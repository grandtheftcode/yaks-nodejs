// controllers/settingController.js
const slugify = require('slugify'); // Menü konumu slug'ı için
const Product = require('../models/Product');
// Dosya yükleme için gerekli modülleri aktif et:
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Dosya sistemi işlemleri için (dosya var mı, silme vb.)



// Yardımcı fonksiyon (Slug'ın benzersiz olmasını sağlar)
async function generateUniqueSlug(name, currentId = null) {
    let baseSlug = slugify(name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    let slug = baseSlug;
    let count = 1;
    let product;

    while (true) {
        const query = Product.findBySlug(slug);
        product = await query;

        // Eğer slug bulunamadıysa VEYA bulunan ürün güncellenen ürünün kendisi ise
        if (!product || (currentId && product.id === currentId)) {
            break; // Bu slug kullanılabilir
        }

        // Slug zaten varsa, sonuna sayı ekleyerek yeni bir slug dene
        slug = `${baseSlug}-${count}`;
        count++;
    }
    return slug;
}


exports.listProducts = async (req, res, next) => {
    try {
        const products = await Product.getAll({ orderBy: 'created_at', orderDirection: 'desc' });
        res.render('admin/products/list', {
            title: 'Ürünler',
            products: products,
            layout: '../views/layouts/admin-layout' // Admin layout'unu belirt
            // flash mesajları için: success: req.flash('success'), error: req.flash('error')
        });
    } catch (err) {
        console.error("Ürün listeleme hatası:", err);
        // req.flash('error', 'Ürünler listelenirken bir hata oluştu.');
        // res.redirect('/admin'); // Veya hata sayfasına yönlendir
        next(err); // Hata middleware'ine gönder
    }
};

exports.showCreateForm = (req, res) => {
    // Kategori listesini de alıp göndermek isteyebilirsiniz
    // const categories = await Category.getAll();
    res.render('admin/products/add', {
        title: 'Yeni Ürün Ekle',
        product: {}, // Boş bir nesne göndererek formda hata almayı önle
        errors: {}, // Olası validasyon hataları için
        layout: '../views/layouts/admin-layout'
        // categories: categories
    });
};

exports.createProduct = async (req, res, next) => {
    try {
        const productData = req.body; // Formdan gelen veriler

        // --- Validasyon (Basit örnek, express-validator daha iyi) ---
        const errors = {};
        if (!productData.name || productData.name.trim() === '') {
            errors.name = 'Ürün adı zorunludur.';
        }
        if (!productData.price || isNaN(parseFloat(productData.price))) {
            errors.price = 'Geçerli bir fiyat giriniz.';
        }
        // ... diğer validasyonlar ...

        if (Object.keys(errors).length > 0) {
            // Hata varsa formu tekrar göster
            return res.render('admin/products/add', {
                title: 'Yeni Ürün Ekle',
                product: productData, // Kullanıcının girdiği verileri geri gönder
                errors: errors,
                layout: '../views/layouts/admin-layout'
            });
        }
        // --- Validasyon Sonu ---

        // Slug oluştur
        productData.slug = await generateUniqueSlug(productData.name);

        // Varsayılanları ayarla (Modelde de yapılabilir)
        productData.status = productData.status || 'draft';
        productData.stock_quantity = parseInt(productData.stock_quantity) || 0;
        productData.price = parseFloat(productData.price);
        productData.sale_price = productData.sale_price ? parseFloat(productData.sale_price) : null;
        productData.category_id = productData.category_id || null;

        // Öne çıkan görsel (featured_image) yüklemesi burada handle edilmeli (multer ile)
        // if (req.file) {
        //     productData.featured_image = '/uploads/products/' + req.file.filename;
        // }

        await Product.create(productData);
        // req.flash('success', 'Ürün başarıyla oluşturuldu.');
        res.redirect('/admin/products/');

    } catch (err) {
        console.error("Ürün oluşturma hatası:", err);
        // req.flash('error', 'Ürün oluşturulurken bir hata oluştu.');
        // Hata durumunda formu tekrar göstermek daha iyi olabilir
        // res.redirect('/admin/products/new');
        next(err);
    }
};

exports.showEditForm = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            // req.flash('error', 'Ürün bulunamadı.');
            return res.redirect('/admin/products/edit');
        }
        // const categories = await Category.getAll(); // Kategorileri al
        res.render('admin/products/edit', {
            title: 'Ürünü Düzenle',
            product: product,
            errors: {},
            layout: '../views/layouts/admin-layout'
            // categories: categories
        });
    } catch (err) {
        console.error("Ürün düzenleme formu hatası:", err);
        next(err);
    }
};

exports.updateProduct = async (req, res, next) => {
    const productId = req.params.id;
    try {
        const productData = req.body;
        const currentProduct = await Product.findById(productId); // Slug değişimi kontrolü için

        if (!currentProduct) {
           // req.flash('error', 'Güncellenecek ürün bulunamadı.');
           return res.redirect('admin/products/');
        }

        // --- Validasyon (create'deki gibi) ---
        const errors = {};
        if (!productData.name || productData.name.trim() === '') {
            errors.name = 'Ürün adı zorunludur.';
        }
         if (!productData.price || isNaN(parseFloat(productData.price))) {
            errors.price = 'Geçerli bir fiyat giriniz.';
        }
        // ...

        if (Object.keys(errors).length > 0) {
            // Hata varsa formu tekrar göster (mevcut ürün verisiyle)
            productData.id = productId; // ID'yi forma geri göndermek için ekle
             return res.render('admin/products/edit', {
                title: 'Ürünü Düzenle',
                product: { ...currentProduct, ...productData }, // Mevcut ve yeni veriyi birleştir
                errors: errors,
                layout: '../views/layouts/admin-layout'
            });
        }
        // --- Validasyon Sonu ---


        // Slug'ı sadece isim değiştiyse veya boşsa yeniden oluştur
        if (productData.name !== currentProduct.name || !productData.slug || productData.slug.trim() === '') {
             productData.slug = await generateUniqueSlug(productData.name, productId);
        } else {
            // Mevcut slug'ı koru ama benzersizliğini kontrol et (nadiren gerekir)
            const existingSlugProduct = await Product.findBySlug(productData.slug);
            if(existingSlugProduct && existingSlugProduct.id !== parseInt(productId)) {
                // Başka bir ürüne ait aynı slug varsa, hata ver veya yenisini üret
                 productData.slug = await generateUniqueSlug(productData.name, productId);
                 // Veya validasyon hatası ver
                 // errors.slug = 'Bu slug başka bir ürün tarafından kullanılıyor.'; // -> validasyona ekle
            }
        }


        // Veri tiplerini ayarla
        productData.price = parseFloat(productData.price);
        productData.sale_price = productData.sale_price ? parseFloat(productData.sale_price) : null;
        productData.stock_quantity = parseInt(productData.stock_quantity) || 0;
        productData.category_id = productData.category_id || null;

        // Resim yükleme/güncelleme işlemi burada yapılmalı (multer)
        // Eğer yeni resim yüklendiyse:
        // if (req.file) {
        //     // Eski resmi sil (opsiyonel)
        //     if (currentProduct.featured_image) {
        //         try {
        //              const oldImagePath = path.join(__dirname, '../../public', currentProduct.featured_image); // public klasörüne göre yolu ayarla
        //              if (fs.existsSync(oldImagePath)) {
        //                 fs.unlinkSync(oldImagePath);
        //              }
        //         } catch(unlinkErr) { console.error("Eski resim silinemedi:", unlinkErr); }
        //     }
        //     productData.featured_image = '/uploads/products/' + req.file.filename;
        // } else {
        //     // Yeni resim yüklenmediyse, mevcut resmi koru
        //     delete productData.featured_image; // Gelen body'de olmamalı ki veritabanında null olmasın
        // }


        await Product.update(productId, productData);
        // req.flash('success', 'Ürün başarıyla güncellendi.');
        res.redirect('/admin/products/');

    } catch (err) {
        console.error("Ürün güncelleme hatası:", err);
        // req.flash('error', 'Ürün güncellenirken bir hata oluştu.');
        // res.redirect(`/admin/products/${productId}/edit`);
         next(err);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId); // Resmi silmek için önce ürünü bul

        if (!product) {
            // req.flash('error', 'Silinecek ürün bulunamadı.');
            return res.redirect('/admin/products/');
        }

        // İlişkili resmi sil (varsa)
        // if (product.featured_image) {
        //     try {
        //          const imagePath = path.join(__dirname, '../../public', product.featured_image); // public klasörüne göre yolu ayarla
        //          if (fs.existsSync(imagePath)) {
        //             fs.unlinkSync(imagePath);
        //              console.log(`Resim silindi: ${imagePath}`);
        //          }
        //     } catch(unlinkErr) {
        //         console.error(`Resim silinemedi (${product.featured_image}):`, unlinkErr);
        //         // Hata olsa bile ürün silme işlemine devam edilebilir veya durdurulabilir.
        //         // req.flash('error', 'Ürün resmi silinirken bir hata oluştu, ancak ürün veritabanından silinecek.');
        //     }
        // }

        await Product.delete(productId);
        // req.flash('success', 'Ürün başarıyla silindi.');
        res.redirect('/admin/products/');

    } catch (err) {
        console.error("Ürün silme hatası:", err);
        // req.flash('error', 'Ürün silinirken bir hata oluştu.');
        // res.redirect('/admin/products/');
         next(err);
    }
};