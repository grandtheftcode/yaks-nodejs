// models/CarouselSlide.js
const db = require('../config/database');

const CarouselSlide = {
    /**
     * Tüm carousel slaytlarını getirir (sıralı).
     * @param {object} options - Opsiyonel filtreleme/sıralama (örn: { status: 'published', orderBy: 'slide_order' })
     * @returns {Promise<Array>} Slayt nesneleri dizisi içeren bir Promise.
     */
    getAll: (options = {}) => {
        let query = db('carousel_slides').select('*');

        // Filtreleme
        if (options.status) {
            query = query.where('status', options.status);
        }

        // Sıralama
        const orderBy = options.orderBy || 'slide_order'; // Varsayılan sıralama
        const orderDirection = options.orderDirection || 'asc'; // Varsayılan yön
        query = query.orderBy(orderBy, orderDirection);

        return query;
    },

    /**
     * Belirli bir ID'ye sahip slaytı getirir.
     * @param {number} id - Aranacak slaytın ID'si.
     * @returns {Promise<Object|undefined>} Slayt nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findById: (id) => {
        return db('carousel_slides').where({ id: id }).first();
    },

    /**
     * Yeni bir carousel slaytı oluşturur.
     * @param {Object} slideData - Oluşturulacak slayt verileri.
     * @returns {Promise<Array<number>>} Eklenen kaydın ID'sini içeren bir dizi döndüren Promise.
     */
    create: (slideData) => {
         // Varsayılan değerleri ayarla (gerekirse)
         if (typeof slideData.slide_order === 'undefined') {
            slideData.slide_order = 0;
         }
         if (!slideData.status) {
            slideData.status = 'published';
         }
        return db('carousel_slides').insert(slideData);
    },

    /**
     * Belirli bir ID'ye sahip slaytı günceller.
     * @param {number} id - Güncellenecek slaytın ID'si.
     * @param {Object} slideData - Güncellenecek slayt verileri.
     * @returns {Promise<number>} Güncellenen satır sayısını içeren bir Promise.
     */
    update: (id, slideData) => {
        slideData.updated_at = db.fn.now(); // updated_at alanını manuel güncelle
        return db('carousel_slides').where({ id: id }).update(slideData);
    },

    /**
     * Slaytların sırasını toplu olarak günceller.
     * @param {Array<Object>} slides - Güncellenecek slaytlar dizisi [{ id, slide_order }, ...]
     * @returns {Promise} Tüm güncellemelerin tamamlanmasını bekleyen bir Promise.
     */
    updateOrder: (slides) => {
         return db.transaction(async trx => {
             await Promise.all(slides.map(slide => {
                 return trx('carousel_slides')
                         .where('id', slide.id)
                         .update({
                             slide_order: slide.slide_order,
                             updated_at: db.fn.now()
                         });
             }));
         });
     },

    /**
     * Belirli bir ID'ye sahip slaytı siler.
     * @param {number} id - Silinecek slaytın ID'si.
     * @returns {Promise<number>} Silinen satır sayısını içeren bir Promise.
     */
    delete: (id) => {
        // İlgili görsel dosyasını da silmek gerekebilir (Controller'da yapılmalı)
        return db('carousel_slides').where({ id: id }).del();
    }
};

module.exports = CarouselSlide;