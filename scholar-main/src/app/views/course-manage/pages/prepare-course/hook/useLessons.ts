import { createVNode, reactive, ref } from 'vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/app/views/archives-manage/entity'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { Json } from '@/common/base'
import { message, Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'

export function useLessons (packetInfo) {
  const listOfDataTable = ref<Json[]>([])
  const lessonCount = ref(1)
  const editLessonFormRef = ref()
  const editLessonVisible = ref(false)
  const editLessonData = ref<Json>({})
  const editLessonFormState = reactive({
    name: ''
  })
  const editLessonFormRules = {
    name: [
      {
        required: true, message: '课次名称不能为空', trigger: 'change'
      },
      {
        min: 0, max: 25, message: '课次名称不能超过25个字符', trigger: 'change'
      },
      { whitespace: true, message: '课次名称不能为空', trigger: 'change' }
    ]
  }
  const editLessonConfirm = () => {
    editLessonFormRef.value.validate().then(() => {
      const params = {
        id: editLessonData.value.id,
        name: editLessonFormState.name,
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        seq: editLessonData.value.seq
      }
      PrepareCourseApi.newLessons(params).then(res => {
        if (res.data.status === 201) {
          CommonApi.statisticsLog({
            name: '编辑课次',
            actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].modify,
            content: JSON.stringify(params)
          })
          editLessonVisible.value = false
          getLessonCountTableList()
        }
      })
    }).catch((error: ValidateErrorEntity<FormState>) => {
      console.log('error', error)
    })
  }

  /**
   * 新增课次
   */
  const newLessons = () => {
    if (listOfDataTable.value.length >= 200) {
      message.warning('课次最多只能新增200个')
      return
    }
    const seq = ToolsUtil.getMaxSeq(listOfDataTable.value.filter(item => item.seq))
    const params = {
      name: '第' + seq + '课次',
      courseId: packetInfo.courseId,
      coursePacketId: packetInfo.id,
      seq
    }
    PrepareCourseApi.newLessons(params).then(res => {
      if (res.data.status === 201) {
        CommonApi.statisticsLog({
          name: '新增课次',
          actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].addCode,
          content: JSON.stringify(params)
        })
        getLessonCountTableList()
      }
    })
  }
  /**
   * 生成课次
   */
  const generateLessons = () => {
    if (listOfDataTable.value.length) {
      generateLessonsAlert()
    } else {
      generateLessonsReal()
    }
  }
  /**
   * 生成课次弹框
   */
  const generateLessonsAlert = () => {
    Modal.confirm({
      title: '提示',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '重新生成课次会覆盖已生成的课次，确定重新生成吗？',
      onOk () {
        return generateLessonsReal()
      }
    })
  }
  /**
   * 修改课次
   */
  const generateLessonsReal = () => {
    return new Promise((resolve, reject) => {
      PrepareCourseApi.lessonPackage(packetInfo.id, lessonCount.value, packetInfo.courseId).then(res => {
        if (res.data.status === 201) {
          CommonApi.statisticsLog({
            name: '生成课次',
            actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].addCode,
            content: JSON.stringify({ coursePacketId: packetInfo.id, lessonCount: lessonCount.value, courseId: packetInfo.courseId })
          })
          getLessonCountTableList()
          resolve(true)
        } else {
          reject(new Error(res.data.message))
        }
      }).catch(err => reject(err))
    })
  }
  /**
   * 编辑课次
   */
  const editLesson = (data) => {
    editLessonVisible.value = true
    editLessonData.value = data
    editLessonFormState.name = data.name
  }
  /**
   * 删除课次
   * @param id
   */
  const delLesson = (id) => {
    Modal.confirm({
      title: '删除',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '确定删除该课次吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.delLessonPackage(id).then(res => {
            if (res.data.status === 204) {
              CommonApi.statisticsLog({
                name: '删除课次',
                actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].delCode,
                content: id
              })
              getLessonCountTableList()
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
   * 获取课次列表
   */
  const getLessonCountTableList = () => {
    PrepareCourseApi.getLessonPackageTable(packetInfo.id).then(res => {
      if (res.data.status === 200) {
        if (res.data.data && res.data.data.length) {
          res.data.data.forEach((item, ii) => {
            res.data.data[ii].index = ii + 1
          })
          listOfDataTable.value = res.data.data.map(item => { item.key = item.id; return item })
          lessonCount.value = res.data.data.length
        } else {
          listOfDataTable.value = []
          lessonCount.value = 1
        }
        SessionStorageUtil.putPacketInfoItem('lessonCount', lessonCount.value)
      }
    })
  }
  // getLessonCountTableList()
  return {
    editLessonFormRef,
    editLessonVisible,
    editLessonConfirm,
    editLessonFormState,
    editLessonFormRules,
    getLessonCountTableList,
    delLesson,
    editLesson,
    generateLessons,
    newLessons,
    listOfDataTable,
    lessonCount
  }
}
