// models/Page.js
const db = require('../config/database');

const Page = {
    /**
     * Tüm sabit sayfaları getirir.
     * @returns {Promise<Array>} Sayfa nesneleri dizisi içeren bir Promise.
     */
    getAll: () => {
        // İçerik (content) genellikle liste görünümünde getirilmez, çok uzun olabilir.
        return db('pages').select('id', 'title', 'slug', 'status', 'created_at', 'updated_at')
                          .orderBy('title', 'asc'); // Başlığa göre sırala
    },

    /**
     * Belirli bir ID'ye sahip sayfayı (içerikle birlikte) getirir.
     * @param {number} id - Aranacak sayfanın ID'si.
     * @returns {Promise<Object|undefined>} Sayfa nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findById: (id) => {
        return db('pages').where({ id: id }).first(); // Tüm alanları getirir
    },

    /**
     * Belirli bir slug'a sahip sayfayı getirir.
     * (Genellikle public site tarafında kullanılır)
     * @param {string} slug - Aranacak sayfanın slug'ı.
     * @returns {Promise<Object|undefined>} Sayfa nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findBySlug: (slug) => {
        return db('pages').where({ slug: slug })
                          // Public sitede sadece yayınlanmışları göstermek isteyebiliriz
                          // .where('status', 'published')
                          .first();
    },

    /**
     * Yeni bir sabit sayfa oluşturur.
     * @param {Object} pageData - Oluşturulacak sayfa verileri (title, slug, content, status).
     * @returns {Promise<Array<number>>} Eklenen kaydın ID'sini içeren bir dizi döndüren Promise.
     */
    create: (pageData) => {
        return db('pages').insert(pageData);
    },

    /**
     * Belirli bir ID'ye sahip sayfayı günceller.
     * @param {number} id - Güncellenecek sayfanın ID'si.
     * @param {Object} pageData - Güncellenecek sayfa verileri.
     * @returns {Promise<number>} Güncellenen satır sayısını içeren bir Promise.
     */
    update: (id, pageData) => {
        pageData.updated_at = db.fn.now(); // updated_at alanını manuel güncelle
        return db('pages').where({ id: id }).update(pageData);
    },

    /**
     * Belirli bir ID'ye sahip sayfayı siler.
     * @param {number} id - Silinecek sayfanın ID'si.
     * @returns {Promise<number>} Silinen satır sayısını içeren bir Promise.
     */
    delete: (id) => {
        return db('pages').where({ id: id }).del();
    }
};

module.exports = Page;