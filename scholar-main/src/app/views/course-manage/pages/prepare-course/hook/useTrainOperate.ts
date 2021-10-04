import { useTrain99 } from '@/app/views/course-manage/pages/prepare-course/hook/useTrain99'
import { useTrainHq } from '@/app/views/course-manage/pages/prepare-course/hook/useTrainHq'
import { useTrainYy } from '@/app/views/course-manage/pages/prepare-course/hook/useTrainYy'
import { useTrainKjl } from '@/app/views/course-manage/pages/prepare-course/hook/useTrainKjl'

export function useTrainOperate (packetInfo) {
  /**
   * 99实训
   */
  const {
    practiceOnChange,
    train99Confirm,
    addOrEditCompany,
    train99FileList,
    train99Visible,
    train99FromRules,
    isEditTrain99,
    currentTrain99,
    train99FromRef,
    train99FromState,
    practiceOn,
    companyLists,
    removeTrain99FileList,
    customDataPackRequest,
    getCompany,
    deleteCompany
  } = useTrain99(packetInfo)

  // getCompany()

  /**
   * 恒企实训
   */
  const {
    hqOnChange,
    trainHqConfirm,
    addOrEditHq,
    trainHqVisible,
    trainHqFromRules,
    isEditTrainHq,
    currentTrainHq,
    trainHqFromRef,
    trainHqFromState,
    hqOn,
    hqLists,
    getHqlist,
    deleteHq
  } = useTrainHq(packetInfo)
  // getHqlist()

  /**
   * 会计乐实训
   */
  const {
    bookkeeperOn,
    bookkeeperOnChange,
    bookkeeperChange,
    kjlOption,
    initBookkeeper,
    kjlLists
  } = useTrainKjl(packetInfo)
  // initBookkeeper()

  /**
   * 用友实训
   */
  const {
    ufidaOn,
    ufidaOnChange
  } = useTrainYy(packetInfo)

  return {
    hqOnChange,
    trainHqConfirm,
    addOrEditHq,
    trainHqVisible,
    trainHqFromRules,
    isEditTrainHq,
    currentTrainHq,
    trainHqFromRef,
    trainHqFromState,
    hqOn,
    hqLists,
    getHqlist,
    deleteHq,
    practiceOnChange,
    train99Confirm,
    addOrEditCompany,
    train99FileList,
    train99Visible,
    train99FromRules,
    isEditTrain99,
    currentTrain99,
    train99FromRef,
    train99FromState,
    deleteCompany,
    removeTrain99FileList,
    customDataPackRequest,
    practiceOn,
    companyLists,
    getCompany,
    ufidaOn,
    ufidaOnChange,
    bookkeeperOn,
    bookkeeperOnChange,
    bookkeeperChange,
    kjlOption,
    initBookkeeper,
    kjlLists
  }
}
