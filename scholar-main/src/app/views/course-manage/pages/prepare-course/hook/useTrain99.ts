import { createVNode, reactive, ref } from 'vue'
import { CompanyItem } from '@/app/views/course-manage/pages/prepare-course/entity'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { AliOssInstane, UploadXHRArgs } from '@/common/services/ali-oss.service'
import { message, Modal } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/common/base'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'

export function useTrain99 (packetInfo) {
  const practiceOn = ref(packetInfo.is99Train === '1')
  const companyLists = ref<CompanyItem[]>([])
  const isEditTrain99 = ref(false)
  const currentTrain99 = ref<Partial<CompanyItem>>({})
  const train99FromRef = ref()
  const train99Visible = ref(false)
  const train99FileList = ref<FileItem[]>([])
  const train99FromState = reactive<{
    permission?:string[],
    filePath?:string,
    termType?:number
    name?:string
  }>({
    permission: ['业务中心', '数字大脑'],
    filePath: '',
    termType: 0,
    name: ''

  })
  const train99FromRules = {
    name: [
      { required: true, message: '公司名称不能为空', trigger: 'blur' },
      { whitespace: true, message: '公司名称不能为空', trigger: 'blur' },
      { min: 0, max: 40, message: '公司名称不能超过40个字符', trigger: 'change' }
    ],
    filePath: [
      {
        required: true, message: '数据包不能为空', trigger: 'blur'
      }
    ],
    termType: [
      {
        required: true, message: '数据包不能为空', trigger: 'change', type: 'number'
      }
    ],
    permission: [
      { required: true, message: '达标条件不能为空', trigger: 'change', type: 'array' }
    ]

  }

  /**
   * 新增
   * @param companyItem
   */
  const addOrEditCompany = (companyItem:CompanyItem) => {
    isEditTrain99.value = !!companyItem.id
    currentTrain99.value = companyItem
    const { name, termType, filePath, fileName, permission } = companyItem
    train99FileList.value = filePath ? [{
      uid: ToolsUtil.getRandomFileName(),
      name: fileName,
      response: {
        objectName: ToolsUtil.getOssUrl(filePath, false)
      },
      thumbUrl: ToolsUtil.getOssUrl(filePath)
    }] : []
    train99FromState.permission = permission ? permission.split(',') : ['业务中心', '数字大脑']
    train99FromState.filePath = filePath || ''
    train99FromState.termType = termType || 0
    train99FromState.name = name || ''
    train99Visible.value = true
  }
  /**
   * 新增实训
   */
  const train99Confirm = () => {
    train99FromRef.value.validate().then(() => {
      const params = {
        id: currentTrain99.value.id,
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        name: train99FromState.name,
        seq: currentTrain99.value.seq || ToolsUtil.getMaxSeq(companyLists.value),
        filePath: train99FromState.filePath,
        status: 1,
        fileName: train99FileList.value[0].name,
        termType: train99FromState.termType,
        permission: train99FromState.permission!.join(',')
      }
      PrepareCourseApi.addCoursePacketCompany(params).then(res => {
        if (res.data.status === 201) {
          const edit = !!currentTrain99.value.id
          const field = edit ? 'modify' : 'addCode'
          CommonApi.statisticsLog({
            name: edit ? '修改公司信息' : '新增公司',
            actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'][field],
            content: JSON.stringify(params)
          })
          getCompany()
          train99Visible.value = false
        }
      })
    }).catch((error: ValidateErrorEntity<FormState>) => {
      console.log('error', error)
    })
  }

  /**
   * 移除数据包
   */
  const removeTrain99FileList = () => {
    train99FileList.value = []
    train99FromState.filePath = ''
  }

  /**
   * 自定义文件上传
   * @param dir
   */
  const customDataPackRequest = (dir:string) => {
    return (args: UploadXHRArgs) => {
      const uploadDir = dir
      AliOssInstane.upload2AliOSS(args, uploadDir).then((imageUrl: string) => {
        train99FromState.filePath = ToolsUtil.getOssUrl(imageUrl, false)
        train99FromRef.value.clearValidate('filePath')
      }).catch((err) => {
        console.log(err)
        message.error('上传出错，请稍后再试')
      })
    }
  }

  /**
   * 删除公司
   * @param item
   */
  const deleteCompany = (item) => {
    Modal.confirm({
      title: '删除公司',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: ('确定删除' + item.name + '公司吗？'),
      onOk () {
        return new Promise((resolve, reject) => {
          if (!(Number(packetInfo.isUsed) > 0)) {
            PrepareCourseApi.companyDel(item.id).then(res => {
              if (res.data.status === 204) {
                getCompany()
                CommonApi.statisticsLog({
                  name: '删除公司',
                  actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'].delCode,
                  content: item.id
                })
                resolve(true)
              } else {
                reject(new Error(res.data.message))
              }
            }).catch(err => reject(err))
          }
        })
      }
    })
  }

  /**
   * 开启实训
   * @param val
   */
  const practiceOnChange = (val: boolean) => {
    const flag = val ? '1' : '0'
    packetInfo.is99Train = flag
    PrepareCourseApi.packageInfoUpdate({ id: packetInfo.id, is99Train: flag }).then(
      res => {
        if (res.data.status === 201) {
          if (flag === '1') {
            getCompany()
          }
          SessionStorageUtil.putPacketInfoItem('is99Train', flag)
        }
      }
    )
  }
  /**
   * 获取公司列表
   */
  const getCompany = () => {
    PrepareCourseApi.getCompany(packetInfo.id).then(
      res => {
        if (res.data.status === 200) {
          companyLists.value = res.data.data
        }
      })
  }
  return {
    practiceOnChange,
    train99Confirm,
    addOrEditCompany,
    train99FileList,
    train99Visible,
    train99FromRules,
    isEditTrain99,
    currentTrain99,
    train99FromRef,
    train99FromState,
    practiceOn,
    companyLists,
    removeTrain99FileList,
    customDataPackRequest,
    getCompany,
    deleteCompany
  }
}
