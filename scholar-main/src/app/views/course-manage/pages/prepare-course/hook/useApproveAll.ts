import { computed, ref } from 'vue'
import { PrepareCourseApi } from '../api'
import { SessionStorageUtil } from '@/common/utils'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { Json } from '@/common/base'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'

export function useApproveAll (menuService, packetInfo, listOfDataChapterBind, recordMap, kjlOption, consolidationModuleCurrent) {
  const courseGroupMember = ref(true)
  const seeDetails = ref(false)
  const mainVideo = ref(0)
  const knowledgeExplanationVideo = ref(0)
  const seeMoreDetails = ref(false)
  const moreDetailsActiveKey = ref('1')
  const lackChapterSession = ref<Json[]>([])
  const moreDetailsTreeData = ref<TreeDataItem>([])
  const moreDetailsExpandedKeys = ref<string[]>([])
  const submitReview = () => {
    getTotalInfo()
    getTotalKnowledgePointsInfo()
    seeDetails.value = true
  }

  /**
   * 获取主视频信息
   */
  const getTotalInfo = () => {
    PrepareCourseApi.getTotalInfo(packetInfo.id).then(res => {
      if (res.data.status === 200) {
        mainVideo.value = res.data.data.sectionVideoNum
      }
    })
  }

  /**
   * 获取知识点信息
   */
  const getTotalKnowledgePointsInfo = () => {
    PrepareCourseApi.getTotalKnowledgePointsInfo(packetInfo.knowledgeSubjectId).then(res => {
      if (res.data.status === 200) {
        knowledgeExplanationVideo.value = res.data.data.lackVideoNum
      }
    })
  }

  const seeDetailsF = () => {
    seeMoreDetails.value = true
    seeDetails.value = false
    if (packetInfo.teachType === '22') {
      moreDetailsActiveKey.value = '1'
    } else {
      moreDetailsActiveKey.value = '2'
    }
    PrepareCourseApi.chapterSelectionLack(packetInfo.id).then(res => {
      if (res.data.status === 200) {
        lackChapterSession.value = res.data.data
      }
    })
    PrepareCourseApi.treeWithLackOfVideo(packetInfo.knowledgeSubjectId).then(res => {
      if (res.data.status === 200) {
        moreDetailsTreeData.value = [res.data.data]
        moreDetailsExpandedKeys.value = [res.data.data.id]
      }
    })
  }
  /**
   * 课包审批
   */
  const seeDetailsComfirm = () => {
    PrepareCourseApi.submitForApproval({
      id: packetInfo.id,
      auditStatus: '1'
    }).then(res => {
      if (res.data.status === 201) {
        seeDetails.value = false
        menuService.goBack(false)
        menuService.gotoUrl({
          url: '/m/course-manage/scp-list',
          paramUrl: '',
          title: '课包'
        })
      }
    })
  }

  const approveAllDisabled = computed(() => {
    const commonIf = (!!listOfDataChapterBind.value.length)
    return ((
      !(
        ((recordMap.applicableHasAFoundationWeek || recordMap.applicableExpertsWeek || recordMap.applicableZeroBasisWeek) && // 录播任务周期设定
            commonIf && // 章节绑定
            packetInfo.teachType === '22') || // 录播
          (commonIf && // 章节绑定
            packetInfo.teachType !== '22')) // 非录播
    ) && Number(packetInfo.isSmart) === 1 // 开启图谱
    ) || (kjlOption.value.filter(item => item.checked).length === 0 && packetInfo.isKjlTrain === '1') || // 会计乐
    (Number(packetInfo.isSmart) === 1 && !consolidationModuleCurrent.value && packetInfo.teachType !== '22' && packetInfo.exerciseType !== '2') // 巩固任务
  })

  const approveAllShow = computed(() => {
    return (
      (packetInfo.curProgress === 3 || (packetInfo.teachType === '22' && packetInfo.curProgress === 2)) && // 最后一步
      packetInfo.preview === '0' && // 非预览
      (packetInfo.auditStatus === '0' || packetInfo.auditStatus === '3') && // 待审批
      courseGroupMember.value) // 课程组成员
  })

  /**
   * 课程组成员检查
   */
  const verificationAudit = () => {
    PrepareCourseApi.getApproveStatus(packetInfo.code).then(res => {
      if (res.data.status === 200) {
        courseGroupMember.value = res.data
      }
    })
  }
  return {
    approveAllDisabled,
    approveAllShow,
    submitReview,
    seeDetails,
    mainVideo,
    knowledgeExplanationVideo,
    seeDetailsF,
    seeDetailsComfirm,
    seeMoreDetails,
    moreDetailsActiveKey,
    lackChapterSession,
    moreDetailsTreeData,
    moreDetailsExpandedKeys
  }
}
