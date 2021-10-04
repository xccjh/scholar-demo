import { CourseDropItem } from '../entity'
import { SessionStorageUtil } from '@/common/utils'
import { AxiosResponse } from 'axios'
import { CommonData } from '@/common/base'
import { ReadLibApi } from '../api'

export function useReadCouseList (courseList, currentCourseId, currentCourseCode, conditionObj) {
  /**
   * 获取课程列表
   */
  const getCourseList = async () => {
    const result:AxiosResponse<CommonData<CourseDropItem>> = await ReadLibApi.getCourseList()
    if (result.data.status === 200) {
      courseList.value = result.data.data || []
    }
  }

  /**
   * 选择课程
   * @param courseItem
   */
  const selectCourse = (courseItem:CourseDropItem) => {
    currentCourseCode.value = courseItem.code
    conditionObj.knowledgeSubjectId = courseItem.id
    conditionObj.knowledgeModuleId = ''
    conditionObj.knowledgeUnitId = ''
    conditionObj.knowledgePointId = ''
    SessionStorageUtil.putReadtree(courseItem.code)
  }

  return { courseList, selectCourse, getCourseList }
}
