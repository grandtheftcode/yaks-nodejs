// models/Category.js
const db = require('../config/database');

const Category = {
    /**
     * Tüm kategorileri getirir.
     * @returns {Promise<Array>} Kategori nesneleri dizisi içeren bir Promise.
     */
    getAll: () => {
        return db('categories').select('*').orderBy('name', 'asc'); // Alfabetik sırala
    },

    /**
     * Belirli bir ID'ye sahip kategoriyi getirir.
     * @param {number} id - Aranacak kategorinin ID'si.
     * @returns {Promise<Object|undefined>} Kategori nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findById: (id) => {
        return db('categories').where({ id: id }).first();
    },

    /**
     * Belirli bir slug'a sahip kategoriyi getirir.
     * @param {string} slug - Aranacak kategorinin slug'ı.
     * @returns {Promise<Object|undefined>} Kategori nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findBySlug: (slug) => {
        return db('categories').where({ slug: slug }).first();
    },

    /**
     * Yeni bir kategori oluşturur.
     * @param {Object} categoryData - Oluşturulacak kategori verileri (name, slug, description).
     * @returns {Promise<Array<number>>} Eklenen kaydın ID'sini içeren bir dizi döndüren Promise.
     */
    create: (categoryData) => {
        // 'created_at' ve 'updated_at' Knex veya veritabanı tarafından otomatik yönetilebilir,
        // ancak emin olmak için eklenebilir:
        // categoryData.created_at = db.fn.now();
        // categoryData.updated_at = db.fn.now();
        return db('categories').insert(categoryData);
    },

    /**
     * Belirli bir ID'ye sahip kategoriyi günceller.
     * @param {number} id - Güncellenecek kategorinin ID'si.
     * @param {Object} categoryData - Güncellenecek kategori verileri (name, slug, description).
     * @returns {Promise<number>} Güncellenen satır sayısını içeren bir Promise.
     */
    update: (id, categoryData) => {
        categoryData.updated_at = db.fn.now(); // updated_at alanını manuel güncelle
        return db('categories').where({ id: id }).update(categoryData);
    },

    /**
     * Belirli bir ID'ye sahip kategoriyi siler.
     * @param {number} id - Silinecek kategorinin ID'si.
     * @returns {Promise<number>} Silinen satır sayısını içeren bir Promise.
     */
    delete: (id) => {
        // Dikkat: Kategori silindiğinde, bu kategoriye bağlı yazıların
        // category_id alanı SET NULL olarak ayarlanmıştı (veritabanı şemasında).
        // Eğer CASCADE olsaydı, ilgili yazılar da silinirdi.
        return db('categories').where({ id: id }).del();
    }
};

module.exports = Category;