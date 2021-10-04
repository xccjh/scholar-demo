export function ResourceManageRoute (path = 'resource-manage', name = path) {
  return {
    path,
    component: () => import(/* webpackChunkName: "resource-manage" */ './resource-manage.vue'),
    name,
    meta: {
      name: 'resource-manage'
    },
    children: [
      { path: 'read', component: () => import(/* webpackChunkName: "read-lib" */ './pages/read-lib/read-lib.vue') },
      { path: 'case', component: () => import(/* webpackChunkName: "case-lib" */ './pages/case-lib/case-lib.vue') },
      { path: 'exercise', component: () => import(/* webpackChunkName: "exercise-lib" */ './pages/exercise-lib/exercise-lib.vue') },
      { path: 'save-train/:type/:id/:professionId', component: () => import(/* webpackChunkName: "save-train" */ './pages/save-train/save-train.vue') },
      { path: 'material-details/:resourceId/:materialType/:courseId', component: () => import(/* webpackChunkName: "save-material" */ './pages/save-material/save-material.vue') },
      { path: 'material-pre-case/:resourceId/:materialType/:courseId', component: () => import(/* webpackChunkName: "save-preview" */ './pages/case-preview/case-preview.vue') }
    ]
  }
}
