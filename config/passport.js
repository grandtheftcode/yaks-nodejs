// config/passport.js
const LocalStrategy = require('passport-local').Strategy; // Yerel stratejiyi import et
const bcrypt = require('bcrypt');                       // Şifre karşılaştırma için bcrypt
const User = require('../models/User');                   // Kullanıcı modelimizi import et

// Passport yapılandırmasını dışa aktaracak fonksiyon
module.exports = function(passport) {
    passport.use(
        // Yeni bir yerel strateji tanımla
        new LocalStrategy(
            { usernameField: 'email', passwordField: 'password' }, // Formdaki input name'leri (email ve password bekliyoruz)
            async (email, password, done) => {
                // Bu fonksiyon, kullanıcı giriş yapmaya çalıştığında çalışır
                try {
                    // 1. Kullanıcıyı e-posta adresine göre veritabanında bul
                    //    Modelde şifreyi de getiren bir fonksiyona ihtiyacımız var (findByEmailWithPassword gibi)
                    const user = await User.findByEmailWithPassword(email);

                    // 2. Kullanıcı bulunamadı mı?
                    if (!user) {
                        // Hata yok, kullanıcı yok, flash mesajı için info
                        return done(null, false, { message: 'Bu e-posta adresi kayıtlı değil.' });
                    }

                    // 3. Şifreleri karşılaştır
                    //    Formdan gelen düz metin şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştır
                    const isMatch = await bcrypt.compare(password, user.password);

                    // 4. Şifre eşleşiyor mu?
                    if (isMatch) {
                        // Hata yok, kullanıcı bulundu ve doğrulandı
                        // Kullanıcı nesnesini (şifre hariç) session'a kaydedilmek üzere döndür
                        // Hassas bilgileri (örn: şifre hash) session'a koymamak önemlidir
                        const userToSerialize = {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                            // İhtiyaç duyulan diğer güvenli alanlar eklenebilir
                        };
                        return done(null, userToSerialize);
                    } else {
                        // Hata yok, kullanıcı var ama şifre yanlış
                        return done(null, false, { message: 'Şifre yanlış.' });
                    }
                } catch (error) {
                    // Veritabanı veya başka bir hata oluştu
                    console.error("Error during local strategy authentication:", error);
                    return done(error); // Hatayı Passport'a bildir
                }
            }
        )
    ); // passport.use sonu

    // Kullanıcı bilgilerini session'a kaydetme (serialize)
    // Login başarılı olduğunda çağrılır. Kullanıcı nesnesinden hangi bilginin
    // session'da saklanacağını belirler (genellikle sadece ID).
    passport.serializeUser((user, done) => {
        done(null, user.id); // Sadece kullanıcı ID'sini session'a kaydet
    });

    // Session'dan kullanıcı bilgilerini geri yükleme (deserialize)
    // Her istekte, session'daki ID kullanılarak çağrılır.
    // ID'ye göre kullanıcıyı veritabanından bulur ve req.user nesnesine ekler.
    passport.deserializeUser(async (id, done) => {
        try {
            // ID'ye göre kullanıcıyı bul (şifre olmadan)
            const user = await User.findById(id);
            if (user) {
                // Kullanıcı nesnesini (şifre hariç) req.user'a ata
                 const userToDeserialize = {
                     id: user.id,
                     username: user.username,
                     email: user.email,
                     role: user.role
                 };
                done(null, userToDeserialize); // Hata yok, kullanıcı bulundu
            } else {
                done(null, false); // Kullanıcı bulunamadı (belki silinmiştir)
            }
        } catch (error) {
            console.error("Error during deserialization:", error);
            done(error, null); // Veritabanı hatası vb.
        }
    });

}; // module.exports sonu