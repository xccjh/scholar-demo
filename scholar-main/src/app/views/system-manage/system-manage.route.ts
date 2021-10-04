export function SystemManageRoute (path = 'system-manage', name = path) {
  return {
    path,
    component: () => import(/* webpackChunkName: "system-manage" */ './system-manage.vue'),
    name,
    meta: {
      name: 'system-manage'
    },
    children: [
      {
        path: 'admin-security',
        component: () => import(/* webpackChunkName: "admin-security" */ './pages/admin-security/admin-security.vue')
      }
    ]
  }
}
