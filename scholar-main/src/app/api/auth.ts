import { post } from './http'

export const auth = {
  /**
   * 登录
   * @param params
   */
  login (params) {
    return post('sys/user/login', params)
  }
}
