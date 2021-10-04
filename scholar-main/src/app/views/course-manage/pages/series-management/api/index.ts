import { get, post, postBody } from '@/app/api'

export const SeriesManagementApi = {
  /**
   * 获取系列下拉
   * @param params
   */
  coursePackageSeriesList (params) {
    return get('pkg/courseSeries/list', params)
  },
  /**
   * 系类操作
   * @param params
   */
  addOrEditSeries (params) {
    return postBody('pkg/courseSeries/saveOrUpdate', params)
  },
  /**
   * 删除系列
   * @param id
   */
  delSeries (id) {
    return post('pkg/courseSeries/del', { id })
  }

}
