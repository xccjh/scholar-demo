export function ArchivesManageRoute (path = 'archives-manage', name = path) {
  return {
    path,
    component: () => import(/* webpackChunkName: "archives-manage" */ './archives-manage.vue'),
    name,
    meta: {
      name: 'archives-manage'
    },
    children: [
      {
        path: 'guide-teacher',
        component: () => import(/* webpackChunkName: "recording-lecturer" */ './pages/recording-lecturer.vue')
      }
    ]
  }
}
