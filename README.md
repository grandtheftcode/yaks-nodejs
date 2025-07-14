# yaks-nodejs
```

**Türkiye'nin Açık Kaynak Node.js Tabanlı CMS Sistemi**

YAKS CMS (Yusuf Akıllı Kolay Site), modern web siteleri için tasarlanmış, kullanıcı dostu, hafif ve esnek bir içerik yönetim sistemidir. Summernote editörüyle zengin içerikler oluşturabilir, tema motoruyla siteni özelleştirebilir ve kullanıcı yönetimiyle kontrolü elinde tutabilirsin.

## 🚀 Özellikler

- 📝 **Blog ve Sayfa Editörü**
  - Summernote tabanlı WYSIWYG editör
  - Taslak / yayın / silinmiş içerik yönetimi
  - Zengin medya desteği (resim, video, bağlantı)

- 🎨 **Tema Motoru**
  - Tema klasörlerinden dinamik tema seçimi
  - EJS tabanlı şablon sistemi
  - Kolayca özelleştirilebilir HTML/CSS yapısı

- 👤 **Kullanıcı Editörü**
  - Profil bilgilerini güncelleme
  - Şifre değiştirme sistemi (🛠️ geliştirme aşamasında)
  - Basit yetkilendirme (admin / yazar)

- 📁 **Sayfa Yönetimi**
  - Statik sayfa oluşturma (Hakkımızda, İletişim vb.)
  - SEO dostu URL yapısı (slug desteği)

## 🛠️ Kullanılan Teknolojiler

- **Sunucu:** Node.js + Express.js  
- **Veritabanı:** MongoDB + Mongoose  
- **Editör:** Summernote  
- **Şablonlama:** EJS  
- **Kimlik Doğrulama:** Passport.js / JWT

## ⚙️ Kurulum

```bash
git clone https://github.com/kullaniciadi/yaks-cms.git
cd yaks-cms
npm install
npm start
```

Varsayılan olarak: [http://localhost:3000](http://localhost:3000)

## 🛤️ Yol Haritası

- [x] Summernote destekli içerik düzenleme
- [x] Temel tema motoru
- [ ] Şifre değiştirme arayüzü
- [ ] Tema pazarı ve yükleme arayüzü
- [ ] Eklenti desteği (plugin sistemi)

## 🧪 Demo / Ekran Görüntüsü

(Ekran görüntüleri buraya eklenecek)

## 🤝 Katkıda Bulunun

Pull request’ler, hata bildirimleri ve geliştirme önerileri için katkıda bulunabilirsiniz.  
Yeni geliştiriciler için dost canlısı bir ortam sunmayı hedefliyoruz.

## 📝 Lisans

MIT Lisansı

---

Geliştirici: [Grand Theft Code (Yusuf CANSEVER)](https://github.com/grandtheftcode)  
```