import { ToolsUtil } from '@/common/utils'
import { get, post, postBody } from '@/app/api'

export const CourseListApi = {
  /**
   * 删除课程
   */
  delCourse (id) {
    return post('pkg/course/delCousre', {
      id
    })
  },

  /**
   * 获取课程列表
   */
  getCourseList (params) {
    return get('pkg/course/getCourseList', params)
  },

  /**
   * 负责人查询
   */
  getChargeList (params) {
    return post('sys/userOrgRole/getPlatformUser', params)
  },

  /**
   * 专业列表
   */
  getDisciplinData (params) {
    return post('pkg/major/listMajor', params)
  },

  /**
   * 课程服务商
   */
  getCourseProvideList () {
    return get('sys/type/courseProvideList')
  },

  /**
   * 添加编辑学科
   * @param params
   */
  saveCourse (params) {
    return postBody('pkg/course/saveCourse', params)
  }

}
