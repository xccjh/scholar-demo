import { bareService, get, post, postBody, service } from '@/app/api'

export const ScpListApi = {
  /**
   * 删除课程
   */
  delPacket (id:string, status:string) {
    return post('pkg/coursePacket/del', {
      id, status
    })
  },
  /**
   * 获取课程树
   */
  getCourseListTree () {
    return post('pkg/course/listByTree')
  },
  /**
   * 获取课程列表
   */
  getPacketInfoList (params) {
    return post('pkg/coursePacket/getList', params)
  },
  /**
   * 添加编辑学科
   * @param params
   */
  savePacket (params) {
    return postBody('pkg/coursePacket/saveOrUpdate', params)
  },
  /**
   * nc课程科目类型
   */
  getCoursePackList () {
    return bareService.get(process.env.VUE_APP_SERVER_URL + 'nc/course_types')
  },
  /**
   * 复制课包
   * @param id
   */
  copyPacket (id) {
    return post('pkg/coursePacket/copy', { id })
  },
  /**
   *  课包售卖
   * @param id 课包id
   * @param isSale 是否售卖：否(0)、是(1)
   */
  lessonBuy (id, isSale:'0'|'1') {
    return postBody('pkg/coursePacket/saveOrUpdate', { id, isSale })
  },

  /**
   * 课包批量新增、修改、售卖、启用等(id无值新增,有值更新)
   * @param param
   */
  batchPkgOperate (param) {
    return postBody('pkg/coursePacket/batchSaveOrUpdate', param)
  },
  /**
   *  课包使用
   * @param id 课包id
   * @param isUsed 是否使用：否(0 | 2)、是(1)
   */
  startUse (id, isUsed:'2'|'1' | '0') {
    return postBody('pkg/coursePacket/saveOrUpdate', { id, isUsed })
  },
  /**
   * 查询校区
   * @param groupId area分组类型（固定值）
   */
  getCollegeList (groupId: string) {
    return post('sys/type/collegeList', { groupId })
  },
  /**
   *
   * @param coursePacketId
   */
  getCampusList (coursePacketId: string) {
    return get('pkg/coursePacketOrg/getSuCodes', { coursePacketId })
  },
  /**
   * ba保存校区授权
   * @param params
   */
  saveCampus (params) {
    return postBody('pkg/coursePacketOrg/batchDelSave', params)
  },
  /**
   * 获取课包系列列表
   * @param params
   */
  getPackageSeriesList (params) {
    return get('pkg/courseSeries/list', params)
  },
  /**
   * 根据课包系类获取版本信息
   * @param params {id:coursePacketId,courseSeriesId}
   */
  getVersionNumber (params) {
    return get('pkg/coursePacket/getPacketVer', params)
  }
}
