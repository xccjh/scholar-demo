import { useSearchTableAdance } from '@/app/views/hooks'
import { SeriesListDataType } from '../entity'
import { SeriesManagementApi } from '../api'
import { AxiosResponse } from 'axios'
import { CommonPagination } from '@/common/base'
import { computed } from 'vue'

export function useSeriesTable (courseList) {
  let initSearch = true
  const { searchList, resetData, storingData, tableState, searchData, getDate, subject } = useSearchTableAdance<SeriesListDataType>('series-management', {
    selectedVal: ''
  }, (tableState) => {
    if (initSearch) {
      initSearch = false
      if (!tableState.selectedVal) {
        tableState.selectedVal = tableState.selectedValue = courseList.value[0]?.id as string
      }
    }
    SeriesManagementApi.coursePackageSeriesList({
      courseId: tableState.selectedValue,
      page: tableState.pageIndex,
      limit: tableState.pageSize
    }).then((res: AxiosResponse<CommonPagination<SeriesListDataType>>) => {
      if (res.data.status === 200) {
        res.data.data.forEach((item, i) => {
          item.seqFont = (i + 1) + (tableState.pageIndex - 1) * tableState.pageSize
        })
        tableState.data = res.data.data.map(item => ({
          ...item,
          key: item.id
        }))
        tableState.total = res.data.page.totalResult || 0
      }
    })
  }, false)
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
    searchList,
    resetData,
    storingData,
    tableState,
    searchData,
    getDate,
    pagination,
    subject
  }
}
