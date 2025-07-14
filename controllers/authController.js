const { ROLES, ROLE_NAMES } = require('../config/roles'); // Rol sabitlerini import et
const passport = require('passport'); // Passport'u login işlemi için kullanacağız
const BlogPost = require('../models/BlogPost');
const Page = require('../models/Page');
const Setting = require('../models/Setting');
const Menu = require('../models/Menu');
const Product = require('../models/Product');
const MenuItem = require('../models/MenuItem');
// controllers/publicController.js
// ... (diğer require'lar) ...
const CarouselSlide = require('../models/CarouselSlide'); // <-- CarouselSlide modelini import et

// ... (getCommonData fonksiyonu) ...



/**
 * Tüm public sayfalarda kullanılacak ortak verileri (ayarlar, ana menü) çeker.
 * @returns {Promise<Object>} siteSettings ve mainNavItems içeren bir nesne.
 */
const getCommonData = async () => {
    const siteSettings = await Setting.getAllAsObject();
    let mainNavItems = [];
    let supertopItems = [];
    let socialItems = [];
    // 'main-nav' slug'ına sahip menüyü bul ve öğelerini hiyerarşik al
    const mainMenu = await Menu.findByLocation('main-nav');
    const supertopMenu = await Menu.findByLocation('ust-header');
    const socialMenu = await Menu.findByLocation('sosyal-medya');
    if (supertopMenu) {
        supertopItems = await MenuItem.getAllByMenuIdHierarchical(supertopMenu.id);
    }
    if (mainMenu) {
        mainNavItems = await MenuItem.getAllByMenuIdHierarchical(mainMenu.id);
    }
    if (socialMenu) {
        socialItems = await MenuItem.getAllByMenuIdHierarchical(socialMenu.id);
    }
    return { siteSettings, mainNavItems ,socialItems,supertopItems };
};

const authController = {
    
    /**
     * Login sayfasını gösterir.
     */
    showLoginForm: (req, res) => {
        // Eğer kullanıcı zaten giriş yapmışsa, onu admin paneline yönlendir
        if (req.isAuthenticated()) { // Passport bu fonksiyonu ekler
             return res.redirect('/admin'); // Veya /admin/dashboard gibi bir hedefe
        }
        res.render('auth/login', { // View: views/auth/login.ejs
            title: 'Giriş Yapın',
            layout: false // Login sayfası için admin layout'unu kullanma
            // Veya ayrı bir auth layout oluşturulabilir: layout: '../views/layouts/auth-layout'
        });
    },

    /**
     * Login formundan gelen isteği işler.
     * Passport'un 'local' stratejisini kullanır.
     */
    loginUser: (req, res, next) => {
        // Passport'un authenticate fonksiyonunu middleware olarak kullan
        passport.authenticate('local', {
            // Başarılı olursa yönlendirilecek adres (örn: admin ana sayfası)
            // Henüz bir admin ana sayfası oluşturmadık, şimdilik kullanıcı listesine gitsin
            successRedirect: '/admin/users',
            // Başarısız olursa login sayfasına geri yönlendir
            failureRedirect: '/login',
            // Başarısız olduğunda flash mesajı göster (Passport otomatik olarak 'error' key'ini kullanır)
            failureFlash: true
        })(req, res, next); // Middleware'i çalıştır
        // Bu yapı sayesinde login mantığını doğrudan buraya yazmamıza gerek kalmaz,
        // Passport (config/passport.js'deki strateji) bizim için halleder.
    },

    /**
     * Kullanıcının oturumunu sonlandırır (logout).
     */
    logoutUser: (req, res, next) => {
        // Passport'un logout fonksiyonunu kullan (req.logout modern versiyonlarda callback gerektirir)
        req.logout(function(err) {
            if (err) {
                console.error("Error during logout:", err);
                return next(err); // Hata olursa hata işleyiciye gönder
            }
            // Başarılı çıkış sonrası flash mesajı ayarla
            req.flash('success_msg', 'Başarıyla çıkış yaptınız.');
            // Login sayfasına yönlendir
            res.redirect('/login');
        });
    },

    /**
     * Ana Sayfa
     * (Örnek: Son birkaç blog yazısını gösterebilir)
     */
    home: async (req, res, next) => {
        try {
            const carouselSlides = await CarouselSlide.getAll({ status: 'published', orderBy: 'slide_order' });
            const commonData = await getCommonData();
            const slug = "home";

             // Özel route'lar (blog gibi) sabit sayfa olarak algılanmasın diye kontrol eklenebilir
             if (slug === 'blog') { // Veya diğer özel route'lar
                 return next(); // Bu route'u geç, diğer route'lar denensin (örn: blogList)
             }


            const page = await Page.findBySlug(slug);

            if (!page || page.status !== 'published') {
                // Sayfa bulunamazsa veya yayınlanmamışsa 404 hatası ver
                 const err = new Error('Page not found.');
                 err.status = 404;
                 return next(err);
            }

            res.render('public/page', { // View: views/public/page.ejs
                pageTitle: page.title + ' - ' + (commonData.siteSettings.site_title?.setting_value || ''),
                pageDescription: page.content.substring(0, 160).replace(/<[^>]*>/g, ''), // Meta açıklama
                ...commonData,
                carouselSlides: carouselSlides,
                page: page,
                layout: '../views/public/layout'
            });
        } catch (error) {
             console.error(`Error loading page with slug ${req.params.slug}:`, error);
            next(error);
        }
    },


        /**
     * Blog Yazıları Listesi (Sayfalamalı)
     */
        prodList: async (req, res, next) => {
            try {
                const commonData = await getCommonData();
                const page = parseInt(req.query.page) || 1;
                const limit = 10; // Sayfa başına gösterilecek yazı sayısı (frontende özel)
                const offset = (page - 1) * limit;
    
                // Sadece yayınlanmış yazıları al
                const options = { status: 'published', limit, offset };
                const posts = await Product.getAll(options);
                const totalPosts = await Product.getAll({ status: 'published' });
                const totalPages = Math.ceil(totalPosts / limit);
    
                res.render('public/products', { // View: views/public/products.ejs
                    pageTitle: 'Blog - ' + (commonData.siteSettings.site_title?.setting_value || ''),
                    ...commonData,
                    posts: posts,
                    currentPage: page,
                    totalPages: totalPages,
                    layout: '../views/public/layout'
                });
            } catch (error) {
                console.error("Error loading blog list:", error);
                next(error);
            }
        },

    /**
     * Blog Yazıları Listesi (Sayfalamalı)
     */
    blogList: async (req, res, next) => {
        try {
            const commonData = await getCommonData();
            const page = parseInt(req.query.page) || 1;
            const limit = 5; // Sayfa başına gösterilecek yazı sayısı (frontende özel)
            const offset = (page - 1) * limit;

            // Sadece yayınlanmış yazıları al
            const options = { status: 'published', limit, offset };
            const posts = await BlogPost.getAll(options);
            const totalPosts = await BlogPost.getTotalCount({ status: 'published' });
            const totalPages = Math.ceil(totalPosts / limit);

            res.render('public/blog-list', { // View: views/public/blog-list.ejs
                pageTitle: 'Blog - ' + (commonData.siteSettings.site_title?.setting_value || ''),
                ...commonData,
                posts: posts,
                currentPage: page,
                totalPages: totalPages,
                layout: '../views/public/layout'
            });
        } catch (error) {
            console.error("Error loading blog list:", error);
            next(error);
        }
    },

    /**
     * Tekil Blog Yazısı Sayfası
     */
    blogPost: async (req, res, next) => {
        try {
            const commonData = await getCommonData();
            const slug = req.params.slug;
            const post = await BlogPost.findBySlug(slug);

            if (!post || post.status !== 'published') {
                const err = new Error('Blog post not found or not published.');
                err.status = 404;
                return next(err); // 404 hatası ver
            }

            res.render('public/blog-post', { // View: views/public/blog-post.ejs
                pageTitle: post.title + ' - ' + (commonData.siteSettings.site_title?.setting_value || ''),
                pageDescription: post.content.substring(0, 160).replace(/<[^>]*>/g, ''), // İçerikten kısa açıklama (meta için)
                ...commonData,
                post: post,
                layout: '../views/public/layout'
            });
        } catch (error) {
            console.error(`Error loading blog post with slug ${req.params.slug}:`, error);
            next(error);
        }
    },
// Admin ana sayfası (login sonrası ilk gidilecek sayfa - opsiyonel)
adminDashboard: (req, res) => {
    res.render('admin/dashboard', { // View: views/admin/dashboard.ejs
        ROLE_NAMES: ROLE_NAMES,
        title: 'Gösterge Paneli',
        layout: '../views/layouts/admin-layout' // Admin layout'unu kullan
        // Dashboard'a özel veriler buraya eklenebilir
    });
},
    /**
     * Sabit Sayfa
     */
    page: async (req, res, next) => {
        try {
            const commonData = await getCommonData();
            const slug = req.params.slug;

             // Özel route'lar (blog gibi) sabit sayfa olarak algılanmasın diye kontrol eklenebilir
             if (slug === 'blog') { // Veya diğer özel route'lar
                 return next(); // Bu route'u geç, diğer route'lar denensin (örn: blogList)
             }


            const page = await Page.findBySlug(slug);

            if (!page || page.status !== 'published') {
                // Sayfa bulunamazsa veya yayınlanmamışsa 404 hatası ver
                 const err = new Error('Page not found.');
                 err.status = 404;
                 return next(err);
            }

            res.render('public/page', { // View: views/public/page.ejs
                pageTitle: page.title + ' - ' + (commonData.siteSettings.site_title?.setting_value || ''),
                pageDescription: page.content.substring(0, 160).replace(/<[^>]*>/g, ''), // Meta açıklama
                ...commonData,
                page: page,
                layout: '../views/public/layout'
            });
        } catch (error) {
             console.error(`Error loading page with slug ${req.params.slug}:`, error);
            next(error);
        }
    },
    
};

module.exports = authController;