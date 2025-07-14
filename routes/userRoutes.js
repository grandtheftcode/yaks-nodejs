// routes/userRoutes.js
const { ROLES } = require('../config/roles');
const express = require('express');
const router = express.Router(); // Express'in Router modülünü kullanıyoruz
const userController = require('../controllers/userController'); // Oluşturduğumuz userController'ı import ediyoruz
const { ensureAuthenticated, hasRole } = require('../middleware/authMiddleware');
const canManagePages = hasRole([ROLES.ADMIN]);

// Kullanıcı Yönetimi Rotaları (/admin/users altında çalışacak şekilde planlıyoruz)

// GET /admin/users -> Tüm kullanıcıları listele (Controller: listUsers)
router.get('/',ensureAuthenticated,canManagePages,  userController.listUsers);

// GET /admin/users/add -> Yeni kullanıcı ekleme formunu göster (Controller: showAddForm)
router.get('/add', ensureAuthenticated,canManagePages, userController.showAddForm);

// POST /admin/users/add -> Yeni kullanıcıyı veritabanına ekle (Controller: addUser)
router.post('/add',ensureAuthenticated,canManagePages,  userController.addUser);

// GET /admin/users/edit/:id -> Belirli bir kullanıcıyı düzenleme formunu göster (Controller: showEditForm)
// :id dinamik bir parametredir, URL'den alınabilir (req.params.id)
router.get('/edit/:id',ensureAuthenticated,canManagePages,  userController.showEditForm);

// POST /admin/users/edit/:id -> Belirli bir kullanıcıyı güncelle (Controller: updateUser)
router.post('/edit/:id',ensureAuthenticated,canManagePages,  userController.updateUser);

// POST /admin/users/delete/:id -> Belirli bir kullanıcıyı sil (Controller: deleteUser)
// Not: Formlar genellikle sadece GET ve POST desteklediği için silme işlemi POST ile yapılıyor.
// RESTful API'lerde bu genellikle DELETE metodu ile yapılır.
router.post('/delete/:id',ensureAuthenticated,canManagePages,  userController.deleteUser);


// Bu router'ı dışa aktararak ana uygulama dosyasında (server.js) kullanılabilir hale getiriyoruz
module.exports = router;