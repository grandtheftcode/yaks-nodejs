// controllers/pageController.js
const slugify = require('slugify');
const Page = require('../models/Page');   // Page modelini import et
const db = require('../config/database'); // Benzersiz slug kontrolü için

// Slug oluşturma ayarları
const slugifyOptions = {
    replacement: '-', remove: /[*+~.()'"!:@]/g, lower: true, strict: true, locale: 'tr'
};

const pageController = {

    /**
     * Tüm sabit sayfaları listeler.
     */
    listPages: async (req, res, next) => {
        try {
            const pages = await Page.getAll(); // İçerik olmadan listele
            res.render('admin/pages/list', { // View yolu: views/admin/pages/list.ejs
                title: 'Sayfalar',
                pages: pages,
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            console.error("Error fetching pages:", error);
            next(error);
        }
    },

    /**
     * Sayfa ekleme formunu gösterir.
     */
    showAddForm: (req, res) => {
        res.render('admin/pages/add', { // View yolu: views/admin/pages/add.ejs
            title: 'Yeni Sayfa Ekle',
            layout: '../views/layouts/admin-layout'
        });
    },

    /**
     * Yeni sabit sayfa ekler.
     */
    addPage: async (req, res, next) => {
        const { title, content, status } = req.body;

        // Basit doğrulama
        if (!title || !content || !status) {
            return res.status(400).render('admin/pages/add', {
                title: 'Yeni Sayfa Ekle',
                error: 'Title, Content, and Status are required.',
                formData: req.body, // Form verilerini geri gönder
                layout: '../views/layouts/admin-layout'
            });
        }

        // Slug'ı otomatik oluştur
        const slug = slugify(title, slugifyOptions);

        try {
            // Slug'ın benzersiz olup olmadığını kontrol et
            const existingPage = await Page.findBySlug(slug);
            if (existingPage) {
                return res.status(400).render('admin/pages/add', {
                     title: 'Yeni Sayfa Ekle',
                     error: `Page title "${title}" already exists (or results in a duplicate URL slug).`,
                     formData: req.body,
                     layout: '../views/layouts/admin-layout'
                 });
            }

            // Veritabanına eklenecek veri
            const newPageData = { title, slug, content, status };

            await Page.create(newPageData);
            res.redirect('/admin/pages'); // Başarı sonrası sayfa listesine yönlendir

        } catch (error) {
             // Veritabanı unique constraint hatası (örn: slug veya title unique ise)
             if (error.code === 'ER_DUP_ENTRY') {
                 return res.status(400).render('admin/pages/add', {
                     title: 'Yeni Sayfa Ekle',
                     error: `A page with a similar title or URL already exists.`,
                     formData: req.body,
                     layout: '../views/layouts/admin-layout'
                 });
             }
            console.error("Error adding page:", error);
            next(error);
        }
    },

    /**
     * Sayfa düzenleme formunu gösterir.
     */
    showEditForm: async (req, res, next) => {
        const pageId = req.params.id;
        try {
            const page = await Page.findById(pageId); // İçerikle birlikte getir
            if (!page) {
                const err = new Error('Page not found');
                err.status = 404;
                return next(err);
            }
            res.render('admin/pages/edit', { // View yolu: views/admin/pages/edit.ejs
                title: `Sayfa Düzenle: ${page.title}`,
                page: page,
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            console.error("Error fetching page for edit:", error);
            next(error);
        }
    },

    /**
     * Sabit sayfayı günceller.
     */
    updatePage: async (req, res, next) => {
        const pageId = req.params.id;
        const { title, content, status } = req.body;

         // Basit doğrulama
        if (!title || !content || !status) {
             const page = await Page.findById(pageId); // Hata mesajı için veri
             return res.status(400).render('admin/pages/edit', {
                 title: `Sayfa Düzenle: ${page ? page.title : ''}`,
                 error: 'Title, Content, and Status are required.',
                 page: { ...page, ...req.body }, // Formdaki güncel veriyi kullan
                 layout: '../views/layouts/admin-layout'
             });
         }

        // Yeni slug'ı oluştur
        const newSlug = slugify(title, slugifyOptions);

        try {
            // Yeni slug başka bir sayfaya ait mi diye kontrol et (kendisi hariç)
            const existingPage = await db('pages')
                                     .where('slug', newSlug)
                                     .whereNot('id', pageId)
                                     .first();
            if (existingPage) {
                 const page = await Page.findById(pageId);
                return res.status(400).render('admin/pages/edit', {
                    title: `Sayfa Düzenle: ${page.title}`,
                    error: `Page title "${title}" results in a duplicate URL slug owned by another page.`,
                    page: { ...page, ...req.body },
                    layout: '../views/layouts/admin-layout'
                });
            }

            // Güncellenecek veri
            const updatedPageData = { title, slug: newSlug, content, status };

            const updatedCount = await Page.update(pageId, updatedPageData);

            if (updatedCount === 0) {
                 console.warn(`Page update for ID ${pageId} resulted in 0 updated rows.`);
                 // throw new Error('Page not found or no changes were made.');
            }
            res.redirect('/admin/pages'); // Başarı sonrası listeye dön

        } catch (error) {
              // Veritabanı unique constraint hatası
             if (error.code === 'ER_DUP_ENTRY') {
                  const page = await Page.findById(pageId);
                 return res.status(400).render('admin/pages/edit', {
                     title: `Sayfa Düzenle: ${page.title}`,
                     error: `A page with a similar title or URL already exists.`,
                     page: { ...page, ...req.body },
                     layout: '../views/layouts/admin-layout'
                 });
             }
            console.error("Error updating page:", error);
            next(error);
        }
    },

    /**
     * Sabit sayfayı siler.
     */
    deletePage: async (req, res, next) => {
        const pageId = req.params.id;
        try {
            const deletedCount = await Page.delete(pageId);
            if (deletedCount === 0) {
                const err = new Error('Page not found');
                err.status = 404;
                return next(err);
            }
            res.redirect('/admin/pages');
        } catch (error) {
            console.error("Error deleting page:", error);
            next(error);
        }
    }
};

module.exports = pageController;