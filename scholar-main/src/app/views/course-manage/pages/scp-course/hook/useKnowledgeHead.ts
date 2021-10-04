import { computed, createVNode, ref } from 'vue'
import { FileItem } from '../entity'
import { ScpCourseApi } from '../api'
import { AxiosResponse } from 'axios'
import { blobDownload } from '@/common/utils'
import { useImportAtlas } from './useImportAtlas'
import { message, Modal } from 'ant-design-vue'
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue/lib'

export function useKnowledgeHead (route, getKnowledgeTree) {
  const importAtlasFileList = ref<FileItem[]>([])

  const {
    importAtlasCancel,
    importAtlasComfirm,
    importAtlasModal,
    importAtlasVisible,
    knowledgeExcelUploadPercent,
    knowledgeExcelUploading
  } = useImportAtlas(importAtlasFileList, route, getKnowledgeTree)

  /**
   * 导入图谱中禁用上传
   */
  const disableImportAtlasFileList = computed(() => {
    return !!importAtlasFileList.value.length
  })

  const businessLoading = ref(false)
  /**
   * 导出图谱
   */
  const exportKnowledgeExcel = (): void => {
    businessLoading.value = true
    ScpCourseApi.exportKnowledgeExcel(route.params.knowledgeSubjectId as string).then((res: AxiosResponse<Blob>) => {
      businessLoading.value = false
      if (res.status === 200) {
        blobDownload(res.data, '知识图谱.xls')
      }
    }).catch(() => (businessLoading.value = false))
  }
  /**
   * 知识点详情导出
   */
  const exportKnowledgeDetail = (): void => {
    businessLoading.value = true
    ScpCourseApi.exportKnowledgeDetail(route.params.courseId as string).then((res: AxiosResponse<Blob>) => {
      businessLoading.value = false
      if (res.status === 200) {
        blobDownload(res.data, '知识点详情.xls')
      }
    }).catch(() => (businessLoading.value = false))
  }

  /**
   * 重置图谱
   */
  const resetMap = () => {
    Modal.confirm({
      title: '重置图谱',
      icon: createVNode(ExclamationCircleOutlined, { style: { color: '#d9011c' } }),
      content: createVNode('div',
        {},
        ['重置图谱后所有学习该知识图谱的学员的掌握率将归零，学员需要重新进行图谱学习。确定要重置图谱吗？',
          createVNode('div', { style: { color: '#e94b5e', 'margin-top': '10px' } }, ['重置操作不可逆，请谨慎操作！'])
        ]),
      onOk () {
        return new Promise((resolve, reject) => {
          ScpCourseApi.resetKnowledge({
            knowledgeSubjectId: route.params.knowledgeSubjectId
          }).then(res => {
            if (res.data.status === 200) {
              message.success(res.data.message)
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => reject(err))
        })
      }
    })
  }

  /**
   * 过滤知识图谱树
   * */
  const filterKnowledgePointsClick = (select) => {
    getKnowledgeTree(select.key)
  }

  return {
    disableImportAtlasFileList,
    importAtlasFileList,
    knowledgeExcelUploadPercent,
    knowledgeExcelUploading,
    importAtlasVisible,
    importAtlasCancel,
    importAtlasComfirm,
    importAtlasModal,
    exportKnowledgeExcel,
    exportKnowledgeDetail,
    resetMap,
    filterKnowledgePointsClick,
    businessLoading
  }
}
