// models/MenuItem.js
const db = require('../config/database');

const MenuItem = {
    /**
     * Belirli bir menüye ait TÜM öğeleri düz liste olarak getirir (sıralı).
     * Admin panelinde düzenleme için kullanışlıdır.
     * @param {number} menuId - Öğeleri getirilecek menünün ID'si.
     */
    getAllByMenuIdFlat: (menuId) => {
        return db('menu_items')
            .where({ menu_id: menuId })
            .orderBy(['parent_id', 'item_order'], 'asc'); // Önce üst seviye, sonra sıralama
    },

    /**
     * Belirli bir menüye ait öğeleri HİYERARŞİK yapıda getirir.
     * Public tema tarafında menüyü oluşturmak için idealdir.
     * @param {number} menuId - Öğeleri getirilecek menünün ID'si.
     * @returns {Promise<Array>} Hiyerarşik menü öğeleri dizisi (her öğe 'children' dizisi içerebilir).
     */
    getAllByMenuIdHierarchical: async (menuId) => {
        const allItems = await db('menu_items')
                                .where({ menu_id: menuId })
                                .orderBy('item_order', 'asc'); // Sadece item_order'a göre sırala

        // Öğeleri ID'lerine göre haritala (map)
        const itemMap = {};
        allItems.forEach(item => {
            itemMap[item.id] = { ...item, children: [] }; // Her öğeye boş bir children dizisi ekle
        });

        // Hiyerarşiyi oluştur
        const hierarchicalItems = [];
        allItems.forEach(item => {
            const currentItem = itemMap[item.id];
            if (item.parent_id && itemMap[item.parent_id]) {
                // Eğer üst öğe varsa ve haritada bulunuyorsa, çocuğu olarak ekle
                itemMap[item.parent_id].children.push(currentItem);
            } else {
                // Üst öğe yoksa (veya bulunamıyorsa), en üst seviyeye ekle
                hierarchicalItems.push(currentItem);
            }
        });

        return hierarchicalItems; // Sadece en üst seviyedeki öğeleri içeren dizi (alt öğeler 'children' içinde)
    },

    /**
     * Belirli bir ID'ye sahip menü öğesini getirir.
     */
    findById: (id) => {
        return db('menu_items').where({ id: id }).first();
    },

    /**
     * Yeni bir menü öğesi oluşturur.
     */
    create: (itemData) => {
        // parent_id boş string ise NULL yap
        if (itemData.parent_id === '' || itemData.parent_id === '0' || itemData.parent_id === 0) {
            itemData.parent_id = null;
        }
         // item_order yoksa 0 ata (veya son sıraya eklemek için mantık eklenebilir)
         if (typeof itemData.item_order === 'undefined') {
             itemData.item_order = 0;
         }
        return db('menu_items').insert(itemData);
    },

    /**
     * Belirli bir ID'ye sahip menü öğesini günceller.
     */
    update: (id, itemData) => {
        // parent_id boş string ise NULL yap
         if (itemData.parent_id === '' || itemData.parent_id === '0' || itemData.parent_id === 0) {
             itemData.parent_id = null;
         }
        itemData.updated_at = db.fn.now();
        return db('menu_items').where({ id: id }).update(itemData);
    },

    /**
     * Birden fazla menü öğesinin sırasını ve/veya üst öğesini günceller.
     * Admin panelinde sürükle-bırak ile sıralama/hiyerarşi değişikliği için kullanılır.
     * @param {Array<Object>} items - Güncellenecek öğeler dizisi [{ id, parent_id, item_order }, ...]
     * @returns {Promise} Tüm güncellemelerin tamamlanmasını bekleyen bir Promise.
     */
    updateOrderAndParent: (items) => {
        // Knex transaction kullanarak tüm güncellemelerin başarılı olmasını garantile
        return db.transaction(async trx => {
            // Promise.all ile tüm update sorgularını aynı anda gönder
            await Promise.all(items.map(item => {
                // parent_id null yapma kontrolü
                const parentId = (item.parent_id === '' || item.parent_id === '0' || item.parent_id === 0 || item.parent_id === null) ? null : item.parent_id;
                return trx('menu_items')
                        .where('id', item.id)
                        .update({
                            parent_id: parentId,
                            item_order: item.item_order,
                            updated_at: db.fn.now() // updated_at'ı da güncelleyelim
                        });
            }));
        });
    },

    /**
     * Belirli bir ID'ye sahip menü öğesini siler.
     * Dikkat: Bu işlem alt öğeleri de silebilir (ON DELETE CASCADE).
     */
    delete: (id) => {
        return db('menu_items').where({ id: id }).del();
    }
};

module.exports = MenuItem;