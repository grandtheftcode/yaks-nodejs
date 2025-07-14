// models/Product.js
const db = require('../config/database'); // Veritabanı bağlantısını import et

const Product = {
    /**
     * Tüm ürünleri getirir (filtrelenmiş ve sıralanmış olabilir).
     * @param {object} options - Opsiyonel filtreleme/sıralama (örn: { status: 'published', categoryId: 5, orderBy: 'price', orderDirection: 'desc' })
     * @returns {Promise<Array>} Ürün nesneleri dizisi içeren bir Promise.
     */
    getAll: (options = {}) => {
        let query = db('products').select('*');

        // Filtreleme
        if (options.status) {
            query = query.where('status', options.status);
        }
        if (options.categoryId) {
            query = query.where('category_id', options.categoryId);
        }
        // Gelecekte başka filtreler eklenebilir (örn: fiyat aralığı, stok durumu vb.)

        // Sıralama
        const orderBy = options.orderBy || 'name'; // Varsayılan sıralama: ürün adı
        const orderDirection = options.orderDirection || 'asc'; // Varsayılan yön
        query = query.orderBy(orderBy, orderDirection);

        return query;
    },

    /**
     * Belirli bir ID'ye sahip ürünü getirir.
     * @param {number} id - Aranacak ürünün ID'si.
     * @returns {Promise<Object|undefined>} Ürün nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findById: (id) => {
        return db('products').where({ id: id }).first();
    },

    /**
     * Belirli bir slug'a sahip ürünü getirir.
     * @param {string} slug - Aranacak ürünün slug'ı.
     * @returns {Promise<Object|undefined>} Ürün nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findBySlug: (slug) => {
        return db('products').where({ slug: slug }).first();
    },

    /**
     * Belirli bir SKU'ya sahip ürünü getirir.
     * @param {string} sku - Aranacak ürünün SKU'su.
     * @returns {Promise<Object|undefined>} Ürün nesnesi veya bulunamazsa undefined içeren bir Promise.
     */
    findBySku: (sku) => {
        return db('products').where({ sku: sku }).first();
    },

    /**
     * Yeni bir ürün oluşturur.
     * @param {Object} productData - Oluşturulacak ürün verileri. `slug` alanı genellikle controller tarafında oluşturulmalıdır.
     * @returns {Promise<Array<number>>} Eklenen kaydın ID'sini içeren bir dizi döndüren Promise.
     */
    create: (productData) => {
        // Varsayılan değerler SQL şemasında tanımlı, ama isterseniz burada da zorlayabilirsiniz.
        if (!productData.status) {
            productData.status = 'draft'; // SQL'deki varsayılanı kullanmak daha iyi olabilir.
        }
        // created_at ve updated_at genellikle veritabanı tarafından otomatik yönetilir.
        return db('products').insert(productData);
    },

    /**
     * Belirli bir ID'ye sahip ürünü günceller.
     * @param {number} id - Güncellenecek ürünün ID'si.
     * @param {Object} productData - Güncellenecek ürün verileri.
     * @returns {Promise<number>} Güncellenen satır sayısını içeren bir Promise.
     */
    update: (id, productData) => {
        // updated_at alanı genellikle SQL şemasındaki `ON UPDATE current_timestamp()` ile otomatik güncellenir.
        // Ancak manuel olarak ayarlamak isterseniz veya trigger yoksa:
        // productData.updated_at = db.fn.now();
        return db('products').where({ id: id }).update(productData);
    },

    /**
     * Belirli bir ID'ye sahip ürünü siler.
     * @param {number} id - Silinecek ürünün ID'si.
     * @returns {Promise<number>} Silinen satır sayısını içeren bir Promise.
     */
    delete: (id) => {
        // İlgili görsel dosyalarını (featured_image) silmek gerekebilir.
        // Bu işlem genellikle controller katmanında, bu delete çağrısından önce veya sonra yapılır.
        return db('products').where({ id: id }).del();
    }

    // İhtiyaç halinde eklenebilecek diğer metodlar:
    // - search(searchTerm): Ürün adı, açıklama vb. alanlarda arama yapmak için.
    // - getFeatured(): Öne çıkan ürünleri getirmek için (eğer 'featured' gibi bir alan eklenirse).
    // - getByCategory(categoryId): Belirli bir kategorideki ürünleri getirmek için (getAll ile de yapılabilir).
    // - updateStock(id, quantityChange): Stok miktarını güncellemek için özel bir metod.
};

module.exports = Product;