import { get, post, postBody } from '@/app/api'

export const CourseApproveAllApi = {
  /**
   * 获取审批详情
   * @param knowledgeSubjectId
   */
  getDetailApprove (knowledgeSubjectId) {
    return get(`res/knowledge-point/countPreAudit/${knowledgeSubjectId}`)
  },
  approveAll (params) {
    return post('pkg/course/courseProcess', params)
  },
  batchApproval (params) {
    return postBody('pkg/course/courseProcess/batch', params)
  }

}
