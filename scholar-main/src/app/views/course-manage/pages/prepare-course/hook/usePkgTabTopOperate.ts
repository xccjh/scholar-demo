import { computed } from 'vue'
import { useProgressChange, useApproveAll } from './'
import { SessionStorageUtil } from '@/common/utils'

export function usePkgTabTopOperate (
  menuService,
  packetInfo,
  chapterStructureData,
  changeProgress,
  lock,
  listOfDataChapterBind,
  recordMap,
  kjlOption,
  consolidationModuleCurrent
) {
  const goback = () => {
    menuService.goBack(false)
    const type = SessionStorageUtil.getPkgType()
    const url = type === 'my' ? '/m/course-manage/initiatepkg' : type === 'all' ? '/m/course-manage/iapproved' : '/m/course-manage/scp-list'
    const title = type === 'my' ? '我发起的' : type === 'all' ? '全部审批' : '课包'
    menuService.gotoUrl({
      url,
      paramUrl: '',
      title
    })
  }

  const {
    preStep,
    nextStep,
    checkStructure,
    getLessonCountTable
  } = useProgressChange(packetInfo, chapterStructureData, changeProgress, lock)

  const {
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
  } = useApproveAll(menuService, packetInfo, listOfDataChapterBind, recordMap, kjlOption, consolidationModuleCurrent)

  return {
    approveAllShow,
    approveAllDisabled,
    submitReview,
    goback,
    preStep,
    changeProgress,
    nextStep,
    checkStructure,
    getLessonCountTable,
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
