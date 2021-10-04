import { computed, defineComponent, nextTick, reactive, ref } from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { CoursePreviewApi } from '@/app/views/course-manage/pages/course-preview/api'
import { useRoute } from 'vue-router'
import { getMaterialName, getResourceName, LEARNING_TARGET } from '@/common/constants'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { checkSameName, LocalStorageUtil, randomString, ToolsUtil } from '@/common/utils'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { Json } from '@/common/base'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { message, Modal } from 'ant-design-vue'
import { AliOssInstane, UploadXHRArgs } from '@/common/services/ali-oss.service'
import { ReadMaterialsFormState } from '@/app/views/resource-manage/pages/save-read/entity'
import { SaveReadApi } from '@/app/views/resource-manage/pages/save-read/api'

export default defineComponent({
  name: 'save-read',

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
    const formState = reactive<ReadMaterialsFormState>({
      id: '',
      title: '',
      learningGoalCode: '',
      uploadFileArr: [],
      authorName: defaultName,
      watermarkText: defaultName,
      isWatermark: '1'
    })
    const rules: Json = {
      title: [
        { required: true, message: '请输入资源标题', trigger: 'blur' },
        { min: 0, max: 30, message: '资源标题不能超过30个字符', trigger: 'change' },
        { whitespace: true, message: '资源标题不能为空', trigger: 'change' }
      ],
      learningGoalCode: [
        { required: true, message: '请选择学习目标', trigger: 'change' }
      ],
      authorName: [
        { required: true, message: '请输入作者名称', trigger: 'blur' },
        { min: 0, max: 30, message: '作者名称不能超过30个字符', trigger: 'change' },
        { whitespace: true, message: '作者名称不能为空', trigger: 'change' }
      ],
      uploadFileArr: [
        { required: true, message: '请上传文件', trigger: 'blur', type: 'array' }
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
      CoursePreviewApi.getKnowledgeTree(route.params.courseId).then(res => {
        if (res.data.status === 200) {
          treeData.value = res.data.data ? [res.data.data] : []
        }
      })
    }
    /**
     * 动态校验
     */
    const formRule = computed(() => {
      if (formState.isWatermark === '1') {
        return {
          ...rules,
          watermarkText: [
            { required: true, message: '请输入水印文字', trigger: 'blur' },
            { min: 0, max: 30, message: '水印文字不能超过30个字符', trigger: 'change' },
            { whitespace: true, message: '水印文字不能为空', trigger: 'change' }
          ]
        }
      }
      return rules
    })

    /**
     * 提交表单
     */
    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          if (fileList.value.every(infoFile => !infoFile.response)) {
            message.warning('请等待资源上传完成')
            return
          }
          const {
            id,
            title,
            learningGoalCode,
            authorName,
            watermarkText,
            isWatermark
          } = formState
          const params: Json = {
            type: route.params.materialType,
            coursewareType: route.params.materialType,
            attachmentInfos: [],
            title,
            learningGoalCode,
            authorName,
            watermarkText,
            isWatermark,
            id
          }
          if (formState.uploadFileArr.every((fileInfo, i) => {
            if (!fileInfo.title) {
              message.warning('第' + (i + 1) + '个附件资源名不能为空')
            } else {
              params.attachmentInfos.push(fileInfo)
              return true
            }
          })) {
            if (isEdit.value) {
              params.attachmentInfos[0].title = title
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
        SaveReadApi.saveCourseWare(params).then(res => {
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
        url: '/m/rm/read',
        paramUrl: '',
        title: '阅读库'
      })
    }

    /**
     * 删除资料
     * @param fileItem
     */
    const removeMaterial = (fileItem: FileItem) => {
      const index = fileList.value.findIndex(itemFile => (fileItem.uid === itemFile.uid))
      fileList.value.splice(index, 1)
      formState.uploadFileArr.splice(index, 1)
      formRef.value.validate('uploadFileArr')
    }

    /**
     * 文件上传校验
     * @param file
     */
    const beforeUploadRead = (file: FileItem, fileListsOrigin: FileItem[]) => {
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
        nextTick(() => {
          fileList.value.splice(fileList.value.findIndex(item => item.uid === file.uid), 1)
        })
        message.warning(msg)
        return false
      }
    }

    /**
     * oss自定义上传文件
     * */
    const customRequest = (dir) => {
      return (args: UploadXHRArgs) => {
        const uploadDir = dir
        AliOssInstane.upload2AliOSS(args, uploadDir).then((imageUrl: string) => {
          if (fileList.value.every(item => item.response)) {
            formState.uploadFileArr = fileList.value.filter(e => e.response).map(fileItem => {
              return {
                attachmentPath: ToolsUtil.getOssUrl(fileItem.response.objectName, false),
                attachmentName: fileItem.name,
                title: fileItem.name.split('.')[0].slice(0, 30),
                uid: fileItem.uid
              }
            })
            formRef.value.validate('uploadFileArr')
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
            const { id, learningGoalCode, attachmentName, resourceUrl, title, authorName, watermarkText, isWatermark, resourcePoints } = res.data.data
            const uid = ToolsUtil.randomString()
            formState.id = id
            formState.title = title
            formState.learningGoalCode = learningGoalCode
            formState.authorName = authorName
            formState.watermarkText = watermarkText
            formState.isWatermark = isWatermark
            formState.uploadFileArr = [{ uid, attachmentName, attachmentPath: resourceUrl, title }]
            fileList.value = [{ uid, name: attachmentName, response: { objectName: resourceUrl } }]
            knowledgePointIds = resourcePoints.map(({ knowledgePointId }) => knowledgePointId).filter(item => item)
            checkedKeys.value = JSON.parse(JSON.stringify(knowledgePointIds))
          }
        })
      }
    }

    const createrName = ref(LocalStorageUtil.getUser().nickName)

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
      removeMaterial,
      beforeUploadRead,
      customRequest,
      isEdit,
      checkedKeys
    }
  }
})
