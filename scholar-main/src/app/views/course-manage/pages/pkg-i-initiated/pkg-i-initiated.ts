import { computed, defineComponent, onErrorCaptured, toRefs } from 'vue'
import { getAuditStatusPkg, LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { useSearchTableAdance } from '@/app/views/hooks'
import { useStore } from 'vuex'
import { CommonPagination, Json, win } from '@/common/base'
import { Bus } from '@/common/services'
import { CourseListDataType } from '../course-list/entity'
import { moment } from '@/main'
import { AxiosResponse } from 'axios'
import { delIf } from '@/app/views/course-manage/pages/pkg-i-initiated/uitls'
import { PkgIInitiatedApi } from '@/app/views/course-manage/pages/pkg-i-initiated/api'

declare const window: win

export default defineComponent({
  name: 'pkg-i-initiated',
  setup () {
    onErrorCaptured((e) => {
      console.log(e)
    })
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()

    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<CourseListDataType>>('initiatepkg', {
      searchWordVal: '',
      dateRangeVal: [],
      selectedVal: '1,2,3'
    }, (tableState) => {
      const param:Json = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        name: tableState.searchWordValue.trim(),
        auditStatus: tableState.selectedValue || '1,2,3',
        createTimeStart: '',
        createTimeEnd: '',
        orgCode: ToolsUtil.getOrgCode(),
        createrId: LocalStorageUtil.getUserId()
      }
      if (tableState.dateRangeValue.length) {
        param.createTimeStart = moment(tableState.dateRangeValue[0]).format('YYYY-MM-DD')
        param.createTimeEnd = moment(tableState.dateRangeValue[1]).format('YYYY-MM-DD')
      }
      PkgIInitiatedApi.getPkgList(param).then((res: AxiosResponse<CommonPagination<Json>>) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map(item => ({
            ...item,
            key: item.id
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
     * 课包预览
     * @param data
     */
    const preview = (data: CourseListDataType): void => {
      SessionStorageUtil.putPacketInfo(data, true)
      SessionStorageUtil.clearChapterSelection()
      SessionStorageUtil.putPkgType('my')
      Bus.$emit('gotoUrl', '/m/course-manage/prepare-course', '', '课包预览')
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
      delIf,
      getAuditStatusPkg,
      ...toRefs(tableState)
    }
  }
})
