import { computed, createVNode, reactive, ref, UnwrapRef } from 'vue'
import { CommonVideoItem, FormStateKnowledge } from '@/app/views/course-manage/pages/course-preview/entity'
import { CoursePreviewApi } from '@/app/views/course-manage/pages/course-preview/api'
import { FileItem } from '../entity'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { useCkeditor, useKnowledgeUpload } from './'
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue/lib'
import { ScpCourseApi } from '@/app/views/course-manage/pages/scp-course/api'

export function useKnowledgeForm (route, attachmentInformation, activedNode) {
  /**
   * 知识点信息
   */
  const formRefKnowledge = ref()
  const formStateKnowledge: UnwrapRef<FormStateKnowledge> = reactive({
    code: '',
    id: '',
    content: '',
    keyLevel: 1,
    isSprint: false,
    isStable: false,
    isFinal: false,
    opsType: 0,
    explanationVideo: [],
    learningMaterials: [],
    isDone: false
  })
  const chapterWeight = ref(0)
  const localVideoFileList = ref<FileItem[]>([])
  const learningMaterialsFileList = ref<FileItem[]>([])

  /**
   * 富文本相关
   */
  const { config, loadObj, ClassicEditor } = useCkeditor()

  /**
   * 学习设置上传中禁用上传
   */
  const disableLearningMaterialsFileUpload = computed(() => {
    return learningMaterialsFileList.value.some(item => item.percent! > 0)
  })

  /**
   * 学习资料进度同步
   * @param info
   */
  const handelChange = (info) => {
    const index = learningMaterialsFileList.value.findIndex(item => item.uid === info.file.uid)
    const curent = JSON.parse(JSON.stringify(learningMaterialsFileList.value[index]))
    if (info.file.status === 'uploading') {
      curent.percent = info.file.percent.toFixed(0)
      learningMaterialsFileList.value[index] = curent
    } else {
      curent.percent = 0
      learningMaterialsFileList.value[index] = curent
    }
  }

  /**
   * 还原知识点内容
   * @param node
   */
  const recoveryKnowledge = (node: TreeDataItem) => {
    if (node.code !== formStateKnowledge.code) { // 去除重复点击
      if (node.kType === '4') {
        if (node.add) {
          resetKnowledgeFrom()
        } else {
          formStateKnowledge.code = node.code || ''
          formStateKnowledge.id = node.id || ''
          formStateKnowledge.content = node.content?.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>') || ''
          formStateKnowledge.keyLevel = node.keyLevel || 1
          formStateKnowledge.isSprint = node.isSprint || false
          formStateKnowledge.isStable = node.isStable || false
          formStateKnowledge.isFinal = node.isFinal || false
          formStateKnowledge.opsType = node.opsType || 0
          formStateKnowledge.isDone = node.isDone || false
          CoursePreviewApi.detailKnowledge(node.id).then(res => {
            if (res.data.status === 200) {
              const explanationVideo: Partial<CommonVideoItem>[] = []
              const learningMaterials: Partial<CommonVideoItem>[] = []
              res.data.data.fileList.forEach(e => {
                if (e.fileType === 1) {
                  explanationVideo.push(e)
                } else {
                  learningMaterials.push(e)
                }
              })
              formStateKnowledge.explanationVideo = explanationVideo
              formStateKnowledge.learningMaterials = learningMaterials
              attachmentInformation.explanationVideoBak = JSON.parse(JSON.stringify(explanationVideo))
              attachmentInformation.learningMaterialsBak = JSON.parse(JSON.stringify(learningMaterials))
            }
          })
        }
      } else {
        resetKnowledgeFrom()
        if (node.kType === '2') {
          chapterWeight.value = node.weight
        }
      }
    }
  }

  /**
   * 重置知识点
   */
  const resetKnowledges = () => {
    Modal.confirm({
      title: '重置知识点',
      icon: createVNode(ExclamationCircleOutlined, { style: { color: '#d9011c' } }),
      content: createVNode('div',
        {},
        ['重置知识点后学员对该知识点的掌握率将归零，学员需要重新进行图谱学习。确定要重置图谱吗？',
          createVNode('div', { style: { color: '#e94b5e', 'margin-top': '10px' } }, ['重置操作不可逆，请谨慎操作！'])
        ]),
      onOk () {
        return new Promise((resolve, reject) => {
          ScpCourseApi.resetKnowledge({
            knowledgePointId: activedNode.value.id
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
   * 重置知识图谱表单
   */
  const resetKnowledgeFrom = () => {
    formStateKnowledge.id = ''
    formStateKnowledge.code = ''
    formStateKnowledge.content = ''
    formStateKnowledge.keyLevel = 1
    formStateKnowledge.isSprint = false
    formStateKnowledge.isStable = false
    formStateKnowledge.isFinal = false
    formStateKnowledge.opsType = 0
    formStateKnowledge.isDone = false
    formStateKnowledge.explanationVideo = attachmentInformation.explanationVideoBak = []
    formStateKnowledge.learningMaterials = attachmentInformation.learningMaterialsBak = []
  }

  /**
   * 讲解视频
   */
  const {
    uploadExplanationVideo,
    confirmUpload,
    removeFileItem,
    editFileItem,
    polywayVisible,
    localUploadvisible,
    polywayFromRef,
    localVideoFromRef,
    localVideoFromRules,
    polywayFromRules,
    videoUpload
  } = useKnowledgeUpload(formStateKnowledge, localVideoFileList)

  return {
    resetKnowledges,
    // 知识点表单
    formRefKnowledge,
    formStateKnowledge,
    chapterWeight,
    localVideoFileList,
    learningMaterialsFileList,
    disableLearningMaterialsFileUpload,
    handelChange,
    recoveryKnowledge,
    resetKnowledgeFrom,
    // 富文本
    config,
    loadObj,
    ClassicEditor,
    // 讲解视频
    uploadExplanationVideo,
    confirmUpload,
    removeFileItem,
    editFileItem,
    polywayVisible,
    localUploadvisible,
    polywayFromRef,
    localVideoFromRef,
    localVideoFromRules,
    polywayFromRules,
    videoUpload
  }
}
