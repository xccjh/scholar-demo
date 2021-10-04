import { computed, defineComponent, onErrorCaptured, toRefs } from 'vue'
import { LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { useSearchTableAdance } from '@/app/views/hooks'
import { useStore } from 'vuex'
import { CommonPagination, win } from '@/common/base'
import { MenuServiceKey } from '@/common/services'
import { CourseListDataType, CourseListParams } from '../course-list/entity'
import { moment } from '@/main'
import { AxiosResponse } from 'axios'
import { CourseListApi } from '../course-list/api'
import { useRequiredInject } from '@/common/hooks'

declare const window: win

export default defineComponent({
  name: 'i-initiated',
  setup () {
    onErrorCaptured((e) => {
      console.log(e)
    })
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()
    const menuService = useRequiredInject(MenuServiceKey)
    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<CourseListDataType>>('i-initiated', {
      selectedVal: '',
      searchWordVal: '',
      dateRangeVal: []
    }, (tableState) => {
      const param: CourseListParams = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        searchKey: tableState.searchWordValue.trim(),
        auditStatus: tableState.selectedValue || '',
        filterKey: 'MANAGER',
        startBillDate: '',
        endBillDate: '',
        queryFilterType: 'I_STARTED'
      }
      if (tableState.dateRangeValue.length) {
        param.startBillDate = moment(tableState.dateRangeValue[0]).format('YYYY-MM-DD')
        param.endBillDate = moment(tableState.dateRangeValue[1]).format('YYYY-MM-DD')
      }
      CourseListApi.getCourseList(param).then((res:AxiosResponse<CommonPagination<CourseListDataType>>) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map(item => ({
            ...item,
            key: item.id,
            eduLevel: (item.eduLevel as string)?.split(',')
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

    /**
     * 课程预览
     * @param data
     */
    const preview = (data: CourseListDataType): void => {
      SessionStorageUtil.removeKnowledgeGraphTab() // 菜单栏切换需要保留tab状态，预览入口不需要
      SessionStorageUtil.putCourseType('1') // 返回区分标志
      menuService.gotoUrl({
        url: '/m/course-manage/course-preview',
        paramUrl: `/${data.id}?type=my`,
        title: '课程预览'
      })
    }

    return {
      loading,
      orgCode,
      userId,
      pagination,
      searchData,
      searchList,
      resetData,
      storingData,
      getDate,
      preview,
      ...toRefs(tableState)
    }
  }
})
