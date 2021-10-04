import { SessionStorageUtil } from '@/common/utils'
import { reactive } from 'vue'
import { PacketInfo } from '@/common/base'

export function usePackageInfo () {
  const {
    name, curProgress, status, courseId, professionId, id, lessonCount, isSmart, code, isCard, is99Train, isBet,
    teachType, auditStatus, preview, createrId, pcode, knowledgeSubjectId, exerciseType, isUsed, majorLeaderId, innerCurProgress,
    isHqTrain, isKjlTrain, isYyTrain, packetTags
  } = SessionStorageUtil.getPacketInfo()
  const packetInfo = reactive<PacketInfo>({
    name,
    curProgress,
    status,
    courseId,
    professionId,
    id,
    lessonCount,
    isSmart,
    code,
    isCard,
    is99Train,
    isBet,
    teachType,
    auditStatus,
    preview,
    createrId,
    pcode,
    knowledgeSubjectId,
    exerciseType,
    isUsed,
    majorLeaderId,
    innerCurProgress,
    isHqTrain,
    isKjlTrain,
    isYyTrain,
    packetTags
  })
  return { packetInfo }
}
