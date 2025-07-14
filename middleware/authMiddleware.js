// middleware/authMiddleware.js
const { ROLES } = require('../config/roles');

const authMiddleware = {
    /**
     * Kullanıcının giriş yapıp yapmadığını kontrol eder.
     */
    ensureAuthenticated: (req, res, next) => {
        // Passport tarafından eklenen isAuthenticated() fonksiyonunu kullan
        if (req.isAuthenticated()) {
            return next(); // Kullanıcı giriş yapmış, devam et
        }
        // Giriş yapılmamışsa flash mesajı ayarla ve login sayfasına yönlendir
        req.flash('error_msg', 'Bu sayfayı görüntülemek için lütfen giriş yapın.');
        res.redirect('/login');
    },

    /**
     * Kullanıcının belirtilen rollerden en az birine sahip olup olmadığını kontrol eder.
     */
    hasRole: (allowedRoles) => {
        return (req, res, next) => {
            // !! Artık req.user kullanıyoruz !!
            // ensureAuthenticated middleware'i önce çalıştığı için req.user'ın var olması beklenir.
            if (!req.user) {
                // Bu durum normalde olmamalı ama güvenlik için kontrol edelim
                 console.error("hasRole middleware: req.user is not defined. Ensure ensureAuthenticated runs first.");
                 req.flash('error_msg', 'Yetkilendirme hatası: Kullanıcı bilgisi bulunamadı.');
                 return res.redirect('/login');
            }

            const currentUserRole = req.user.role; // Giriş yapmış kullanıcının rolü

            if (allowedRoles && allowedRoles.includes(currentUserRole)) {
                return next(); // Yetkisi var, devam et
            } else {
                // Yetkisi yoksa, spesifik bir hata sayfası veya genel hata işleyiciye gönder
                console.warn(`Authorization denied: User role (${currentUserRole}) is not in allowed roles (${allowedRoles}) for ${req.originalUrl}`);
                // Basit bir hata mesajı ile anasayfaya veya dashboard'a yönlendirme
                // req.flash('error_msg', 'Bu işlemi yapmak için yetkiniz bulunmuyor.');
                // return res.redirect('/admin'); // Veya kullanıcıyı geldiği yere geri gönder?

                // Veya 403 Forbidden hatası ver
                 const err = new Error('Forbidden - You do not have permission to access this resource.');
                 err.status = 403;
                 return next(err); // Genel hata işleyiciye gönder (error.ejs'yi render eder)
            }
        };
    }
};

module.exports = authMiddleware;