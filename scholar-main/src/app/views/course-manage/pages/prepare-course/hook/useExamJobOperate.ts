import { computed, reactive, ref } from 'vue'
import { TaskDataType } from '../entity'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { CallItem, Json } from '@/common/base'
import { LocalStorageUtil, ToolsUtil } from '@/common/utils'
import { PrepareCourseApi } from '../api'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/app/views/course-manage/pages/scp-list/entity'
import { conversionNode, otherEdit } from '../utils'
import { message } from 'ant-design-vue'

export function useExamJobOperate (packetInfo, getTaskList, currentLearnSetSection, taskList) {
  const currentTask = ref<Partial<TaskDataType>>({})
  const isEditTask = ref(false)
  const subQuestionBankTreeMap = reactive<{
    exam: TreeDataItem[],
    exercise: TreeDataItem[],
    examSearch: TreeDataItem[],
    exerciseSearch: TreeDataItem[]
  }>({
    exam: [],
    exercise: [],
    examSearch: [],
    exerciseSearch: []
  })
  const jobOperateVisible = ref(false)
  const examOperateVisible = ref(false)
  const exerciseListPreview = ref(false)
  const examListPreview = ref(false)
  const examOperateFormRef = ref()
  const jobOperateFormRef = ref()
  const jobOperateRules = {
    taskForm: [
      { required: true, message: '任务类型不能为空', trigger: 'change' }
    ],
    name: [
      { required: true, message: '任务名称不能为空', trigger: 'change' },
      { whitespace: true, message: '任务名称不能为空', trigger: 'change' },
      { min: 0, max: 50, message: '任务名称不能超过50个字符', trigger: 'change' }
    ]
  }
  const examOperateRules = {
    formingMethod: [
      { required: true, message: '组卷类型不能为空', trigger: 'change', type: 'number' }
    ]
  }
  const examOperateFormRules = computed(() => {
    return isEditTask.value ? examOperateRules : {
      ...examOperateRules,
      missionName: [
        { required: true, message: '任务名称不能为空', trigger: 'change' },
        { whitespace: true, message: '任务名称不能为空', trigger: 'change' },
        { min: 0, max: 50, message: '任务名称不能超过50个字符', trigger: 'change' }
      ],
      subQuestionBank: [
        { required: true, message: '子题库不能为空', trigger: 'change', type: 'number' }
      ]
    }
  })
  const jobOperateFormRules = computed(() => {
    return isEditTask.value ? jobOperateRules : {
      ...jobOperateRules,
      subQuestionBank: [
        { required: true, message: '子题库不能为空', trigger: 'change', type: 'number' }
      ]
    }
  })
  const jobOperateFormState = reactive<{
    taskForm: string;
    name: string;
    subQuestionBank: number | undefined,
  }>({
    taskForm: '2',
    name: '课后练习',
    subQuestionBank: undefined
  })
  const examOperateFormState = reactive<{
    missionName: string;
    formingMethod: number;
    subQuestionBank: number | undefined,
    isFixed: '0' | '1' | '2'
  }>({
    missionName: '',
    formingMethod: 1,
    subQuestionBank: undefined,
    isFixed: '1'
  })
  const listOfDataExercise = ref<Json[]>([])
  const listOfData = ref<Json[]>([])
  const examSubQuestionBankExam = ref<TreeDataItem[]>([])
  const subQuestionBank: { examSubQuestionBankExamBak: string[], homeworkSubQuestionBankBak: string[] } = {
    examSubQuestionBankExamBak: [],
    homeworkSubQuestionBankBak: []
  }
  const homeworkSubQuestionBank = ref<TreeDataItem[]>([])
  const queryKeywordsJob = ref('1')
  const queryKeywords = ref('1')
  const testExerciseName = ref('')
  const testPaperName = ref('')
  const testExerciseId = ref()
  const testPaperId = ref()
  const formingMethod = ref('')
  /**
   * 考试操作
   * @param
   */
  const examOperate = (e) => {
    if (e.key === '0') {
      addVolume()
    } else {
      chooseTestPaper()
    }
  }
  /**
   * 新增编辑考试
   * @param item
   */
  const addVolume = (data?: TaskDataType) => {
    currentTask.value = data || {}
    isEditTask.value = !!data
    getSubQuestionBank('exam').then(flag => {
      if (flag) {
        if (data) {
          examOperateFormState.missionName = data.name
          examOperateFormState.formingMethod = data.taskForm
          examOperateFormState.subQuestionBank = Number(data.quebankId)
        } else {
          const selected = LocalStorageUtil.getExamSubquestionbank()
          examOperateFormState.missionName = ''
          examOperateFormState.formingMethod = 1
          examOperateFormState.subQuestionBank = selected ? Number(selected) : undefined
        }
        examOperateVisible.value = true
      }
    })
  }
  /**
   * 作业操作
   * @param e
   */
  const jobOperate = (e) => {
    if (e.key === '0') {
      entryExercises()
    } else {
      entryExercisesList()
    }
  }
  /**
   * 调用作业
   */
  const entryExercisesList = () => {
    getSubQuestionBank('exerciseSearch')
    getCallList('exercise')
    homeworkSubQuestionBank.value = [] //  作业调用子题库
    subQuestionBank.homeworkSubQuestionBankBak = [] //  作业调用子题库
    testExerciseName.value = '' // 作业名
    exerciseListPreview.value = true
  }
  /**
   * 调用考试
   */
  const chooseTestPaper = () => {
    getSubQuestionBank('examSearch')
    getCallList('exam')
    formingMethod.value = '' // 组卷类型
    testPaperName.value = '' // 试卷名
    examSubQuestionBankExam.value = [] //  试卷调用子题库
    subQuestionBank.examSubQuestionBankExamBak = [] //  试卷调用子题库
    examListPreview.value = true
  }

  /**
   * 新增编辑作业
   */
  const saveJobOperate = () => {
    ToolsUtil.getCodeUid(uid => {
      jobOperateFormRef.value.validate().then(() => {
        if (isEditTask.value) { // 编辑
          const params = {
            id: currentTask.value.id,
            name: jobOperateFormState.name,
            taskForm: jobOperateFormState.taskForm
          }
          PrepareCourseApi.saveJobExam(params).then(res => {
            if (res.data.status === 201) {
              getTaskList()
              CommonApi.statisticsLog({
                name: '编辑作业',
                actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
                content: JSON.stringify(params)
              })
              jobOperateVisible.value = false
            }
          })
        } else {
          PrepareCourseApi.saveTkPaper({
            name: jobOperateFormState.name,
            proId: uid,
            courseCode: packetInfo.code,
            taskType: 2,
            groupWay: 1,
            sublibraryModuleId: jobOperateFormState.subQuestionBank,
            userPhone: LocalStorageUtil.getUser().userName
          }).then(resP => {
            if (resP.data.code === 200) {
              PrepareCourseApi.saveTkDefaultCourse({
                proId: uid,
                courseCode: packetInfo.code,
                mobile: LocalStorageUtil.getUser().userName
              }).then(resI => {
                if (resI.data.code === 200) {
                  const param: Json = {
                    courseId: packetInfo.courseId,
                    coursePacketId: packetInfo.id,
                    courseChapterId: currentLearnSetSection.value.courseChapterId,
                    courseSectionId: currentLearnSetSection.value.id,
                    status: 1, // 状态：有效(1)、失效(0)
                    seq: ToolsUtil.getMaxSeq(taskList.value),
                    examType: 1, // 组卷方式：1: '选题组卷/录题组卷' 2: '题型难度 '3: '知识点难度抽题组卷' 4: 题型难度随机组卷
                    gradeType: 1, // 评分类型：学生自评(1)、老师评分(2)
                    needTeacherProc: 0,
                    isGrade: 1, // 是否需要评分：否(0)、是(1)
                    taskType: 2, // 任务类型：阅读任务(0)、案例任务(1)、作业任务(2)、实训任务(3)、考试任务(4)、实战任务(5)、问卷(6)、测评(7)
                    attachmentPath: process.env.VUE_APP_questionBank + '#/questionList?proId=' + uid + '&courseCode=' + packetInfo.code, // 附件路径
                    name: jobOperateFormState.name, // 任务名称(默认等于附件名)
                    attachmentName: jobOperateFormState.name, // 附件名
                    resourceId: resP.data.data.paperUuid + '-' + resP.data.data.paperId, // 资源id，题库返回的作业考试id
                    taskForm: jobOperateFormState.taskForm, // 任务形式：课前(0)、课中(1)、课后(2)
                    quebankId: jobOperateFormState.subQuestionBank
                  }
                  if (packetInfo.exerciseType === '2') {
                    param.answerTimes = 1
                  }
                  PrepareCourseApi.saveJobExam(param).then(resS => {
                    if (resS.data.status === 201) {
                      getTaskList()
                      CommonApi.statisticsLog({
                        name: '新增作业',
                        actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].addCode,
                        content: JSON.stringify(param)
                      })
                      editTk({ id: resP.data.data.paperId, taskType: '2' } as TaskDataType)
                      jobOperateVisible.value = false
                    }
                  })
                }
              })
            }
          })
        }
      }).catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
    })
  }
  /**
   * 新增编辑考试
   */
  const saveExamOperate = () => {
    ToolsUtil.getCodeUid(uid => {
      examOperateFormRef.value.validate().then(() => {
        if (isEditTask.value) { // 编辑
          const params = {
            id: currentTask.value.id,
            name: examOperateFormState.missionName
          }
          PrepareCourseApi.saveJobExam(params).then(res => {
            if (res.data.status === 201) {
              getTaskList()
              CommonApi.statisticsLog({
                name: '编辑试卷',
                actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
                content: JSON.stringify(params)
              })
              examOperateVisible.value = false
            }
          })
        } else {
          PrepareCourseApi.saveTkPaper({
            name: examOperateFormState.missionName,
            proId: uid,
            courseCode: packetInfo.code,
            taskType: 4,
            groupWay: examOperateFormState.formingMethod,
            isFixed: examOperateFormState.formingMethod !== 4 ? examOperateFormState.isFixed : '0',
            sublibraryModuleId: examOperateFormState.subQuestionBank,
            userPhone: LocalStorageUtil.getUser().userName
          }).then(resP => {
            if (resP.data.code === 200) {
              PrepareCourseApi.saveTkDefaultCourse({
                proId: uid,
                courseCode: packetInfo.code,
                mobile: LocalStorageUtil.getUser().userName
              }).then(resI => {
                if (resI.data.code === 200) {
                  const param: Json = {
                    courseId: packetInfo.courseId,
                    coursePacketId: packetInfo.id,
                    courseChapterId: currentLearnSetSection.value.courseChapterId,
                    courseSectionId: currentLearnSetSection.value.id,
                    status: 1, // 状态：有效(1)、失效(0)
                    seq: ToolsUtil.getMaxSeq(taskList.value),
                    examType: examOperateFormState.formingMethod, // 组卷方式：1: '选题组卷/录题组卷' 2: '题型难度 '3: '知识点难度抽题组卷' 4: 题型难度随机组卷
                    gradeType: packetInfo.exerciseType === '1' ? 1 : 2, // 评分类型：学生自评(1)、老师评分(2)
                    needTeacherProc: packetInfo.exerciseType === '1' ? 0 : 1,
                    isGrade: 1, // 是否需要评分：否(0)、是(1)
                    taskType: 4, // 任务类型：阅读任务(0)、案例任务(1)、作业任务(2)、实训任务(3)、考试任务(4)、实战任务(5)、问卷(6)、测评(7)
                    attachmentPath: process.env.VUE_APP_questionBank + '#/questionList?proId=' + uid + '&courseCode=' + packetInfo.code, // 附件路径
                    name: examOperateFormState.missionName, // 任务名称(默认等于附件名)
                    attachmentName: examOperateFormState.missionName, // 附件名
                    resourceId: resP.data.data.paperUuid + '-' + resP.data.data.paperId, // 资源id，题库返回的作业考试id
                    quebankId: examOperateFormState.subQuestionBank,
                    paperType: '1'
                  }
                  if (packetInfo.exerciseType === '2') {
                    param.answerTimes = 1
                  }
                  PrepareCourseApi.saveJobExam(param).then(resS => {
                    if (resS.data.status === 201) {
                      getTaskList()
                      CommonApi.statisticsLog({
                        name: '新增组卷',
                        actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].addCode,
                        content: JSON.stringify(param)
                      })
                      editTk({ id: resP.data.data.paperId, taskType: '4' } as TaskDataType)
                      examOperateVisible.value = false
                    }
                  })
                }
              })
            }
          })
        }
      }).catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
    })
  }
  /**
   * 编辑题库相关
   * @param data HandoutItem
   */
  const editTk = (data: TaskDataType) => {
    if (data.name) {
      if (data.taskType === '2') {
        entryExercises(data)
      } else if (data.taskType === '4') {
        addVolume(data) // 新增/编辑组卷
      } else {
        otherEdit(data)
      }
    } else {
      otherEdit(data)
    }
  }

  /**
   * 新增编辑作业
   * @param data
   */
  const entryExercises = (data?: TaskDataType) => {
    currentTask.value = data || {}
    isEditTask.value = !!data
    const recoveryData = () => {
      if (data) {
        jobOperateFormState.name = data.name
        jobOperateFormState.taskForm = data.taskForm
        jobOperateFormState.subQuestionBank = Number(data.quebankId)
      } else {
        const selected = LocalStorageUtil.getPracSubquestionbank()
        jobOperateFormState.name = '课后练习'
        jobOperateFormState.taskForm = '2'
        jobOperateFormState.subQuestionBank = selected ? Number(selected) : undefined
      }
      jobOperateVisible.value = true
    }
    if (isEditTask.value) {
      recoveryData()
    } else {
      // ToolsUtil.getCodeUid(uid => {
      getSubQuestionBank('exercise').then(flag => {
        if (flag) {
          recoveryData()
        }
      })
      // })
    }
  }

  /**
   * 获取子题库模块树
   * @param label 类型
   */
  const getSubQuestionBank = (label: 'exam' | 'exercise' | 'examSearch' | 'exerciseSearch') => {
    return new Promise((resolve) => {
      PrepareCourseApi.getSubQuestionBank({
        courseCode: packetInfo.code,
        type: (label === 'exam' || label === 'examSearch') ? 'EXAM' : 'PRACTICE'
      }).then(res => {
        if (res.data.code === 200) {
          subQuestionBankTreeMap[label] = conversionNode(res.data.data, label)
          resolve(true)
        } else {
          message.error(res.data.message)
          resolve(false)
        }
      }).catch(() => {
        resolve(false)
        message.error('题库服务异常')
      })
    })
  }

  /**
   * 作业新增缓存子题库模块id
   */
  const execrisesSubQuestionBankChange = (value, label, extra) => {
    if (value) {
      LocalStorageUtil.putPracSubquestionbank(value)
    }
  }

  /**
   * 试卷新增缓存子题库模块id
   */
  const subQuestionBankChange = (value, label, extra) => {
    if (value) {
      LocalStorageUtil.putExamSubquestionbank(value)
    }
  }
  /**
   * 调用作业、试卷
   * @param data
   * @param ifExercise
   */
  const transfer = (data: CallItem, ifExercise: boolean) => {
    ToolsUtil.getCodeUid(uid => {
      const gradeType = ifExercise ? 1 : packetInfo.exerciseType === '1' ? 1 : 2
      const param: Json = {
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        courseChapterId: currentLearnSetSection.value.courseChapterId,
        courseSectionId: currentLearnSetSection.value.id,
        status: 1, // 状态：有效(1)、失效(0)
        seq: ToolsUtil.getMaxSeq(taskList.value),
        examType: 1, // 组卷方式：1: '选题组卷/录题组卷' 2: '题型难度 '3: '知识点难度抽题组卷' 4: 题型难度随机组卷
        gradeType, // 评分类型：学生自评(1)、老师评分(2)
        needTeacherProc: gradeType === 1 ? 0 : 1,
        isGrade: 1, // 是否需要评分：否(0)、是(1)
        attachmentPath: process.env.VUE_APP_questionBank + '#/questionList?proId=' + uid + '&courseCode=' + packetInfo.code, // 附件路径
        taskType: ifExercise ? 2 : 4,
        name: data.name,
        attachmentName: data.name,
        quebankId: (data.sublibraryModuleIdList && data.sublibraryModuleIdList.length)
          ? data.sublibraryModuleIdList.map(e => e.sublibraryModuleId).join(',') : '',
        resourceId: data.paperUuid + '-' + data.id
      }
      if (ifExercise) {
        param.taskForm = '2'
      } else {
        param.paperType = '1'
        param.examType = data.groupWay
        if (packetInfo.exerciseType === '2') {
          param.answerTimes = 1
        }
      }

      PrepareCourseApi.saveJobExam(param).then(res => {
        if (res.data.status === 201) {
          getTaskList()
          CommonApi.statisticsLog({
            name: ifExercise ? '调用作业' : '调用试卷',
            actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].addCode,
            content: JSON.stringify(param)
          })
        }
      })
    })
  }
  /**
   * 获取作业/考试调用列表
   * @param label 考试/作业
   */
  const getCallList = (label: 'exam' | 'exercise') => {
    ToolsUtil.getCodeUid(uid => {
      const params = {
        id: label === 'exam' ? ((String(testPaperId.value) && String(testPaperId.value) !== 'null') ? testPaperId.value : '')
          : ((String(testExerciseId.value) && String(testExerciseId.value) !== 'null') ? testExerciseId.value : ''),
        proId: uid,
        groupWay: label === 'exercise' ? '' : formingMethod.value ? formingMethod.value : '',
        courseCode: packetInfo.code,
        name: label === 'exam' ? (testPaperName.value ? testPaperName.value : '') : (testExerciseName.value ? testExerciseName.value : ''),
        isNotTaskType: label === 'exam' ? '4' : '2', // 过滤掉作业类型
        sublibraryModuleIds: label === 'exam' ? subQuestionBank.examSubQuestionBankExamBak.join(',') : subQuestionBank.homeworkSubQuestionBankBak.join(','),
        pageSize: '10000',
        pageNum: '1'
      }
      PrepareCourseApi.getCallList(params).then(res => {
        if (res.data.code === 200) {
          if (label === 'exam') {
            listOfData.value = res.data.data.rows.map(item => {
              item.key = item.id
              return item
            })
          } else {
            listOfDataExercise.value = res.data.data.rows.map(item => {
              item.key = item.id
              return item
            })
          }
        }
      })
    })
  }
  /**
   * 收集子题库查询参数
   * @param data
   * @param label
   */
  const subQuestionBankChangeSearch = (data, label: 'examSearch' | 'exerciseSearch') => {
    const bakLabel = label === 'examSearch' ? 'examSubQuestionBankExamBak' : 'homeworkSubQuestionBankBak'
    subQuestionBank[bakLabel] = []
    if (data.length) {
      data.forEach(e => {
        if (parseFloat(e).toString() === 'NaN') {
          subQuestionBank[label].every((item) => {
            if (item.code === e) {
              item.children.forEach(child => {
                subQuestionBank[bakLabel].push(child.key)
              })
            } else {
              return true
            }
          })
        } else {
          subQuestionBank[bakLabel].push(e)
        }
      })
    }
  }

  /**
   * 切换调用列表关键字清除查询缓存
   */
  const queryKeywordsChange = () => {
    Number(queryKeywords.value) === 1 ? testPaperName.value = '' : testPaperId.value = ''
  }
  /**
   * 切换调用列表关键字清除查询缓存
   */
  const queryKeywordsJobChange = () => {
    Number(queryKeywordsJob.value) === 1 ? testExerciseName.value = '' : testExerciseId.value = ''
  }

  return {
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
    subQuestionBank,
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
    getSubQuestionBank,
    entryExercises,
    editTk,
    saveExamOperate,
    saveJobOperate,
    chooseTestPaper,
    entryExercisesList,
    jobOperate,
    addVolume,
    examOperate
  }
}
