import { PacketInfoListDataType } from '../entity'

export function useConditionJudgment (userId) {
  /**
   * 是否可以删除
   */
  const delIf = (data:PacketInfoListDataType) => { // '0':'草稿';'1''待审批';'2':'已通过';'3':'未通过';
    return data.auditStatus === '0' || // 草稿下未审批前
      (data.status === '0' && data.auditStatus === '3') || // 草稿下的未通过
      (data.status === '1' && data.leaderId === userId && data.auditStatus !== '1' &&
        ((data?.isUsed === '0' || data?.isUsed === '2') && (data.isSale === '0' || data.isSale === '2'))) // 标准课包下课程负责人未启用和未售卖在已通过和未通过下
  }

  /**
   * 不能删除提示语
   * 不能删除提示语
   * @param data PacketInfoListDataType
   */
  const getDelCompetence = (data: PacketInfoListDataType) => {
    if (!delIf(data)) {
      return '标准课包，只有课程负责人才权限删除 ，当课包处于已启用/已售卖时不可删除。'
    } else {
      return null
    }
  }

  const statusIf = (data:PacketInfoListDataType) => {
    return data.status === '1'
  }

  /**
   * 标准课包下课程负责人非待审核状态
   * @param data PacketInfoListDataType
   */
  const showUse = (data: PacketInfoListDataType) => {
    return data?.status === '1' && data?.leaderId === userId && approvalling(data)
  }

  /**
   *
   * @param data PacketInfoListDataType
   */
  const joinSeriesJudgment = (data:PacketInfoListDataType) => {
    return ifJoinTheSeries(data) && showEdit(data)
  }

  /**
   * 课程组成员。课程负责人。专业负责人
   * @param data PacketInfoListDataType
   */
  const showEdit = (data: PacketInfoListDataType) => {
    let flag = false
    if (data.majorLeaderId) {
      flag = data.majorLeaderId.split(',').indexOf(userId) > -1
    }
    if (!flag) {
      flag = data.leaderId === userId
    }
    if (!flag) {
      if (data.courseTeamIds) {
        flag = data.courseTeamIds.split(',').indexOf(userId) > -1
      }
    }
    return flag && approvalling(data)
  }

  /**
   * 是否显示加入系列
   * @param PacketInfoListDataType
   */
  const ifJoinTheSeries = (data:PacketInfoListDataType) => {
    return data.status === '1' // 标准课包
  }
  /**
   * 非待审核
   * @param PacketInfoListDataType
   */
  const approvalling = (data:PacketInfoListDataType) => {
    return Number(data.auditStatus) !== 1
  }
  return { delIf, showEdit, joinSeriesJudgment, approvalling, getDelCompetence, showUse, statusIf }
}
