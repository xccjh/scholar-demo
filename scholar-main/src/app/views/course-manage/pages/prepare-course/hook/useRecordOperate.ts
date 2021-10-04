import { computed, reactive, ref } from 'vue'
import { FormState, Json } from '@/common/base'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { TaskDataType } from '@/app/views/course-manage/pages/prepare-course/entity'
import { ToolsUtil } from '@/common/utils'
import { getDuration, getVideoLength } from '@/app/views/course-manage/pages/prepare-course/utils'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { UploadXHRArgs } from '@/common/services/ali-oss.service'
import { uploadPolywayInstane } from '@/common/services/upload-polyway.service'

export function useRecordOperate (handoutsRecording, packetInfo, currentLearnSetSection, getHandoutFiles, recordLocalUploadFileList) {
  const isRecordLocalUploadEdit = ref(false)
  const recordLocalUploadLabel = ref('')
  const recordLocalUploadData = ref<Json>({})
  const recordLocalUploadVisible = ref(false)
  const teacherList = ref<Json[]>([])
  const recordLocalUploadFormRef = ref()
  const recordLocalUploadFormState = reactive({
    videoUrl: '',
    videoType: '1',
    attachmentName: '',
    authorId: '',
    seq: 1,
    id: '',
    videoDuration: 1
  })
  const recordLocalUploadFormRulesBase = {
    videoUrl: [
      { required: true, message: '视频不能为空', trigger: 'blur' }
    ],
    videoType: [
      { required: true, message: '视频标签不能为空', trigger: 'blur' }
    ],
    attachmentName: [
      { whitespace: true, message: '视频名称不能为空', trigger: 'blur' },
      { required: true, message: '视频名称不能为空', trigger: 'blur' },
      { min: 0, max: 50, message: '视频名称不能超过50个字符', trigger: 'change' }
    ],
    authorId: [
      { required: true, message: '指导讲师不能为空', trigger: 'blur' }
    ],
    seq: [
      { whitespace: true, message: '序号不能为空', trigger: 'blur', type: 'number' },
      { required: true, message: '序号不能为空', trigger: 'blur', type: 'number' }
    ]
  }
  const recordLocalUploadFormRules = computed(() => {
    if (recordLocalUploadLabel.value === 'showInteraction') {
      return {
        ...recordLocalUploadFormRulesBase,
        videoDuration: [
          { whitespace: true, message: '视频时长不能为空', trigger: 'blur', type: 'number' },
          { required: true, message: '视频时长不能为空', trigger: 'blur', type: 'number' }
        ]
      }
    } else {
      return recordLocalUploadFormRulesBase
    }
  })

  /**
   * 获取指导讲师列表
   */
  const getTeacher = () => {
    PrepareCourseApi.getTeacher().then((res) => {
      if (res.data.status === 200) {
        teacherList.value = res.data.data
      }
    })
  }

  /**
   * 编辑录播视频
   */
  const editRecord = (item: TaskDataType) => {
    recordLocalUploadFormState.videoUrl = item.attachmentPath
    recordLocalUploadFormState.videoType = item.videoType
    recordLocalUploadFormState.attachmentName = item.title
    recordLocalUploadFormState.authorId = item.authorId
    recordLocalUploadFormState.seq = item.seq
    recordLocalUploadFormState.id = item.id
    recordLocalUploadFormState.videoDuration = item.videoLength || 1
    videoUpload(item.sourceType === '3' ? 'showInteraction' : item.attachmentExt ? 'localVideo' : 'polyway', false, item)
  }

  /**
   * 保存本地视频上传
   */
  const confirmRecordLocalUpload = () => {
    recordLocalUploadFormRef.value.validate().then(() => {
      const { courseId, id: coursePacketId } = packetInfo
      const { id: courseSectionId, courseChapterId } = currentLearnSetSection.value
      const { authorId, videoType, seq, videoUrl: attachmentPath, attachmentName } = recordLocalUploadFormState
      const params: Json[] = [
        {
          courseId,
          coursePacketId,
          courseChapterId,
          courseSectionId,
          title: attachmentName,
          attachmentName,
          attachmentPath,
          authorId,
          attachmentExt: ToolsUtil.getFileExt(attachmentPath),
          authorName: teacherList.value.filter(eee => Object.is(eee.id, authorId))[0].name,
          type: '103',
          sourceType: recordLocalUploadLabel.value === 'showInteraction' ? 3 : 2,
          seq,
          videoType
        }
      ]
      if (isRecordLocalUploadEdit.value) { // 编辑
        params[0].id = recordLocalUploadFormState.id
        params[0].resourceId = recordLocalUploadData.value.resourceId
        params[0].videoLength = recordLocalUploadFormState.videoDuration
      } else { // 新增
        if (recordLocalUploadLabel.value === 'polyway') {
          getDuration(attachmentPath).then(res => {
            if (res.data.code === 200) {
              if (res.data.data.length) {
                params[0].videoLength = getVideoLength(res.data.data[0].duration)
                PrepareCourseApi.batchSaveCourseSectionFile(params).then(res => {
                  if (res.data.status === 201) {
                    const field = !isRecordLocalUploadEdit.value ? 'addCode' : 'modify'
                    CommonApi.statisticsLog({
                      name: (!isRecordLocalUploadEdit.value ? '新增' : '编辑') + '录播视频',
                      actionCode: STATISTICALRULES.packetInfo['learnSet-record-action'][field],
                      content: JSON.stringify(params)
                    })
                    getHandoutFiles()
                    recordLocalUploadVisible.value = false
                  }
                })
              } else {
                message.warning('请填写正确的视频ID')
              }
            }
          })
          return
        } else {
          if (!recordLocalUploadFormState.videoDuration) {
            message.warning('请输入视频时长')
            return
          }
          params[0].videoLength = recordLocalUploadFormState.videoDuration
        }
      }
      PrepareCourseApi.batchSaveCourseSectionFile(params).then(res => {
        if (res.data.status === 201) {
          const field = !isRecordLocalUploadEdit.value ? 'addCode' : 'modify'
          CommonApi.statisticsLog({
            name: (!isRecordLocalUploadEdit.value ? '新增' : '编辑') + '录播视频',
            actionCode: STATISTICALRULES.packetInfo['learnSet-record-action'][field],
            content: JSON.stringify(params)
          })
          getHandoutFiles()
          recordLocalUploadVisible.value = false
        }
      })
    }).catch((error: ValidateErrorEntity<FormState>) => {
      console.log('error', error)
    })
  }
  /**
   * 视频上传弹框
   * @param label 本地/保利威/展示互动
   * @param reset 新增/修改
   * @param data  HandoutItem
   */
  const videoUpload = (label: 'localVideo' | 'polyway' | 'showInteraction', reset = true, data?: TaskDataType) => {
    isRecordLocalUploadEdit.value = !reset
    recordLocalUploadLabel.value = label
    recordLocalUploadData.value = data || {}
    getTeacher()
    if (reset) {
      recordLocalUploadFormState.videoUrl = ''
      recordLocalUploadFormState.videoType = '1'
      recordLocalUploadFormState.attachmentName = ''
      recordLocalUploadFormState.authorId = ''
      recordLocalUploadFormState.seq = 1
      recordLocalUploadFormState.id = ''
      recordLocalUploadFormState.videoDuration = 1
      recordLocalUploadFormState.seq = (handoutsRecording.value[0] && handoutsRecording.value[0].seq) ? (handoutsRecording.value[0].seq + 1) : 1
    }
    recordLocalUploadFileList.value = []
    recordLocalUploadVisible.value = true
  }

  /**
   * 保利威上传
   */
  const recordLocalUploadCustomRequest = () => {
    return (args: UploadXHRArgs) => {
      uploadPolywayInstane.uploadPolyway(args).then(({ mp4, vid, duration }) => {
        recordLocalUploadFormState.videoUrl = vid
        recordLocalUploadFormState.videoDuration = getVideoLength(duration) || 1
        recordLocalUploadFormState.attachmentName = recordLocalUploadFileList.value[0].name.split('.')[0]
        recordLocalUploadFileList.value[0].thumbUrl = process.env.VUE_APP_OSS_URL + '/common/video.png'
      }).catch((err) => {
        console.log(err)
        message.error('上传出错，请稍后再试')
      })
    }
  }

  /**
   * 移除
   */
  const removeRecordLocalUploadFileList = () => {
    recordLocalUploadFormState.videoUrl = ''
    recordLocalUploadFormState.videoDuration = 1
    return true
  }

  return {
    editRecord,
    videoUpload,
    isRecordLocalUploadEdit,
    recordLocalUploadVisible,
    confirmRecordLocalUpload,
    recordLocalUploadFormRef,
    recordLocalUploadFormState,
    recordLocalUploadFormRules,
    teacherList,
    recordLocalUploadLabel,
    recordLocalUploadCustomRequest,
    removeRecordLocalUploadFileList
  }
}
