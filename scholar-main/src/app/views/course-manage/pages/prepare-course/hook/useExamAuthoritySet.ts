import { reactive, ref } from 'vue'
import { TaskDataType } from '../entity'
import { PrepareCourseApi } from '../api'
import { message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/app/views/course-manage/pages/scp-list/entity'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'

export function useExamAuthoritySet (getTaskList, packetInfo) {
  const examSetVisible = ref(false)
  const authorityVisible = ref(false)
  const currentExamType = ref('')
  const currentExam = ref<Partial<TaskDataType>>({})
  const currentQuestion = ref<Partial<TaskDataType>>({})
  const examSetFormRef = ref()
  const authorityFormRef = ref()
  const authorityFormState = reactive({
    answerTimes: 0,
    answerTime: null
  })
  const authorityFormRules = {
    answerTimes: [
      { required: true, message: '请输入答题次数', trigger: 'change', type: 'number' }
    ]
  }
  const examSetFormRules = {
    examLength: [
      { required: true, message: '考试时长不能为空', trigger: 'change', type: 'number' },
      { whitespace: true, message: '考试时长不能为空', trigger: 'change', type: 'number' }
    ],
    passScore: [
      { required: true, message: '及格分数不能为空', trigger: 'change', type: 'number' },
      { whitespace: true, message: '及格分数不能为空', trigger: 'change', type: 'number' }
    ],
    answerTimes: [
      { required: true, message: '请输入答题次数', trigger: 'change', type: 'number' }
    ]
  }
  const examSetFormState = reactive({
    examLength: 0,
    passScore: 0,
    paperType: '1',
    computerType: '',
    isRedo: '0',
    answerTimes: 0,
    answerTime: null,
    resultWay: '1',
    configType: '1',
    id: ''
  })

  /**
   * 自动回显重做状态
   * @param paperType
   */
  const paperTypeChange = (paperType: string) => {
    if (paperType === '6' && (currentExamType.value === '3' || currentExamType.value === '2')) {
      examSetFormState.isRedo = '1'
    } else {
      examSetFormState.isRedo = '0'
    }
  }

  /**
   * 更新考试设置
   */
  const saveExam = () => {
    if (examSetFormState.answerTimes === 1 && !(examSetFormState.answerTime)) {
      message.warning('请输入你想要的答题次数')
      return
    }
    examSetFormRef.value.validate().then(() => {
      const {
        examLength,
        passScore,
        paperType,
        computerType,
        isRedo,
        configType
      } = examSetFormState

      const params = {
        id: currentExam.value.id,
        examLength,
        passScore,
        computerType,
        isRedo,
        paperType,
        answerTimes: examSetFormState.answerTimes === 1 ? examSetFormState.answerTime : 0,
        resultWay: packetInfo.exerciseType === '1' ? '1' : '0',
        configType
      }
      PrepareCourseApi.examSetting(params).then(res => {
        if (res.data.status === 201) {
          CommonApi.statisticsLog({
            name: '考试任务考试设置更改',
            actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
            content: JSON.stringify(params)
          })
          examSetVisible.value = false
          getTaskList()
        }
      })
    }).catch((error: ValidateErrorEntity<FormState>) => {
      console.log('error', error)
    })
  }

  /**
   * 打开考试设置
   */
  const examSetting = (item: TaskDataType) => {
    if (item.taskType === '4') {
      currentExam.value = item
      getExamination()
    } else {
      currentQuestion.value = item
      questionnaireSetting()
    }
  }
  /**
   * 回显考试设置
   */
  const getExamination = () => {
    PrepareCourseApi.getExamination(currentExam.value.id).then(res => {
      if (res.data.status === 200) {
        const result = res.data.data || {}
        currentExamType.value = result.examType
        examSetFormState.id = result.id
        examSetFormState.examLength = result.examLength || 0
        examSetFormState.passScore = result.passScore || 0
        examSetFormState.paperType = result.paperType || '1'
        examSetFormState.isRedo = (result.isRedo && String(result.isRedo)) || '0'
        examSetFormState.computerType = result.computerType || '1'
        examSetFormState.resultWay = result.resultWay || (packetInfo.exerciseType === '1' ? '1' : '0')
        examSetFormState.configType = result.configType || '1'
        if (Number(result.answerTimes) !== 0) {
          examSetFormState.answerTime = result.answerTimes
          examSetFormState.answerTimes = 1
        } else {
          examSetFormState.answerTime = null
          examSetFormState.answerTimes = 0
        }
        examSetVisible.value = true
      }
    })
  }

  /**
   * 回显权限设置
   */
  const questionnaireSetting = () => {
    PrepareCourseApi.getExamination(currentQuestion.value.id).then(res => {
      if (res.data.status === 200) {
        const result = res.data.data || {}
        if (Number(result.answerTimes) !== 0) {
          authorityFormState.answerTime = result.answerTimes
          authorityFormState.answerTimes = 1
        } else {
          authorityFormState.answerTime = null
          authorityFormState.answerTimes = 0
        }
        authorityVisible.value = true
      }
    })
  }

  /**
   * 保存权限设置
   */
  const saveQuestionnaire = () => {
    if (authorityFormState.answerTimes === 1 && !(authorityFormState.answerTime)) {
      message.warning('请输入你想要的答题次数')
      return
    }
    authorityFormRef.value.validate().then(() => {
      const params = {
        id: currentQuestion.value.id,
        answerTimes: authorityFormState.answerTimes === 1 ? authorityFormState.answerTime : 0
      }
      PrepareCourseApi.examSetting(params).then(res => {
        if (res.data.status === 201) {
          CommonApi.statisticsLog({
            name: (currentQuestion.value.taskType === '6' ? '问卷' : '测评') + '任务权限设置更改',
            actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
            content: JSON.stringify(params)
          })
          authorityVisible.value = false
        }
      })
    }).catch((error: ValidateErrorEntity<FormState>) => {
      console.log('error', error)
    })
  }

  return {
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
  }
}
