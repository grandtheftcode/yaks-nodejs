// models/Setting.js
const db = require('../config/database');

const Setting = {
    /**
     * Tüm ayarları getirir.
     * Ayarları anahtarlarına göre bir nesne olarak döndürmek kullanışlı olabilir.
     * @returns {Promise<Object>} Anahtarı ayar adı, değeri ayar nesnesi olan bir nesne.
     * Örn: { site_title: { setting_key: 'site_title', setting_value: '...', ... }, ... }
     */
    getAllAsObject: async () => {
        const settingsArray = await db('settings').select('*');
        const settingsObject = {};
        settingsArray.forEach(setting => {
            settingsObject[setting.setting_key] = setting;
        });
        return settingsObject;
    },

    /**
     * Tüm ayarları bir dizi olarak getirir (admin formunu oluşturmak için).
     * @returns {Promise<Array>} Ayar nesneleri dizisi.
     */
    getAllAsArray: () => {
         // Belki admin panelinde belirli bir sırada göstermek isteriz
         // return db('settings').select('*').orderBy('setting_key', 'asc');
         return db('settings').select('*');
    },

    /**
     * Belirli bir ayarı anahtarına göre getirir.
     * @param {string} key - Ayarın anahtarı.
     * @returns {Promise<Object|undefined>} Ayar nesnesi veya bulunamazsa undefined.
     */
    findByKey: (key) => {
        return db('settings').where({ setting_key: key }).first();
    },

    /**
     * Belirli bir ayarın sadece değerini getirir. Public tarafta kullanışlıdır.
     * @param {string} key - Ayarın anahtarı.
     * @param {any} defaultValue - Ayar bulunamazsa döndürülecek varsayılan değer.
     * @returns {Promise<string|null|any>} Ayarın değeri veya varsayılan değer.
     */
    getValueByKey: async (key, defaultValue = null) => {
         const setting = await db('settings').select('setting_value').where({ setting_key: key }).first();
         return setting ? setting.setting_value : defaultValue;
    },
    getCurrentTemplate: async (key, defaultValue = null) => {
        const setting = await db('settings').select('setting_value').where({ setting_key: "current_template" }).first();
        return setting ? setting.setting_value : defaultValue;
   },
   setCurrentTemplate: async (key, defaultValue = null) => {
    const setting = await db('settings').select('setting_value').where({ setting_key: "current_template" }).first();
    setting.update(setting_value,key);
},

    /**
     * Ayarları toplu olarak günceller veya ekler.
     * Admin panelindeki ayar formundan gelen veriyi işler.
     * @param {Object} settingsData - Anahtarı ayar adı, değeri yeni değer olan nesne.
     * Örn: { site_title: 'Yeni Başlık', theme_color_primary: '#ff0000' }
     * @returns {Promise} Tüm işlemlerin tamamlanmasını bekleyen bir Promise.
     */
    updateBulk: (settingsData) => {
        // Knex transaction kullanarak tüm güncellemelerin başarılı olmasını garantile
        return db.transaction(async trx => {
            const updates = [];
            for (const key in settingsData) {
                if (Object.hasOwnProperty.call(settingsData, key)) {
                    const value = settingsData[key];
                    // UPSERT (Update or Insert) mantığı: Var olanı güncelle, yoksa ekle.
                    // Knex'in doğrudan upsert'ü her veritabanında farklı çalışabilir.
                    // En uyumlu yöntem: Önce var mı diye bak, sonra update veya insert yap.
                    // Daha basit yöntem (MySQL için): INSERT ... ON DUPLICATE KEY UPDATE
                    const updatePromise = trx('settings')
                        .where('setting_key', key)
                        .update({
                            setting_value: value
                            // updated_at otomatik güncellenir
                        });
                        // .then(updatedCount => {
                        //     // Eğer update 0 satır etkilediyse (yani key yoksa), insert yap.
                        //     // Bu yöntem biraz daha karmaşık transaction yönetimi gerektirir.
                        //     // Şimdilik sadece var olanları güncellediğini varsayalım.
                        //     // Yeni ayar ekleme ayrı bir işlem olabilir.
                        // });

                     // Alternatif (MySQL/PostgreSQL): Raw SQL ile ON CONFLICT / ON DUPLICATE KEY
                     /*
                     const upsertQuery = `
                         INSERT INTO settings (setting_key, setting_value)
                         VALUES (?, ?)
                         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
                     `;
                     const updatePromise = trx.raw(upsertQuery, [key, value]);
                     */

                    updates.push(updatePromise);
                }
            }
            // Tüm update sorgularını aynı anda gönder ve bekle
            await Promise.all(updates);
        });
    },

     /**
     * Yeni bir ayar ekler (Admin panelinde nadiren kullanılır, genellikle başlangıçta eklenir).
     * @param {Object} settingData - Eklenecek ayarın tüm bilgileri (setting_key, setting_value, description, input_type).
     * @returns {Promise}
     */
    create: (settingData) => {
         return db('settings').insert(settingData);
    }

    // Ayar silme genellikle yapılmaz, ama gerekirse eklenebilir.
    // delete: (key) => { ... }
};

module.exports = Setting;