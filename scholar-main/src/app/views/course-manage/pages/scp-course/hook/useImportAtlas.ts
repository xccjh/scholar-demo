import { ref } from 'vue'
import { Subscription, timer } from 'rxjs'
import { message } from 'ant-design-vue'
import { ScpCourseApi } from '../api'
import { ToolsUtil } from '@/common/utils'

export function useImportAtlas (importAtlasFileList, route, getKnowledgeTree) {
  const importAtlasVisible = ref(false) // 导入图谱弹框
  const knowledgeExcelUploading = ref(false)
  const knowledgeExcelUploadPercent = ref(0)
  let timer$: Subscription
  /**
   * 取消导入图谱
   */
  const importAtlasCancel = () => {
    if (knowledgeExcelUploading.value) {
      message.warning('正在导入知识图谱请不要中途退出')
      importAtlasVisible.value = true
    }
  }

  /**
   * 导入图谱弹框
   */
  const importAtlasModal = () => {
    importAtlasVisible.value = true
    importAtlasFileList.value = []
  }

  /**
   * 导入图谱
   */
  const importAtlasComfirm = () => {
    if (importAtlasFileList.value.length) {
      ScpCourseApi.importKnowledge(route.params.knowledgeSubjectId as string, ToolsUtil.getOssUrl(importAtlasFileList.value[0].response.objectName, false)).then(res => {
        if (res.data.status === 201) {
          message.success('格式校验通过开始进行导入操作,请不要中途退出')
          knowledgeExcelUploading.value = true
          timer$ = timer(0, 1000).subscribe(() => {
            ScpCourseApi.queryImportKnowledgeProgress(
              route.params.knowledgeSubjectId as string
            ).then(resP => {
              if (resP.data.status === 200) {
                if (resP.data.data.isDone) {
                  knowledgeExcelUploadPercent.value = 100
                  timer$.unsubscribe()
                  timer(1000).subscribe(() => {
                    message.success('批量导入成功')
                    importAtlasVisible.value = false
                    knowledgeExcelUploading.value = false
                    knowledgeExcelUploadPercent.value = 0
                    getKnowledgeTree()
                  })
                } else {
                  if (resP.data.data.msg.indexOf('异常') > -1) {
                    message.error(resP.data.data.msg, 3)
                    timer$.unsubscribe()
                    knowledgeExcelUploading.value = false
                    knowledgeExcelUploadPercent.value = 0
                    getKnowledgeTree()
                  } else {
                    knowledgeExcelUploadPercent.value = Math.floor(resP.data.data.percent * 100)
                  }
                }
              } else {
                message.error('服务器中途出错了，请稍后再试')
              }
            })
          })
        }
      })
    } else {
      message.warning('请上传文件后导入')
    }
  }

  return {
    importAtlasCancel,
    importAtlasComfirm,
    importAtlasModal,
    importAtlasVisible,
    knowledgeExcelUploadPercent,
    knowledgeExcelUploading
  }
}
