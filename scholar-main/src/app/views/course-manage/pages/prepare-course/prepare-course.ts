import { computed, defineComponent, nextTick, ref, toRefs } from 'vue'
import { LocalStorageUtil, SessionStorageUtil } from '@/common/utils'
import { useStore } from 'vuex'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { useLearnSet, useLessons, useOtherSet, usePackageInfo, usePackageStructure, usePkgTabTopOperate } from './hook'
import { VueDraggableNext } from '@xccjh/vue3-draggable-drop'
import {
  getBingData,
  getColor,
  getDescType,
  getEvaluationStatus,
  getEvaluationType,
  getExamText,
  getFormingMethod,
  getLabel,
  getQuestionnaireType,
  getTaskFormText,
  getTaskTitle,
  getText,
  getType,
  getWidth,
  learnSetPreview,
  otherEdit,
  showBind,
  showCheck,
  showExamType,
  showJobType,
  transformChaperTreeNodes
} from './utils'
import { filePreview } from '@/app/views/course-manage/pages/scp-course/utils'
import { Modal } from 'ant-design-vue'

export default defineComponent({
  name: 'prepare-course',
  components: {
    draggable: VueDraggableNext
  },
  setup () {
    const store = useStore()
    const userId = LocalStorageUtil.getUserId()
    const loading = computed(() => store.state.loading)
    const route: RouteLocationNormalizedLoaded = useRoute()
    const menuService = useRequiredInject(MenuServiceKey)
    const { packetInfo } = usePackageInfo()
    const chapterStructureData = ref<any[]>([])
    const lock = {
      flag: false
    }

    const clickProgress = async (index: number, direction: 'prev' | 'next' | 'direct') => {
      await changeProgress(index, direction)
    }

    const changeProgress = async (index: number, direction: 'prev' | 'next' | 'direct') => {
      const pre = packetInfo.curProgress
      if (packetInfo.preview === '0') {
        if (!checkStructure()) { // 章节校验
          nextTick(() => {
            packetInfo.curProgress = pre
            lock.flag = false
          })
          return
        }
        const step = packetInfo.curProgress!
        const limit = (packetInfo.teachType !== '22') ? 2 : 1
        if (index === -1) { // 点按钮从0-4
          if (step === limit) { // 其他设置校验
            if (packetInfo.teachType !== '22') {
              if (!await getLessonCountTable()) {
                Modal.warning({
                  title: '课次设置',
                  content: '请先生成课次'
                })
                packetInfo.curProgress = pre
                lock.flag = false
                return
              }
            }
          }
        } else { // 直接点
          if (index > limit && step < limit) {
            if (packetInfo.teachType !== '22') {
              if (!await getLessonCountTable()) {
                Modal.warning({
                  title: '请生成课次',
                  content: '请先到其他设置tab生成课次'
                })
                packetInfo.curProgress = pre
                lock.flag = false
                return
              }
            }
          } else if (index > limit && step === limit) {
            if (packetInfo.teachType !== '22') {
              if (!await getLessonCountTable()) {
                Modal.warning({
                  title: '课次设置',
                  content: '请先生成课次'
                })
                packetInfo.curProgress = pre
                lock.flag = false
                return
              }
            }
          }
        }
      }
      if (direction === 'prev') {
        packetInfo.curProgress!--
      } else if (direction === 'next') {
        packetInfo.curProgress!++
      } else {
        packetInfo.curProgress = index
      }
      initTabData()
      SessionStorageUtil.putPacketInfoItem('curProgress', packetInfo.curProgress)
      lock.flag = false
    }

    /**
     * 课包结构
     */
    const {
      addChapterVisible,
      addSectionVisible,
      isEditSection,
      isEditChapter,
      addSectionFormRef,
      addChapterFormRef,
      addChapterFormState,
      addSectionFormState,
      addChapterFormRules,
      addSectionFormRules,
      chapterStructureActiveKey,
      getChapter,
      openSection,
      sectionChange,
      addChapter,
      addChapterConfirm,
      delChapter,
      addSection,
      delSection,
      addSectionConfirm,
      chapterStructureDrag,
      sectionStructureDrag,
      chapterStructureVisible,
      chapterStructureFileList,
      disableChapterStructureFileList,
      chapterImport,
      chapterExport,
      businessLoading,
      templateDownload,
      knowledgeGraphImport
    } = usePackageStructure(packetInfo, chapterStructureData)

    /**
     * 学习设置
     */
    const {
      currentLearnSetSection,
      customRequest,
      prepareBeforeUpload,
      learnsetTreeData,
      learnsetTreeNodeClick,
      learnsetTreeNodeExpand,
      learnsetSelectedKeys,
      learnsetExpandedKeys,
      learnSetVideoImportVisible,
      learnSetVideoImportFileList,
      disablelearnSetVideoImportFileList,
      learnSetVideoImportTemplateDownload,
      learnSetVideoImportConfirm,
      handoutsLecture,
      sectionDrop,
      handouts,
      handoutsMaterial,
      handoutsRecording,
      taskList,
      mainFileChange,
      disableMainLecture,
      downloadChange,
      isGradeChange,
      isSummaryChange,
      mainFileAssociatLoading,
      learnSetDownLoad,
      delLearnSet,
      mainFileAssociate,
      showMainFileAssociate,
      callSchoolEnterpriseLib,
      uploadLocal,
      lectureActiveKey,
      taskActiveKey,
      gradeTypeChange,
      currentBindLength,
      bindLimit,
      mainFileAssocateClassList,
      mainfileAssocateVisible,
      totalPage,
      closeAssocateBindModal,
      pageNumModelChangeDetect,
      currentAssocatePageNum,
      isBindChange,
      getBindBlur,
      currentResource,
      localUploadVisible,
      localUploadConfirm,
      localUploadCancel,
      localUploadLearnTarget,
      localUploadFileList,
      previewTask,
      learnSetEdit,
      questionOrEvaluationCall,
      examOperate,
      jobOperate,
      evaluationName,
      evaluationType,
      evaluationPreview,
      questionnaireName,
      questionnaireType,
      questionnairePreview,
      listOfEvaluationData,
      listOfQuestionnaireData,
      closeQuestionnaireModal,
      newQuestionnaireOrEvaluation,
      showTransfer,
      cancelCall,
      transferQuestionnaire,
      previewExaminationQuestionnaire,
      examSetVisible,
      saveExam,
      examSetFormRef,
      examSetting,
      examSetFormRules,
      examSetFormState,
      paperTypeChange,
      currentExamType,
      jobOperateVisible,
      jobOperateFormRef,
      jobOperateFormRules,
      jobOperateFormState,
      saveJobOperate,
      isEditTask,
      execrisesSubQuestionBankChange,
      previewExaminationPaper,
      transfer,
      listOfDataExercise,
      getCallList,
      subQuestionBankChangeSearch,
      homeworkSubQuestionBank,
      queryKeywordsJob,
      testExerciseId,
      queryKeywordsJobChange,
      testExerciseName,
      listOfData,
      formingMethod,
      testPaperName,
      testPaperId,
      examSubQuestionBankExam,
      exerciseListPreview,
      queryKeywordsChange,
      queryKeywords,
      examListPreview,
      saveExamOperate,
      subQuestionBankChange,
      examOperateVisible,
      examOperateFormRef,
      examOperateFormRules,
      examOperateFormState,
      subQuestionBankTreeMap,
      authorityVisible,
      authorityFormRef,
      authorityFormState,
      authorityFormRules,
      saveQuestionnaire,
      materialActiveKey,
      recordActiveKey,
      editRecord,
      videoUpload,
      isRecordLocalUploadEdit,
      recordLocalUploadVisible,
      confirmRecordLocalUpload,
      recordLocalUploadFormRef,
      recordLocalUploadFormState,
      recordLocalUploadFormRules,
      recordLocalUploadFileList,
      teacherList,
      recordLocalUploadLabel,
      recordLocalUploadCustomRequest,
      removeRecordLocalUploadFileList,
      getLearnSetChapter,
      currentTask
    } = useLearnSet(packetInfo, menuService)

    /**
     * 课次设置
     */

    const {
      editLessonFormRef,
      editLessonVisible,
      editLessonConfirm,
      editLessonFormState,
      editLessonFormRules,
      getLessonCountTableList,
      delLesson,
      editLesson,
      generateLessons,
      newLessons,
      listOfDataTable,
      lessonCount
    } = useLessons(packetInfo)

    /**
     * 其他设置
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
      levelModalVisible,
      levelFromState,
      levelFromRules,
      levelFromRef,
      saveLevelOperate,
      isEditLevel,
      paperArr,
      totalTestPaperScore,
      testPaperNameChange,
      rewardSetVisible,
      rewardSetFileList,
      rewardSetConfirm,
      rewardSetResourceCall,
      rewardSetBeforeUpload,
      subQuestionBankMap,
      subQuestionBankCurrent,
      subQuestionBankIntCurrent,
      otherSubQuestionBankChange,
      otherSetExam,
      otherSetIntelligent,
      consolidationModuleCurrent,
      consolidationModuleCurrentChange,
      delListSublibraryItem,
      getSubLibrary,
      getSubQuestionBank,
      getLevelList,
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
      deleteCompany,
      otherSetSubQuestionBankDrag,
      getCompany,
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
      ufidaOn,
      ufidaOnChange,
      bookkeeperOn,
      bookkeeperOnChange,
      bookkeeperChange,
      kjlOption,
      initBookkeeper,
      kjlLists,
      knowledgeNum,
      isBetChange,
      isBetOn,
      intellAdapt,
      intellAdaptChange,
      totalSectionNum,
      recordMap,
      applicableChange,
      applicableFocus,
      applicableWeekChange,
      listOfDataChapterBind,
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
      timeChange,
      getPapers
    } = useOtherSet(packetInfo, menuService)

    /**
     * 步骤tab
     */
    const tabCurProgress = computed(() => {
      return Number(packetInfo.curProgress) + 1
    })

    /**
     * 其他设置内部tab
     */
    const tabCurInnerProgress = computed(() => {
      return Number(packetInfo.innerCurProgress) + 1
    })

    /**
     * 切换tab
     * @param step
     */
    const tabCurInnerProgressChange = (step: number) => {
      packetInfo.innerCurProgress = step - 1
      SessionStorageUtil.putPacketInfoItem('innerCurProgress', String(packetInfo.innerCurProgress))
      getTabSubData()
    }

    /**
     * 其他设置自动回想数据
     */
    const getTabSubData = () => {
      if (tabCurInnerProgress.value === 1) { // 闯关
        getLevelList()
        approvalJudgment()
      } else if (tabCurInnerProgress.value === 2) { // 题库
        getSubLibrary()
        getSubQuestionBank()
        approvalJudgment()
      } else if (tabCurInnerProgress.value === 3) { // 实训
        getCompany()
        getHqlist()
        initBookkeeper()
        intelligentApprovalJudgment()
      } else { // 智适应
        intellAdaptData()
        trainingApprovalJudgment()
      }
    }

    /**
     * 审批状态检测
     */
    const approvalJudgment = () => {
      trainingApprovalJudgment()
      intelligentApprovalJudgment()
    }

    /**
     * 智适应审批状态数据
     */
    const intelligentApprovalJudgment = () => {
      if (packetInfo.isSmart === '1') {
        getChapterBindList()
        getSubLibrary()
        if (packetInfo.teachType === '22') {
          getLessonPackage()
        }
      }
    }

    /**
     * 实训审批状态数据
     */
    const trainingApprovalJudgment = () => {
      if (packetInfo.isKjlTrain === '1') {
        initBookkeeper()
      }
    }

    /**
     * 自动回显步骤数据
     */
    const initTabData = () => {
      if (tabCurProgress.value === 1) {
        getChapter()
      } else if (tabCurProgress.value === 2) {
        learnsetSelectedKeys.value = [SessionStorageUtil.getSelection().id]
        learnsetExpandedKeys.value = [SessionStorageUtil.getChapter()!]
        getLearnSetChapter()
      } else if ((tabCurProgress.value === 3 && packetInfo.teachType === '22') || (tabCurProgress.value === 4 && packetInfo.teachType !== '22')) {
        getTabSubData()
      } else {
        getLessonCountTableList()
      }
    }

    /**
     * 最顶部按钮
     */
    const {
      approveAllShow,
      approveAllDisabled,
      submitReview,
      goback,
      preStep,
      nextStep,
      checkStructure,
      getLessonCountTable,
      seeDetailsF,
      seeDetailsComfirm,
      seeDetails,
      mainVideo,
      knowledgeExplanationVideo,
      seeMoreDetails,
      moreDetailsActiveKey,
      lackChapterSession,
      moreDetailsTreeData,
      moreDetailsExpandedKeys
    } = usePkgTabTopOperate(
      menuService,
      packetInfo,
      chapterStructureData,
      changeProgress,
      lock,
      listOfDataChapterBind,
      recordMap,
      kjlOption,
      consolidationModuleCurrent
    )

    initTabData()

    return {
      seeMoreDetails,
      moreDetailsActiveKey,
      lackChapterSession,
      seeDetailsF,
      seeDetailsComfirm,
      seeDetails,
      mainVideo,
      knowledgeExplanationVideo,
      getOtherSetSection,
      getOtherSetChapter,
      otherSetTreeNodeExpand,
      otherSetTreeNodeClick,
      otherSetTreeData,
      otherSetSelectedKeys,
      otherSetExpandedKeys,
      currentOtherSetSection,
      chapterBindModal,
      getBingData,
      knowledgeNum,
      isBetChange,
      intellAdaptChange,
      totalSectionNum,
      ...toRefs(recordMap),
      applicableChange,
      applicableFocus,
      applicableWeekChange,
      listOfDataChapterBind,
      intellAdaptData,
      isBetOn,
      intellAdapt,
      userId,
      loading,
      ...toRefs(packetInfo),
      packetInfo,
      tabCurProgress,
      approveAllShow,
      approveAllDisabled,
      submitReview,
      goback,
      preStep,
      changeProgress,
      nextStep,
      customRequest,
      prepareBeforeUpload,
      chapterExport,
      businessLoading,
      knowledgeGraphImport,
      chapterStructureFileList,
      disableChapterStructureFileList,
      chapterStructureVisible,
      templateDownload,
      chapterImport,
      addChapterVisible,
      addSectionVisible,
      isEditSection,
      isEditChapter,
      addSectionFormRef,
      addChapterFormRef,
      addChapterFormState,
      addSectionFormState,
      addChapterFormRules,
      addSectionFormRules,
      chapterStructureActiveKey,
      getChapter,
      openSection,
      sectionChange,
      addChapter,
      addChapterConfirm,
      delChapter,
      addSection,
      delSection,
      addSectionConfirm,
      chapterStructureDrag,
      sectionStructureDrag,
      currentLearnSetSection,
      chapterStructureData,
      transformChaperTreeNodes,
      learnsetTreeData,
      learnsetTreeNodeClick,
      learnsetTreeNodeExpand,
      learnsetSelectedKeys,
      learnsetExpandedKeys,
      learnSetVideoImportVisible,
      learnSetVideoImportFileList,
      disablelearnSetVideoImportFileList,
      learnSetVideoImportTemplateDownload,
      learnSetVideoImportConfirm,
      handoutsLecture,
      sectionDrop,
      handouts,
      handoutsMaterial,
      handoutsRecording,
      taskList,
      mainFileChange,
      disableMainLecture,
      downloadChange,
      isGradeChange,
      isSummaryChange,
      mainFileAssociatLoading,
      learnSetDownLoad,
      learnSetPreview,
      delLearnSet,
      mainFileAssociate,
      showMainFileAssociate,
      callSchoolEnterpriseLib,
      uploadLocal,
      lectureActiveKey,
      taskActiveKey,
      gradeTypeChange,
      currentBindLength,
      bindLimit,
      mainFileAssocateClassList,
      mainfileAssocateVisible,
      totalPage,
      closeAssocateBindModal,
      getColor,
      pageNumModelChangeDetect,
      currentAssocatePageNum,
      isBindChange,
      getBindBlur,
      currentResource,
      localUploadVisible,
      localUploadConfirm,
      localUploadCancel,
      localUploadLearnTarget,
      localUploadFileList,
      previewTask,
      getText,
      getExamText,
      getTaskFormText,
      showExamType,
      showJobType,
      learnSetEdit,
      questionOrEvaluationCall,
      examOperate,
      jobOperate,
      evaluationName,
      evaluationType,
      evaluationPreview,
      questionnaireName,
      questionnaireType,
      questionnairePreview,
      listOfEvaluationData,
      listOfQuestionnaireData,
      closeQuestionnaireModal,
      newQuestionnaireOrEvaluation,
      getQuestionnaireType,
      getEvaluationType,
      getEvaluationStatus,
      showTransfer,
      cancelCall,
      transferQuestionnaire,
      previewExaminationQuestionnaire,
      examSetVisible,
      saveExam,
      examSetFormRef,
      examSetting,
      examSetFormRules,
      examSetFormState,
      paperTypeChange,
      currentExamType,
      jobOperateVisible,
      jobOperateFormRef,
      jobOperateFormRules,
      jobOperateFormState,
      saveJobOperate,
      ...toRefs(subQuestionBankTreeMap),
      isEditTask,
      execrisesSubQuestionBankChange,
      previewExaminationPaper,
      transfer,
      listOfDataExercise,
      getCallList,
      subQuestionBankChangeSearch,
      homeworkSubQuestionBank,
      queryKeywordsJob,
      testExerciseId,
      queryKeywordsJobChange,
      testExerciseName,
      listOfData,
      formingMethod,
      testPaperName,
      testPaperId,
      examSubQuestionBankExam,
      exerciseListPreview,
      queryKeywordsChange,
      getFormingMethod,
      getType,
      queryKeywords,
      examListPreview,
      saveExamOperate,
      subQuestionBankChange,
      examOperateVisible,
      examOperateFormRef,
      examOperateFormRules,
      examOperateFormState,
      authorityVisible,
      authorityFormRef,
      authorityFormState,
      authorityFormRules,
      saveQuestionnaire,
      materialActiveKey,
      recordActiveKey,
      editRecord,
      videoUpload,
      isRecordLocalUploadEdit,
      recordLocalUploadVisible,
      confirmRecordLocalUpload,
      recordLocalUploadFormRef,
      recordLocalUploadFormState,
      recordLocalUploadFormRules,
      recordLocalUploadFileList,
      filePreview,
      teacherList,
      recordLocalUploadLabel,
      getLabel,
      recordLocalUploadCustomRequest,
      removeRecordLocalUploadFileList,
      listOfDataTable,
      delLesson,
      editLesson,
      lessonCount,
      generateLessons,
      newLessons,
      editLessonFormRef,
      editLessonVisible,
      editLessonConfirm,
      editLessonFormState,
      editLessonFormRules,
      getLessonCountTableList,
      clickProgress,
      tabCurInnerProgress,
      breakthroughMode,
      addOrEditLevel,
      deleteGift,
      deleteLevel,
      rewardSettings,
      breakthroughModeChange,
      levelLists,
      moduleArr,
      levelModalVisible,
      levelFromState,
      levelFromRules,
      levelFromRef,
      saveLevelOperate,
      isEditLevel,
      paperArr,
      totalTestPaperScore,
      testPaperNameChange,
      rewardSetVisible,
      rewardSetFileList,
      rewardSetConfirm,
      rewardSetResourceCall,
      rewardSetBeforeUpload,
      subQuestionBankCurrent,
      subQuestionBankIntCurrent,
      otherSubQuestionBankChange,
      otherSetExam,
      otherSetIntelligent,
      consolidationModuleCurrent,
      consolidationModuleCurrentChange,
      delListSublibraryItem,
      tabCurInnerProgressChange,
      ...toRefs(subQuestionBankMap),
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
      deleteCompany,
      otherSetSubQuestionBankDrag,
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
      ufidaOn,
      ufidaOnChange,
      bookkeeperOn,
      bookkeeperOnChange,
      bookkeeperChange,
      kjlOption,
      initBookkeeper,
      kjlLists,
      chapterBindVisible,
      bindKnowledgePoints,
      knowledgeGraphTreeData,
      knowledgeGraphExpandedKeys,
      knowledgeGraphCheckedKeys,
      knowledgeGraphTreeNodeClick,
      getKnowledgeTreeData,
      untieKnowledgePoints,
      modifyBind,
      moreDetailsTreeData,
      moreDetailsExpandedKeys,
      currentTask,
      showCheck,
      showBind,
      getTaskTitle,
      getWidth,
      otherEdit,
      timeOpen,
      timeChange,
      examTimePre,
      examTime,
      getPapers,
      getDescType
    }
  }
})
