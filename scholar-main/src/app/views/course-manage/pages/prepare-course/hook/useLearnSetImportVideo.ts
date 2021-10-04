import { computed, ref } from 'vue'
import { PrepareCourseApi } from '../api'
import { AxiosResponse } from 'axios'
import { blobDownload, ToolsUtil } from '@/common/utils'
import { message } from 'ant-design-vue'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'

export function useLearnSetImportVideo (packetInfo, getHandoutFiles) {
  const learnSetVideoImportVisible = ref(false)
  const learnSetVideoImportFileList = ref<FileItem[]>([])
  const disablelearnSetVideoImportFileList = computed(() => {
    return !!learnSetVideoImportFileList.value.length
  })
  /**
   * 导入视频模板下载
   * @constructor
   */
  const learnSetVideoImportTemplateDownload = () => {
    PrepareCourseApi.exportExcelVideo().then((res: AxiosResponse<Blob>) => {
      blobDownload(res.data, '导入视频模板.xls')
    })
  }

  /**
   * 导入视频
   */
  const learnSetVideoImportConfirm = () => {
    PrepareCourseApi.importExcelVideo({
      courseId: packetInfo.courseId,
      coursePacketId: packetInfo.id,
      fileUrl: ToolsUtil.getOssUrl(learnSetVideoImportFileList.value[0].response.objectName, false)
    }).then(res => {
      if (res.data.status === 200) {
        message.success('导入成功')
        learnSetVideoImportVisible.value = false
        getHandoutFiles()
      }
    })
  }
  return {
    learnSetVideoImportVisible,
    learnSetVideoImportFileList,
    disablelearnSetVideoImportFileList,
    learnSetVideoImportTemplateDownload,
    learnSetVideoImportConfirm
  }
}
