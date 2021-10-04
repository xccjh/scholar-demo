import { ToolsUtil } from '@/common/utils'
import { formHeader, get, getHeader, originService, post, postBody } from '@/app/api'

export const CourseStatisticsApi = {
  /**
   * 数据统计
   * @param params
   */
  getStatistics (params) {
    return postBody('pkg/course/getKnowledgeQuestionList', params)
  },
  /**
   * 数据统计导出
   * @param courseCode
   */
  exportExcelCourse (params) {
    return originService.get('pkg/course/exportKnowledgeQuestion', {
      headers: {
        ...getHeader(),
        ...formHeader
      },
      params,
      responseType: 'blob'
    })
  }

}
