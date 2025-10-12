

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
- **Veritabanı:** Mysql / Knex
- **Editör:** Summernote  
- **Şablonlama:** EJS  
- **Kimlik Doğrulama:** Passport.js / JWT

## ⚙️ Kurulum
eger sanal sunucu kullanıyorsanız 

İlk baş

makineye docket kurulur

sonrasında 

```bash
wget https://raw.githubusercontent.com/grandtheftcode/yaks-installer/refs/heads/main/yaks-installer-docker.sh && chmod 777 yaks-installer-docker.sh && ./yaks-installer-docker.sh

```
yazarak kurulum başlatılır ve kurulum adimlari takip edilerek veritabani ve kullanici bilgileri ayarlanilir ardindan yukleme otomatik olarak kurulur.

eger cpanel kullanıyorsaniz manuel kurulum yapabilirsiniz yakinda otomatik php kurulum scipti yayinda olacaktır (yazilimlin kullanilmasi için hala nodejs desteginin cpanelde olmasi gerekmektedir. docker desteginin olmasina gerek yoktur docker sadece vdste full stack kurulum icin tam uyumluluk saglamasi icin gereklidir cpanel uyumluluk altyapisi yazilimimiz icin uygundur)
## 🛤️ Yol Haritası

- [x] Summernote destekli içerik düzenleme
- [x] Temel tema motoru
- [ ] Şifre değiştirme arayüzü
- [ ] Tema pazarı ve yükleme arayüzü
- [ ] Eklenti desteği (plugin sistemi)

## 🧪 Demo / Ekran Görüntüsü

Yakinda Paylaşılacaktır

## 🤝 Katkıda Bulunun

Pull request’ler, hata bildirimleri ve geliştirme önerileri için katkıda bulunabilirsiniz.  
Yeni geliştiriciler için dost canlısı bir ortam sunmayı hedefliyoruz.

## 📝 Lisans

GNU Lisansı

---

Geliştirici: [Grand Theft Code (Yusuf CANSEVER)](https://github.com/grandtheftcode)  
