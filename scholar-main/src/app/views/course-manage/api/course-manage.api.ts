import { get, post } from '@/app/api'

export const CourseManageApi = {
  getXxxList () {
    // 便捷导航配置
    const url = '/xx'
    return get(url)
  },
  getMajorList (params) {
    // 便捷导航配置
    const url = 'pkg/major/listMajor'
    return post(url, params)
  }
}
