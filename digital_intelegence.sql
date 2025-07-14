-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 14 Tem 2025, 17:19:22
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
-- Veritabanı: `digital_intelegence`
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
(7, 'Home', 'home', '<div class=\"postContent\"> <b>Saygıdeğer Hocalarım,</b><br><br>\r\nDijital dünyada güçlü bir varlık oluşturmanın ve hedef kitlenize etkili bir şekilde ulaşmanın günümüzdeki öneminin farkındayız. İşte bu bilinçle, YAKS CMS (kendi geliştirdiğimiz, Node.js tabanlı güçlü içerik yönetim sistemi) altyapısıyla size özel, yenilikçi ve yüksek performanslı çözümler sunuyoruz. Amacımız, dijital hedeflerinize ulaşmanız için size en uygun ve etkili araçları sunmaktır.<br> <b>Hizmetlerimiz ve Avantajları:</b><br> <b>1. YAKS CMS + 1 Yıl Hosting Hizmeti : 1500 TL</b><ul><li><b>Güçlü Altyapı:</b> Kendi geliştirdiğimiz Node.js tabanlı YAKS CMS, modern web teknolojilerinin sunduğu hız, güvenlik ve esnekliği bir araya getirir.</li> <li><b>Yüksek Performans:</b> Node.js\'in olay güdümlü ve bloklanmayan yapısı sayesinde web siteniz hızlı ve akıcı bir deneyim sunar.</li> <li><b>Kolay Yönetim:</b> Kullanıcı dostu arayüzümüz sayesinde içeriğinizi kolayca yönetebilir, güncelleyebilir ve geliştirebilirsiniz.</li> <li><b>Güvenilir Hosting:</b> Web sitenizin kesintisiz ve güvenli bir şekilde yayınlanması için yüksek performanslı hosting hizmetimizle yanınızdayız.</li> <li><b>Ekonomik Çözüm:</b> Başlangıç için ideal olan bu paket, güçlü bir altyapıya uygun bir maliyetle sahip olmanızı sağlar.</li> </ul><b>2. Basit Mobil Uygulama (YAKS CMS Entegre) + YAKS CMS + 1 Yıl Hosting Hizmeti: 6500 TL</b><ul><li><b>Geniş Kitleye Erişim:</b> Mobil uygulamanız sayesinde öğrenci ve velilerinize her an her yerden ulaşın.</li> <li><b>Anlık Bilgilendirme:</b> Duyurular, etkinlikler, notlar ve diğer önemli bilgileri mobil uygulama üzerinden anında paylaşın.</li> <li><b>YAKS CMS Entegrasyonu:</b> Web sitenizdeki içerikler otomatik olarak mobil uygulamanıza yansır, böylece içerik yönetiminde zaman ve iş gücü tasarrufu sağlarsınız.</li> <li><b>Kullanıcı Dostu Arayüz:</b> Hedef kitlenizin kolayca kullanabileceği sezgisel bir tasarıma sahiptir.</li> <li><b>Değerli İletişim Kanalı:</b> Mobil uygulama üzerinden geri bildirimler alabilir, anketler düzenleyebilir ve etkileşimi artırabilirsiniz.</li> </ul><b>3. 6 Revizeli, CMS Dışı Özel Fonksiyonlu Uygulama ve Web Sitesi Yazım Hizmeti (YAKS CMS\'li)+ 1 Yıl Hosting Hizmeti: 30000 TL</b><ul><li><b>Tamamen Size Özel Çözümler:</b> İhtiyaçlarınıza özel olarak tasarlanmış, özgün fonksiyonlara sahip web siteleri ve uygulamalar geliştiriyoruz.</li> <li><b>Sınırsız İmkanlar:</b> Özel kullanıcı portalları, interaktif özellikler, entegrasyonlar ve aklınızdaki diğer tüm özel projeleri hayata geçirebiliriz.</li> <li><b>Yüksek Kalite ve Güvenilirlik:</b> Alanında uzman ve deneyimli ekibimizle en son teknolojileri kullanarak yüksek kaliteli ve güvenilir çözümler sunuyoruz.</li> <li><b>6 Revizyon Hakkı:</b> Proje sürecinde 6 kez revizyon yapma imkanı sunarak, sonucun tam olarak beklentilerinizi karşılamasını sağlıyoruz.</li> <li><b>Uzun Vadeli Yatırım:</b> Özel çözümlerimiz, kurumunuzun dijital altyapısını güçlendirerek uzun vadede rekabet avantajı sağlar.</li> </ul><b>Neden Bizi Tercih Etmelisiniz?</b><ul><li><b>Kendi Geliştirdiğimiz Güçlü Altyapı:</b> YAKS CMS, size özel çözümler sunma ve uzun vadeli destek sağlama konusunda bize benzersiz bir avantaj sunar.</li> <li><b>Eğitim Sektörüne Özel Çözümler:</b> İhtiyaçlarınızı ve dinamiklerini iyi anlıyor, buna yönelik çözümler geliştiriyoruz.</li> <li><b>Müşteri Memnuniyeti Odaklı Yaklaşım:</b> Her aşamada sizinle yakın iletişim kuruyor, beklentilerinizi en üst düzeyde karşılamak için çalışıyoruz.</li> <li><b>Tecrübeli ve Uzman Ekip:</b> Alanında deneyimli ve yetkin bir ekiple projelerinizi hayata geçiriyoruz.</li> <li><b>Sürdürülebilir ve Ölçeklenebilir Çözümler:</b> Sunduğumuz çözümler, kurumunuzun büyüme hedefleriyle uyumlu ve gelecekteki ihtiyaçlarınıza cevap verebilecek niteliktedir.</li> </ul>Gelin, dijital dönüşüm yolculuğunuzda size eşlik edelim. İhtiyaçlarınızı daha detaylı görüşmek ve size özel çözümler sunmak için bizimle iletişime geçmekten lütfen çekinmeyin.<br> <i>(Lütfen domain ve uygulama mağaza (Google Play, App Store) kaydı için ayrı bir ücretin söz konusu olduğunu unutmayınız.)</i><br> <b>Saygılarımızla,</b><br>\r\nYusuf CANSEVER\r\n					</div>', 'published', '2025-04-17 22:39:07', '2025-05-18 16:32:08');

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
(10, 'yusufiadmin', '1643.yusuf@gmail.com', '$2b$10$.gONZBOJ4lWH./tH4wRkpuW8xp6rtjMvtR2BC8mGFq1XQeHBteZMm', 0, '2025-05-18 17:37:05', '2025-05-18 17:37:05');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
