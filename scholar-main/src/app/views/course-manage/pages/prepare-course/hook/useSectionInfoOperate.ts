import { ref } from 'vue'
import { useSectionInfoCommonOperate } from './useSectionInfoCommonOperate'
import { useQuestionnaireOrEvaluation } from './useQuestionnaireOrEvaluation'
import { useExamAuthoritySet } from './useExamAuthoritySet'
import { previewExaminationPaper } from '../utils'
import { useExamJobOperate } from './useExamJobOperate'

export function useSectionInfoOperate (
  handoutsLecture,
  taskList,
  getTaskList,
  getHandoutFiles,
  packetInfo,
  menuService,
  currentLearnSetSection
) {
  /**
   * 考试设置
   * */
  const {
    examSetting,
    saveExam,
    paperTypeChange,
    currentExamType,
    examSetFormState,
    examSetFormRules,
    examSetFormRef,
    examSetVisible,
    authorityVisible,
    authorityFormRef,
    authorityFormState,
    authorityFormRules,
    saveQuestionnaire
  } = useExamAuthoritySet(getTaskList, packetInfo)

  /**
   * 考试作业操作
   */
  const {
    currentTask,
    isEditTask,
    subQuestionBankTreeMap,
    jobOperateVisible,
    examOperateVisible,
    exerciseListPreview,
    examListPreview,
    examOperateFormRef,
    jobOperateFormRef,
    examOperateFormRules,
    jobOperateFormRules,
    jobOperateFormState,
    examOperateFormState,
    listOfDataExercise,
    listOfData,
    examSubQuestionBankExam,
    homeworkSubQuestionBank,
    queryKeywordsJob,
    queryKeywords,
    testExerciseName,
    testPaperName,
    testExerciseId,
    testPaperId,
    formingMethod,
    queryKeywordsJobChange,
    queryKeywordsChange,
    subQuestionBankChangeSearch,
    getCallList,
    transfer,
    subQuestionBankChange,
    execrisesSubQuestionBankChange,
    saveExamOperate,
    saveJobOperate,
    jobOperate,
    examOperate,
    entryExercises,
    addVolume
  } = useExamJobOperate(
    packetInfo,
    getTaskList,
    currentLearnSetSection,
    taskList
  )

  /**
   * 问卷测评操作
   */
  const {
    evaluationName,
    evaluationType,
    evaluationPreview,
    questionnaireName,
    questionnaireType,
    questionnairePreview,
    listOfEvaluationData,
    listOfQuestionnaireData,
    questionOrEvaluationCall,
    closeQuestionnaireModal,
    newQuestionnaireOrEvaluation,
    transferQuestionnaire
  } = useQuestionnaireOrEvaluation(packetInfo, currentLearnSetSection, taskList, getTaskList)

  /**
   * 公共操作
   */
  const {
    cancelCall,
    showTransfer,
    previewExaminationQuestionnaire,
    previewTask,
    learnSetEdit,
    learnSetDownLoad,
    gradeTypeChange,
    isGradeChange,
    isSummaryChange,
    downloadChange,
    mainFileChange,
    showMainFileAssociate,
    disableMainLecture,
    delLearnSet
  } = useSectionInfoCommonOperate(
    taskList,
    getTaskList,
    packetInfo,
    handoutsLecture,
    menuService,
    getHandoutFiles,
    entryExercises,
    addVolume
  )

  return {
    delLearnSet,
    previewTask,
    learnSetDownLoad,
    gradeTypeChange,
    isGradeChange,
    isSummaryChange,
    downloadChange,
    mainFileChange,
    showMainFileAssociate,
    disableMainLecture,
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
    questionOrEvaluationCall,
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
    listOfData,
    formingMethod,
    testPaperName,
    testExerciseId,
    testPaperId,
    examSubQuestionBankExam,
    exerciseListPreview,
    queryKeywordsChange,
    queryKeywords,
    examListPreview,
    subQuestionBankChange,
    examOperateVisible,
    examOperateFormRef,
    examOperateFormRules,
    examOperateFormState,
    saveExamOperate,
    authorityVisible,
    authorityFormRef,
    authorityFormState,
    authorityFormRules,
    saveQuestionnaire,
    currentTask
  }
}
