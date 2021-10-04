import { useRecordPlan } from '@/app/views/course-manage/pages/prepare-course/hook/useRecordPlan'
import { useIntellAdaptSwitch } from '@/app/views/course-manage/pages/prepare-course/hook/useIntellAdaptSwitch'
import { useChapterBind } from '@/app/views/course-manage/pages/prepare-course/hook/useChapterBind'

export function useIntellAdapt (packetInfo, getSubLibrary, getSubQuestionBank) {
  /**
   * 录播计划
   */
  const {
    recordMap,
    applicableChange,
    applicableFocus,
    applicableWeekChange,
    getLessonPackage,
    totalSectionNum,
    examTimePre,
    examTime,
    timeOpen,
    timeChange
  } = useRecordPlan(packetInfo)

  /**
   * 章节绑定
   */
  const {
    chapterBindVisible,
    bindKnowledgePoints,
    chapterBindModal,
    listOfDataChapterBind,
    getChapterBindList,
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
    modifyBind
  } = useChapterBind(packetInfo)

  /**
   * 智适应开关
   */
  const {
    knowledgeNum,
    isBetChange,
    isBetOn,
    intellAdapt,
    intellAdaptChange,
    getKnowledgeNum
  } = useIntellAdaptSwitch(packetInfo, getLessonPackage, getChapterBindList)

  /**
   * 初始化数据
   */
  const intellAdaptData = () => {
    getKnowledgeNum()
    getSubLibrary()
    getSubQuestionBank()
    getLessonPackage()
    if (intellAdapt.value) {
      getChapterBindList()
    }
  }

  return {
    knowledgeNum,
    isBetChange,
    isBetOn,
    intellAdapt,
    intellAdaptChange,
    totalSectionNum,
    recordMap,
    intellAdaptData,
    applicableChange,
    applicableFocus,
    applicableWeekChange,
    chapterBindVisible,
    bindKnowledgePoints,
    chapterBindModal,
    listOfDataChapterBind,
    getOtherSetSection,
    getOtherSetChapter,
    otherSetTreeNodeExpand,
    otherSetTreeNodeClick,
    otherSetTreeData,
    otherSetSelectedKeys,
    otherSetExpandedKeys,
    currentOtherSetSection,
    knowledgeGraphTreeData,
    knowledgeGraphExpandedKeys,
    knowledgeGraphCheckedKeys,
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
  }
}
