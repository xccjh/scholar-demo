import { get, post, postBody } from '@/app/api'

export const ReadLibApi = {
  /**
   * 获取课程列表
   */
  getCourseList () {
    return postBody('/res/knowledgeSubject/listByUserId')
  },
  /**
   * 查询阅读库列表
   * @param param
   */
  getReadList (param) {
    return postBody('res/resource/conditionQuery', param)
  },
  /**
   * 获取阅读库资料详情
   */
  getResourceDetail (id: string, type: '101' | '102' | '103') {
    return post('res/resource/resourceDetail', { id, type })
  },
  /**
   * 删除资料
   * @param resourceId
   */
  delResource (resourceId:string) {
    return post('res/resource/commonDel/' + resourceId, {})
  },
  /**
   * 阅读库任务调用
   */
  invokeCourseSectionFileTask (params) {
    return postBody('pkg/courseTask/invoke', params)
  },
  /**
   * 关卡资料-新增与修改
    */
  levelInfoAddOrModify (param) {
    return postBody('pkg/coursePacketCardResource/saveOrUpdate', param)
  },
  /**
   * 阅读库资料调用
   * @param params
   */
  invokeCourseSectionFile (params) {
    return postBody('pkg/courseSectionResource/invoke', params)
  },
  /**
   * 删除阅读库任务调用
   * @param id
   */
  delCourseSectionFileTask (id) {
    return post('pkg/courseTask/del', { id })
  },
  /**
   * 删除阅读库任务调用
   * @param id
   */
  delCourseSectionFile (id) {
    return post('pkg/courseSectionResource/del', { id })
  },
  /**
   * 删除关卡调用
   */
  levelInfoDel (id) {
    return post('pkg/coursePacketCardResource/del', { id })
  }
}
