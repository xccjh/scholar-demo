import { bareService, get, post, postBody, service } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'

export const OperationLogApi = {
  /**
   * 操作日志列表
   */
  getPackageOperatLogList (param) {
    return postBody(STATISTICALRULES.pageListUrl, param)
  }
}
