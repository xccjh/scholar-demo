import { get, post, postBody } from '../http'
import { LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { bareService } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'

export const CommonApi = {
  /**
   * 获取题库赛道对应code
   */
  getCodeUid () {
    const url = 'sys/org/getOrgForTiku'
    return get(url)
  },
  /**
   * 题库自动登录
   * @param userName
   */
  tklogin (userName:string) {
    return bareService.get(process.env.VUE_APP_questionBankApi + 'sign/commonlogin/qkcloginbyUP', {
      params: {
        secret: 'qkclogin',
        userName
      }
    })
  },
  /**
   * 获取机构信息
   */
  getInfo () {
    return post('sys/org/getByCode', {
      orgCode: ToolsUtil.getOrgCode()
    })
  },
  /**
   * 记录日志操作服务
   * @param params
   */
  statisticsLog (params) {
    const packetInfo = SessionStorageUtil.getPacketInfo()
    if (packetInfo.status === '1') {
      const options = { isCommonHttpHeader: true }
      postBody(STATISTICALRULES.recordControlUrl, {
        ...params,
        businessCode: STATISTICALRULES.packetInfo.businessId,
        orgCode: ToolsUtil.getOrgCode(),
        source: 1,
        informationId: packetInfo.pcode,
        userName: LocalStorageUtil.getUser().userName,
        userId: LocalStorageUtil.getUserId()
      }, options)
    }
  },
  getPlatformPermission () {
    return get('sys/user/getUserPlatform', {
      orgCode: ToolsUtil.getOrgCode(),
      id: LocalStorageUtil.getUserId()
    })
  }
}
