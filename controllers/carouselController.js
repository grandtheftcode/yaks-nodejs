// controllers/carouselController.js
const CarouselSlide = require('../models/CarouselSlide');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Yapılandırması (Carousel Görselleri İçin) ---
const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/carousel'); // Carousel yükleme klasörü
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        // Dosya adı: carousel-167888...987.png
        cb(null, 'carousel-' + uniqueSuffix + extension);
    }
});

const carouselFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for carousel!'), false);
    }
};

const uploadCarouselImage = multer({
    storage: carouselStorage,
    fileFilter: carouselFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// Middleware'i route'ta kullanmak üzere export edebiliriz veya route dosyasında tekrar tanımlayabiliriz.
// Şimdilik route dosyasında tanımlayacağız.
// module.exports.uploadMiddleware = uploadCarouselImage.single('image_path');

// --- /Multer Yapılandırması ---


const carouselController = {

    /**
     * Tüm carousel slaytlarını (admin için) listeler ve yönetim sayfasını gösterir.
     */
    manageSlides: async (req, res, next) => {
        try {
            // Tüm slaytları (draft dahil) sıralı olarak al
            const slides = await CarouselSlide.getAll({ orderBy: 'slide_order' });
            res.render('admin/carousel/manage', { // View: views/admin/carousel/manage.ejs
                title: 'Manage Carousel Slides',
                slides: slides,
                layout: '../views/layouts/admin-layout'
                // Bu view'a sürükle-bırak JS (SortableJS) entegre edilecek
            });
        } catch (error) {
            console.error("Error fetching carousel slides:", error);
            next(error);
        }
    },

    /**
     * Yeni slayt ekler (form gönderimi ve dosya yükleme).
     * Bu fonksiyon Multer middleware'inden sonra çalışır.
     */
    addSlide: async (req, res, next) => {
        // Form verileri req.body'de, yüklenen dosya req.file'da olacak
        const { title, caption, link_url, link_target, status } = req.body;

        // Dosya yüklendi mi kontrol et
        if (!req.file) {
            req.flash('error_msg', 'Carousel image is required.');
            return res.redirect('/admin/carousel'); // Yönetim sayfasına geri dön
        }

        // Dosya yolunu al (public'e göreceli)
         const publicDir = path.join(__dirname, '../public');
         const image_path = '/' + path.relative(publicDir, req.file.path).replace(/\\/g, '/');

         // Sıralama için son sırayı bul (veya varsayılan 0 kalsın)
         // const lastSlide = await db('carousel_slides').orderBy('slide_order','desc').first();
         // const slide_order = lastSlide ? lastSlide.slide_order + 1 : 0;

        try {
            const newSlideData = {
                title: title || null,
                caption: caption || null,
                image_path, // Yüklenen dosyanın yolu
                link_url: link_url || null,
                link_target: link_target || '_self',
                status: status || 'published',
                slide_order: 0 // Sıralama ayrı yapılacak
            };

            await CarouselSlide.create(newSlideData);
            req.flash('success_msg', 'Carousel slide added successfully.');
            res.redirect('/admin/carousel');

        } catch (error) {
             console.error("Error adding carousel slide:", error);
             // Yüklenen dosyayı sil (eğer DB'ye eklenemediyse)
             try {
                 fs.unlinkSync(req.file.path);
                 console.log(`Deleted uploaded file ${req.file.path} due to DB error.`);
             } catch (unlinkErr) {
                 console.error(`Error deleting uploaded file ${req.file.path}:`, unlinkErr);
             }
             req.flash('error_msg', 'Failed to add carousel slide.');
             res.redirect('/admin/carousel');
             // next(error); // Veya genel hata işleyiciye gönder
        }
    },

    /**
     * Slayt düzenleme formunu gösterir (ayrı bir sayfa olarak - AJAX ile modal da olabilir).
     */
    showEditForm: async (req, res, next) => {
         const slideId = req.params.id;
         try {
             const slide = await CarouselSlide.findById(slideId);
             if (!slide) {
                 req.flash('error_msg', 'Slide not found.');
                 return res.redirect('/admin/carousel');
             }
             res.render('admin/carousel/edit', { // View: views/admin/carousel/edit.ejs
                 title: 'Edit Carousel Slide',
                 slide: slide,
                 layout: '../views/layouts/admin-layout'
             });
         } catch (error) {
             console.error("Error fetching slide for edit:", error);
             next(error);
         }
    },

    /**
     * Carousel slaytını günceller (dosya yükleme dahil).
     */
    updateSlide: async (req, res, next) => {
         const slideId = req.params.id;
         const { title, caption, link_url, link_target, status } = req.body;
         let image_path; // Yeni resim yolu (eğer yüklendiyse)

         try {
            // Önce mevcut slaytı bul
            const currentSlide = await CarouselSlide.findById(slideId);
            if (!currentSlide) {
                 req.flash('error_msg', 'Slide not found.');
                 return res.redirect('/admin/carousel');
             }

            // Yeni resim yüklendi mi?
            if (req.file) {
                 // Eski resmi sil
                 if (currentSlide.image_path) {
                     const oldFilePath = path.join(__dirname, '../public', currentSlide.image_path);
                      if (currentSlide.image_path.startsWith('/uploads/carousel/') && fs.existsSync(oldFilePath)) {
                          try { fs.unlinkSync(oldFilePath); } catch (err) { console.error("Error deleting old carousel image:", err); }
                      }
                 }
                 // Yeni resim yolunu al
                 const publicDir = path.join(__dirname, '../public');
                 image_path = '/' + path.relative(publicDir, req.file.path).replace(/\\/g, '/');
             } else {
                 // Yeni resim yüklenmediyse mevcut yolu kullan
                 image_path = currentSlide.image_path;
             }

             const updatedSlideData = {
                 title: title || null,
                 caption: caption || null,
                 image_path, // Ya yeni ya da eski yol
                 link_url: link_url || null,
                 link_target: link_target || '_self',
                 status: status || 'published',
                 // slide_order burada güncellenmez
             };

             await CarouselSlide.update(slideId, updatedSlideData);
             req.flash('success_msg', 'Carousel slide updated successfully.');
             res.redirect('/admin/carousel');

         } catch (error) {
              console.error("Error updating carousel slide:", error);
               // Eğer yeni resim yüklendiyse ve hata oluştuysa, yeni yüklenen resmi sil
               if (req.file) {
                   try { fs.unlinkSync(req.file.path); } catch (unlinkErr) { console.error("Error deleting newly uploaded file after update error:", unlinkErr); }
               }
               req.flash('error_msg', 'Failed to update carousel slide.');
               res.redirect('/admin/carousel');
               // next(error);
         }
     },

     /**
     * Slaytların sırasını günceller (AJAX isteği).
     */
    updateOrder: async (req, res, next) => {
         // Sürükle-bırak JS'den gelen veri: req.body.slides = [ { id: ..., slide_order: ... }, ...]
         const slides = req.body.slides;

         if (!slides || !Array.isArray(slides)) {
             return res.status(400).json({ success: false, message: 'Invalid slides data.' });
         }

         try {
             await CarouselSlide.updateOrder(slides);
             res.json({ success: true, message: 'Carousel order updated successfully.' });
         } catch (error) {
             console.error("Error updating carousel slides order:", error);
              res.status(500).json({ success: false, message: 'Failed to update carousel order.' });
         }
     },

    /**
     * Carousel slaytını siler (ilgili resmi de siler).
     */
    deleteSlide: async (req, res, next) => {
        const slideId = req.params.id;
        try {
            // Önce slayt bilgilerini al (resim yolunu bilmek için)
            const slideToDelete = await CarouselSlide.findById(slideId);
            if (!slideToDelete) {
                 req.flash('error_msg', 'Slide not found.');
                 return res.redirect('/admin/carousel');
             }

            // Veritabanından sil
            await CarouselSlide.delete(slideId);

             // İlişkili resmi sil
             if (slideToDelete.image_path) {
                 const filePath = path.join(__dirname, '../public', slideToDelete.image_path);
                  if (slideToDelete.image_path.startsWith('/uploads/carousel/') && fs.existsSync(filePath)) {
                      try { fs.unlinkSync(filePath); } catch (err) { console.error("Error deleting carousel image file:", err); }
                  }
             }

            req.flash('success_msg', 'Carousel slide deleted successfully.');
            res.redirect('/admin/carousel');
        } catch (error) {
            console.error("Error deleting carousel slide:", error);
            req.flash('error_msg', 'Failed to delete carousel slide.');
            res.redirect('/admin/carousel');
            // next(error);
        }
    }
};

module.exports = carouselController;