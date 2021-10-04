import { get, post, postBody } from '@/app/api'

export const CaseLibApi = {
  /**
   * 获取案例列表
   * @param params
   */
  getCaseList (params) {
    return postBody('res/resource/conditionQuery', params)
  },
  /**
   * 复制案例资源
   * @param resourceId
   */
  copyResource (resourceId:string) {
    return postBody('res/courseware/copyCase', { id: resourceId })
  },
  /**
   * 删除案例资源
   * @param resourceId
   */
  delResource (resourceId: string) {
    const url = 'res/resource/commonDel/' + resourceId
    return post(url, {})
  }
}
