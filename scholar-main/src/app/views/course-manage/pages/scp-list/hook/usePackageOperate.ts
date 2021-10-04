import { reactive, Ref, ref, toRaw, UnwrapRef } from 'vue'
import { FormState, PacketInfoListDataType } from '../entity'
import { Json } from '@/common/base'
import { ScpListApi } from '../api'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useCourseSubjectTypeData } from '@/app/views/course-manage/pages/scp-list/hook/useCourseSubjectTypeData'

export function usePackageOperate (curEditData: Ref<Partial<PacketInfoListDataType>>, courseMap, tableState, searchData, courseList) {
  const formRef = ref()
  const visible = ref(false)
  const isEdit = ref(false)
  const formState: UnwrapRef<Partial<FormState>> = reactive({
    id: '',
    name: '',
    teachType: '11',
    selectedCourse: '',
    courseSubjectTypeId: '', // 课程科目类型
    exerciseType: '1' // 做题模式
  })

  const formRules: Json = {
    name: [
      { whitespace: true, message: '课包名称不能为空', trigger: 'blur' },
      { required: true, message: '课包名称不能为空', trigger: 'blur' },
      { min: 0, max: 50, message: '课包名称不能超过50个字符', trigger: 'change' }
    ],
    teachType: [
      { required: true, message: '课包类型不能为空', trigger: 'change' }
    ],
    selectedCourse: [
      { required: true, message: '所属课程不能为空', trigger: 'change' }
    ],
    exerciseType: [
      { required: true, message: '做题模式不能为空', trigger: 'change' }
    ]
  }

  /**
   * nc课程科目类型
   */
  const {
    courseSubjectTypeData,
    getCourseSubjectTypeArr
  } = useCourseSubjectTypeData()
  /**
   * 新增编辑课包
   * */
  const startEdit = (data?: PacketInfoListDataType) => {
    isEdit.value = !!data
    curEditData.value = data || {}
    formState.id = data?.id
    formState.name = data?.name
    formState.teachType = data?.teachType
    formState.exerciseType = data?.exerciseType
    visible.value = true
    formState.selectedCourse = ''
    if (isEdit.value) {
      courseList.value.every(course => {
        if (course.id === data!.courseId) {
          formState.selectedCourse = data!.courseId
        } else {
          return true
        }
      })
    }
    formState.courseSubjectTypeId = ''
    getCourseSubjectTypeArr().then(courseSubjectTypeArr => {
      if (isEdit.value) {
        courseSubjectTypeArr.every(courseSubjectType => {
          if (courseSubjectType.VALUE === data!.courseSubjectTypeId) {
            formState.courseSubjectTypeId = data?.courseSubjectTypeId
          } else {
            return true
          }
        })
      }
    })
  }

  /**
   * 课包保存
   * */
  const confirm = () => {
    formRef.value
      .validate()
      .then(() => {
        const postData: Json = toRaw(formState)
        postData.courseId = formState.selectedCourse
        postData.majorId = courseMap.courseMapMajorId[postData.courseId]
        postData.courseCode = courseMap.courseMapCourseCode[postData.courseId]
        ScpListApi.savePacket(postData).then((res) => {
          if (res.data.status === 201) {
            tableState.pageIndex = 1
            searchData()
            visible.value = false
          }
        })
      })
      .catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
  }

  return { confirm, startEdit, formRef, visible, isEdit, formState, formRules, courseSubjectTypeData }
}
