// models/BlogPost.js
const db = require('../config/database');

const BlogPost = {
    /**
     * Tüm blog yazılarını (yazar ve kategori bilgileriyle birlikte) getirir.
     * Sayfalama için opsiyonel limit ve offset eklenebilir.
     * @param {object} options - Opsiyonel filtreleme/sayfalama parametreleri (örn: { limit, offset, categoryId, userId, status })
     * @returns {Promise<Array>} Blog yazısı nesneleri dizisi içeren bir Promise.
     */
    getAll: (options = {}) => {
        let query = db('blog_posts as bp') // blog_posts tablosuna 'bp' aliası verelim
            .select(
                'bp.id', 'bp.title', 'bp.slug', 'bp.status', 'bp.created_at', 'bp.updated_at',
                'u.id as author_id', 'u.username as author_username', // Yazar bilgileri
                'c.id as category_id', 'c.name as category_name'      // Kategori bilgileri
            )
            .leftJoin('users as u', 'bp.user_id', 'u.id') // users tablosuyla join (yazar için)
            .leftJoin('categories as c', 'bp.category_id', 'c.id') // categories tablosuyla join
            .orderBy('bp.created_at', 'desc'); // En yeni yazılar başta

        // Opsiyonel Filtreleme
        if (options.status) {
            query = query.where('bp.status', options.status);
        }
        if (options.categoryId) {
            query = query.where('bp.category_id', options.categoryId);
        }
         if (options.userId) {
            query = query.where('bp.user_id', options.userId);
        }
        // Diğer filtreler eklenebilir (başlığa göre arama vb.)

        // Opsiyonel Sayfalama
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.offset(options.offset);
        }

        return query;
    },

     /**
     * Belirli bir ID'ye sahip blog yazısını (yazar ve kategori bilgileriyle) getirir.
     * İçerik de dahil edilir.
     * @param {number} id - Aranacak yazının ID'si.
     * @returns {Promise<Object|undefined>} Blog yazısı nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findById: (id) => {
        return db('blog_posts as bp')
            .select(
                'bp.*', // Yazının tüm alanlarını al (content dahil)
                'u.id as author_id', 'u.username as author_username',
                'c.id as category_id', 'c.name as category_name'
            )
            .leftJoin('users as u', 'bp.user_id', 'u.id')
            .leftJoin('categories as c', 'bp.category_id', 'c.id')
            .where('bp.id', id)
            .first();
    },

     /**
     * Belirli bir slug'a sahip blog yazısını getirir.
     * (Genellikle public site tarafında kullanılır)
     * @param {string} slug - Aranacak yazının slug'ı.
     * @returns {Promise<Object|undefined>} Blog yazısı nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findBySlug: (slug) => {
         return db('blog_posts as bp')
            .select('bp.*', 'u.username as author_username', 'c.name as category_name')
            .leftJoin('users as u', 'bp.user_id', 'u.id')
            .leftJoin('categories as c', 'bp.category_id', 'c.id')
            .where('bp.slug', slug)
            // Public sitede sadece yayınlanmışları göstermek isteyebiliriz
            // .where('bp.status', 'published')
            .first();
    },

     /**
     * Toplam blog yazısı sayısını getirir (sayfalama için kullanılır).
     * @param {object} options - Opsiyonel filtreleme parametreleri (örn: { categoryId, userId, status })
     * @returns {Promise<number>} Toplam yazı sayısı.
     */
    getTotalCount: async (options = {}) => {
         let query = db('blog_posts').count('id as count');

         // getAll ile aynı filtreleri uygula
         if (options.status) {
            query = query.where('status', options.status);
         }
         if (options.categoryId) {
             query = query.where('category_id', options.categoryId);
         }
          if (options.userId) {
             query = query.where('user_id', options.userId);
         }

         const result = await query.first();
         return result ? result.count : 0;
     },

    /**
     * Yeni bir blog yazısı oluşturur.
     * @param {Object} postData - Oluşturulacak yazı verileri (title, slug, content, user_id, category_id, status, featured_image).
     * @returns {Promise<Array<number>>} Eklenen kaydın ID'sini içeren bir dizi döndüren Promise.
     */
    create: (postData) => {
        // category_id boş string ise NULL yapalım (veritabanı hatası almamak için)
        if (postData.category_id === '') {
            postData.category_id = null;
        }
        return db('blog_posts').insert(postData);
    },

    /**
     * Belirli bir ID'ye sahip blog yazısını günceller.
     * @param {number} id - Güncellenecek yazının ID'si.
     * @param {Object} postData - Güncellenecek yazı verileri.
     * @returns {Promise<number>} Güncellenen satır sayısını içeren bir Promise.
     */
    update: (id, postData) => {
        // category_id boş string ise NULL yapalım
         if (postData.category_id === '') {
            postData.category_id = null;
        }
        postData.updated_at = db.fn.now(); // updated_at alanını manuel güncelle
        return db('blog_posts').where({ id: id }).update(postData);
    },

    /**
     * Belirli bir ID'ye sahip blog yazısını siler.
     * @param {number} id - Silinecek yazının ID'si.
     * @returns {Promise<number>} Silinen satır sayısını içeren bir Promise.
     */
    delete: (id) => {
        return db('blog_posts').where({ id: id }).del();
    }
};

module.exports = BlogPost;