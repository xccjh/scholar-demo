import { ref } from 'vue'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { SessionStorageUtil } from '@/common/utils'

export function useIntellAdaptSwitch (packetInfo, getLessonPackage, getChapterBindList) {
  const knowledgeNum = ref(0)
  const isBetOn = ref(packetInfo.isBet === '1')
  const intellAdapt = ref(packetInfo.isSmart === '1')

  /**
   * 开启押题宝
   * @param val
   */
  const isBetChange = (val) => {
    const flag = val ? '1' : '0'
    packetInfo.isBet = flag
    PrepareCourseApi.packageInfoUpdate({ id: packetInfo.id, isBet: flag }).then(
      res => {
        if (res.data.status === 201) {
          SessionStorageUtil.putPacketInfoItem('isBet', flag)
        }
      }
    )
  }
  /**
   * 开启图谱
   * @param val
   */
  const intellAdaptChange = (val) => {
    const flag = val ? '1' : '0'
    packetInfo.isSmart = flag
    PrepareCourseApi.packageInfoUpdate({ id: packetInfo.id, isSmart: flag, isDailyOn: flag }).then(
      res => {
        if (res.data.status === 201) {
          if (val) {
            getLessonPackage()
            getChapterBindList()
          }
          SessionStorageUtil.putPacketInfoItem('isSmart', flag)
        }
      }
    )
  }

  /**
   * 获取知识点总数
   */
  const getKnowledgeNum = () => {
    PrepareCourseApi.getKnowledgeNum({ knowledgeSubjectId: packetInfo.knowledgeSubjectId }).then(
      res => {
        if (res.data.status === 200) {
          knowledgeNum.value = res.data.data.num || 0
        } else {
          knowledgeNum.value = 0
        }
      })
  }

  return {
    knowledgeNum,
    isBetChange,
    isBetOn,
    intellAdapt,
    intellAdaptChange,
    getKnowledgeNum
  }
}
