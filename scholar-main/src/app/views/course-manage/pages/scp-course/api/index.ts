import { bareService, formHeader, get, getHeader, originService, post, postBody, service } from '@/app/api'
import { AxiosResponse } from 'axios'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { CommonDataObj, CommonStructure } from '@/common/base'
import { FormStateKnowledge } from '@/app/views/course-manage/pages/course-preview/entity'

export const ScpCourseApi = {

  /**
   * 知识图谱重置
   * @param param
   */
  resetKnowledge (param) {
    return get('res/knowledge-point/knowledgePersonalReset', param)
  },

  /**
   * 添加编辑学科
   * @param params
   */
  getExerciseReviewList () {
    return get('sys/org/listSchoolsAndTeachers')
  },
  /**
   * 获取博保利威视频时长
   * @param param
   */
  getVideoLength (params) {
    return bareService.get(process.env.VUE_APP_polywayApi + 'v2/video/' + process.env.VUE_APP_userid + '/info', { params })
  },
  /**
   * 导出图谱
   * @param knowledgeSubjectId
   */
  exportKnowledgeExcel (knowledgeSubjectId: string): Promise<AxiosResponse<Blob>> {
    return originService.get('res/knowledge-point/exportExcel/' + knowledgeSubjectId, {
      headers: {
        ...getHeader(),
        ...formHeader
      },
      responseType: 'blob'
    })
  },
  /**
   * 知识点详情导出
   * @param courseId
   */
  exportKnowledgeDetail (courseId: string): Promise<AxiosResponse<Blob>> {
    return originService.get('pkg/course/exportKnowledgeQuestionList?courseId=' + courseId, {
      headers: {
        ...getHeader(),
        ...formHeader
      },
      responseType: 'blob'
    })
  },

  /**
   * 知识图谱树节点排序更新
   * @param param
   * @param interfaceUrl
   */
  sortKnowledgeNode (param: any, interfaceUrl: string) {
    return postBody(
      `res/${interfaceUrl}/updateSeq`,
      param)
  },
  /**
   * 导入知识图谱Excel
   * @param knowledgeSubjectId
   * @param excelUrl
   */
  importKnowledge (knowledgeSubjectId: string, excelUrl: string) {
    return postBody('res/knowledge-point/importExcel/' + knowledgeSubjectId, { fileUrl: excelUrl })
  },
  /**
   * 导入知识图谱进度查询
   * @param knowledgeSubjectId
   */
  queryImportKnowledgeProgress (knowledgeSubjectId: string) {
    const url = 'res/knowledge-point/checkImportProgress/' + knowledgeSubjectId
    return get(url, {})
  },
  /**
   * 保存课程信息
   */
  curriculumConstructionSave (params) {
    return postBody('pkg/course/settingCourse', params)
  },
  /**
   * 保存题库习题审核人
   * @param telphones
   */
  saveTheQuestionBankExerciseReviewer (telphones: string) {
    return bareService.get(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/createAuditor?mobile=' + telphones)
  },
  /**
   * 保存树节点信息
   */
  saveTreeNode (param, node: TreeDataItem): Promise<AxiosResponse<CommonDataObj<FormStateKnowledge>>> {
    let url
    const kType = node.kType
    if (kType === '2') {
      url = 'res/knowledge-module/save'
    } else if (kType === '3') {
      url = 'res/knowledge-unit/save'
    } else if (kType === '4') {
      url = 'res/knowledge-point/save'
    }
    return postBody(url, param)
  },
  /**
   * 删除节点接口
   * @param node
   * @param id
   */
  delTreeNode (params): Promise<AxiosResponse<CommonStructure>> {
    let url
    if (params.kType === '2') {
      url = 'res/knowledge-module/del/'
    } else if (params.kType === '3') {
      url = 'res/knowledge-unit/del/'
    } else if (params.kType === '4') {
      url = 'res/knowledge-point/del/'
    }
    return get(url + params.id)
  },
  /**
   * 课包审批
   * @param params
   */
  approveAll (params) {
    return post('pkg/course/courseProcess', params)
  }

}
