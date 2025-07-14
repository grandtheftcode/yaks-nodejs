-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 14 Tem 2025, 17:39:37
-- Sunucu sürümü: 10.4.32-MariaDB
-- PHP Sürümü: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `yaks_db`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(270) NOT NULL,
  `content` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `featured_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `carousel_slides`
--

CREATE TABLE `carousel_slides` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `link_target` varchar(10) DEFAULT '_self',
  `slide_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('draft','published') NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(4, 'Genel', 'genel', '', '2025-04-11 20:12:12', '2025-04-11 20:12:12');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location_slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `menus`
--

INSERT INTO `menus` (`id`, `name`, `location_slug`, `description`, `created_at`) VALUES
(1, 'Ana Navigasyon', 'main-nav', 'Sitenin ana üst menüsü', '2025-04-11 08:30:47'),
(2, 'Üst Header', 'ust-header', 'Sitedeki En Üst Menü', '2025-04-14 07:48:14'),
(3, 'Sosyal Medya', 'sosyal-medya', 'Sosyal Medya İkonları', '2025-04-14 07:48:14');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `url` varchar(255) NOT NULL,
  `target` varchar(10) DEFAULT '_self',
  `parent_id` int(11) DEFAULT NULL,
  `item_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `menu_items`
--

INSERT INTO `menu_items` (`id`, `menu_id`, `title`, `url`, `target`, `parent_id`, `item_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Ana Sayfa', '/', '_self', NULL, 0, '2025-04-11 08:30:47', '2025-05-18 16:51:11'),
(8, 3, 'fa-youtube', 'https://www.youtube.com/@KlavyeGangsteri', '_self', NULL, 0, '2025-04-14 07:49:14', '2025-05-18 16:27:37'),
(9, 3, 'fa-instagram', 'https://www.instagram.com/cudazihin/', '_self', NULL, 0, '2025-04-14 08:07:51', '2025-04-18 08:48:32');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `pages`
--

CREATE TABLE `pages` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `content` longtext NOT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `pages`
--

INSERT INTO `pages` (`id`, `title`, `slug`, `content`, `status`, `created_at`, `updated_at`) VALUES
(7, 'Home', 'home', '<article class=\"markdown-body entry-content container-lg\" itemprop=\"text\"><p dir=\"auto\"><strong>Türkiye\'nin Açık Kaynak Node.js Tabanlı CMS Sistemi</strong></p>\r\n<p dir=\"auto\">YAKS CMS (Yusuf Akıllı Kolay Site), modern web siteleri için tasarlanmış, kullanıcı dostu, hafif ve esnek bir içerik yönetim sistemidir. Summernote editörüyle zengin içerikler oluşturabilir, tema motoruyla siteni özelleştirebilir ve kullanıcı yönetimiyle kontrolü elinde tutabilirsin.</p>\r\n<div class=\"markdown-heading\" dir=\"auto\"><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\">&nbsp;Özellikler</h2><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\"><strong style=\"font-size: 1rem;\">Blog ve Sayfa Editörü</strong></h2></div><ul dir=\"auto\"><li>\r\n<ul dir=\"auto\">\r\n<li>Summernote tabanlı WYSIWYG editör</li>\r\n<li>Taslak / yayın / silinmiş içerik yönetimi</li>\r\n<li>Zengin medya desteği (resim, video, bağlantı)</li>\r\n</ul>\r\n</li>\r\n<li>\r\n<p dir=\"auto\"><strong>Tema Motoru</strong></p>\r\n<ul dir=\"auto\">\r\n<li>Tema klasörlerinden dinamik tema seçimi</li>\r\n<li>EJS tabanlı şablon sistemi</li>\r\n<li>Kolayca özelleştirilebilir HTML/CSS yapısı</li>\r\n</ul>\r\n</li>\r\n<li>\r\n<p dir=\"auto\"><strong>Kullanıcı Editörü</strong></p>\r\n<ul dir=\"auto\">\r\n<li>Profil bilgilerini güncelleme</li>\r\n<li>Şifre değiştirme sistemi ( geliştirme aşamasında)</li>\r\n<li>Basit yetkilendirme (admin / yazar)</li>\r\n</ul>\r\n</li>\r\n<li>\r\n<p dir=\"auto\"><strong>Sayfa Yönetimi</strong></p>\r\n<ul dir=\"auto\">\r\n<li>Statik sayfa oluşturma (Hakkımızda, İletişim vb.)</li>\r\n<li>SEO dostu URL yapısı (slug desteği)</li>\r\n</ul>\r\n</li>\r\n</ul>\r\n<div class=\"markdown-heading\" dir=\"auto\"><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\">&nbsp;Kullanılan Teknolojiler</h2><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\"><strong style=\"font-size: 1rem;\">Sunucu:</strong><span style=\"font-size: 1rem;\"> Node.js + Express.js</span></h2></div><ul dir=\"auto\">\r\n<li><strong>Veritabanı:</strong> MongoDB + Mongoose</li>\r\n<li><strong>Editör:</strong> Summernote</li>\r\n<li><strong>Şablonlama:</strong> EJS</li>\r\n<li><strong>Kimlik Doğrulama:</strong> Passport.js / JWT</li>\r\n</ul>\r\n<div class=\"markdown-heading\" dir=\"auto\"><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\"> Kurulum</h2><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\"><span style=\"font-size: 1rem;\">İlk baş</span></h2></div>\r\n<div class=\"highlight highlight-source-shell notranslate position-relative overflow-auto\" dir=\"auto\"><pre>git clone https://github.com/grandtheftcode/yaks-nodejs.git\r\n<span class=\"pl-c1\">cd</span> yaks-nodejs</pre><div class=\"zeroclipboard-container\">\r\n    <clipboard-copy aria-label=\"Copy\" class=\"ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center\" data-copy-feedback=\"Copied!\" data-tooltip-direction=\"w\" value=\"git clone https://github.com/grandtheftcode/yaks-nodejs.git\r\ncd yaks-nodejs\" tabindex=\"0\" role=\"button\">\r\n      <svg aria-hidden=\"true\" height=\"16\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" data-view-component=\"true\" class=\"octicon octicon-copy js-clipboard-copy-icon\">\r\n    <path d=\"M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z\"></path><path d=\"M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z\"></path>\r\n</svg>\r\n      <svg aria-hidden=\"true\" height=\"16\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" data-view-component=\"true\" class=\"octicon octicon-check js-clipboard-check-icon color-fg-success d-none\">\r\n    <path d=\"M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z\"></path>\r\n</svg>\r\n    </clipboard-copy>\r\n  </div></div>\r\n<p dir=\"auto\">yazarak proje çekilir</p>\r\n<p dir=\"auto\">knexfile.js düzenlenerek veritabanınızın bilgileri ile değiştirilir</p>\r\n<p dir=\"auto\">Daha Sonra</p>\r\n<div class=\"snippet-clipboard-content notranslate position-relative overflow-auto\"><pre class=\"notranslate\"><code>npm install\r\nnpm start\r\n</code></pre><div class=\"zeroclipboard-container\">\r\n    <clipboard-copy aria-label=\"Copy\" class=\"ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center\" data-copy-feedback=\"Copied!\" data-tooltip-direction=\"w\" value=\"npm install\r\nnpm start\" tabindex=\"0\" role=\"button\">\r\n      <svg aria-hidden=\"true\" height=\"16\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" data-view-component=\"true\" class=\"octicon octicon-copy js-clipboard-copy-icon\">\r\n    <path d=\"M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z\"></path><path d=\"M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z\"></path>\r\n</svg>\r\n      <svg aria-hidden=\"true\" height=\"16\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" data-view-component=\"true\" class=\"octicon octicon-check js-clipboard-check-icon color-fg-success d-none\">\r\n    <path d=\"M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z\"></path>\r\n</svg>\r\n    </clipboard-copy>\r\n  </div></div>\r\n<p dir=\"auto\">komutları kullanılarak proje aktif edilir</p>\r\n<p dir=\"auto\">Varsayılan olarak: <a href=\"http://localhost:3000\" rel=\"nofollow\">http://localhost:3000</a></p>\r\n<div class=\"markdown-heading\" dir=\"auto\"><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\"> Yol Haritası</h2><a id=\"user-content-️-yol-haritası\" class=\"anchor\" aria-label=\"Permalink:  Yol Haritası\" href=\"#️-yol-haritası\"><svg class=\"octicon octicon-link\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path d=\"m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z\"></path></svg></a></div>\r\n<ul class=\"contains-task-list\">\r\n<li class=\"task-list-item\"><input type=\"checkbox\" id=\"\" disabled=\"\" class=\"task-list-item-checkbox\" aria-label=\"Completed task\" checked=\"\"> Summernote destekli içerik düzenleme</li>\r\n<li class=\"task-list-item\"><input type=\"checkbox\" id=\"\" disabled=\"\" class=\"task-list-item-checkbox\" aria-label=\"Completed task\" checked=\"\"> Temel tema motoru</li>\r\n<li class=\"task-list-item\"><input type=\"checkbox\" id=\"\" disabled=\"\" class=\"task-list-item-checkbox\" aria-label=\"Incomplete task\"> Şifre değiştirme arayüzü</li>\r\n<li class=\"task-list-item\"><input type=\"checkbox\" id=\"\" disabled=\"\" class=\"task-list-item-checkbox\" aria-label=\"Incomplete task\"> Tema pazarı ve yükleme arayüzü</li>\r\n<li class=\"task-list-item\"><input type=\"checkbox\" id=\"\" disabled=\"\" class=\"task-list-item-checkbox\" aria-label=\"Incomplete task\"> Eklenti desteği (plugin sistemi)</li>\r\n</ul>\r\n<div class=\"markdown-heading\" dir=\"auto\"><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\">&nbsp;Demo / Ekran Görüntüsü</h2><a id=\"user-content--demo--ekran-görüntüsü\" class=\"anchor\" aria-label=\"Permalink: ???? Demo / Ekran Görüntüsü\" href=\"#-demo--ekran-görüntüsü\"><svg class=\"octicon octicon-link\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path d=\"m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z\"></path></svg></a></div>\r\n<p dir=\"auto\">Yakinda Paylaşılacaktır</p>\r\n<div class=\"markdown-heading\" dir=\"auto\"><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\"> Katkıda Bulunun</h2><a id=\"user-content--katkıda-bulunun\" class=\"anchor\" aria-label=\"Permalink:  Katkıda Bulunun\" href=\"#-katkıda-bulunun\"><svg class=\"octicon octicon-link\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path d=\"m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z\"></path></svg></a></div>\r\n<p dir=\"auto\">Pull request’ler, hata bildirimleri ve geliştirme önerileri için katkıda bulunabilirsiniz.<br>\r\nYeni geliştiriciler için dost canlısı bir ortam sunmayı hedefliyoruz.</p>\r\n<div class=\"markdown-heading\" dir=\"auto\"><h2 tabindex=\"-1\" class=\"heading-element\" dir=\"auto\">&nbsp;Lisans</h2><a id=\"user-content--lisans\" class=\"anchor\" aria-label=\"Permalink: ???? Lisans\" href=\"#-lisans\"><svg class=\"octicon octicon-link\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path d=\"m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z\"></path></svg></a></div>\r\n<p dir=\"auto\">GNU Lisansı</p>\r\n<hr>\r\n<p dir=\"auto\">Geliştirici: <a href=\"https://github.com/grandtheftcode\">Grand Theft Code (Yusuf CANSEVER)</a></p>\r\n</article>', 'published', '2025-04-17 22:39:07', '2025-07-14 15:34:37');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(270) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `stock_quantity` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `category_id` int(11) DEFAULT NULL,
  `status` enum('published','draft','private') NOT NULL DEFAULT 'draft',
  `featured_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `input_type` varchar(20) DEFAULT 'text',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`, `description`, `input_type`, `updated_at`) VALUES
('address', 'Beyoğlu / Istanbul', 'Işyeri Adresi', 'textarea', '2025-04-18 08:30:45'),
('current_template', 'yaks.yaksstil', 'Mevcut Şablon', 'text', '2025-05-18 16:23:39'),
('eposta', 'info@yusufcansever.com.tr', 'E-Posta', 'text', '2025-04-18 08:29:48'),
('footer_text', '© 2025 Tüm Hakları Saklıdır.', 'Site alt bilgisinde görünecek metin (HTML olabilir)', 'textarea', '2025-04-13 12:49:53'),
('footer_textarea', 'Türkiyenin Dijital Kalbi', 'alt kısım için açıklama metni', 'textarea', '2025-05-18 16:48:23'),
('site_description', 'Türkiyenin Dijital Kalbi', 'Arama motorları için sitenin kısa açıklaması', 'textarea', '2025-05-18 16:02:40'),
('site_logo', '/uploads/settings/site_logo-1747585371869-99411583.png', 'Sitenin logosu (URL veya dosya yolu)', 'file', '2025-05-18 16:22:51'),
('site_title', 'Yaks CMS', 'Sitenin Başlığı', 'text', '2025-05-18 16:48:23'),
('teklif_link', 'https://www.r10.net/profil/186516-yusufcansever.html', 'teklif link', 'text', '2025-05-18 16:26:40'),
('telephone', '0 543 451 82 48', 'Telefon', 'text', '2025-04-18 08:30:05'),
('theme_color_menu_bg', '#00e645', 'Arka menü rengi', 'color', '2025-04-18 08:18:39'),
('theme_color_primary', '#437a49', 'Ana tema rengi (örn: butonlar, linkler)', 'color', '2025-04-18 08:18:41');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` tinyint(3) UNSIGNED NOT NULL DEFAULT 3 COMMENT '0: Admin, 1: Moderator, 2: Editor, 3: Visitor/Default',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(11, 'admin', 'ilk@user.com', '$2b$10$Kx2l.lq/aoV0oh7aRleh8OIv7Db0YY1M5bg/wfw4z5.NLe7D5CVmi', 0, '2025-07-14 15:35:22', '2025-07-14 15:35:22');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Tablo için indeksler `carousel_slides`
--
ALTER TABLE `carousel_slides`
  ADD PRIMARY KEY (`id`);

--
-- Tablo için indeksler `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Tablo için indeksler `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `location_slug` (`location_slug`);

--
-- Tablo için indeksler `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_id` (`menu_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Tablo için indeksler `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Tablo için indeksler `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `category_id` (`category_id`);

--
-- Tablo için indeksler `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Tablo için indeksler `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Tablo için AUTO_INCREMENT değeri `carousel_slides`
--
ALTER TABLE `carousel_slides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Tablo için AUTO_INCREMENT değeri `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Tablo için AUTO_INCREMENT değeri `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Tablo için AUTO_INCREMENT değeri `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Tablo için AUTO_INCREMENT değeri `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Tablo için AUTO_INCREMENT değeri `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Tablo için AUTO_INCREMENT değeri `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Tablo kısıtlamaları `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_items_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
