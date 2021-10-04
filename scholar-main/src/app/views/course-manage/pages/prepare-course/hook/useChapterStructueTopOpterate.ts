import { computed, createVNode, ref } from 'vue'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { PrepareCourseApi } from '../api'
import { AxiosResponse } from 'axios'
import { blobDownload, ToolsUtil } from '@/common/utils'

export function useChapterStructueTopOpterate (getChapter, packetInfo) {
  const chapterStructureVisible = ref(false)
  const chapterStructureFileList = ref<FileItem[]>([])
  const disableChapterStructureFileList = computed(() => {
    return !!chapterStructureFileList.value.length
  })

  /**
   * 知识图谱导入章节
   */
  const knowledgeGraphImport = () => {
    Modal.confirm({
      title: '导入知识图谱',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '您确定将知识图谱中的章节结构一键同步到课包结构吗？将会清除已有的章节结构。',
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.synchronizedKnowledge({
            courseId: packetInfo.courseId,
            coursePacketId: packetInfo.id
          }).then((res) => {
            if (res.data.status === 201) {
              getChapter()
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => {
            reject(err)
          })
        })
      }
    })
  }

  /**
   * 模板下载
   */
  const templateDownload = () => {
    PrepareCourseApi.chapterTemplateDown().then((res:AxiosResponse<Blob>) => {
      blobDownload(res.data, '章节结构模板.xls')
    })
  }

  const businessLoading = ref(false)

  /**
   * 章节导出
   */
  const chapterExport = () => {
    businessLoading.value = true
    PrepareCourseApi.packetChapterExport(packetInfo.id).then((res:AxiosResponse<Blob>) => {
      businessLoading.value = false
      blobDownload(res.data, packetInfo.name + '章节结构.xls')
    }).catch(() => (businessLoading.value = false))
  }

  /**
   * 章节导入
   */
  const chapterImport = () => {
    PrepareCourseApi.excelImportChapter({
      courseId: packetInfo.courseId,
      coursePacketId: packetInfo.id,
      fileUrl: ToolsUtil.getOssUrl(chapterStructureFileList.value[0].response.objectName, false)
    }).then(res => {
      if (res.data.status === 200) {
        getChapter()
        chapterStructureVisible.value = false
      }
    })
  }
  return {
    chapterStructureVisible,
    chapterStructureFileList,
    disableChapterStructureFileList,
    chapterImport,
    chapterExport,
    templateDownload,
    knowledgeGraphImport,
    businessLoading
  }
}
