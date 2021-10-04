import { ToolsUtil } from '@/common/utils'
import { get, post, postBody } from '@/app/api'

export const ProfessionListApi = {
  /**
   * 删除专业
   */
  delMajor (id) {
    return get('pkg/major/del', {
      id
    })
  },

  /**
   * 获取所有产品线
   */
  getAllLine () {
    return get('sys/productLine/getList', { status: 1 })
  },

  /**
   * 负责人查询
   */
  getChargeList (params) {
    return post('sys/userOrgRole/getPlatformUser', params)
  },

  /**
   * 添加编辑学科
   * @param params
   */
  saveMajor (params) {
    const url = 'pkg/major/save'
    return postBody(url, params)
  }

}
