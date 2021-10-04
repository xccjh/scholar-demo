import { ref } from 'vue'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { SessionStorageUtil } from '@/common/utils'

export function useTrainYy (packetInfo) {
  const ufidaOn = ref(packetInfo.isYyTrain === '1')
  /**
   * 开启恒企实训
   * @param val
   */
  const ufidaOnChange = (val: boolean) => {
    const flag = val ? '1' : '0'
    packetInfo.isYyTrain = flag
    PrepareCourseApi.packageInfoUpdate({ id: packetInfo.id, isYyTrain: flag }).then(
      res => {
        if (res.data.status === 201) {
          SessionStorageUtil.putPacketInfoItem('isYyTrain', flag)
        }
      }
    )
  }
  return {
    ufidaOn,
    ufidaOnChange
  }
}
