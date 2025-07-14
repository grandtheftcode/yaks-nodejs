// controllers/categoryController.js
const slugify = require('slugify'); // slugify kütüphanesini import et
const Category = require('../models/Category'); // Category modelini import et
const db = require('../config/database'); // <-- EKLEDİK!

// Slug oluşturma ayarları (isteğe bağlı, varsayılanlar da iyi çalışır)
const slugifyOptions = {
    replacement: '-', // Boşluk yerine '-' kullan
    remove: /[*+~.()'"!:@]/g, // İstenmeyen karakterleri kaldır
    lower: true,      // Küçük harfe çevir
    strict: true,     // Geçersiz karakterleri tamamen kaldırır (replacement yerine)
    locale: 'tr'      // Türkçe karakterler için (örn: 'ı' -> 'i')
};

const categoryController = {

    /**
     * Tüm kategorileri listeler.
     */
    listCategories: async (req, res, next) => {
        try {
            const categories = await Category.getAll();
            res.render('admin/categories/list', { // Yeni view yolu: views/admin/categories/list.ejs
                title: 'Kategoriyi Yönet',
                categories: categories,
                layout: '../views/layouts/admin-layout' // Varsayılan layout'u kullan
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
            next(error);
        }
    },

    /**
     * Kategori ekleme formunu gösterir.
     */
    showAddForm: (req, res) => {
        res.render('admin/categories/add', { // Yeni view yolu: views/admin/categories/add.ejs
            title: 'Yeni Kategori Ekle',
            layout: '../views/layouts/admin-layout'
        });
    },

    /**
     * Yeni kategori ekler.
     */
    addCategory: async (req, res, next) => {
        const { name, description } = req.body;

        // Basit doğrulama
        if (!name) {
            return res.status(400).render('admin/categories/add', {
                title: 'Yeni Kategori Ekle',
                error: 'Category name is required.',
                formData: { name, description }, // Girilen veriyi geri gönder
                layout: '../views/layouts/admin-layout'
            });
        }

        // Slug'ı otomatik oluştur
        const slug = slugify(name, slugifyOptions);

        try {
            // Slug'ın benzersiz olup olmadığını kontrol et
            const existingCategory = await Category.findBySlug(slug);
            if (existingCategory) {
                // Eğer aynı isimden (ve dolayısıyla aynı slug'dan) varsa hata ver
                return res.status(400).render('admin/categories/add', {
                    title: 'Yeni Kategori Ekle',
                    error: `Category name "${name}" already exists (or results in a duplicate URL slug).`,
                    formData: { name, description },
                    layout: '../views/layouts/admin-layout'
                });
            }

            // Yeni kategoriyi oluştur
            await Category.create({ name, slug, description });
            // Başarı mesajı ile listeye yönlendir (ileride flash mesaj eklenebilir)
            res.redirect('/admin/categories');

        } catch (error) {
             // Veritabanı seviyesinde unique kısıtlama hatası (örn: name unique ise)
             if (error.code === 'ER_DUP_ENTRY') {
                 return res.status(400).render('admin/categories/add', {
                     title: 'Yeni Kategori Ekle',
                     error: `Category name "${name}" already exists.`,
                     formData: { name, description },
                     layout: '../views/layouts/admin-layout'
                 });
             }
            console.error("Error adding category:", error);
            next(error);
        }
    },

    /**
     * Kategori düzenleme formunu gösterir.
     */
    showEditForm: async (req, res, next) => {
        const categoryId = req.params.id;
        try {
            const category = await Category.findById(categoryId);
            if (!category) {
                const err = new Error('Category not found');
                err.status = 404;
                return next(err);
            }
            res.render('admin/categories/edit', { // Yeni view yolu: views/admin/categories/edit.ejs
                title: `Kategori Düzenle: ${category.name}`,
                category: category,
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            console.error("Error fetching category for edit:", error);
            next(error);
        }
    },

    /**
     * Kategoriyi günceller.
     */
    updateCategory: async (req, res, next) => {
        const categoryId = req.params.id;
        const { name, description } = req.body;

        if (!name) {
             const category = await Category.findById(categoryId); // Hata mesajı için veri
             return res.status(400).render('admin/categories/edit', {
                 title: `Kategori Düzenle: ${category ? category.name : ''}`,
                 category: { ...category, name, description }, // Form verilerini göster
                 error: 'Category name is required.',
                 layout: '../views/layouts/admin-layout'
             });
        }

        // Yeni slug'ı oluştur
        const newSlug = slugify(name, slugifyOptions);

        try {
            // Bu yeni slug başka bir kategoriye ait mi diye kontrol et (kendisi hariç)
            const existingCategory = await db('categories') // Doğrudan db kullanabiliriz veya Modele ek fonksiyon yazabiliriz
                                     .where('slug', newSlug)
                                     .whereNot('id', categoryId)
                                     .first();

            if (existingCategory) {
                const category = await Category.findById(categoryId);
                return res.status(400).render('admin/categories/edit', {
                    title: `Kategori Düzenle: ${category.name}`,
                    category: { ...category, name, description }, // Formdaki veriyi tut
                    error: `Category name "${name}" results in a duplicate URL slug owned by another category.`,
                    layout: '../views/layouts/admin-layout'
                });
            }

            // Kategoriyi güncelle
            const updatedCount = await Category.update(categoryId, { name, slug: newSlug, description });

            if (updatedCount === 0) {
                 // Nadir durum, kategori bulunamadı veya veri aynıydı
                 const err = new Error('Category not found or no changes were made.');
                 err.status = 404;
                 return next(err);
            }
            res.redirect('/admin/categories');

        } catch (error) {
             // Veritabanı seviyesinde unique kısıtlama hatası (örn: name unique ise)
             if (error.code === 'ER_DUP_ENTRY') {
                  const category = await Category.findById(categoryId);
                 return res.status(400).render('admin/categories/edit', {
                     title: `Kategori Düzenle: ${category.name}`,
                     category: { ...category, name, description },
                     error: `Category name "${name}" already exists.`,
                     layout: '../views/layouts/admin-layout'
                 });
             }
            console.error("Error updating category:", error);
            next(error);
        }
    },

    /**
     * Kategoriyi siler.
     */
    deleteCategory: async (req, res, next) => {
        const categoryId = req.params.id;
        try {
            // İsteğe bağlı: Kategoriye bağlı yazı olup olmadığını kontrol et ve silmeyi engelle/uyar
            // const postCount = await db('blog_posts').where({ category_id: categoryId }).count('id as count').first();
            // if (postCount && postCount.count > 0) {
            //     // Hata mesajı göster veya kullanıcıyı uyar
            //     // Flash mesaj kullanmak burada ideal olurdu.
            //     console.warn(`Attempted to delete category ${categoryId} which has ${postCount.count} posts.`);
            //     // Şimdilik silmeye izin veriyoruz, DB 'ON DELETE SET NULL' yapacak.
            // }

            const deletedCount = await Category.delete(categoryId);
            if (deletedCount === 0) {
                const err = new Error('Category not found');
                err.status = 404;
                return next(err);
            }
            res.redirect('/admin/categories');
        } catch (error) {
            console.error("Error deleting category:", error);
            next(error);
        }
    }
};

// Controller'ı kullanıma aç
module.exports = categoryController;

// !!! ÖNEMLİ: updateCategory içindeki unique slug kontrolünde doğrudan 'db' kullandık.
// Bu satırın çalışması için categoryController.js'nin en başına şunu eklemeyi unutmayın:
// const db = require('../config/database');