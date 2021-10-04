import { get, post, postBody } from '@/app/api'

export const SaveCaseApi = {
  /**
   * 新增阅读资源
   */
  saveCourseWare (params) {
    return postBody('res/courseware/saveCase', params)
  },
  /**
   * 获取阅读资料详情
   * @param resourceId
   * @param materialType
   */
  getResourceDetail (resourceId:string, materialType:string) {
    return post('res/resource/resourceDetail', { id: resourceId, type: materialType })
  }
}
