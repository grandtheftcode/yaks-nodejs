// controllers/userController.js

const User = require('../models/User');
const { ROLES, ROLE_NAMES } = require('../config/roles');
const db = require('../config/database'); // <--- BU SATIRI EKLEYİN

const userController = {
    listUsers: async (req, res, next) => {
        try {
            const users = await User.getAll();
            res.render('admin/users', {
                title: 'Kullanıcıları Yönet',
                users: users,
                // Rol isimlerini view'da kullanmak için gönderelim
                ROLE_NAMES: ROLE_NAMES,
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
            // ... (hata işleme aynı)
            console.error('Error fetching users:', error);
            next(error);
        }
    },

    showAddForm: (req, res) => {
        res.render('admin/add-user', {
             title: 'Yeni Kullanıcı',
             // Rol seçeneklerini view'a gönderelim
             ROLES: ROLES,
             ROLE_NAMES: ROLE_NAMES,
             layout: '../views/layouts/admin-layout'
        });
    },

      addUser: async (req, res, next) => {
        const { username, email, password, role } = req.body;




        // !! Güvenlik Notu: Burada mevcut kullanıcının yeni kullanıcıya kendisinden daha yüksek bir rol atamasını engellemek gibi ek kontroller gerekebilir.
        // Örneğin, sadece Admin başka birini Admin yapabilmeli. Şimdilik basit tutuyoruz.

        try {
            // ... (mevcut kullanıcı kontrolü aynı) ...
             const existingUser = await User.findByEmailWithPassword(email) || await User.findByUsernameWithPassword(username);
             if (existingUser) {
                 // ... (hata mesajı ve render aynı, ROLES ve ROLE_NAMES eklenmeli) ...
                 let errorMessage = '';
                 if (existingUser.email === email) errorMessage = 'Email already exists.';
                 else errorMessage = 'Username already exists.';
                 return res.status(400).render('admin/add-user', {
                      title: 'Yeni Kullanıcı',
                      error: errorMessage,
                      ROLES: ROLES,
                      ROLE_NAMES: ROLE_NAMES,
                      layout: '../views/layouts/admin-layout',
                      formData: { username, email, role: role }
                 });
             }


            // ...
            // !! User.create artık şifreyi OTOMATİK hash'leyecek !!
            const newUser = { username, email, password: password, role: role };
            await User.create(newUser); // Modeldeki güncellenmiş create çağrılır
            res.redirect('/admin/users');

        } catch (error) {
             // ... (hata işleme aynı)
             console.error('Error adding user:', error);
             next(error);
        }
    },

    showEditForm: async (req, res, next) => {
        const userId = req.params.id;
        try {
            const user = await User.findById(userId);
            if (!user) {
                 // ... (kullanıcı bulunamadı hatası aynı)
                 const err = new Error('User not found');
                 err.status = 404;
                 return next(err);
            }
            res.render('admin/edit-user', {
                title: `Kullanıcıyı Düzenle: ${user.username}`,
                user: user,
                // Rol seçeneklerini ve isimlerini view'a gönderelim
                ROLES: ROLES,
                ROLE_NAMES: ROLE_NAMES,
                layout: '../views/layouts/admin-layout'
            });
        } catch (error) {
             // ... (hata işleme aynı)
             console.error('Error fetching user for edit:', error);
             next(error);
        }
    },

    updateUser: async (req, res, next) => {
        const userId = req.params.id;
        // Formdan 'role' alanını da alalım
        const { username, email, role } = req.body;
        const selectedRole = parseInt(role, 10); // String'i sayıya çevir
try {
        // Doğrulama
        if (!username || !email || isNaN(selectedRole) || !Object.values(ROLES).includes(selectedRole)) {
                 // ... (hata mesajı ve render aynı, ROLES ve ROLE_NAMES eklenmeli) ...
                  let errorMessage = '';
                  if (existingUser.email === email) errorMessage = 'Email already belongs to another user.';
                  else errorMessage = 'Username already belongs to another user.';
                  const user = await User.findById(userId);
                  return res.status(400).render('admin/edit-user', {
                      title: `Kullanıcıyı Düzenle: ${user.username}`,
                      user: { ...user, username, email, role: selectedRole },
                      error: errorMessage,
                      ROLES: ROLES,
                      ROLE_NAMES: ROLE_NAMES,
                      layout: '../views/layouts/admin-layout'
                  });
             }
             
           // Güncellenecek verilere rolü de ekle
           const updatedData = { username, email, role: selectedRole };
           const updatedCount = await User.update(userId, updatedData);

           if (updatedCount === 0) {
               // Kullanıcı bulunamadı veya veri aynı olduğu için güncelleme olmadı
                const err = new Error('User not found or no changes made');
                err.status = 404;
                return next(err);
           }
           res.redirect('/admin/users'); // Başarılı güncelleme sonrası listeye dön
        }
        catch (error) {
            console.error('Error updating user:', error);
             // Eğer veritabanı seviyesinde unique kısıtlaması hatası olursa (nadiren buraya düşer ama olabilir)
             if (error.code === 'ER_DUP_ENTRY') {
                 const user = await User.findById(userId);
                 return res.status(400).render('admin/edit-user', {
                     title: `Kullanıcıyı Düzenle: ${user.username}`,
                     user: { ...user, username, email },
                     error: 'Username or Email already exists.',
                     layout: '../views/layouts/admin-layout'
                 });
             }
            next(error);
        }
    },
    // deleteUser fonksiyonu genellikle aynı kalabilir.
     deleteUser: async (req, res, next) => {
        const userId = req.params.id;

        // !! Güvenlik Notu: Son Admin kullanıcısının silinmesini engellemek gibi kontroller eklenebilir.
        // const userToDelete = await User.findById(userId);
        // const adminCount = await db('users').where({ role: ROLES.ADMIN }).count('id as count').first();
        // if (userToDelete.role === ROLES.ADMIN && adminCount.count <= 1) {
        //     return next(new Error('Cannot delete the last administrator.'));
        // }

         try {
             const deletedCount = await User.delete(userId);
             if (deletedCount === 0) {
                 // ... (kullanıcı bulunamadı hatası aynı)
                   const err = new Error('User not found');
                   err.status = 404;
                   return next(err);
             }
             res.redirect('/admin/users');
         } catch (error) {
             // ... (hata işleme aynı)
              console.error('Error deleting user:', error);
              next(error);
         }
    }
};

module.exports = userController;