import { get, post, postBody } from '@/app/api'

export const PkgApproveAllApi = {
  approveAll (params) {
    return post('pkg/coursePacket/approval', params)
  },
  batchApproval (params) {
    return postBody('pkg/coursePacket/batchApproval', params)
  }

}
