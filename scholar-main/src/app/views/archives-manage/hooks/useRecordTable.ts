import { useSearchTableAdance } from '@/app/views/hooks'
import { CourseListDataType } from '@/app/views/course-manage/pages/course-list/entity'
import { TeacherListDataType, TeacherListParams } from '@/app/views/archives-manage/entity'
import { RecordinLecturerApi } from '@/app/views/archives-manage/api'
import { AxiosResponse } from 'axios'
import { CommonPagination } from '@/common/base'
import { computed } from 'vue'

export function useRecordTable () {
  const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<CourseListDataType>>('guide-teacher', {
    searchWordVal: '',
    selectedCourseVal: []
  }, (tableState) => {
    const param: TeacherListParams = {
      page: tableState.pageIndex,
      limit: tableState.pageSize,
      sort: 'createTime|desc',
      name: tableState.searchWordValue.trim(),
      courseIds: tableState.selectedCourseValue?.join(',') || ''
    }
    RecordinLecturerApi.getGuideTeacherTableList(param).then((res: AxiosResponse<CommonPagination<TeacherListDataType>>) => {
      if (res.data.status === 200) {
        res.data.data.forEach((item, i) => {
          item.seq = (i + 1) + (tableState.pageIndex - 1) * tableState.pageSize
        })
        tableState.data = res.data.data.map(item => ({
          ...item,
          key: item.id
        }))
        tableState.total = res.data.page.totalResult || 0
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
    pagination,
    searchList,
    resetData,
    storingData,
    tableState,
    searchData,
    getDate
  }
}
