import { SeriesListDataType } from '../entity'
import { reactive, ref } from 'vue'
import { Json } from '@/common/base'
import { findAll } from '@/common/utils'
import { message } from 'ant-design-vue'
import { SeriesManagementApi } from '../api'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/app/views/archives-manage/entity'

export function useSeriesOperate (departmentBulletFormState, searchData, courseList, tableState, storingData) {
  const curEditData = ref<Json>({})
  const isEdit = ref(false)
  const departmentBulletFormRef = ref()
  const departmentBulletVisible = ref(false)
  const departmentBulletFormRules = {
    name: [
      { whitespace: true, message: '系列名称不能为空', trigger: 'blur' },
      { required: true, message: '系列名称不能为空', trigger: 'blur' },
      { min: 0, max: 25, message: '系列名称不能超过25个字符', trigger: 'change' }
    ],
    ruleType: [
      { required: true, message: '排课规则不能为空', trigger: 'blur' }
    ],
    courseId: [
      { required: true, message: '所属课程不能为空', trigger: 'blur' }
    ]
  }
  /**
   * 新增编辑系列
   * @param data
   */
  const seriesOpterate = (data:SeriesListDataType) => {
    isEdit.value = !!data.id
    curEditData.value = data
    departmentBulletVisible.value = true
    departmentBulletFormState.name = data.name || ''
    departmentBulletFormState.ruleType = data.ruleType || '1'
    departmentBulletFormState.courseId = data.courseId || courseList.value[0]?.id || ''
  }

  /**
   * 保存系类信息
   */
  const departmentBulletConfirm = () => {
    departmentBulletFormRef.value
      .validate()
      .then(() => {
        const nameArr = tableState.data.map((item) => item.name)
        if (isEdit.value) {
          const currentIndex = tableState.data.findIndex(e => e.name === curEditData.value.name)
          const allIndexArr = findAll(nameArr, departmentBulletFormState.name)
          const allIndexArrfilter = allIndexArr.filter(e => e !== currentIndex)
          if (allIndexArrfilter.length > 0) {
            message.warning('该课程下已存在同名系列')
            return
          }
        } else {
          if (nameArr.indexOf(departmentBulletFormState.name) > -1) {
            message.warning('该课程下已存在同名系列')
            return
          }
        }
        const { courseId, name, ruleType } = departmentBulletFormState
        SeriesManagementApi.addOrEditSeries({
          courseId,
          name,
          ruleType,
          id: curEditData.value.id
        }).then((res) => {
          if (res.data.status === 201) {
            tableState.pageIndex = 1
            tableState.selectedVal = tableState.selectedValue = departmentBulletFormState.courseId
            storingData()
            searchData()
            departmentBulletVisible.value = false
          }
        })
      })
      .catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
  }

  return {
    curEditData,
    isEdit,
    departmentBulletVisible,
    departmentBulletFormState,
    departmentBulletFormRules,
    departmentBulletFormRef,
    seriesOpterate,
    departmentBulletConfirm
  }
}
