export function CourseManageRoute (path = 'course-manage', name = path) {
  return {
    path,
    component: () => import(/* webpackChunkName: "course-manage" */ './course-manage.vue'),
    name,
    meta: {
      name: 'course-manage'
    },
    children: [
      {
        path: 'label-management',
        component: () => import(/* webpackChunkName: "label-management" */ './pages/label-management/label-management.vue'),
        meta: {
          name: '标签管理'
        }
      },
      {
        path: 'profession-list',
        component: () => import(/* webpackChunkName: "profession-list" */ './pages/profession-list/profession-list.vue'),
        meta: {
          name: '专业列表'
        }
      },
      {
        path: 'approve-all',
        component: () => import(/* webpackChunkName: "approve-all" */ './pages/course-approve-all/course-approve-all.vue'),
        meta: {
          name: '全部审批'
        }
      },
      {
        path: 'i-initiated',
        component: () => import(/* webpackChunkName: "i-initiated" */ './pages/course-i-initiated/course-i-initiated.vue'),
        meta: {
          name: '我的审批'
        }
      },
      {
        path: 'course-list',
        component: () => import(/* webpackChunkName: "course-list" */ './pages/course-list/course-list.vue'),
        meta: {
          name: '课程管理'
        }
      },
      {
        path: 'course-preview/:id',
        component: () => import(/* webpackChunkName: "course-preview" */ './pages/course-preview/course-preview.vue'),
        meta: {
          name: '课程预览'
        }
      },
      {
        path: 'statistics',
        component: () => import(/* webpackChunkName: "statistics" */ './pages/course-statistics/course-statistics.vue'),
        meta: {
          name: '数据统计'
        }
      },
      {
        path: 'wrong-questions',
        component: () => import(/* webpackChunkName: "wrong-questions" */ './pages/wrong-questions/wrong-questions.vue'),
        meta: {
          name: '错题统计'
        }
      },
      {
        path: 'graph-statistics',
        component: () => import(/* webpackChunkName: "graph-statistics" */ './pages/graph-statistics/graph-statistics.vue'),
        meta: {
          name: '图谱统计'
        }
      },
      {
        path: 'scp-course/:courseId/:knowledgeSubjectId/:status/:auditStatus/:courseCode/:leaderId',
        component: () => import(/* webpackChunkName: "scp-course" */ './pages/scp-course/scp-course.vue'),
        meta: {
          name: '课程建设'
        }
      },
      {
        path: 'initiatepkg',
        component: () => import(/* webpackChunkName: "course-manage" */ './pages/pkg-i-initiated/pkg-i-initiated.vue'),
        meta: {
          name: '我发起的'
        }
      },
      {
        path: 'iapproved',
        component: () => import(/* webpackChunkName: "initiatepkg" */ './pages/pkg-approve-all/pkg-approve-all.vue'),
        meta: {
          name: '全部审批'
        }
      },
      {
        path: 'scp-list',
        component: () => import(/* webpackChunkName: "scp-list" */ './pages/scp-list/scp-list.vue'),
        meta: {
          name: '课包列表'
        }
      },
      {
        path: 'prepare-course',
        component: () => import(/* webpackChunkName: "prepare-course" */ './pages/prepare-course/prepare-course.vue'),
        meta: {
          name: '课包建设'
        }
      },
      {
        path: 'series-management',
        component: () => import(/* webpackChunkName: "series-management" */ './pages/series-management/series-management.vue'),
        meta: {
          name: '系列管理'
        }
      },
      {
        path: 'operation-log',
        component: () => import(/* webpackChunkName: "operation-log" */ './pages/operation-log/operation-log.vue'),
        meta: {
          name: '操作日志'
        }
      },
      {
        path: 'feedback-statistics',
        component: () => import(/* webpackChunkName: "feedback-statistics" */'./pages/feedback-statistics/feedback-statistics.vue'),
        meta: {
          name: '反馈统计'
        }
      },
      {
        path: 'package-overview',
        component: () => import(/* webpackChunkName: "package-overview" */ './pages/package-overview/package-overview.vue'),
        meta: {
          name: '课包概况'
        }
      }
    ]
  }
}
