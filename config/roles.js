// config/roles.js

const ROLES = {
    ADMIN: 0,
    MODERATOR: 1,
    EDITOR: 2,
    VISITOR: 3 // veya GUEST, SUBSCRIBER vb.
};

// Rollerin sayısal değerlerinden isimlerine bir harita (map) oluşturalım (View'larda göstermek için kullanışlı)
const ROLE_NAMES = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.MODERATOR]: 'Moderatör',
    [ROLES.EDITOR]: 'Editör',
    [ROLES.VISITOR]: 'Ziyaretçi'
};

module.exports = {
    ROLES,
    ROLE_NAMES
};