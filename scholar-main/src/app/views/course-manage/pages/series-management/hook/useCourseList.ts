import { ref } from 'vue'
import { CourseTreeItem, CourseTreeItemDetail } from '@/app/views/course-manage/pages/scp-list/entity'
import { ScpListApi } from '@/app/views/course-manage/pages/scp-list/api'
import { AxiosResponse } from 'axios'
import { CommonData } from '@/common/base'

export async function useCourseList (departmentBulletFormState) {
  const courseList = ref<Partial<CourseTreeItemDetail>[]>([])
  const getCourseList = async () => {
    return new Promise((resolve) => {
      ScpListApi.getCourseListTree().then((result: AxiosResponse<CommonData<CourseTreeItem>>) => {
        if (result.data.status === 200) {
          if (result.data.data.length) {
            let courseListTmp: Partial<CourseTreeItemDetail>[] = []
            result.data.data.forEach(item => {
              if (item.courseList && item.courseList.length) {
                courseListTmp = courseListTmp.concat(item.courseList)
              }
            })
            courseList.value = courseListTmp
            departmentBulletFormState.courseId = courseListTmp[0].id!
          } else {
            courseList.value = []
          }
          resolve(true)
        }
      })
    })
  }
  await getCourseList()
  return { courseList }
}
