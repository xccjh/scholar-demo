import { get, post, postBody } from '@/app/api'

export const AdminSecurityApi = {
  /**
   * 获取验证码
   * @param telphone
   */
  getVerCode (telphone: string) {
    return post('third/sms/sendCode', { telphone })
  },
  /**
   * 用户修改密码
   * @param params
   */
  sendModifyPassword (params) {
    return postBody('sys/user/modifyPass', params)
  }
}
