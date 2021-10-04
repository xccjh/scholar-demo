import { computed, createVNode } from 'vue'
import { changeLoop } from '@/common/utils'
import { ScpCourseApi } from '../api'
import { APPROVE_MAP } from '@/common/constants'
import { Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue/lib'

export function useTabTopOperate (saveData, menuService, treeData, route, userId, title) {
  /**
   * 返回
   */
  const goback = () => {
    saveData(() => {
      menuService.goBack(false)
      menuService.gotoUrl({
        url: '/m/course-manage/course-list',
        paramUrl: '',
        title: '课程管理'
      })
    })
  }

  /**
   * 禁用审批
   */
  const approveAllDisabled = computed(() => {
    if (route.params.leaderId === userId) { // 课程负责人
      if (route.params.status !== '0') { // 草稿一定不禁用
        if (route.params.auditStatus === '1') { // 待审批一定禁用
          return true
        }
        let changeFlagToApprove = true // 不变更不能审批
        // 课程树变更一定不禁用
        changeLoop(treeData.value, () => {
          changeFlagToApprove = false
        })
        return changeFlagToApprove
      } else {
        return false
      }
    } else {
      return true
    }
  })

  /**
   * 课程建设审批
   */
  const submitReview = (again:boolean) => {
    if (again || route.params.status !== '0') {
      resubmit()
    } else {
      submitForApproval()
    }
  }
  /**
   * 课程审批
   * @param type
   */
  const approveAll = (type:string) => {
    return new Promise((resolve, reject) => {
      ScpCourseApi.approveAll({
        courseId: route.params.courseId,
        action: APPROVE_MAP[type]
      }).then((res) => {
        if (res.data.status === 201) {
          menuService.goBack(false)
          menuService.gotoUrl({
            url: '/m/course-manage/course-list',
            paramUrl: '',
            title: '课程管理'
          })
          resolve(true)
        } else {
          reject(new Error(res.data.message))
        }
      }).catch(err => reject(err))
    })
  }

  /**
   * 提交审批
   */
  const submitForApproval = () => {
    Modal.confirm({
      title: '提交审批',
      content: '课程一经审批通过，课程将开放资源研发存储，课包建设权限。',
      icon: createVNode(ExclamationCircleOutlined),
      onOk () {
        return approveAll('0')
      }
    })
  }
  /**
   * 重新提交审批
   */
  const resubmit = () => {
    Modal.confirm({
      title: '重新提交',
      content: '确定对' + title + '课程重新提交审批吗？课程一经审批通过，课程将开放资源研发存储，课包建设权限。',
      icon: createVNode(ExclamationCircleOutlined),
      onOk () {
        return approveAll('5')
      }
    })
  }
  return {
    goback,
    submitReview,
    approveAllDisabled
  }
}
