import { computed, defineComponent, toRefs } from 'vue'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { useStore } from 'vuex'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
import { LocalStorageUtil, ToolsUtil } from '@/common/utils'
import { useSearchTableAdance } from '@/app/views/hooks'
import { PacketInfoListDataType } from '@/app/views/course-manage/pages/scp-list/entity'
import { FeedbackStatisticsApi } from '@/app/views/course-manage/pages/feedback-statistics/api'
import 'viewerjs/dist/viewer.min.css'
import Viewer from 'viewerjs'

export default defineComponent({
  name: 'feedback-statistics',

  setup () {
    const menuService = useRequiredInject(MenuServiceKey)
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const route: RouteLocationNormalizedLoaded = useRoute()
    const userId = LocalStorageUtil.getUserId()
    const gotoback = () => {
      menuService.goBack(false)
      menuService.gotoUrl({
        url: '/m/course-manage/scp-list',
        paramUrl: '',
        title: '课包'
      })
    }

    const getImageFullPath = (path) => {
      return ToolsUtil.getOssUrl(path)
    }

    const previewImg = (container) => {
      const viewer = new Viewer(document.getElementById(container) as HTMLElement, {
        backdrop: 'static',
        button: true,
        navbar: true,
        toolbar: true,
        title: true,
        hidden: () => {
          viewer.destroy()
        }
      })
      viewer.show()
    }

    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<PacketInfoListDataType>>('feedback-statistics', {
      searchWordVal: ''
    }, (tableState) => {
      FeedbackStatisticsApi.getFeedBackList({
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        searchKey: tableState.searchWordValue.trim(),
        coursePacketId: route.query.coursePacketId
      }).then((res) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map(item => ({
            ...item,
            key: ToolsUtil.randomString()
          }))
          tableState.total = res.data.page.totalResult
        }
      })
    })
    const pagination = computed(() => ({
      total: tableState.total,
      current: tableState.pageIndex,
      pageSize: tableState.pageSize,
      showSizeChanger: true,
      defaultPageSize: 15,
      pageSizeOptions: ['15', '20', '30', '40', '50'],
      showTotal: (total) => (`共 ${total} 条记录`)
    }))

    return {
      gotoback,
      pagination,
      searchList,
      resetData,
      storingData,
      ...toRefs(tableState),
      searchData,
      getDate,
      loading,
      previewImg,
      getImageFullPath
    }
  }

})
