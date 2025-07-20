// server.js (en üstteki require'lar)
require('dotenv').config();
const express = require('express');
const path = require('path');
const vhost = require('vhost');
const expressLayouts = require('express-ejs-layouts');
// YENİ Importlar:
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session); // ✅ Artık çalışır
const knex = require('./config/database');
const passport = require('passport');
const flash = require('connect-flash');
require('./config/passport')(passport); 
tc = require('./controllers/themeController.js');
const userRoutes = require('./routes/userRoutes');
// ... diğer route importları ...
const settingRoutes = require('./routes/settingRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); 
const blogRoutes = require('./routes/blogRoutes'); 
const pageRoutes = require('./routes/pageRoutes'); 
const menuRoutes = require('./routes/menuRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const ThemeRoutes = require('./routes/themeRoutes.js'); 
const carouselRoutes = require('./routes/carouselRoutes'); // <-- YENİ
const ProductRoutes = require('./routes/productRoutes.js'); // Product router'ı import et
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000; // Portu .env'den al veya 3000 kullan

const Setting = require('./models/Setting');
 strink = "";
async function getTheme() {
    strink = await Setting.getCurrentTemplate()
    tc.applyThemeFile(strink)
}
getTheme()


// 3. View Engine Ayarları (EJS ve Layouts)
app.use(expressLayouts); // express-ejs-layouts middleware'ini etkinleştir
app.set('layout', './layouts/admin-layout'); // Varsayılan layout dosyasını belirt (views klasörüne göre)
app.set('view engine', 'ejs'); // View engine olarak EJS'yi ayarla
app.set('views', path.join(__dirname, 'views')); // views klasörünün yolunu belirt

// 4. Middleware Ayarları
// Statik dosyaları sunmak için (public klasörü: CSS, JS, resimler)
app.use(express.static(path.join(__dirname, "public")));
// Gelen isteklerdeki URL-encoded veriyi (form verisi) parse etmek için
app.use(express.urlencoded({ extended: true }));
// Gelen isteklerdeki JSON veriyi parse etmek için (API'ler için kullanışlı)
app.use(express.json());



// Store'u factory fonksiyon gibi çağırıyoruz
const store = new KnexSessionStore({
  knex,
  tablename: 'sessions',
  createtable: true,
  clearInterval: 1000 * 60 * 60
});


// Session middleware
app.use(session({
  secret: 'drtfjsoiswejpgf',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 saatlik ömür
    secure: false           // HTTPS kullanıyorsan true yap
  }
}));

// --- Passport Middleware ---
app.use(passport.initialize()); // Passport'u başlat
app.use(passport.session());    // Kalıcı login oturumları için (express-session'dan sonra gelmeli)

// --- Flash Mesaj Middleware ---
app.use(flash()); // connect-flash'ı etkinleştir (session'dan sonra gelmeli)

// --- Flash Mesajları Global Değişken Olarak Ayarlama (View'larda kolay erişim için) ---
// Bu middleware, her istekte flash mesajları `res.locals`'a ekler,
// böylece tüm EJS şablonlarında `success_msg`, `error_msg` gibi değişkenler kullanılabilir.
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg'); // 'success_msg' flash mesajlarını al
    res.locals.error_msg = req.flash('error_msg');     // 'error_msg' flash mesajlarını al
    res.locals.error = req.flash('error');             // Passport'un login hataları için 'error' anahtarını kullanır
    res.locals.currentUser = req.user || null;        // Giriş yapmış kullanıcıyı (varsa) view'lara gönderir (req.user Passport tarafından eklenir)
    // Rol sabitlerini de view'lara global olarak gönderebiliriz (yetki kontrolleri için)
    const { ROLES } = require('./config/roles');
    res.locals.ROLES = ROLES;
    next(); // Bir sonraki middleware'e geç
});



// Kullanıcı ile ilgili tüm route'ları /admin/users altında kullan
// Yani userRoutes.js içindeki '/' -> '/admin/users' olacak
// userRoutes.js içindeki '/add' -> '/admin/users/add' olacak


app.use('/', authRoutes); // <-- YENİ (Login, Logout, /admin gibi route'ları içerir)
app.use('/admin/users', userRoutes);
app.use('/admin/categories', categoryRoutes); // <-- YENİ
app.use('/admin/blog', blogRoutes); // <-- YENİ
app.use('/admin/pages', pageRoutes); // <-- YENİ
app.use('/admin/menus', menuRoutes);
app.use('/admin/settings', settingRoutes); // <-- YENİ
app.use('/admin/carousel', carouselRoutes);
app.use('/admin/products', ProductRoutes);
app.use('/admin/themes', ThemeRoutes);

// Diğer kaynaklar için route'lar buraya eklenebilir
// app.use('/admin/products', productRoutes);

// 6. Hata İşleme (Error Handling) Middleware'leri

app.use((err, req, res, next) => {
    // ... (Mevcut genel hata işleyici kodunuz) ...
    console.error('Genel Hata Yakalandı:', err.stack || err); // Stack trace'i logla
    const statusCode = err.status || 500;
    const message = err.message || 'Sunucuda bir hata oluştu.';


    res.status(statusCode).render(statusCode.toString(), { // views/error.ejs'yi kullanır (Genel Hatalar İçin)
        title: `Hata: ${statusCode}`,
        message: message,
        layout: false // Veya hata layout'u
        // errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 7. Sunucuyu Başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
    console.log(`Yönetim Paneli: http://localhost:${port}/admin/users`);
});