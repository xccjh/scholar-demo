import { LocalStorageUtil, ToolsUtil } from '@/common/utils'
import axios from 'axios' // 引入axios的第三方插件
import interceptor from './interceptors'

export const getHeader = () => ({
  'x-header-atr': 'manage',
  token: LocalStorageUtil.getUserToken() || '',
  userId: LocalStorageUtil.getUserId() || '',
  orgCode: ToolsUtil.getOrgCode() || '',
  stuId: LocalStorageUtil.getUserId() || ''
})

/* 常规的 */
export const jsonHeader = {
  'Content-Type': 'application/json'
}
export const formHeader = {
  'Content-Type': 'application/x-www-form-urlencoded'
}
/* 文件的 */
export const fileHeader = {
  'Content-Type': 'multipart/form-data'
}

//  1.创建axios实列
export const service = interceptor(axios.create({
  // A.公共接口
  baseURL: process.env.VUE_APP_SERVER_URL,
  // B.设置接口请求超时
  timeout: 15 * 1000
}))
// 第三方全路径实例
export const bareService = interceptor(axios.create({
  timeout: 60 * 1000 * 60 * 24
}), '')
// 不加loading拦截器实例
export const originService = axios.create({
  timeout: 15 * 1000,
  baseURL: process.env.VUE_APP_SERVER_URL
})
