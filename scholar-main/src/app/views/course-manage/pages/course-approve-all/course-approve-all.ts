import { computed, defineComponent, onErrorCaptured, ref, toRefs } from 'vue'
import { LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { useSearchTableAdance } from '@/app/views/hooks'
import { useStore } from 'vuex'
import { CommonPagination, Json, win } from '@/common/base'
import { CourseListDataType, CourseListParams } from '../course-list/entity'
import { moment } from '@/main'
import { AxiosResponse } from 'axios'
import { CourseListApi } from '../course-list/api'
import { MenuServiceKey } from '@/common/services'
import { CourseApproveAllApi } from './api'
import { APPROVE_MAP } from '@/common/constants'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { useRequiredInject } from '@/common/hooks'

type Key = ColumnProps['key'];
declare const window: win

export default defineComponent({
  name: 'approve-all',
  setup () {
    onErrorCaptured((e) => {
      console.log(e)
    })

    const addKnowledgePoints = ref(0)
    const delKnowledgePoints = ref(0)
    const menuService = useRequiredInject(MenuServiceKey)
    const store = useStore()
    const visible = ref(false)
    const approveVisible = ref(false)
    const record = ref<Partial<CourseListDataType>>({})
    const loading = computed(() => store.state.loading)
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()

    const selectedRowKey = ref<Key[]>([])
    const hasSelected = computed(() => selectedRowKey.value.length > 0)
    const onSelectChange = (selectedRowKeys: Key[]) => {
      selectedRowKey.value = selectedRowKeys
    }

    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<CourseListDataType>>('approve-all', {
      searchWordVal: '',
      dateRangeVal: []
    }, (tableState) => {
      const param: CourseListParams = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        searchKey: tableState.searchWordValue.trim(),
        auditStatus: '',
        filterKey: 'MANAGER',
        startBillDate: '',
        endBillDate: '',
        queryFilterType: 'ALL_APPROVED'
      }
      if (tableState.dateRangeValue.length) {
        param.startBillDate = moment(tableState.dateRangeValue[0]).format('YYYY-MM-DD')
        param.endBillDate = moment(tableState.dateRangeValue[1]).format('YYYY-MM-DD')
      }
      CourseListApi.getCourseList(param).then((res: AxiosResponse<CommonPagination<CourseListDataType>>) => {
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
      SessionStorageUtil.putCourseType('2') // 返回区分标志
      menuService.gotoUrl({
        url: '/m/course-manage/course-preview',
        paramUrl: `/${data.id}?type=all`,
        title: '课程预览'
      })
    }

    /**
     * 请求审批接口
     * @param type 0 | 1 | 2 | 3 | 4 | 5
     * */
    const approveAll = (type) => {
      CourseApproveAllApi.approveAll({
        courseId: record.value?.id,
        action: APPROVE_MAP[type]
      }).then((res) => {
        if (res.data.status === 201) {
          visible.value = false
          searchData()
        }
      })
    }

    /**
     * 打开审批弹框
     * @param data CourseListDataType
     * */
    const approvedReal = (data: CourseListDataType) => {
      visible.value = true
      record.value = data
    }

    /**
     * 审批操作获取信息
     * @param data CourseListDataType
     */
    const approved = (data: CourseListDataType): void => {
      if (data.status === '1') {
        CourseApproveAllApi.getDetailApprove(data.knowledgeSubjectId).then((res: Json) => {
          addKnowledgePoints.value = res.data.new || 0
          delKnowledgePoints.value = res.data.del || 0
          approvedReal(data)
        })
      } else {
        approvedReal(data)
      }
    }

    /**
     * 批量审批
     * @param action
     */
    const approvBatch = (action: 'AUDIT_PASS' | 'AUDIT_REJECT') => {
      CourseApproveAllApi.batchApproval({
        courseIdList: selectedRowKey.value,
        action
      }).then(res => {
        if (res.data.status === 201) {
          approveVisible.value = false
          searchData('button')
        }
      })
    }

    const getCheckboxProps = (record) => ({
      disabled: record.auditStatus !== '1',
      code: record.code
    })

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
      visible,
      approveVisible,
      approved,
      approveAll,
      preview,
      addKnowledgePoints,
      delKnowledgePoints,
      record,
      selectedRowKey,
      hasSelected,
      approvBatch,
      onSelectChange,
      getCheckboxProps,
      ...toRefs(tableState)
    }
  }
})
