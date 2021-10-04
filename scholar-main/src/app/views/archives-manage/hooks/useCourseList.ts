import { ref } from 'vue'
import { CourseListDataType } from '@/app/views/course-manage/pages/course-list/entity'
import { RecordinLecturerApi } from '@/app/views/archives-manage/api'
import { AxiosResponse } from 'axios'
import { CommonPagination } from '@/common/base'

export function useCourseList () {
  const courseList = ref<CourseListDataType[]>([])
  RecordinLecturerApi.getCourseList().then((result: AxiosResponse<CommonPagination<CourseListDataType>>) => {
    if (result.data.status === 200) {
      if (result.data.data.length) {
        courseList.value = result.data.data
      } else {
        courseList.value = []
      }
    }
  })

  return {
    courseList
  }
}
