import { useSearchTableAdance } from '@/app/views/hooks'
import { PacketInfoListDataType, PacketInfoListParams } from '../entity'
import { moment } from '@/main'
import { ScpListApi } from '../api'
import { AxiosResponse } from 'axios'
import { CommonPagination, Sorter } from '@/common/base'
import { computed, ref, Ref } from 'vue'
import { makePy, sortScpData } from '@/common/utils'

export function useScpTable () {
  const courseSeriesNameSortOrder = ref<'ascend' |'descend' |undefined>(undefined)
  const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<PacketInfoListDataType>>('scp-list', {
    searchWordVal: '',
    selectedVal: '',
    dateRangeVal: []
  }, (tableState, pageChange, sorter) => {
    if (!pageChange && sorter && sorter.columnKey) { // 前端排序
      courseSeriesNameSortOrder.value = sorter.order
      sortScpData<Partial<PacketInfoListDataType>>(tableState, sorter)
    } else { // 数据刷新
      const param: PacketInfoListParams = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        searchKey: tableState.searchWordValue.trim(),
        courseId: tableState.selectedValue || '',
        updateTimeStart: '',
        updateTimeEnd: ''
      }
      if (tableState.dateRangeValue.length) {
        param.updateTimeStart = moment(tableState.dateRangeValue[0]).format('YYYY-MM-DD')
        param.updateTimeEnd = moment(tableState.dateRangeValue[1]).format('YYYY-MM-DD')
      }
      ScpListApi.getPacketInfoList(param).then((res: AxiosResponse<CommonPagination<PacketInfoListDataType>>) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map(item => ({
            ...item,
            key: item.id
          }))
          sortScpData(tableState, sorter)
          tableState.total = res.data.page.totalResult
        }
      })
    }
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
  return { searchList, resetData, storingData, tableState, searchData, getDate, pagination, courseSeriesNameSortOrder }
}
