import {
  useBreakthrough,
  useSubQuestionBank,
  useTrainOperate,
  useIntellAdapt
} from '.'

export function useOtherSet (packetInfo, menuService) {
  /**
   * 闯关
   */
  const {
    breakthroughMode,
    addOrEditLevel,
    deleteGift,
    deleteLevel,
    rewardSettings,
    breakthroughModeChange,
    levelLists,
    moduleArr,
    paperArr,
    levelModalVisible,
    levelFromState,
    levelFromRules,
    levelFromRef,
    saveLevelOperate,
    isEditLevel,
    totalTestPaperScore,
    testPaperNameChange,
    rewardSetVisible,
    rewardSetFileList,
    rewardSetConfirm,
    rewardSetResourceCall,
    rewardSetBeforeUpload,
    getLevelList,
    getPapers
  } = useBreakthrough(packetInfo, menuService)

  // getLevelList()

  /**
   * 配套题库
   */
  const {
    subQuestionBankMap,
    getSubQuestionBank,
    subQuestionBankCurrent,
    otherSubQuestionBankChange,
    otherSetExam,
    otherSetIntelligent,
    delListSublibraryItem,
    getSubLibrary,
    otherSetSubQuestionBankDrag,
    subQuestionBankIntCurrent,
    consolidationModuleCurrent,
    consolidationModuleCurrentChange
  } = useSubQuestionBank(packetInfo)

  // getSubQuestionBank()
  // getSubLibrary()

  /**
   * 实训
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
  } = useTrainOperate(packetInfo)

  // getCompany
  // getHqlist()
  // initBookkeeper()

  /**
   * 智适应
   */
  const {
    knowledgeNum,
    isBetChange,
    isBetOn,
    intellAdapt,
    intellAdaptChange,
    totalSectionNum,
    recordMap,
    listOfDataChapterBind,
    applicableChange,
    applicableFocus,
    applicableWeekChange,
    intellAdaptData,
    chapterBindModal,
    chapterBindVisible,
    bindKnowledgePoints,
    getOtherSetSection,
    getOtherSetChapter,
    otherSetTreeNodeExpand,
    otherSetTreeNodeClick,
    otherSetTreeData,
    otherSetSelectedKeys,
    otherSetExpandedKeys,
    currentOtherSetSection,
    knowledgeGraphTreeData,
    knowledgeGraphCheckedKeys,
    knowledgeGraphExpandedKeys,
    knowledgeGraphTreeNodeClick,
    getKnowledgeTreeData,
    untieKnowledgePoints,
    modifyBind,
    getChapterBindList,
    getLessonPackage,
    examTimePre,
    examTime,
    timeOpen,
    timeChange
  } = useIntellAdapt(packetInfo, getSubLibrary, getSubQuestionBank)

  // intellAdaptData()

  return {
    getChapterBindList,
    getLessonPackage,
    chapterBindModal,
    knowledgeNum,
    isBetChange,
    isBetOn,
    intellAdapt,
    intellAdaptChange,
    totalSectionNum,
    recordMap,
    listOfDataChapterBind,
    intellAdaptData,
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
    breakthroughMode,
    addOrEditLevel,
    deleteGift,
    deleteLevel,
    rewardSettings,
    breakthroughModeChange,
    levelLists,
    moduleArr,
    paperArr,
    levelModalVisible,
    levelFromState,
    levelFromRules,
    levelFromRef,
    saveLevelOperate,
    isEditLevel,
    totalTestPaperScore,
    testPaperNameChange,
    rewardSetVisible,
    rewardSetFileList,
    rewardSetConfirm,
    rewardSetResourceCall,
    rewardSetBeforeUpload,
    subQuestionBankMap,
    getSubQuestionBank,
    subQuestionBankCurrent,
    otherSubQuestionBankChange,
    otherSetExam,
    delListSublibraryItem,
    getSubLibrary,
    getLevelList,
    otherSetSubQuestionBankDrag,
    bookkeeperOn,
    bookkeeperOnChange,
    bookkeeperChange,
    kjlOption,
    initBookkeeper,
    kjlLists,
    otherSetIntelligent,
    subQuestionBankIntCurrent,
    consolidationModuleCurrent,
    consolidationModuleCurrentChange,
    applicableChange,
    applicableFocus,
    applicableWeekChange,
    chapterBindVisible,
    bindKnowledgePoints,
    getOtherSetSection,
    getOtherSetChapter,
    otherSetTreeNodeExpand,
    otherSetTreeNodeClick,
    otherSetTreeData,
    otherSetSelectedKeys,
    otherSetExpandedKeys,
    currentOtherSetSection,
    knowledgeGraphTreeData,
    knowledgeGraphCheckedKeys,
    knowledgeGraphExpandedKeys,
    knowledgeGraphTreeNodeClick,
    getKnowledgeTreeData,
    untieKnowledgePoints,
    modifyBind,
    examTimePre,
    examTime,
    timeOpen,
    timeChange,
    getPapers
  }
}