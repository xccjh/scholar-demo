import { useSearchTableAdance } from '@/app/views/hooks'
import { CaseMaterialsDataType, CaseMaterialsParams } from '../entity'
import { LearningGoalCode } from '@/app/views/resource-manage/pages/read-lib/entity'
import { CaseLibApi } from '../api'
import { AxiosResponse } from 'axios'
import { CommonDataObj, CommonDataOptObj, Json, MaterialPagination } from '@/common/base'
import { computed, ref } from 'vue'
import { SessionStorageUtil } from '@/common/utils'
import { useCallResource } from './'

export function useCaseTable (conditionObj, route, menuService, courseList) {
  const useTimeSortOrder = ref<'ascend' | 'descend' | undefined>(undefined)

  const callResourceData = ref<Json>({})
  /**
   * 初始化调用参数和调用数据
   */
  const initCallParamsData = (tableState, storingData) => {
    if (route.query.from === 'scp' && !callResourceData.value.professionId) {
      callResourceData.value = SessionStorageUtil.getScpResourceMaterial()
    }
  }

  const { searchList, resetData, storingData, tableState, searchData, getDate, subject } = useSearchTableAdance<Partial<CaseMaterialsDataType>>('case', {
    searchWordVal: '',
    learningGoalCodeVal: []
  }, (tableState, pageChange, sorter, storingData) => {
    if (courseList.value.length) {
      initCallParamsData(tableState, storingData)
      if (!pageChange && sorter && sorter.columnKey) {
        useTimeSortOrder.value = sorter.order
      }
      const param: CaseMaterialsParams =
        {
          page: tableState.pageIndex,
          limit: tableState.pageSize,
          condition: tableState.searchWordValue.trim(),
          coursewareType: ['104'],
          learningGoalCode: (tableState.learningGoalCodeValue as LearningGoalCode[]) || [],
          ...conditionObj,
          sort: useTimeSortOrder.value === 'ascend' ? 'useTime|asc' : useTimeSortOrder.value === 'descend' ? 'useTime|desc' : undefined
        }
      CaseLibApi.getCaseList(param).then((res: AxiosResponse<CommonDataOptObj<MaterialPagination<CaseMaterialsDataType>>>) => {
        if (res.data.status === 200) {
          if (res.data.data) {
            tableState.data = res.data.data.records!.map(item => ({
              ...item,
              key: item.id
            }))
            tableState.total = res.data.data.total
          } else {
            tableState.data = []
            tableState.total = 0
          }
          if (route.query.from === 'scp' && callResourceData.value.nodes) {
            // 调用
            tableState.data.forEach((item) => {
              const hasCallItem = callResourceData.value.nodes.find(
                (it) => it.id === item.id
              )
              if (hasCallItem) {
                item.isCall = true
                item.taskId = hasCallItem.taskId
                item.taskType = hasCallItem.taskType
              } else {
                item.taskType = '-1'
              }
              item.supportType = supportType(item.fileType)
            })
            setPermitedCall()
          }
        }
      })
    }
  }, false)

  /**
   * 列表调用功能逻辑
   */
  const {
    permitedCall,
    callResource,
    cancelCallResource,
    completeCall,
    supportType,
    setPermitedCall
  } = useCallResource(route, tableState, menuService, callResourceData)

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
    pagination,
    searchList,
    resetData,
    storingData,
    tableState,
    searchData,
    getDate,
    subject,
    conditionObj,
    useTimeSortOrder,
    permitedCall,
    callResource,
    cancelCallResource,
    completeCall,
    supportType,
    setPermitedCall,
    callResourceData
  }
}
