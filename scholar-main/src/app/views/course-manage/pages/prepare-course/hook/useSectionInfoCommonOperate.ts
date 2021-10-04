import { CallItem, WjCallItem } from '@/common/base'
import { PrepareCourseApi } from '../api'
import { SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { createVNode, ref } from 'vue'
import { SectionDataType, TaskDataType } from '../entity'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { AliOssInstane } from '@/common/services/ali-oss.service'
import {
  getDescType,
  learnSetPreview, otherEdit,
  previewCase,
  previewExaminationPaper,
  previewTrain
} from '../utils'
import { Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'

export function useSectionInfoCommonOperate (taskList, getTaskList, packetInfo, handoutsLecture, menuService, getHandoutFiles, entryExercises, addVolume) {
  const bindLimit = ref(1000000) // 调用任务上线

  /**
   * 任务弹框显示调用
   */
  const showTransfer = (data: WjCallItem, flag: boolean) => {
    // 任务最多7个
    if (taskList.value.length >= bindLimit.value) {
      if (!flag) {
        return false
      }
    }
    let list: string[] = []
    if (taskList.value.length) {
      list = taskList.value.map(e => {
        return e.resourceId.split('-')[0]
      })
    }
    // 取消调用显示逻辑
    if (flag) {
      if (list.length) {
        if (list.indexOf(data.paperUuid) > -1) {
          return true
        }
      }
    } else {
      // 调用显示逻辑
      if (!list.length) {
        return true
      }
      if (list.indexOf(data.paperUuid) < 0) {
        return true
      }
    }
  }
  /**
   * 任务弹框取消调用
   */
  const cancelCall = (data: CallItem, type?: 'exam' | 'exercise' | 'questionnaireType' | 'evaluationType') => {
    const list = taskList.value.map(e => {
      return e.resourceId.split('-')[0]
    })
    const index = list.findIndex((ee) => {
      return ee === data.paperUuid
    })
    PrepareCourseApi.delSectionResourceTask(taskList.value[index].id).then(res => {
      if (res.data.status === 204) {
        getTaskList()
      }
    })
  }
  /**
   * 预览问卷测评考试作业
   */
  const previewExaminationQuestionnaire = (data: WjCallItem) => {
    ToolsUtil.getTkToken(tokenJson => {
      ToolsUtil.getCodeUid(uid => {
        const str = '&token=' + tokenJson.token + '&refreshToken=' + tokenJson.refreshToken +
          '&proId=' + uid + '&courseCode=' + packetInfo.code
        open(process.env.VUE_APP_questionBank + '#/paper/previewPaper?paperId=' + data.paperId + str)
      })
    })
  }

  /**
   * 禁用设置主讲义
   */
  const disableMainLecture = (lecture) => {
    return !(packetInfo.preview === '1' ||
      (lecture.attachmentPath &&
        (lecture.attachmentPath.indexOf('.ppt') > -1 ||
          lecture.attachmentPath.indexOf('.pptx') > -1)))
  }
  /**
   * 显示主讲义
   */
  const showMainFileAssociate = (item: SectionDataType) => {
    return packetInfo.preview === '0' && item.isMainFile && item.attachmentPath &&
      (item.attachmentPath.indexOf('.ppt') > -1 || item.attachmentPath.indexOf('.pptx') > -1)
  }
  /**
   * 设置主讲义
   */
  const mainFileChange = (e: { target: { checked: boolean } }, item: SectionDataType) => {
    const ifMainFile = e.target.checked
    const work = [PrepareCourseApi.modifySectionResource({ id: item.id, isMainFile: ifMainFile ? '1' : '0' })]
    if (ifMainFile) { // 设置主讲义去除其他主讲义
      handoutsLecture.value.every((ee, ii) => {
        if (ee.isMainFile && ee.id !== item.id) {
          work.push(PrepareCourseApi.modifySectionResource({ id: ee.id, isMainFile: '0' }))
          handoutsLecture.value[ii].isMainFile = false
        } else {
          return true
        }
      })
    }
    Promise.all(work).then(res => {
      if (res[0].data.status === 201) {
        CommonApi.statisticsLog({
          name: '主讲义更改',
          actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
          content: JSON.stringify({ id: item.id, isMainFile: ifMainFile ? '1' : '0' })
        })
      }
      getTaskList()
    })
  }
  /**
   * 设置下载权限
   * @param downloadType  0 :不可以 1 可以
   * @param item
   * @param isTask boolean
   */
  const downloadChange = (downloadType: '0' | '1', item: SectionDataType | TaskDataType, isTask?: boolean) => {
    (isTask
      ? PrepareCourseApi.modifySectionResourceTask({ id: item.id, downloadType })
      : PrepareCourseApi.modifySectionResource({ id: item.id, downloadType }
      ))
      .then(res => {
        if (res.data.status === 201) {
          if (isTask) {
            CommonApi.statisticsLog({
              name: '阅读任务能否下载更改',
              actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
              content: JSON.stringify({ id: item.id, downloadType })
            })
          } else {
            CommonApi.statisticsLog({
              name: (item.type === '103' ? '资料' : '讲义') + '能否下载更改',
              actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
              content: JSON.stringify({ id: item.id, downloadType })
            })
          }
          item.downloadType = downloadType
        }
      })
  }
  /**
   * 设置评分权限
   * @param isGrade 0 :不评分| 1 需评分
   * @param item TaskDataType
   */
  const isGradeChange = (isGrade: '' | '0' | '1', item: TaskDataType) => {
    PrepareCourseApi.modifySectionResourceTask({ id: item.id, isGrade }).then(res => {
      if (res.data.status === 201) {
        CommonApi.statisticsLog({
          name: '案例任务是否评分更改',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
          content: JSON.stringify({ id: item.id, isGrade })
        })
        item.isGrade = isGrade
      }
    })
  }
  /**
   * 阅读任务总结视频更改
   * @param e
   * @param item TaskDataType
   */
  const isSummaryChange = (e: { target: { checked: boolean } }, item: TaskDataType) => {
    const isSummary = e.target.checked
    const work = [PrepareCourseApi.modifySectionResourceTask({ id: item.id, isSummary: isSummary ? '1' : '0' })]
    if (isSummary) { // 设置主讲义去除其他主讲义
      taskList.value.every((ee, ii) => {
        if (ee.isSummary && ee.id !== item.id) {
          work.push(PrepareCourseApi.modifySectionResourceTask({ id: ee.id, isSummary: '0' }))
          taskList.value[ii].isSummary = false
        } else {
          return true
        }
      })
    }
    Promise.all(work).then(res => {
      if (res[0].data.status === 201) {
        CommonApi.statisticsLog({
          name: '阅读任务总结视频更改',
          actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
          content: JSON.stringify({ id: item.id, isSummary: isSummary ? '1' : '0' })
        })
      }
    })
  }
  /**
   * 是否自评修改
   * @param gradeType 1:学生自评 ; 2:老师批改
   * @param item TaskDataType
   */
  const gradeTypeChange = (gradeType: '1' | '2', item: TaskDataType) => {
    const params = { id: item.id, gradeType, needTeacherProc: gradeType === '1' ? 0 : 1 }
    PrepareCourseApi.modifySectionResourceTask(params).then(res => {
      if (res.data.ss === 201) {
        CommonApi.statisticsLog({
          name: '作业任务自评更改',
          actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].modify,
          content: JSON.stringify(params)
        })
        item.gradeType = gradeType
      }
    })
  }
  /**
   * 下载
   */
  const learnSetDownLoad = (item: SectionDataType | TaskDataType) => {
    let name = item.attachmentName
    if (name.indexOf('.') < 0) {
      const pathArr = item.attachmentPath.split('.')
      name += ('.' + pathArr[pathArr.length - 1])
    }
    AliOssInstane.downloadFile(name, item.attachmentPath)
  }

  /**
   * 编辑操作
   */
  const learnSetEdit = (data: TaskDataType) => {
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
   * 预览任务类
   * @param item
   */
  const previewTask = (item: TaskDataType) => {
    if (item.taskType === '3') {
      previewTrain(item)
    } else if (item.taskType === '1') {
      SessionStorageUtil.putCaseBackPath('/m/course-manage/prepare-course')
      previewCase(menuService, item)
    } else if (item.taskType === '2' || item.taskType === '4' || item.taskType === '6' || item.taskType === '7') {
      previewExaminationPaper(item, packetInfo)
    } else {
      learnSetPreview(item)
    }
  }

  /**
   * 删除
   * @param item
   * @param task  是否任务
   */
  const delLearnSet = (item: SectionDataType | TaskDataType, task?: boolean) => {
    Modal.confirm({
      title: '警告',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: Number(packetInfo.isUsed) > 0 ? '该课包已启用，若删除任务可能会导致学员端异常，是否继续删除？' : `确定要删除“${item.attachmentName ? item.attachmentName : item.name}”吗？`,
      onOk () {
        return new Promise((resolve, reject) => {
          (task
            ? PrepareCourseApi.delSectionResourceTask(item.id)
            : PrepareCourseApi.delSectionResource(item.id)).then(res => {
            if (res.data.status === 204) {
              if (task) { // 更新seq
                CommonApi.statisticsLog({
                  name: '删除' + getDescType(item.taskType),
                  actionCode: STATISTICALRULES.packetInfo['learnSet-task-action'].delCode,
                  content: item.id
                })
                const params: Partial<{ id: string, seq: number }>[] = []
                taskList.value.filter(w => w.id !== item.id).forEach((ee, ii) => {
                  const obj: Partial<{ id: string, seq: number }> = {}
                  obj.id = ee.id
                  obj.seq = ii
                  params.push(obj)
                })
                if (params.length) {
                  PrepareCourseApi.saveOrUpdateTask(params)
                }
              } else {
                const type = item.type
                let desc
                let field
                if (type === '101') {
                  desc = '讲义'
                  field = 'learnSet-lecture-action'
                } else if (type === '103') {
                  desc = '录播视频'
                  field = 'learnSet-record-action'
                } else if (type === '102') {
                  desc = '资料'
                  field = 'learnSet-material-action'
                }
                CommonApi.statisticsLog({
                  name: '删除' + desc,
                  actionCode: STATISTICALRULES.packetInfo[field].delCode,
                  content: item.id
                })
              }
              if (item.isMainFile) {
                getTaskList()
                getHandoutFiles()
              } else {
                task ? getTaskList() : getHandoutFiles()
              }
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => reject(err))
        })
      }
    })
  }

  return {
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
  }
}
