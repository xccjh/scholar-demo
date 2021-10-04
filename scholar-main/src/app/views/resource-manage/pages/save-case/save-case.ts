import { computed, defineComponent, reactive, ref, toRefs, nextTick } from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { CoursePreviewApi } from '@/app/views/course-manage/pages/course-preview/api'
import { useRoute } from 'vue-router'
import { getMaterialName, getResourceName, LEARNING_TARGET, CONFIG, getImgVideoReosolver } from '@/common/constants'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { checkSameName, getContentLength, LocalStorageUtil, randomString, ToolsUtil } from '@/common/utils'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { Json } from '@/common/base'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { message, Modal } from 'ant-design-vue'
import { AliOssInstane, UploadXHRArgs } from '@/common/services/ali-oss.service'
import { SaveReadApi } from '@/app/views/resource-manage/pages/save-read/api'
import { CaseMaterialsFormState } from './entity'
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload'
import { SaveCaseApi } from '@/app/views/resource-manage/pages/save-case/api'

export default defineComponent({
  name: 'save-case',

  setup () {
    const orgCode = ToolsUtil.getOrgCode()
    const defaultName = orgCode === 'zksd' ? '考拉日记' : '恒企教育'
    const treeData = ref<TreeDataItem[]>([])
    const checkedKeys = ref<string[]>([])
    const route = useRoute()
    let minType = 5
    let knowledgePointIds: string[] = []
    const menuService = useRequiredInject(MenuServiceKey)
    const formRef = ref()

    const fileList = ref<FileItem[]>([])
    const formState = reactive<CaseMaterialsFormState>({
      id: '',
      title: '',
      learningGoalCode: '',
      authorName: defaultName,
      caseAttanmentArr: [],
      analysis: '',
      background: '',
      guide: ''
    })

    const formRule: Json = {
      title: [
        { required: true, message: '请输入资源标题', trigger: 'blur' },
        { min: 0, max: 30, message: '资源标题不能超过30个字符', trigger: 'blur' },
        { whitespace: true, message: '资源标题不能为空', trigger: 'blur' }
      ],
      learningGoalCode: [
        { required: true, message: '请选择学习目标', trigger: 'change' }
      ],
      authorName: [
        { required: true, message: '请输入作者名称', trigger: 'blur' },
        { min: 0, max: 30, message: '作者名称不能超过30个字符', trigger: 'blur' },
        { whitespace: true, message: '作者名称不能为空', trigger: 'blur' }
      ],
      background: [
        { required: true, message: '请输入案例背景', trigger: 'change' },
        { whitespace: true, message: '案例背景不能为空', trigger: 'change' }
      ]
    }

    const isEdit = computed(() => {
      return route.params.resourceId !== '0'
    })

    /**
     * 选中树节点
     * @param selectedKeys 选中的key
     * @param e 选中信息
     */
    const treeNodeClick = (selectedKeys, e:
      { selected: boolean, checkedNodes: { props: { dataRef: TreeDataItem } }[], node, event: string; halfCheckedKeys: string[] }
    ) => {
      minType = 5
      knowledgePointIds = e.checkedNodes.filter(item => item.props.dataRef.kType === '4').map(e => e.props.dataRef.id || e.props.dataRef.key)
      e.checkedNodes.forEach(node => {
        if (node.props.dataRef.kType < minType) {
          minType = node.props.dataRef.kType
        }
      })
    }

    /**
     * 获取知识图谱树
     */
    const getKnowledgeTree = () => {
      treeData.value = []
      CoursePreviewApi.getKnowledgeTree(route.params.courseId).then(res => {
        if (res.data.status === 200) {
          treeData.value = [res.data.data]
        }
      })
    }

    /**
     * 提交表单
     */
    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          if (fileList.value.length && fileList.value.every(infoFile => !infoFile.response)) {
            message.warning('请等待资源上传完成')
            return
          }
          const {
            id,
            title,
            learningGoalCode,
            authorName,
            guide,
            background,
            analysis,
            caseAttanmentArr
          } = formState
          if (getContentLength(background) > 5000) {
            message.warning('案例背景已超出限制')
            return
          }
          if (getContentLength(analysis) > 5000) {
            message.warning('案例解析已超出限制')
            return
          }
          if (getContentLength(guide) > 5000) {
            message.warning('教学指导内容已超出限制')
            return
          }
          const params: Json = {
            type: route.params.materialType,
            coursewareType: route.params.materialType,
            attachments: caseAttanmentArr,
            title: title,
            learningGoalCode,
            authorName,
            id,
            guide,
            background,
            analysis
          }
          if (knowledgePointIds.length) {
            params.pointType = 1
            params.points = knowledgePointIds
          } else {
            params.pointType = 2
            params.points = [route.params.courseId]
          }

          if (minType === 5 && !knowledgePointIds.length) {
            Modal.confirm({
              title: '未选择知识点资料将挂到课程，确定吗？',
              closable: true,
              okText: '确定',
              onOk: () => {
                return savaRecourse(params)
              }
            })
          } else {
            if (params.pointType === 2) {
              Modal.confirm({
                title: '选择的节点未包含知识点，资料将挂到课程，确定吗？',
                closable: true,
                okText: '确定',
                onOk: () => {
                  return savaRecourse(params)
                }
              })
            } else {
              savaRecourse(params)
            }
          }
        })
        .catch((error: ValidateErrorEntity<any>) => {
          console.log('error', error)
        })
    }

    /**
     * 保存资料
     * @param params
     */
    const savaRecourse = (params) => {
      return new Promise((resolve, reject) => {
        SaveCaseApi.saveCourseWare(params).then(res => {
          if (res.data.status === 201) {
            resolve(true)
            gotoback()
          } else {
            reject(new Error(res.data.message))
          }
        }).catch((err) => {
          reject(err)
        })
      })
    }

    /**
     * 回退
     */
    const gotoback = () => {
      menuService.goBack(false)
      menuService.gotoUrl({
        url: '/m/rm/case',
        paramUrl: '',
        title: '案例库'
      })
    }

    /**
     * 删除资料
     * @param fileItem
     */
    const removeCaseMaterial = (fileItem: FileItem) => {
      const index = fileList.value.findIndex(itemFile => (fileItem.uid === itemFile.uid))
      fileList.value.splice(index, 1);
      (fileList as Json).cached = fileList.value
      formState.caseAttanmentArr.splice(index, 1)
    }

    /**
     * 文件上传校验
     * @param file
     */
    const beforeUploadMaterial = (file: FileItem, fileListsOrigin: FileItem[]) => {
      const fileType = ToolsUtil.getFileType(file.name)
      if ((fileType === 'excel' || fileType === 'word' || fileType === 'pdf' || fileType === 'ppt')) {
        const isLt100M = file.size! / 1024 / 1024 < 100
        if (!isLt100M) {
          const msg = '请保证文档类文件小于100MB!'
          message.warning(msg)
          nextTick(() => {
            fileList.value.splice(fileList.value.findIndex(item => item.uid === file.uid), 1)
          })
          return false
        }
      }

      if (file.name.length > 100) {
        const msg = file.name + '名称太长，文件名包含扩展名请保持100个字符以内'
        message.warning(msg)
        nextTick(() => {
          fileList.value.splice(fileList.value.findIndex(item => item.uid === file.uid), 1)
        })
        return false
      }
      if (!checkSameName(file.name, fileList.value.filter(item => (!fileListsOrigin.find(innerItem => innerItem.uid === item.uid))))) {
        const msg = '请不要重复上传，文件名重复'
        message.warning(msg)
        nextTick(() => {
          fileList.value.splice(fileList.value.findIndex(item => item.uid === file.uid), 1)
        })
        return false
      }
      if (!(fileList as Json).cached) {
        (fileList as Json).cached = [fileListsOrigin.splice(0, 1)[0]]
      } else {
        if ((fileList as Json).cached.length >= 4) {
          const msg = '案例附件仅限上传4个!'
          message.warning(msg)
          nextTick(() => {
            fileList.value.splice(fileList.value.findIndex(item => item.uid === file.uid), 1)
          })
          return false
        }
        (fileList as Json).cached.push(fileListsOrigin.splice(0, 1)[0])
      }

      return true
    }

    /**
     * oss自定义上传文件
     * */
    const customRequest = (dir) => {
      return (args: UploadXHRArgs) => {
        const uploadDir = dir
        AliOssInstane.upload2AliOSS(args, uploadDir).then((imageUrl: string) => {
          if (fileList.value.every(item => item.response)) {
            formState.caseAttanmentArr = fileList.value.filter(e => e.response).map(fileItem => ({
              attachmentPath: ToolsUtil.getOssUrl(fileItem.response.objectName, false),
              attachmentName: fileItem.name,
              aattachmentExt: ToolsUtil.getExt(fileItem.name),
              attachmentType: 12,
              uid: fileItem.uid
            }))
          }
        }).catch((err) => {
          console.log(err)
          message.error('上传出错，请稍后再试')
        })
      }
    }

    /**
     * 回显表单数据
     */
    const getEditData = () => {
      if (isEdit.value) {
        SaveReadApi.getResourceDetail(route.params.resourceId as string, route.params.materialType as string).then(res => {
          if (res.data.status === 200) {
            createrName.value = res.data.data.createrName
            const { id, learningGoalCode, title, authorName, resourcePoints, background, guide, analysis, attachment } = res.data.data
            formState.id = id
            formState.title = title
            formState.learningGoalCode = learningGoalCode
            formState.authorName = authorName
            formState.background = background
            formState.guide = guide
            formState.analysis = analysis
            formState.caseAttanmentArr = attachment.map(item => ({
              attachmentPath: item.attachmentPath,
              attachmentName: item.attachmentName,
              uid: item.id,
              aattachmentExt: item.aattachmentExt,
              attachmentType: 12
            }))
            fileList.value = attachment.map(item => ({
              uid: ToolsUtil.randomString(),
              name: item.attachmentName,
              response: {
                objectName: item.attachmentPath
              }
            }));
            (fileList as Json).cached = fileList.value
            knowledgePointIds = resourcePoints.map(({ knowledgePointId }) => knowledgePointId).filter(item => item)
            checkedKeys.value = JSON.parse(JSON.stringify(knowledgePointIds))
          }
        })
      }
    }

    const createrName = ref(LocalStorageUtil.getUser().nickName)
    const loading = reactive({
      backgroundLoading: false,
      analysisLoading: false,
      guideLoading: false
    })
    const backgroundConfig = Object.assign({}, CONFIG, getImgVideoReosolver(loading, 'backgroundLoading'))
    const analysisConfig = Object.assign({}, CONFIG, getImgVideoReosolver(loading, 'analysisLoading'))
    const guideConfig = Object.assign({}, CONFIG, getImgVideoReosolver(loading, 'guideLoading'))

    getKnowledgeTree()
    getEditData()

    return {
      // 表单
      formRef,
      formState,
      formRule,
      onSubmit,
      gotoback,
      // 树节点
      treeNodeClick,
      treeData,
      title: `${route.params.resourceId === '0' ? '新增' : '编辑'}${getMaterialName(route.params.materialType as string, 'MATERIAL_TYPE')}`,
      createrName,
      learnTargetArr: LEARNING_TARGET,
      materialType: route.params.materialType,
      // 文件上传相关
      fileList,
      removeCaseMaterial,
      beforeUploadMaterial,
      customRequest,
      isEdit,
      checkedKeys,
      ...toRefs(loading),
      ClassicEditor,
      analysisConfig,
      guideConfig,
      backgroundConfig,
      getContentLength
    }
  }
})
