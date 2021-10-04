import { ToolsUtil } from '@/common/utils'
import { del, get, post, postBody } from '@/app/api'

export const LabelManagementApi = {
  /**
   * 删除标签
   */
  delLabel (id) {
    return del('pkg/major/tag/del', {
      id
    })
  },

  /**
   * 获取标签列表
   */
  getLabelList (params) {
    return get('pkg/major/tag/list', params)
  },

  /**
   * 负责人查询
   */
  getChargeList (params) {
    return post('sys/userOrgRole/getPlatformUser', params)
  },

  /**
   * 专业列表
   */
  getDisciplinData (params) {
    return post('pkg/major/listMajor', params)
  },

  /**
   * 课程服务商
   */
  getCourseProvideList () {
    return get('sys/type/courseProvideList')
  },

  /**
   * 添加编辑标签
   * @param params
   */
  saveOrEditLabel (params) {
    return postBody('pkg/major/tag/save', params)
  },
  /**
   * 标签上移
   * @param id
   */
  moveUp (id) {
    return post('pkg/major/tag/up', { id })
  },
  /**
   * 标签下移
   * @param id
   */
  moveDown (id) {
    return post('pkg/major/tag/down', { id })
  }

}
