import { Modal } from 'ant-design-vue'
import { PrepareCourseApi } from '../api'

export function useProgressChange (packetInfo, chapterStructureData, changeProgress, lock) {
  /**
   * 校验章节设置
   */
  const checkStructure = () => {
    const checkChapterStructureData = () => {
      if (chapterStructureData.value.length === 0) {
        return true
      }
      return !chapterStructureData.value.every(chapter => {
        if (!(chapter.children && chapter.children.length === 0)) {
          return true
        }
      })
    }
    if (packetInfo.curProgress === 0 && packetInfo.preview === '0' && checkChapterStructureData()) {
      Modal.warning({
        title: '课包结构',
        content: '您还存在章节没有设置，请完成全部章节结构才能进入下一步'
      })
      return false
    }
    return true
  }
  /**
   * 课次设置校验
   */
  const getLessonCountTable = () => {
    return new Promise((resolve) => {
      PrepareCourseApi.getLessonPackageTable(packetInfo.id).then(res => {
        if (res.data.status === 200) {
          if (res.data.data && res.data.data.length) {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      })
    })
  }

  /**
   * 下一步
   */
  const nextStep = async () => {
    if (!lock.flag) {
      lock.flag = true
      await changeProgress(-1, 'next')
    }
  }

  /**
   * 上一步
   */
  const preStep = async () => {
    if (!lock.flag) {
      lock.flag = true
      await changeProgress(1, 'prev')
    }
  }

  return {
    preStep,
    nextStep,
    checkStructure,
    getLessonCountTable
  }
}
