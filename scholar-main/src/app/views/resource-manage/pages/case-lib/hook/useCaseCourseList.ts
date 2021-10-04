import { AxiosResponse } from 'axios'
import { CommonData } from '@/common/base'
import { CourseDropItem } from '../../read-lib/entity'
import { ReadLibApi } from '../../read-lib/api'
import { SessionStorageUtil } from '@/common/utils'

export function useCaseCourseList (courseList, currentCourseId, currentCourseCode, conditionObj) {
  /**
   * 获取课程列表
   */
  const getCourseList = async () => {
    const result: AxiosResponse<CommonData<CourseDropItem>> = await ReadLibApi.getCourseList()
    if (result.data.status === 200) {
      courseList.value = result.data.data || []
    }
  }
  /**
   * 选择课程
   * @param courseItem
   */
  const selectCourse = (courseItem: CourseDropItem) => {
    currentCourseCode.value = courseItem.code
    conditionObj.knowledgeSubjectId = courseItem.id
    conditionObj.knowledgeModuleId = ''
    conditionObj.knowledgeUnitId = ''
    conditionObj.knowledgePointId = ''
    SessionStorageUtil.putCasetree(courseItem.code)
  }
  return { getCourseList, selectCourse }
}
