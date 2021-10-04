import { computed, reactive, ref, UnwrapRef } from 'vue'
import { FileItem, FormState, MemerDataType } from '../entity'
import { Json } from '@/common/base'
import { useCourseModal } from './useCourseModal'
import { compareArrayChange } from '@/common/utils'

export function useCourseInfo (route, courseInfo) {
  // 课包信息
  const formRef = ref()
  const formState: UnwrapRef<FormState> = reactive({
    courseMemberUserIdList: [],
    coverPath: '',
    introduction: '',
    id: route.params.courseId as string,
    exercisesAuditUserIdList: []
  })
  const rules = {
    courseMemberUserIdList: [
      { required: true, message: '请选择课程组成员', trigger: 'change', type: 'array' }
    ],
    introduction: [
      { required: true, message: '请填写课程简介', trigger: 'blur' },
      { whitespace: true, message: '请填写课程简介', trigger: 'blur' },
      { min: 0, max: 200, message: '学科名称不能超过200个字符', trigger: 'change' }
    ],
    coverPath: [
      { required: true, message: '请上传课程封面', trigger: 'change' }
    ]
  }
  const fileList = ref<FileItem[]>([])
  const detailRecordEnd = ref(false) // 初始化回显结束
  const state: UnwrapRef<Partial<MemerDataType>> = reactive({ // 课程成员信息
    initPage: true,
    roleArrBak: [],
    roleInitArr: [],
    nodesBak: [],
    nodesInit: [],
    roleArr: [],
    roleArrRevert: [],
    roleArrBakRevert: [],
    nodes: [],
    nodesRevert: [],
    nodesBakRevert: []
  })

  /**
   * 课程组成员列表
   * */
  const getMemberList = computed({
    get () {
      return (state.roleArr || []).filter(e => e.isSelected)
    },
    set (value) {
      const roleArr = JSON.parse(JSON.stringify(state.roleInitArr));
      (value as string[]).forEach(e => {
        roleArr.every(item => {
          if (item.id === e) {
            item.isSelected = true
          } else {
            return true
          }
        })
      })
      state.roleArr = roleArr
    }
  })

  /**
   * 习题审核成员列表
   * */
  const getAdustList = computed({
    get () {
      let listResult: Json[] = []
      const nodesArr = JSON.parse(JSON.stringify(state.nodes))
      if (nodesArr.length && detailRecordEnd.value) {
        const result = nodesArr.map(e => {
          e.teacherList = e.teacherList.filter(item => item.isSelected)
          return e
        }).filter(itemP => itemP.teacherList && itemP.teacherList.length)
        if (result.length) {
          result.forEach(itemL => {
            listResult = listResult.concat(itemL.teacherList)
          })
        }
      }
      return listResult
    },
    // 根据id过滤出数组
    set (data) {
      const nodesArr = JSON.parse(JSON.stringify(state.nodesInit));
      (data as string[]).forEach(e => {
        nodesArr.every(item => {
          return item.teacherList.every(itemInner => {
            if (e === itemInner.id) {
              itemInner.isSelected = true
            } else {
              return true
            }
          })
        })
      })
      state.nodes = nodesArr
    }
  })

  /**
   * 移除课程封面
   */
  const removeCourseCover = () => {
    fileList.value.length = 0
    formState.coverPath = ''
    formRef.value.validateFields(['coverPath'])
  }

  /**
   * 检查课程信息变更
   */
  const checkCourseInfoChange = () => {
    const { courseMemberUserIdList, introduction, exercisesAuditUserIdList, coverPath } = formState
    if (compareArrayChange(courseMemberUserIdList, courseInfo.bakCheck.courseMemberUserIdList) ||
      coverPath !== courseInfo.bakCheck.coverPath ||
      introduction !== courseInfo.bakCheck.introduction ||
      compareArrayChange(exercisesAuditUserIdList, courseInfo.bakCheck.exercisesAuditUserIdList)) {
      return true
    }
  }

  /**
   * 课程信息弹框
   */
  const {
    aduitStaffVisible,
    courseStaffVisible,
    aduitKey,
    courseKey,
    courseSearch,
    AduitSearch,
    removeAduitMember,
    addAduitMember,
    removeMember,
    addMember,
    aduitItemSelectInner,
    itemSelectInner,
    courseComfirm,
    courseCancel,
    auditCancel,
    auditComfirm,
    clickAduit
  } = useCourseModal(formRef, formState, state, getMemberList, getAdustList)

  return {
    /**
     * 课程表单
     */
    formRef,
    formState,
    rules,
    state, // 课程成员信息
    detailRecordEnd, // 初始化回显结束
    fileList, // 课程封面
    getMemberList, // 课程组成员列表
    getAdustList, // 习题审核成员列表
    removeCourseCover, // 移除课程封面
    checkCourseInfoChange, // 检查课程信息变更
    /**
     * 课程信息弹框
     */
    aduitStaffVisible,
    courseStaffVisible,
    aduitKey,
    courseKey,
    courseSearch,
    AduitSearch,
    removeAduitMember,
    addAduitMember,
    removeMember,
    addMember,
    aduitItemSelectInner,
    itemSelectInner,
    courseComfirm,
    courseCancel,
    auditCancel,
    auditComfirm,
    clickAduit
  }
}
