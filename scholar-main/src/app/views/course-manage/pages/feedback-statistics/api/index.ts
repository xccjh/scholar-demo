
import { ToolsUtil } from '@/common/utils'
import { get, post, postBody } from '@/app/api'

export const FeedbackStatisticsApi = {

  /**
   * 获取课程详情
   * @param id
   */
  getFeedBackList (params) {
    return get('pkg/FeedBack/list', params)
  }
}
