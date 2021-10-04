import { ref } from 'vue'
import { Json, WjCallItem } from '@/common/base'
import { ToolsUtil } from '@/common/utils'
import { PrepareCourseApi } from '../api'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'

export function useQuestionnaireOrEvaluation (packetInfo, currentLearnSetSection, taskList, getTaskList) {
  const evaluationName = ref('')
  const evaluationType = ref('')
  const evaluationPreview = ref(false)
  const questionnaireName = ref('')
  const questionnaireType = ref('')
  const questionnairePreview = ref(false)
  const listOfEvaluationData = ref<Json[]>([])
  const listOfQuestionnaireData = ref<Json[]>([])
  /**
   * 打开问卷测评调用弹框和查询
   */
  const questionOrEvaluationCall = (e: { key: 'evaluationType' | 'questionnaireType' }) => {
    ToolsUtil.getCodeUid((uid) => {
      PrepareCourseApi.getEvaluateQuestionList({
        proId: uid,
        typeId: e.key === 'evaluationType' ? 3 : 4,
        evaluateId: e.key === 'evaluationType'
          ? evaluationType ? evaluationType.value : undefined : questionnaireType.value ? questionnaireType.value : undefined,
        name: e.key === 'evaluationType' ? evaluationName.value ? evaluationName.value : undefined : questionnaireName.value ? questionnaireName.value : undefined,
        courseCode: packetInfo.code,
        status: 2,
        pageSize: '10000',
        pageNum: '1'
      }).then(res => {
        if (res.data.code === 200) {
          if (e.key === 'evaluationType') {
            listOfEvaluationData.value = res.data.data.rows.map(item => {
              item.key = item.id
              return item
            })
            evaluationPreview.value = true
          } else {
            listOfQuestionnaireData.value = res.data.data.rows.map(item => {
              item.key = item.id
              return item
            })
            questionnairePreview.value = true
          }
        }
      })
    })
  }
  /**
   * 关闭问卷测评弹框
   * @param label
   */
  const closeQuestionnaireModal = (label: 'evaluationType' | 'questionnaireType') => {
    if (label === 'evaluationType') {
      questionnaireType.value = ''
      questionnaireName.value = ''
      evaluationPreview.value = false
    } else {
      questionnairePreview.value = false
      evaluationType.value = ''
      evaluationName.value = ''
    }
  }
  /**
   * 新增问卷
   */
  const newQuestionnaireOrEvaluation = (label: 'evaluationType' | 'questionnaireType') => {
    ToolsUtil.getTkToken(tokenJson => {
      ToolsUtil.getCodeUid(uid => {
        const str = 'token=' + tokenJson.token + '&refreshToken=' + tokenJson.refreshToken +
          '&proId=' + uid + '&courseCode=' + packetInfo.code
        if (label === 'evaluationType') {
          open(process.env.VUE_APP_questionBank + '#/PaperEvaluation/List?' + str)
        } else {
          open(process.env.VUE_APP_questionBank + '#/PaperQuestionnaire/List?' + str)
        }
      })
    })
  }
  /**
   * 调用问卷测评
   */
  const transferQuestionnaire = (data: WjCallItem, label: 'evaluationType' | 'questionnaireType') => {
    ToolsUtil.getCodeUid(uid => {
      const params = {
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        courseChapterId: currentLearnSetSection.value.courseChapterId,
        courseSectionId: currentLearnSetSection.value.id,
        status: 1, // 状态：有效(1)、失效(0)
        seq: ToolsUtil.getMaxSeq(taskList.value),
        attachmentPath: process.env.VUE_APP_questionBank +
          (label === 'evaluationType' ? '#/PaperEvaluation/List' : '#/PaperQuestionnaire/List') +
          '?proId=' + uid + '&courseCode=' + packetInfo.code, // 附件路径
        name: data.name,
        attachmentName: data.name,
        resourceId: data.paperUuid + '-' + data.paperId,
        taskType: label === 'evaluationType' ? 7 : 6,
        answerTimes: 1
      }
      PrepareCourseApi.saveJobExam(params).then(res => {
        if (res.data.status === 201) {
          CommonApi.statisticsLog({
            name: label === 'evaluationType' ? '调用测评' : '调用问卷',
            actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].addCode,
            content: JSON.stringify(params)
          })
          getTaskList()
        }
      })
    })
  }
  return {
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
  }
}
