// controllers/menuController.js
const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const db = require('../config/database'); // Benzersizlik kontrolü için
const slugify = require('slugify'); // Menü konumu slug'ı için

const slugifyOptions = { replacement: '-', remove: /[*+~.()'"!:@]/g, lower: true, strict: true };

const menuController = {

    // --- Menü Konumları Yönetimi ---

    /**
     * Tüm menü konumlarını listeler.
     */
    listMenus: async (req, res, next) => {
        try {
            const menus = await Menu.getAll();
            res.render('admin/menus/list-locations', { // View: views/admin/menus/list-locations.ejs
                title: 'Menü Konumları',
                menus: menus,
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            console.error("Error fetching menu locations:", error);
            next(error);
        }
    },

    /**
     * Menü konumu ekleme formunu gösterir.
     */
    showAddMenuForm: (req, res) => {
         res.render('admin/menus/add-location', { // View: views/admin/menus/add-location.ejs
             title: 'Menü Konumları Ekle',
             layout: '../views/layouts/admin-layout'
         });
    },

    /**
     * Yeni menü konumu ekler.
     */
    addMenu: async (req, res, next) => {
        const { name, description } = req.body;
        if (!name) { /* Hata render et... */ return res.status(400).render(/*...*/); }

        const location_slug = slugify(name, slugifyOptions);

        try {
            const existing = await Menu.findByLocation(location_slug);
            if (existing) { /* Hata render et (slug zaten var)... */ return res.status(400).render(/*...*/); }

            await Menu.create({ name, location_slug, description });
            res.redirect('/admin/menus');
        } catch (error) {
             if (error.code === 'ER_DUP_ENTRY') { /* Hata render et... */ }
             console.error("Error adding menu location:", error);
             next(error);
        }
    },

    // Menü konumu düzenleme ve silme fonksiyonları da benzer şekilde eklenebilir (şimdilik atlıyoruz).
    // showEditMenuForm, updateMenu, deleteMenu

    // --- Belirli Bir Menünün Öğelerini Yönetme ---

    /**
     * Seçilen menünün öğelerini yönetmek için ana arayüzü gösterir.
     * Bu arayüzde öğe listesi, ekleme formu ve sıralama mekanizması bulunur.
     */
    manageMenuItems: async (req, res, next) => {
        const menuId = req.params.menuId; // URL'den menü ID'sini al
        try {
            const menu = await Menu.findById(menuId);
            if (!menu) {
                const err = new Error('Menu location not found');
                err.status = 404; return next(err);
            }

            // Menü öğelerini düz liste olarak al (düzenleme için)
            const menuItems = await MenuItem.getAllByMenuIdFlat(menuId);

            // Formda 'parent' seçimi için yine düz listeyi kullanabiliriz
            const parentOptions = menuItems.map(item => ({ id: item.id, title: item.title }));

            res.render('admin/menus/manage-items', { // View: views/admin/menus/manage-items.ejs
                title: `Menü Ögesi Ekle: ${menu.name}`,
                menu: menu,
                menuItems: menuItems, // Düz liste
                parentOptions: parentOptions, // Parent seçimi için
                layout: '../views/layouts/admin-layout'
                // Bu view'a sürükle-bırak JS kütüphanesi (örn: SortableJS) entegre edilecek
            });
        } catch (error) {
            console.error(`Error fetching items for menu ${menuId}:`, error);
            next(error);
        }
    },

    /**
     * Belirli bir menüye yeni öğe ekler.
     * Bu, manageMenuItems sayfasındaki formdan POST isteği ile çağrılır.
     */
    addMenuItem: async (req, res, next) => {
        const menuId = req.params.menuId;
        const { title, url, target, parent_id } = req.body;

        if (!title || !url) {
            // Hata yönetimi: Formu tekrar render et (flash mesajlar ideal olurdu)
            console.error("Menu item title and URL are required.");
             // Basit yönlendirme, idealde form hata mesajıyla gösterilmeli
            return res.redirect(`/admin/menus/items/${menuId}`);
        }

        // En sona eklemek için order belirle (veya 0 bırakılabilir)
         // const lastItem = await db('menu_items').where({ menu_id: menuId, parent_id: parent_id || null }).orderBy('item_order', 'desc').first();
         // const item_order = lastItem ? lastItem.item_order + 1 : 0;

        try {
            await MenuItem.create({
                menu_id: menuId,
                title,
                url,
                target: target || '_self',
                parent_id: parent_id || null, // Boş veya 0 gelirse null yap
                item_order: 0 // Şimdilik 0, sıralama ayrıca yapılacak
            });
            res.redirect(`/admin/menus/items/${menuId}/`); // Başarı sonrası aynı sayfaya dön
        } catch (error) {
            console.error("Error adding menu item:", error);
            next(error);
        }
    },

    /**
     * Belirli bir menü öğesini düzenleme formunu gösterir (AJAX ile veya ayrı sayfada).
     * Şimdilik basitlik adına manageMenuItems içindeki formlarla düzenleme yapıldığını varsayalım
     * veya bu fonksiyonu ayrı bir düzenleme sayfası için kullanabiliriz.
     */
    showEditMenuItemForm: async (req, res, next) => {
        // Bu fonksiyon, eğer her öğe için ayrı bir edit sayfası istenirse kullanılır.
        // Alternatif olarak, manage-items.ejs'de her öğe yanında düzenleme butonu
        // ve modal veya inline form ile düzenleme yapılabilir.
         const itemId = req.params.itemId;
         try {
             const menuItem = await MenuItem.findById(itemId);
             if (!menuItem) { /* 404 */ }
             const menu = await Menu.findById(menuItem.menu_id);
             const allItemsForMenu = await MenuItem.getAllByMenuIdFlat(menuItem.menu_id);
             const parentOptions = allItemsForMenu
                                   .filter(item => item.id !== menuItem.id) // Kendisini parent yapamasın
                                   .map(item => ({ id: item.id, title: item.title }));

             res.render('admin/menus/edit-item', { // Ayrı view: views/admin/menus/edit-item.ejs
                  title: `Menü Ögesi Düzenle: ${menuItem.title}`,
                  menuItem: menuItem,
                  menu: menu,
                  parentOptions: parentOptions,
                  layout: '../views/layouts/admin-layout'
              });
         } catch (error) { next(error); }
    },

    /**
     * Belirli bir menü öğesini günceller.
     */
    updateMenuItem: async (req, res, next) => {
        const itemId = req.params.itemId;
        const { title, url, target, parent_id } = req.body; // order genellikle ayrı güncellenir

         if (!title || !url) { /* Hata yönetimi */ }

         try {
             // Döngüsel parent ilişkisi kontrolü eklenebilir (bir öğe kendi alt öğesi olamaz)

             await MenuItem.update(itemId, {
                 title,
                 url,
                 target: target || '_self',
                 parent_id: parent_id || null
                 // item_order burada güncellenmez, o ayrı işlem
             });

             // İsteğin kaynağına göre yönlendir (eğer ayrı sayfaysa liste sayfasına gibi)
             const menuItem = await MenuItem.findById(itemId); // menu_id'yi almak için
             res.redirect(`/admin/menus/${menuItem.menu_id}/items`);

         } catch (error) { next(error); }
    },

    /**
     * Menü öğelerinin sırasını ve hiyerarşisini günceller (AJAX isteği ile).
     * Sürükle-bırak JS'den gelen veriyi işler.
     */
    updateItemsOrder: async (req, res, next) => {
        const menuId = req.params.menuId;
        // Sürükle-bırak kütüphanesinden gelen veri genellikle şuna benzer bir yapıda olur:
        // req.body.items = [ { id: 5, parent_id: null, item_order: 0 }, { id: 7, parent_id: 5, item_order: 0 }, ... ]
        const items = req.body.items;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Invalid items data.' });
        }

        try {
            // Tüm öğelerin aynı menuId'ye ait olduğundan emin ol (güvenlik)
            // ... (kontrol eklenebilir) ...

            await MenuItem.updateOrderAndParent(items);
            res.json({ success: true, message: 'Menu order updated successfully.' }); // AJAX isteğine JSON yanıtı
        } catch (error) {
            console.error("Error updating menu items order:", error);
             res.status(500).json({ success: false, message: 'Failed to update menu order.' });
        }
    },

    /**
     * Belirli bir menü öğesini siler.
     */
    deleteMenuItem: async (req, res, next) => {
         const itemId = req.params.itemId;
         let menuId; // Yönlendirme için menuId'yi almamız lazım

         try {
             const menuItem = await MenuItem.findById(itemId);
             if (!menuItem) { /* 404 - öğe bulunamadı */ }
             menuId = menuItem.menu_id; // Yönlendirme için sakla

             // Silme işlemi (CASCADE ilişkisi alt öğeleri de silecek)
             await MenuItem.delete(itemId);

             res.redirect(`/admin/menus/items/${menuId}`);

         } catch (error) {
             console.error("Error deleting menu item:", error);
             // Hata durumunda da menuId'yi biliyorsak o sayfaya yönlendirebiliriz
             if (menuId) {
                  res.redirect(`/admin/menus/items/${menuId}?error=delete_failed`); // Hata parametresi ile
             } else {
                 next(error); // Bilmiyorsak genel hata işleyiciye
             }
         }
    }
};

module.exports = menuController;