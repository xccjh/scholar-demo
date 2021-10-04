import { ToolsUtil } from '@/common/utils'
import { get, post, postBody } from '@/app/api'

export const CoursePreviewApi = {

  /**
   * 获取课程详情
   * @param id
   */
  getCourseDetail (id) {
    return get('pkg/course/getCourse', { courseId: id })
  },
  /**
   * 全部树
   * @param knowledgeSubjectId
   * @param isDone 是否已完善
   */
  getKnowledgeTree (knowledgeSubjectId, isDone = '') {
    return get('res/knowledge-module/tree/' + knowledgeSubjectId, { isDone })
  },
  /**
   * 审批树
   * @param knowledgeSubjectId
   * @param isDone 是否已完善
   */
  getPreAuditTree (knowledgeSubjectId, isDone = '') {
    return get('res/knowledge-module/preAuditTree/' + knowledgeSubjectId, { isDone })
  },
  /**
   * 知识点详情
   */
  detailKnowledge (id) {
    return get('res/knowledge-point/get/' + id)
  }

}
