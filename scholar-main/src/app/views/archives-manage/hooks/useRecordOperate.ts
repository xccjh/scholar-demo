import { createVNode, reactive, ref, UnwrapRef } from 'vue'
import { FormState, TeacherListDataType } from '@/app/views/archives-manage/entity'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { AliOssInstane, UploadXHRArgs } from '@/common/services/ali-oss.service'
import { showPreviewResourceModal, ToolsUtil } from '@/common/utils'
import { timer } from 'rxjs'
import { message, Modal } from 'ant-design-vue'
import { RecordinLecturerApi } from '@/app/views/archives-manage/api'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { PreviewFileOption } from '@/common/base'
import { shared } from '@/common/services'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'

export function useRecordOperate (searchData, tableState, courseList) {
  const guideTeacherVisible = ref(false)
  const isEdit = ref(false)
  const teacherFormRef = ref()
  const teacherFormState: UnwrapRef<FormState> = reactive({
    id: '',
    polywayID: '',
    videoName: '',
    introduction: '',
    name: '',
    avatar: '',
    courseIds: []
  })
  const teacherFormRules = {
    polywayID: [
      {
        min: 0, max: 35, message: '保利威ID不能超过34个字符', trigger: 'blur'
      }
    ],
    videoName: [
      {
        min: 0, max: 25, message: '视频名称不能超过25个字符', trigger: 'blur'
      }
    ],
    introduction: [
      {
        required: true, message: '讲师简介不能为空', trigger: 'blur'
      },
      {
        min: 0, max: 100, message: '讲师简介不能超过100个字符', trigger: 'blur'
      },
      { whitespace: true, message: '讲师简介不能为空', trigger: 'blur' }
    ],
    name: [
      {
        required: true, message: '讲师名称不能为空', trigger: 'blur'
      },
      {
        min: 0, max: 25, message: '讲师名称不能超过25个字符', trigger: 'blur'
      },
      { whitespace: true, message: '讲师名称不能为空', trigger: 'blur' }
    ],
    avatar: [
      {
        required: true, message: '请上传文件', trigger: 'blur'
      }
    ],
    courseIds: [
      {
        required: true, message: '所属课程不能为空', trigger: 'change', type: 'array'
      }
    ]
  }
  const fileList = ref<FileItem[]>([])

  /**
   * oss自定义上传文件
   * */
  const customRequest = (dir) => {
    return (args: UploadXHRArgs) => {
      const uploadDir = dir
      AliOssInstane.upload2AliOSS(args, uploadDir).then((imageUrl: string) => {
        teacherFormState.avatar = ToolsUtil.getOssUrl(imageUrl, false)
        timer(0).subscribe(() => {
          teacherFormRef.value.validate('avatar')
        })
        console.log(fileList.value)
        debugger
      }).catch((err) => {
        console.log(err)
        message.error('上传出错，请稍后再试')
      })
    }
  }
  const removeFile = () => {
    teacherFormState.avatar = ''
    fileList.value = []
  }

  const showTeacherModal = (data?) => {
    isEdit.value = !!data
    teacherFormState.id = data?.id
    teacherFormState.polywayID = data?.videoId
    teacherFormState.videoName = data?.videoName
    teacherFormState.introduction = data?.introduction
    teacherFormState.avatar = data?.avatar
    teacherFormState.name = data?.name
    const courses: string[] = []
    if (isEdit.value) {
      data.course.forEach(item => {
        courseList.value.every(course => {
          if (item.courseId === course.id) {
            courses.push(course.id)
          } else {
            return true
          }
        })
      })
    }
    teacherFormState.courseIds = courses
    fileList.value = isEdit.value ? [{
      uid: ToolsUtil.getRandomFileName(),
      name: data.fileName,
      response: {
        objectName: ToolsUtil.getOssUrl(data.avatar, false)
      },
      thumbUrl: ToolsUtil.getOssUrl(data.avatar)
    }] : []
    guideTeacherVisible.value = true
  }

  const confirmModal = () => {
    teacherFormRef.value
      .validate()
      .then(() => {
        const {
          videoName,
          introduction,
          polywayID,
          name,
          avatar,
          id,
          courseIds
        } = teacherFormState
        const params = {
          name,
          introduction,
          videoId: polywayID,
          videoName,
          id: id || '',
          avatar,
          courseIds
        }
        RecordinLecturerApi.guideTeacherAddEdit(params).then((res) => {
          if (res.data.status === 201) {
            tableState.pageIndex = 1
            searchData()
            guideTeacherVisible.value = false
          }
        })
      })
      .catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
  }

  // 新增讲师
  const filePreview = (e) => {
    const option: Partial<PreviewFileOption> = {
      polywayId: '',
      furl: ToolsUtil.getOssUrl(fileList.value[0].response.objectName),
      share: '0',
      native: '1',
      ow365: '0',
      title: e.name,
      viewerId: shared.getUserInfo().id,
      orgCode: ToolsUtil.getOrgCode()
    }
    showPreviewResourceModal(option)
  }
  /**
   * 课程编辑
   * @param data
   */
  const editItem = (data: TeacherListDataType): void => {
    showTeacherModal(data)
  }
  /**
   * 课程删除
   * @param data
   */
  const delItem = (data: TeacherListDataType): void => {
    Modal.confirm({
      title: '提示',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '确认删除吗? ',
      onOk () {
        return new Promise((resolve, reject) => {
          RecordinLecturerApi.guideTeacherDel(data.id).then((res) => {
            if (res.data.status === 204) {
              searchData()
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          })
        })
      }
    })
  }

  /**
   * 预览附件
   * */
  const handlePreViewVideo = (itemFile: TeacherListDataType): void => {
    showPreviewResourceModal({
      polywayId: itemFile.videoId,
      furl: '',
      share: '0',
      native: '1',
      ow365: '0',
      title: itemFile.name,
      viewerId: shared.getUserInfo().id,
      orgCode: ToolsUtil.getOrgCode()
    })
  }

  return {
    editItem,
    delItem,
    handlePreViewVideo,
    guideTeacherVisible,
    teacherFormRules,
    teacherFormRef,
    teacherFormState,
    isEdit,
    customRequest,
    filePreview,
    confirmModal,
    showTeacherModal,
    fileList,
    removeFile
  }
}
