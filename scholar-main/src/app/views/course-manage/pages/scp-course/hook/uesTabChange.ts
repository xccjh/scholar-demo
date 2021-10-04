import { computed, ref } from 'vue'
import { SessionStorageUtil } from '@/common/utils'

export function uesTabChange (route, saveData) {
  let currentStep = 0
  const curProgressInfo = SessionStorageUtil.getCourseInfoItem()
  if (curProgressInfo) {
    currentStep = JSON.parse(curProgressInfo)[route.params.courseId] || 0
  }
  const curProgress = ref(currentStep)
  const tabCurProgress = computed(() => curProgress.value + 1) // 当前进度
  /**
   * 切换tab
   * @param direction
   * @param index
   */
  const courseTabChange = (direction, index) => {
    if (direction === 'prev') {
      curProgress.value--
    } else if (direction === 'next') {
      curProgress.value++
    } else {
      curProgress.value = index
    }
    SessionStorageUtil.putCourseInfoItem({ [route.params.courseId as string]: curProgress.value })
  }
  /**
   * 上下步骤
   * @param index
   * @param direction
   */
  const changeProgress = (index: number, direction: 'prev' | 'next' | 'direct') => {
    saveData(() => {
      courseTabChange(direction, index)
    })
  }
  return {
    curProgress,
    tabCurProgress,
    courseTabChange,
    changeProgress
  }
}
