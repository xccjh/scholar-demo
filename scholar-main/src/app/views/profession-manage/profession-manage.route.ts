export function ProfessionManageRoute (path = 'profession-manage', name = path) {
  return {
    path,
    component: () => import(/* webpackChunkName: "profession-manage" */ './profession-manage.vue'),
    name,
    meta: {
      name: 'profession-manage'
    }
  }
}
