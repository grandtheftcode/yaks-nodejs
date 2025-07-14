// models/Menu.js
const db = require('../config/database');

const Menu = {
    /**
     * Tüm menü konumlarını getirir.
     */
    getAll: () => {
        return db('menus').select('*').orderBy('name', 'asc');
    },

    /**
     * Belirli bir ID'ye sahip menü konumunu getirir.
     */
    findById: (id) => {
        return db('menus').where({ id: id }).first();
    },

    /**
     * Belirli bir location_slug'a sahip menü konumunu getirir.
     */
    findByLocation: (locationSlug) => {
        return db('menus').where({ location_slug: locationSlug }).first();
    },

    /**
     * Yeni bir menü konumu oluşturur.
     */
    create: (menuData) => {
        // location_slug'ın benzersiz olduğundan emin olmak için kontrol controller'da yapılabilir.
        return db('menus').insert(menuData);
    },

    /**
     * Belirli bir ID'ye sahip menü konumunu günceller.
     */
    update: (id, menuData) => {
         // location_slug güncelleniyorsa benzersizlik kontrolü controller'da yapılmalı.
        return db('menus').where({ id: id }).update(menuData);
    },

    /**
     * Belirli bir ID'ye sahip menü konumunu siler.
     * Dikkat: Bu işlem 'menu_items' tablosundaki ilişkili öğeleri de silecektir (ON DELETE CASCADE nedeniyle).
     */
    delete: (id) => {
        return db('menus').where({ id: id }).del();
    }
};

module.exports = Menu;