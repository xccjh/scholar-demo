import { useLocalFileUpload } from './useLocalFileUpload'
import { SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { Json } from '@/common/base'

export function useLectureButtonOperate (
  currentLearnSetSection,
  handoutsLecture,
  handoutsMaterial,
  handoutsRecording,
  taskList,
  getHandoutFiles,
  getTaskList,
  packetInfo,
  menuService
) {
  /**
   * 本地上传
   */
  const {
    uploadLocal,
    localUploadVisible,
    localUploadConfirm,
    localUploadCancel,
    localUploadLearnTarget,
    localUploadFileList
  } = useLocalFileUpload(
    currentLearnSetSection,
    handoutsLecture,
    handoutsMaterial,
    taskList,
    getHandoutFiles,
    getTaskList
  )

  /**
   * 资源库调用
   */
  const callSchoolEnterpriseLib = (type: 'read' | 'case' | 'setting', task: '1' | '101' | '102' | '103') => {
    const tasks = (task === '1' ? taskList.value
      : task === '101' ? handoutsLecture.value
        : task === '102' ? handoutsMaterial.value
          : task === '103' ? handoutsRecording.value
            : [])
    const item :Json = {
      type: 'scp-section-handout',
      professionId: packetInfo.professionId,
      sectionInfo: {
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        courseChapterId: currentLearnSetSection.value.courseChapterId,
        courseSectionId: currentLearnSetSection.value.id
      },
      seq: ToolsUtil.getMaxSeq(tasks),
      nodes: tasks.map(el => {
        return {
          taskId: el.id,
          id: el.resourceId
        }
      })
    }
    if (packetInfo.isUsed > 0) {
      item.isStandard = '1'
    } else {
      item.isStandard = ''
    }
    if (task === '1') {
      item.limit = 100000
    }
    SessionStorageUtil.putScpResourceMaterial(item)
    if (type === 'read') {
      SessionStorageUtil.removeReadtree()
    } else if (type === 'case') {
      SessionStorageUtil.removeCasetree()
    } else if (type === 'setting') {
      SessionStorageUtil.removeTrainTree()
    }
    menuService.gotoUrl({
      url: '/m/rm/' + type,
      paramUrl: `?from=scp&task=${task}`
    })
  }

  return {
    callSchoolEnterpriseLib,
    uploadLocal,
    localUploadVisible,
    localUploadConfirm,
    localUploadCancel,
    localUploadLearnTarget,
    localUploadFileList
  }
}
