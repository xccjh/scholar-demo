import { reactive, ref } from 'vue'
import { CourseTreeItem, CourseTreeItemDetail } from '../entity'
import { ScpListApi } from '../api'
import { AxiosResponse } from 'axios'
import { CommonData } from '@/common/base'

export function useCourseList () {
  const courseList = ref<Partial<CourseTreeItemDetail>[]>([])
  const courseListSelect = ref<CourseTreeItemDetail[]>([])
  const courseMap = reactive<{
    courseMapId:{[key:string]:string}
    courseMapName:{[key:string]:string}
    courseMapMajorId:{[key:string]:string}
    courseMapCourseCode:{[key:string]:string}
  }>({
    courseMapId: {},
    courseMapName: {},
    courseMapMajorId: {},
    courseMapCourseCode: {}
  })
  ScpListApi.getCourseListTree().then((result:AxiosResponse<CommonData<CourseTreeItem>>) => {
    if (result.data.status === 200) {
      if (result.data.data.length) {
        courseList.value = []
        courseListSelect.value = []
        let courseListTmp:CourseTreeItemDetail[] = []
        result.data.data.forEach(item => {
          if (item.courseList && item.courseList.length) {
            courseListTmp = courseListTmp.concat(item.courseList)
          }
        })
        courseList.value = courseListTmp
      } else {
        courseList.value = []
      }
      courseListSelect.value = JSON.parse(JSON.stringify(courseList.value))
      courseListSelect.value.forEach((e:CourseTreeItemDetail) => {
        courseMap.courseMapId[e.id] = e.name
        courseMap.courseMapName[e.name] = e.id
        courseMap.courseMapMajorId[e.id] = e.majorId
        courseMap.courseMapCourseCode[e.id] = e.code
      })
      courseList.value.unshift({ id: '', name: '全部' })
    }
  })
  return { courseList, courseListSelect, courseMap }
}
