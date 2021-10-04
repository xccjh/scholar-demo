import { ref } from 'vue'
import { SectionDataType, TaskDataType } from '../entity'
import { PrepareCourseApi } from '../api'
import { getTypeData } from '../utils'
import { message } from 'ant-design-vue'
import { SeqIdStandard } from '@/common/base'

export function useLearnSetFileList (currentLearnSetSection) {
  const handoutsLecture = ref<SectionDataType[]>([])
  const handoutsMaterial = ref<SectionDataType[]>([])
  const handoutsRecording = ref<SectionDataType[]>([])
  const handouts = ref<SectionDataType[]>([])
  const taskList = ref<TaskDataType[]>([])
  /**
   * 获取任务列表
   */
  const getTaskList = () => {
    PrepareCourseApi.getTaskFileList(currentLearnSetSection.value.id).then(res => {
      if (res.data.status === 200) {
        const result = res.data.data
        if (result && result.length) {
          result.forEach((data, i) => {
            result[i].isDownloadType = data.downloadType === '1'
            result[i].isSummary = data.isSummary === '1'
            result[i].isNeed = data.isNeed === '1'
          })
          result.sort((a, b) => a.seq > b.seq ? -1 : a.seq < b.seq ? 1
            : a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0)
          taskList.value = result
        } else {
          taskList.value = []
        }
      }
    })
  }
  /**
   * 资料列表
   */
  const getHandoutFiles = () => {
    if (currentLearnSetSection.value.id) {
      PrepareCourseApi.getSectionFileList(currentLearnSetSection.value.id).then(res => {
        if (res.data.status === 200) {
          handouts.value = res.data.data
          handouts.value.forEach((data, i) => {
            handouts.value[i].isDownloadType = data.downloadType === '1'
          })
          handoutsLecture.value = getTypeData(handouts.value, '101')
          handoutsMaterial.value = getTypeData(handouts.value, '102')
          handoutsRecording.value = getTypeData(handouts.value, '103')
        }
      })
    }
  }

  /**
   * 节信息拖拽
   */
  const sectionDrop = (e, type: '1' | '2' | '3' | '4') => {
    const params: SeqIdStandard[] = []
    if (type === '3') { // 任务
      taskList.value.forEach((ee, ii) => {
        const obj: SeqIdStandard = {}
        obj.id = ee.id
        obj.seq = taskList.value.length - ii
        taskList.value[ii].seq = obj.seq
        params.push(obj)
      })
      PrepareCourseApi.saveOrUpdateTask(params)
    } else {
      if (type === '1') { // 讲义
        handoutsLecture.value.forEach((ee, ii) => {
          const obj: SeqIdStandard = {}
          obj.id = ee.id
          obj.seq = handoutsLecture.value.length - ii
          handoutsLecture.value[ii].seq = obj.seq
          params.push(obj)
        })
      } else if (type === '2') { // 录播
        handoutsRecording.value.forEach((ee, ii) => {
          const obj: SeqIdStandard = {}
          obj.id = ee.id
          obj.seq = handoutsRecording.value.length - ii
          handoutsRecording.value[ii].seq = obj.seq
          params.push(obj)
        })
      } else { // 资料
        handoutsMaterial.value.forEach((ee, ii) => {
          const obj: SeqIdStandard = {}
          obj.id = ee.id
          obj.seq = handoutsMaterial.value.length - ii
          handoutsMaterial.value[ii].seq = obj.seq
          params.push(obj)
        })
      }
      PrepareCourseApi.saveOrUpdate(params)
    }
  }

  return {
    getHandoutFiles,
    getTaskList,
    handoutsLecture,
    handoutsMaterial,
    handoutsRecording,
    handouts,
    taskList,
    sectionDrop
  }
}
