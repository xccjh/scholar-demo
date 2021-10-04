import { ref, nextTick } from 'vue'
import { MemberItem } from '../entity'

export function useCourseModal (formRef, formState, state, getMemberList, getAdustList) {
  const aduitStaffVisible = ref(false) // 习题审核成员弹框
  const courseStaffVisible = ref(false) // 课程组成员弹框
  const aduitKey = ref('') // 弹框搜索
  const courseKey = ref('') // 弹框搜索

  /**
   * 课程组成员搜索
   * */
  const courseSearch = () => {
    const bak = JSON.parse(JSON.stringify(state.roleArr))
    if (courseKey.value) {
      if (courseKey.value === '匿名') {
        state.roleArrBak = bak.filter(e => !e.nickName)
      } else {
        state.roleArrBak = bak.filter(e => e.nickName.indexOf(courseKey.value) > -1)
      }
    } else {
      state.roleArrBak = bak
    }
    (getMemberList.value as MemberItem[]).forEach(itemP => {
      (state.roleArrBak || []).every(itemO => {
        if (itemO.id === itemP.id) {
          itemO.isSelected = true
        } else {
          return true
        }
      })
    })
  }

  /**
   * 习题审核人员搜索
   * */
  const AduitSearch = () => {
    const bak = JSON.parse(JSON.stringify(state.nodesInit))
    if (aduitKey.value) {
      bak.forEach(e => {
        e.teacherList = JSON.parse(JSON.stringify(e.teacherList.filter(item => {
          if (aduitKey.value === '匿名') {
            return !item.nickName
          } else {
            return item.nickName && item.nickName.indexOf(aduitKey.value) > -1
          }
        })))
      })
      state.nodesBak = bak.filter(item => item.teacherList.length > 0)
    } else {
      state.nodesBak = bak
    }
    (getAdustList.value as MemberItem[]).forEach(itemOt => {
      (state.nodesBak || []).every(itemR => {
        return itemR.teacherList.every(itemPi => {
          if (itemOt.id === itemPi.id) {
            itemPi.isSelected = true
          } else {
            return true
          }
        })
      })
    })
  }

  /**
   * 关闭习题审核成员弹框
   * */
  const auditCancel = () => {
    aduitStaffVisible.value = false
    state.nodesBak = JSON.parse(JSON.stringify(state.nodesBakRevert))
    state.nodes = JSON.parse(JSON.stringify(state.nodesRevert))
  }
  /**
   * 习题审核弹框确定
   * */
  const auditComfirm = () => {
    aduitStaffVisible.value = false
  }

  /**
   * 展开习题审核下拉
   * */
  const clickAduit = (itemP) => {
    itemP.expand = !itemP.expand
    state.nodesInit.every(item => {
      if (item.id === itemP.id) {
        item.expand = !item.expand
      } else {
        return true
      }
    })
  }

  /**
   * 关闭课程组成员弹框
   * */
  const courseCancel = () => {
    courseStaffVisible.value = false
    state.roleArr = JSON.parse(JSON.stringify(state.roleArrRevert))
    state.roleArrBak = JSON.parse(JSON.stringify(state.roleArrBakRevert))
  }
  /**
   * 课程组成员弹框确定
   * */
  const courseComfirm = () => {
    courseStaffVisible.value = false
    formRef.value.validate('courseMemberUserIdList')
  }

  /**
   * 习题审核成员弹框增减
   * @param item
   * @param j
   * @param k
   */
  const aduitItemSelectInner = (item, itemTop) => {
    item.isSelected = !item.isSelected
    state.nodes.every(nodeI => {
      if (nodeI.id === itemTop.id) {
        nodeI.teacherList.every(itemP => {
          if (itemP.id === item.id) {
            itemP.isSelected = item.isSelected
          } else {
            return true
          }
        })
      } else {
        return true
      }
    })
    formState.exercisesAuditUserIdList = (getAdustList.value as MemberItem[]).map(e => e.id)
  }

  /**
   * 课程组成员弹框增减
   * @param item
   * @param i
   */
  const itemSelectInner = (item: MemberItem, i: number) => {
    item.isSelected = !item.isSelected
    state.roleArr.every((itemP, iP) => {
      if (itemP.id === item.id) {
        state.roleArr![iP].isSelected = item.isSelected
      } else {
        return true
      }
    })
    formState.courseMemberUserIdList = (getMemberList.value as MemberItem[]).map(e => e.id)
  }

  /**
   * 移除课程组成员
   * @param item
   * @param i
   */
  const removeMember = (item: MemberItem, i: number) => {
    item.isSelected = false
    formState.courseMemberUserIdList = (getMemberList.value as MemberItem[]).map(e => e.id);
    (state.roleArrBak || []).every(itemx => {
      if (itemx.id === item.id) {
        itemx.isSelected = false
      } else {
        return true
      }
    })
    formRef.value.validate('courseMemberUserIdList')
  }

  /**
   * 打开课程组成员弹框
   * */
  const addMember = () => {
    state.roleArrRevert = JSON.parse(JSON.stringify(state.roleArr))
    state.roleArrBakRevert = JSON.parse(JSON.stringify(state.roleArrBak))
    courseStaffVisible.value = true
  }

  /**
   * 打开习题审核成员弹框
   * */
  const addAduitMember = () => {
    state.nodesRevert = JSON.parse(JSON.stringify(state.nodes))
    state.nodesBakRevert = JSON.parse(JSON.stringify(state.nodesBak))
    aduitStaffVisible.value = true
  }

  /**
   * 移除习题审核成员
   * @param item
   * @param i
   */
  const removeAduitMember = (item: MemberItem, i: number) => {
    const bak: MemberItem[] = JSON.parse(JSON.stringify(getAdustList.value))
    bak[i].isSelected = false;
    (state.nodesBak || []).every(itemO => {
      return itemO.teacherList.every(itemOp => {
        if (itemOp.id === item.id) {
          itemOp.isSelected = false
        } else {
          return true
        }
      })
    })
    const exercisesAuditUserIdList = bak.filter(itemi => itemi.isSelected).map(e => e.id)
    getAdustList.value = exercisesAuditUserIdList
    formState.exercisesAuditUserIdList = exercisesAuditUserIdList
  }

  return {
    aduitStaffVisible,
    courseStaffVisible,
    aduitKey,
    courseKey,
    courseSearch,
    AduitSearch,
    removeAduitMember,
    addAduitMember,
    removeMember,
    addMember,
    aduitItemSelectInner,
    itemSelectInner,
    courseComfirm,
    courseCancel,
    auditCancel,
    auditComfirm,
    clickAduit
  }
}
