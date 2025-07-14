// models/User.js (Sadece güncellenen kısımlar)
const db = require('../config/database');
const { ROLES, ROLE_NAMES } = require('../config/roles'); // Rol sabitlerini import et
const bcrypt = require('bcrypt'); // <-- bcrypt'i import et

const User = {
    getAll: () => {
        // 'role' alanını da seçiyoruz
        return db('users').select('id', 'username', 'email', 'role', 'created_at', 'updated_at')
                         .orderBy('created_at', 'desc');
    },

    findById: (id) => {
         // 'role' alanını da seçiyoruz
        return db('users').where({ id: id })
                          .select('id', 'username', 'email', 'role', 'created_at', 'updated_at')
                          .first();
    },

    // findByEmail, findByUsername, create, update, delete fonksiyonları genellikle aynı kalabilir
    // Ancak create ve update'e gelen userData içinde 'role' alanı da olabilir.

    // findByEmail ve findByUsername şifre kontrolü için kullanılacaksa password'ü de seçmeli
    findByEmailWithPassword: (email) => {
        return db('users').where({ email: email }).first();
   },
    findByUsernameWithPassword: (username) => {
        return db('users').where({ username: username }).first();
   },

   /**
    * Yeni bir kullanıcı oluşturur ve şifreyi hash'ler.
    * @param {Object} userData - username, email, password, role.
    * @returns {Promise<Array<number>>} Eklenen kaydın ID'sini içeren dizi.
    */
   create: async (userData) => { // <-- Fonksiyonu async yap
       try {
           // Şifreyi hash'le
           const saltRounds = 10; // Hash'leme karmaşıklığı (genellikle 10-12)
           const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

           // Hash'lenmiş şifre ile yeni kullanıcı verisini hazırla
           const newUser = {
               ...userData, // username, email, role
               password: hashedPassword // Orijinal şifre yerine hash'lenmiş olanı kullan
           };

           // Veritabanına ekle
           return db('users').insert(newUser);

       } catch (error) {
           console.error("Error hashing password or creating user:", error);
           throw error; // Hatayı controller'a fırlat
       }
   },


    /**
     * Belirli bir ID'ye sahip kullanıcıyı günceller.
     * @param {number} id - Güncellenecek kullanıcının ID'si.
     * @param {Object} userData - Güncellenecek kullanıcı verileri (username, email vb. - şifre hariç tutulabilir).
     * @returns {Promise<number>} Güncellenen satır sayısını içeren bir Promise (genellikle 1 veya 0).
     */
    update: (id, userData) => {
        // Şifre alanının bu fonksiyona gelmediğinden emin olalım (controller'da kontrol edilir)
        // veya geliyorsa silelim: delete userData.password;
        userData.updated_at = db.fn.now();
        return db('users').where({ id: id }).update(userData);
    },

    /**
     * Belirli bir ID'ye sahip kullanıcıyı siler.
     * @param {number} id - Silinecek kullanıcının ID'si.
     * @returns {Promise<number>} Silinen satır sayısını içeren bir Promise (genellikle 1 veya 0).
     */
    delete: (id) => {
        return db('users').where({ id: id }).del();
    }
};

// Modeli dışa aktararak diğer dosyalarda kullanılabilir hale getir
module.exports = User;