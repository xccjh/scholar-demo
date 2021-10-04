import { ref } from 'vue'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { message } from 'ant-design-vue'
import { PrepareCourseApi } from '../api'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { getField } from '../utils'
import { CurrentLearnSetSection } from '../entity'
import { Json } from '@/common/base'
import { ToolsUtil } from '@/common/utils'

export function useLocalFileUpload (
  currentLearnSetSection,
  handoutsLecture,
  handoutsMaterial,
  taskList,
  getHandoutFiles,
  getTaskList
) {
  const localUploadVisible = ref(false)
  const localUploadLearnTarget = ref('1')
  const localUploadFileList = ref<FileItem[]>([])
  const localUploadType = ref('')
  /**
   * 打开本地上传弹框
   */
  const uploadLocal = (type: '101' | '102' | '104') => {
    localUploadVisible.value = true
    localUploadType.value = type
  }

  /**
   * 保存任务资料
   */
  const localUploadConfirm = () => {
    if (!localUploadLearnTarget.value) {
      message.warning('请选择学习目标')
      return
    }
    if (localUploadFileList.value.length === 0) {
      message.warning('请上传文件')
      return
    }
    const params = formatLocalUploadParams(currentLearnSetSection.value);
    (localUploadType.value === '104' ? PrepareCourseApi.batchSaveCourseSectionTaskFile(params) : PrepareCourseApi.batchSaveCourseSectionFile(params)).then(res => {
      if (res.data.status === 201) {
        CommonApi.statisticsLog({
          name: '本地上传',
          actionCode: STATISTICALRULES.packetInfo[getField(localUploadType.value)].addCode,
          content: JSON.stringify(params)
        })
        getHandoutFiles()
        getTaskList()
        localUploadVisible.value = false
        localUploadFileList.value = []
        localUploadLearnTarget.value = '1'
      }
    })
  }
  /**
   * 关闭
   */
  const localUploadCancel = () => {
    localUploadVisible.value = false
    localUploadFileList.value = []
    localUploadLearnTarget.value = '1'
  }

  /**
   * 格式化参数
   * @param currentLearnSetSection
   */
  const formatLocalUploadParams = (currentLearnSetSection: Partial<CurrentLearnSetSection>) => {
    const orgCode = ToolsUtil.getOrgCode()
    const defaultName = orgCode === 'zksd' ? '考拉日记' : '恒企教育'

    return localUploadFileList.value.map((file, i) => {
      const obj: Json = {
        courseId: currentLearnSetSection.courseId,
        coursePacketId: currentLearnSetSection.coursePacketId,
        courseChapterId: currentLearnSetSection.courseChapterId,
        courseSectionId: currentLearnSetSection.id,
        attachmentName: file.name,
        attachmentPath: ToolsUtil.getOssUrl(file.response.objectName, false),
        aattachmentExt: ToolsUtil.getExt(file.name),
        sourceType: 1,
        seq: ToolsUtil.getMaxSeq(
          localUploadType.value === '104' ? taskList.value
            : localUploadType.value === '102' ? handoutsMaterial.value
              : localUploadType.value === '101' ? handoutsLecture.value
                : []) + i,
        type: localUploadType.value,
        learningGoalCode: localUploadLearnTarget.value,
        authorName: defaultName,
        watermarkText: defaultName,
        isWatermark: '1'
      }
      if (localUploadType.value === '104' || localUploadType.value === '101') {
        obj.name = file.name
        obj.status = '1'
        obj.isNeed = 0
        obj.downloadType = '0'
        obj.gradeType = '1'
        obj.taskType = '0'
      } else {
        obj.downloadType = '2'
      }
      return obj
    })
  }
  return {
    uploadLocal,
    localUploadVisible,
    localUploadConfirm,
    localUploadCancel,
    localUploadLearnTarget,
    localUploadFileList
  }
}
