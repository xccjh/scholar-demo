import { ToolsUtil } from '@/common/utils'
import { get, post, postBody } from '@/app/api'

export const PkgIInitiatedApi = {
  getPkgList (param) {
    return post('pkg/coursePacket/approvalList', param)
  }
}
