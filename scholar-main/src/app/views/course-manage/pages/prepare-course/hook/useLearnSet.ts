import { ref } from 'vue'
import { CurrentLearnSetSection } from '../entity'
import { useLearnSetFileList } from './useLearnSetFileList'
import { useSectionInfoOperate } from './useSectionInfoOperate'
import { useAssocateTask } from './useAssocateTask'
import { useLectureButtonOperate } from './useLectureButtonOperate'
import { useLearnSetTree } from './useLearnSetTree'
import { useLearnSetImportVideo } from './useLearnSetImportVideo'
import { useUploadFile } from './useUploadFile'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { useRecordOperate } from '@/app/views/course-manage/pages/prepare-course/hook/useRecordOperate'
import { SessionStorageUtil } from '@/common/utils'

export function useLearnSet (packetInfo, menuService) {
  const lectureActiveKey = ref('0')
  const recordActiveKey = ref('1')
  const taskActiveKey = ref('2')
  const materialActiveKey = ref('3')
  const recordLocalUploadFileList = ref<FileItem[]>([])

  /**
   * 当前选中节
   */
  const currentLearnSetSection = ref<Partial<CurrentLearnSetSection>>(SessionStorageUtil.getSelection())

  /**
   * 节信息任务资料列表
   */
  const {
    getHandoutFiles,
    getTaskList,
    handoutsLecture,
    handoutsMaterial,
    handoutsRecording,
    handouts,
    taskList,
    sectionDrop
  } = useLearnSetFileList(currentLearnSetSection)

  /**
   * 节信息资料任务列表操作
   */
  const {
    delLearnSet,
    learnSetDownLoad,
    gradeTypeChange,
    isGradeChange,
    isSummaryChange,
    downloadChange,
    mainFileChange,
    showMainFileAssociate,
    disableMainLecture,
    previewTask,
    learnSetEdit,
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
    questionOrEvaluationCall,
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
    subQuestionBankTreeMap,
    isEditTask,
    execrisesSubQuestionBankChange,
    previewExaminationPaper,
    transfer,
    listOfDataExercise,
    getCallList,
    subQuestionBankChangeSearch,
    homeworkSubQuestionBank,
    queryKeywordsJob,
    queryKeywordsJobChange,
    testExerciseName,
    testExerciseId,
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
    authorityVisible,
    authorityFormRef,
    authorityFormState,
    authorityFormRules,
    saveQuestionnaire,
    currentTask
  } = useSectionInfoOperate(handoutsLecture, taskList, getTaskList, getHandoutFiles, packetInfo, menuService, currentLearnSetSection)

  /**
   * 主讲义关联
   */
  const {
    closeAssocateBindModal,
    mainFileAssociate,
    getBindBlur,
    isBindChange,
    pageNumModelChangeDetect,
    bindLimit,
    mainFileAssociatLoading,
    totalPage,
    currentBindLength,
    currentResource,
    mainFileAssocateClassList,
    mainfileAssocateVisible,
    currentAssocatePageNum
  } = useAssocateTask(getTaskList, currentLearnSetSection)

  /**
   * 本地上传和各个库调用
   */
  const {
    callSchoolEnterpriseLib,
    uploadLocal,
    localUploadVisible,
    localUploadConfirm,
    localUploadCancel,
    localUploadLearnTarget,
    localUploadFileList
  } = useLectureButtonOperate(
    currentLearnSetSection,
    handoutsLecture,
    handoutsMaterial,
    handoutsRecording,
    taskList,
    getHandoutFiles,
    getTaskList,
    packetInfo,
    menuService
  )

  /**
   * 学习设置左侧树逻辑
   */
  const {
    learnsetTreeNodeExpand,
    learnsetTreeNodeClick,
    learnsetTreeData,
    learnsetSelectedKeys,
    learnsetExpandedKeys,
    getLearnSetChapter
  } = useLearnSetTree(getTaskList, getHandoutFiles, packetInfo, currentLearnSetSection)

  /**
   * 学习设置录播顶侧导入视频逻辑
   */
  const {
    learnSetVideoImportVisible,
    learnSetVideoImportFileList,
    disablelearnSetVideoImportFileList,
    learnSetVideoImportTemplateDownload,
    learnSetVideoImportConfirm
  } = useLearnSetImportVideo(packetInfo, getHandoutFiles)

  /**
   * 阿里云文件上传逻辑
   */
  const { customRequest, prepareBeforeUpload } = useUploadFile(localUploadFileList)

  /**
   * 录播操作逻辑
   */
  const {
    editRecord,
    videoUpload,
    isRecordLocalUploadEdit,
    recordLocalUploadVisible,
    confirmRecordLocalUpload,
    recordLocalUploadFormRef,
    recordLocalUploadFormState,
    recordLocalUploadFormRules,
    teacherList,
    recordLocalUploadLabel,
    recordLocalUploadCustomRequest,
    removeRecordLocalUploadFileList
  } = useRecordOperate(handoutsRecording, packetInfo, currentLearnSetSection, getHandoutFiles, recordLocalUploadFileList)

  return {
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
    recordLocalUploadFileList,
    getLearnSetChapter,
    editRecord,
    videoUpload,
    isRecordLocalUploadEdit,
    recordLocalUploadVisible,
    confirmRecordLocalUpload,
    recordLocalUploadFormRef,
    recordLocalUploadFormState,
    recordLocalUploadFormRules,
    teacherList,
    recordLocalUploadLabel,
    recordLocalUploadCustomRequest,
    removeRecordLocalUploadFileList,
    currentTask
  }
}
