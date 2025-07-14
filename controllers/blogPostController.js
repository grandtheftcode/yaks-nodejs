// controllers/blogPostController.js
const slugify = require('slugify');
const BlogPost = require('../models/BlogPost');
const Category = require('../models/Category'); // Kategori seçimi için
const User = require('../models/User');       // Yazar seçimi için (gerekirse)
const db = require('../config/database');     // Benzersiz slug kontrolü için
const { ROLES } = require('../config/roles'); // Yazar rollerini kontrol etmek için (opsiyonel)

// Slug oluşturma ayarları (categoryController ile aynı olabilir)
const slugifyOptions = {
    replacement: '-', remove: /[*+~.()'"!:@]/g, lower: true, strict: true, locale: 'tr'
};

const blogPostController = {

    /**
     * Blog yazılarını listeler (sayfalamalı).
     */
    listPosts: async (req, res, next) => {
        try {
            // Sayfalama parametreleri (query string'den alınabilir, örn: /posts?page=2)
            const page = parseInt(req.query.page) || 1; // Mevcut sayfa numarası
            const limit = 10; // Sayfa başına gösterilecek yazı sayısı
            const offset = (page - 1) * limit;

            // Filtreleme (örnek)
            const options = { limit, offset };
             if (req.query.status) options.status = req.query.status; // Duruma göre filtrele
             // Diğer filtreler (kategori, yazar vb.) eklenebilir

            const posts = await BlogPost.getAll(options);
            const totalPosts = await BlogPost.getTotalCount(options); // Filtrelenmiş toplam yazı sayısı
            const totalPages = Math.ceil(totalPosts / limit);

            res.render('admin/blog/list', { // View yolu: views/admin/blog/list.ejs
                title: 'Blog Gönderileri',
                posts: posts,
                currentPage: page,
                totalPages: totalPages,
                totalPosts: totalPosts,
                // Filtreleme seçeneklerini view'a gönderebiliriz (formlar için)
                // categories: await Category.getAll(),
                // users: await User.getAll(), // Tüm kullanıcılar yerine sadece yazarları listelemek daha iyi olabilir
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            next(error);
        }
    },

    /**
     * Yazı ekleme formunu gösterir (kategorilerle birlikte).
     */
    showAddForm: async (req, res, next) => {
        try {
            const categories = await Category.getAll();
            // İsteğe bağlı: Yazar seçimi için sadece belirli rollerdeki kullanıcıları getir
            // const authors = await db('users').whereIn('role', [ROLES.ADMIN, ROLES.MODERATOR, ROLES.EDITOR]).select('id', 'username');

            res.render('admin/blog/add', { // View yolu: views/admin/blog/add.ejs
                title: 'Blog Gönderisi Ekle',
                categories: categories,
                // authors: authors, // Yazar seçimi eklenirse
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            console.error("Error fetching data for add post form:", error);
            next(error);
        }
    },

    /**
     * Yeni blog yazısı ekler.
     */
    addPost: async (req, res, next) => {
        // Formdan gelen veriler
        // 'content' büyük ihtimalle bir WYSIWYG editörden (örn: TinyMCE) gelecek HTML içeriği olacak.
        const { title, content, category_id, status } = req.body;

        // !! ÖNEMLİ: user_id giriş yapmış kullanıcıdan alınmalı! Auth sistemi olmadığından şimdilik sabit.
        // const user_id = req.user.id; // Gerçek uygulamada böyle olmalı
        const user_id = req.user.id; // Varsayım: ID'si 1 olan kullanıcı ekliyor (admin?) -> DEĞİŞTİRİLMELİ!

        // Basit doğrulama
        if (!title || !content || !status) {
            const categories = await Category.getAll();
            return res.status(400).render('admin/blog/add', {
                title: 'Blog Gönderisi Ekle',
                error: 'Title, Content, and Status are required.',
                categories: categories,
                formData: req.body, // Form verilerini geri gönder
                layout: '../views/layouts/admin-layout'
            });
        }

        // Slug'ı otomatik oluştur
        const slug = slugify(title, slugifyOptions);

        try {
            // Slug'ın benzersiz olup olmadığını kontrol et
            const existingPost = await BlogPost.findBySlug(slug);
            if (existingPost) {
                const categories = await Category.getAll();
                return res.status(400).render('admin/blog/add', {
                     title: 'Blog Gönderisi Ekle',
                     error: `Post title "${title}" already exists (or results in a duplicate URL slug).`,
                     categories: categories,
                     formData: req.body,
                     layout: '../views/layouts/admin-layout'
                 });
            }

            // Veritabanına eklenecek veri
            const newPostData = {
                title,
                slug,
                content,
                user_id, // Giriş yapmış kullanıcıdan alınmalı
                category_id: category_id || null, // Seçilmemişse null
                status,
                // featured_image: req.file ? req.file.path : null // Dosya yükleme eklenirse
            };

            await BlogPost.create(newPostData);
            res.redirect('/admin/blog'); // Başarı sonrası blog listesine yönlendir

        } catch (error) {
            // Veritabanı hatası (örn: olmayan category_id, user_id)
             if (error.code && error.code.startsWith('ER_')) { // Genel DB hataları
                 const categories = await Category.getAll();
                 return res.status(500).render('admin/blog/add', {
                     title: 'Blog Gönderisi Ekle',
                     error: 'Database error occurred while saving the post. Please check foreign keys or constraints.',
                     categories: categories,
                     formData: req.body,
                     layout: '../views/layouts/admin-layout'
                 });
             }
            console.error("Error adding blog post:", error);
            next(error);
        }
    },

    /**
     * Yazı düzenleme formunu gösterir (yazı verisi ve kategorilerle).
     */
    showEditForm: async (req, res, next) => {
        const postId = req.params.id;
        try {
            const post = await BlogPost.findById(postId);
            if (!post) {
                const err = new Error('Blog post not found');
                err.status = 404;
                return next(err);
            }

            // !! Yetkilendirme Kontrolü: Sadece kendi yazısını veya Admin/Moderatör tüm yazıları düzenleyebilsin?
            // const currentUser = req.user; // Giriş yapmış kullanıcı (login sistemi gerekli)
            // const currentUser = { id: 1, role: ROLES.ADMIN }; // TEST AMAÇLI VARSAYIM
            // if (currentUser.role !== ROLES.ADMIN && currentUser.role !== ROLES.MODERATOR && post.author_id !== currentUser.id) {
            //     const err = new Error('Forbidden - You can only edit your own posts.');
            //     err.status = 403;
            //     return next(err);
            // }

            const categories = await Category.getAll();
            // const authors = await db('users').whereIn('role', [ROLES.ADMIN, ROLES.MODERATOR, ROLES.EDITOR]).select('id', 'username');

            res.render('admin/blog/edit', { // View yolu: views/admin/blog/edit.ejs
                title: `Blog Gönderisi Düzenle: ${post.title}`,
                post: post,
                categories: categories,
                // authors: authors, // Yazar değiştirme formu eklenirse
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            console.error("Error fetching data for edit post form:", error);
            next(error);
        }
    },

    /**
     * Blog yazısını günceller.
     */
    updatePost: async (req, res, next) => {
        const postId = req.params.id;
        const { title, content, category_id, status } = req.body;

        // !! user_id'nin güncellenip güncellenmeyeceğine karar verilmeli. Genellikle değiştirilmez
        //    veya sadece Admin/Moderatör değiştirebilir.

        // Basit doğrulama
        if (!title || !content || !status) {
            // Hata durumunda formu tekrar render etmek için verileri tekrar çek
             const post = await BlogPost.findById(postId); // Mevcut post verisi
             const categories = await Category.getAll();
             return res.status(400).render('admin/blog/edit', {
                 title: `Blog Gönderisi Düzenle: ${post ? post.title : ''}`,
                 error: 'Title, Content, and Status are required.',
                 post: { ...post, ...req.body }, // Formdaki güncel veriyi kullan, DB'deki değil
                 categories: categories,
                 layout: '../views/layouts/admin-layout'
             });
         }

        // Yeni slug'ı oluştur
        const newSlug = slugify(title, slugifyOptions);

        try {
             // Güncellenmeden önce yazının varlığından ve yetkiden emin ol (showEditForm'daki gibi)
             const post = await BlogPost.findById(postId);
             if (!post) { /* 404 hatası */ throw new Error('Post not found'); /* ... */ }
             // Yetki kontrolü (yukarıdaki gibi) eklenebilir...

             // Yeni slug başka bir yazıya ait mi diye kontrol et (kendisi hariç)
             const existingPost = await db('blog_posts')
                                      .where('slug', newSlug)
                                      .whereNot('id', postId)
                                      .first();
             if (existingPost) {
                 const categories = await Category.getAll();
                 return res.status(400).render('admin/blog/edit', {
                     title: `Blog Gönderisi Düzenle: ${post.title}`,
                     error: `Post title "${title}" results in a duplicate URL slug owned by another post.`,
                     post: { ...post, ...req.body },
                     categories: categories,
                     layout: '../views/layouts/admin-layout'
                 });
             }

            // Güncellenecek veri
            const updatedPostData = {
                title,
                slug: newSlug,
                content,
                category_id: category_id || null,
                status,
                // user_id: new_author_id, // Eğer yazar değiştiriliyorsa
                // featured_image: req.file ? req.file.path : post.featured_image // Dosya yükleme varsa
            };

            const updatedCount = await BlogPost.update(postId, updatedPostData);

            if (updatedCount === 0) {
                // Belki de değişiklik yapılmadı? Veya ID yanlıştı.
                 console.warn(`Blog post update for ID ${postId} resulted in 0 updated rows.`);
                 // throw new Error('Post not found or no changes were made.'); // Hata fırlatılabilir
            }
            res.redirect('/admin/blog'); // Başarı sonrası listeye dön

        } catch (error) {
              if (error.code && error.code.startsWith('ER_')) {
                   const post = await BlogPost.findById(postId);
                   const categories = await Category.getAll();
                  return res.status(500).render('admin/blog/edit', {
                      title: `Blog Gönderisi Düzenle: ${post ? post.title : ''}`,
                      error: 'Database error occurred while updating the post.',
                      post: { ...post, ...req.body },
                      categories: categories,
                      layout: '../views/layouts/admin-layout'
                  });
              }
             console.error("Error updating blog post:", error);
             next(error);
        }
    },

    /**
     * Blog yazısını siler.
     */
    deletePost: async (req, res, next) => {
        const postId = req.params.id;
        try {
            // Silmeden önce yetki kontrolü (Admin, Moderatör veya kendi yazısı) yapılmalı!
            const post = await BlogPost.findById(postId);
             if (!post) { /* 404 hatası */ throw new Error('Post not found'); /* ... */ }
            // Yetki kontrolü...

            const deletedCount = await BlogPost.delete(postId);
            if (deletedCount === 0) {
                const err = new Error('Blog post not found');
                err.status = 404;
                return next(err);
            }
            res.redirect('/admin/blog');
        } catch (error) {
            console.error("Error deleting blog post:", error);
            next(error);
        }
    }
};

module.exports = blogPostController;