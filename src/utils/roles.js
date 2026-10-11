// Canonical platform roles: USER (customer), HOST (provider), ADMIN.
// 'OWNER' is a legacy frontend alias of 'HOST' (old mock data/bookmarks).

export const normalizeRole = (role) => (role === 'OWNER' ? 'HOST' : role)

export const isHostRole = (role) => normalizeRole(role) === 'HOST'

export const HOST_ROLES = ['HOST', 'OWNER']
