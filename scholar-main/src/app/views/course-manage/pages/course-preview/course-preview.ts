import { defineComponent, reactive, ref, UnwrapRef } from 'vue'
import { getName, getPreview, isPicture, SessionStorageUtil, showPreviewResourceModal, ToolsUtil } from '@/common/utils'
import { moment } from '@/main'
import { MenuServiceKey, shared } from '@/common/services'
import { CoursePreviewApi } from './api'
import { RouteLocationNormalized, useRoute } from 'vue-router'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { CommonVideoItem, FormState } from './entity'
import { Json, PreviewFileOption } from '@/common/base'
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload'
import { CONFIG } from '@/common/constants'
import { uploadOssInstane } from '@/common/services/upload-oss.service'
import { useRequiredInject } from '@/common/hooks'

export default defineComponent({
  name: 'course-preview',
  setup () {
    const formState: UnwrapRef<FormState> = reactive({
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
    const formRef = ref()
    const route: RouteLocationNormalized = useRoute()
    const orgCode = ToolsUtil.getOrgCode()
    const isExpend = ref(false)
    const activeKey = ref('1')
    const data = ref<Json>({})
    const knowledgeSubjectId = ref('')
    const auditStatus = ref('')
    const treeData = ref<TreeDataItem[]>([])
    const activedNode = ref<TreeDataItem>({})
    const totalWeight = ref(0)
    const chapterWeight = ref(0)
    const menuService = useRequiredInject(MenuServiceKey)

    /**
     * 返回
     * */
    const backToList = () => {
      const type = SessionStorageUtil.getCourseType()
      menuService.goBack(false)
      if (type === '0') {
        menuService.gotoUrl({
          url: '/m/course-manage/course-list',
          paramUrl: '',
          title: '课程管理'
        })
      } else if (type === '1') {
        menuService.gotoUrl({
          url: '/m/course-manage/i-initiated',
          paramUrl: '',
          title: '我发起的'
        })
      } else {
        menuService.gotoUrl({
          url: '/m/course-manage/approve-all',
          paramUrl: '',
          title: '全部审批'
        })
      }
      SessionStorageUtil.removeCourseType()
    }
    /**
     * 格式化专业
     * */
    const getMajorList = (data) => {
      if (data) {
        if (orgCode === 'cjsd') {
          return data.majorName
        } else {
          return data.majorCourseList && data.majorCourseList.length && data.majorCourseList.map(e => e.majorName).join(', ')
        }
      } else {
        return '--'
      }
    }
    /**
     * 格式化日期
     * */
    const getDate = (date) => {
      return moment(new Date(date)).format('YYYY-MM-DD')
    }
    /**
     * 获取课程详情
     * */
    const getCourseDetail = (id: string) => {
      CoursePreviewApi.getCourseDetail(id).then(res => {
        if (res.data.status === 200) {
          data.value = res.data.data
          if (res.data.data.courseDetail) {
            data.value.courseDetail.introduction = data.value.courseDetail?.introduction?.replace(/\n/g, '<br/>')
          }
          knowledgeSubjectId.value = res.data.data.knowledgeSubjectId
          auditStatus.value = res.data.data.auditStatus
          getKnowledgeTree()
          recoverTab()
        }
      })
    }

    /**
     * 点击tab
     * */
    const tabChange = (key) => {
      SessionStorageUtil.putKnowledgeGraphTab(JSON.stringify({ [knowledgeSubjectId.value]: key }))
    }

    /**
     * 过滤知识图谱树
     * */
    const filterKnowledgePointsClick = (select) => {
      getKnowledgeTree(select.key)
    }

    /**
     * 初始化知识图谱树
     * */
    const getKnowledgeTree = (type: '1' | '2' = '1') => {
      CoursePreviewApi[type === '1' ? 'getKnowledgeTree' : 'getPreAuditTree'](knowledgeSubjectId.value).then(res => {
        if (res.data.status === 200) {
          totalWeight.value = 0
          treeData.value = [res.data.data]
          const { children } = res.data.data
          if (children && children.length) {
            children.filter((node) => (node.status !== '3')).forEach(rr => {
              totalWeight.value += rr.weight
            })
          }
        }
      })
    }
    /**
     * 预览附件
     * */
    const previewItem = (itemFile) => {
      const option: Partial<PreviewFileOption> = {
        polywayId: '',
        furl: '',
        share: '0',
        native: '1',
        ow365: '0',
        viewerId: shared.getUserInfo().id,
        orgCode: ToolsUtil.getOrgCode(),
        title: itemFile.attachmentName
      }
      if (itemFile.attachmentPath?.indexOf('.') < 0) {
        option.polywayId = itemFile.attachmentPath
      } else {
        option.furl = itemFile.attachmentPath
      }
      showPreviewResourceModal(option)
    }

    /**
     * 点击树节点
     * @param selectedKeys
     * @param e
     */
    const selectTree = (selectedKeys, e: { selected: boolean, selectedNodes, node, event }) => {
      const node = activedNode.value = e.selectedNodes[0].props
      if (node.kType === '4') {
        formState.code = node.code
        formState.id = node.id
        formState.content = node.content
        formState.keyLevel = node.keyLevel
        formState.isSprint = node.isSprint
        formState.isStable = node.isStable
        formState.isFinal = node.isFinal
        formState.opsType = node.opsType
        formState.isDone = node.isDone
        CoursePreviewApi.detailKnowledge(node.id).then(res => {
          if (res.data.status === 200) {
            const explanationVideo: CommonVideoItem[] = []
            const learningMaterials: CommonVideoItem[] = []
            res.data.data.fileList.forEach(e => {
              if (e.fileType === 1) {
                explanationVideo.push(e)
              } else {
                learningMaterials.push(e)
              }
            })
            formState.explanationVideo = explanationVideo
            formState.learningMaterials = learningMaterials
          }
        })
      } else {
        formState.id = ''
        formState.code = ''
        formState.content = ''
        formState.keyLevel = 1
        formState.isSprint = false
        formState.isStable = false
        formState.isFinal = false
        formState.opsType = 0
        formState.isDone = false
        formState.explanationVideo = []
        formState.learningMaterials = []
        if (node.kType === '2') {
          chapterWeight.value = node.weight
        }
      }
    }
    /**
     * 还原tab
     */
    const recoverTab = () => {
      const indexObj = SessionStorageUtil.getKnowledgeGraphTab()
      if (indexObj) {
        const index = JSON.parse(indexObj)[knowledgeSubjectId.value]
        if (index) {
          activeKey.value = index
        }
      }
    }

    const loadObj = reactive({
      editorOne: false
    })

    const getResolver = (label) => {
      return (file:File) => {
        return new Promise((resolve, reject) => {
          loadObj[label] = true
          uploadOssInstane.uploadOss(file).then((urlObj:{url:string}) => {
            loadObj[label] = false
            resolve(urlObj)
          }).catch(err => {
            reject(err)
            loadObj[label] = false
          })
        })
      }
    }
    const getImgVideoReosolver = (label) => {
      return {
        videoUpload: getResolver(label),
        imageUpload: getResolver(label)
      }
    }

    const config = Object.assign({}, CONFIG, getImgVideoReosolver('editorOne'))

    getCourseDetail(route.params.id as string)

    return {
      isExpend,
      backToList,
      orgCode,
      getMajorList,
      getDate,
      data,
      activeKey,
      tabChange,
      ossUrl: process.env.VUE_APP_OSS_URL,
      filterKnowledgePointsClick,
      treeData,
      activedNode,
      totalWeight,
      selectTree,
      formRef,
      formState,
      chapterWeight,
      getName,
      getPreview,
      previewItem,
      isPicture,
      ClassicEditor,
      config
    }
  }
})
