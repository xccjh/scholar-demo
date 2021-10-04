import { reactive, Ref, ref, UnwrapRef } from 'vue'
import { Json } from '@/common/base'
import { ScpListApi } from '../api'
import { PacketInfoListDataType } from '../entity'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { ToolsUtil } from '@/common/utils'

export function useCampusTree (curEditData: Ref<Partial<PacketInfoListDataType>>) {
  const affiliatedCampusChecked = ref(false)
  const campusVisible = ref(false)
  const capmusFormRef = ref()
  const affiliatedCampusTreeData = ref<TreeDataItem[]>([])
  const campusFormState: UnwrapRef<{ ocodes: string[] }> = reactive({
    ocodes: []
  })
  const campusFormRules: Json = {
    ocodes: [
      { required: true, message: '所属校区不能为空', trigger: 'change', type: 'array' }
    ]
  }

  /**
   * 获取校区下拉树
   */
  const getCollegeList = () => {
    ScpListApi.getCollegeList('area').then(res => {
      if (res.data.status === 200) {
        affiliatedCampusTreeData.value = transformTreeData(res.data.data).filter(e => e.children.length)
        getCampusList()
      }
    })
  }
  /**
   * 增减校区授权树
   * @param e
   */
  const campusTreeChange = (value: string[], label: string[], extra: {
    allCheckedNodes: Json[],
    checked: boolean,
    preValue: { label: string, value: string }[],
    triggerNode: Json,
    triggerValue: string
  }) => {
    affiliatedCampusChecked.value = value.every((value, i) => {
      if (value.indexOf('AREA_') > -1) {
        return true
      }
    }) && value.length === affiliatedCampusTreeData.value.length
  }

  /**
   * 保存所属校区
   */
  const capmusConfirm = () => {
    capmusFormRef.value
      .validate()
      .then(() => {
        const params: any = {
          courseId: curEditData.value.courseId,
          coursePacketId: curEditData.value.id,
          orgCode: ToolsUtil.getOrgCode(),
          subCodes: ''
        }
        if (!affiliatedCampusChecked.value && campusFormState.ocodes.length) {
          params.subCodes = campusFormState.ocodes.map(item => {
            if (item.indexOf('AREA_') > -1) {
              return item.split('AREA_')[1]
            } else {
              return item
            }
          }).join(',')
        }
        ScpListApi.saveCampus(params).then(res => {
          if (res.data.status === 201) {
            campusVisible.value = false
          }
        })
      })
  }

  /**
   * 转换树数据
   * @param data
   */
  const transformTreeData = (data) => {
    const formatChildren = (children: any[]) => {
      if (!children || children.length === 0) {
        return []
      } else {
        return children.map(school => {
          return {
            key: school.oCode,
            value: school.oCode,
            title: school.orgName,
            isLeaf: true
          }
        })
      }
    }
    return data.map(area => {
      return {
        key: 'AREA_' + area.typeCode,
        value: 'AREA_' + area.typeCode,
        title: area.typeName,
        children: formatChildren(area.chlidren)
      }
    })
  }

  /**
   * 打开校区授权
   */
  const schoolDistrict = (data: PacketInfoListDataType) => {
    campusVisible.value = true
    curEditData.value = data
    getCollegeList()
  }
  /**
   * 同步校区授权数据
   */
  const getCampusList = () => {
    ScpListApi.getCampusList(curEditData.value.id!).then(res => {
      if (res.data.data && res.data.data.length) {
        campusFormState.ocodes = res.data.data.map(item => {
          if (affiliatedCampusTreeData.value.find(campusItem => (campusItem.value.split('AREA_')[1] === item))) {
            return 'AREA_' + item
          } else {
            return item
          }
        })
        affiliatedCampusChecked.value = false
      } else {
        const list: string[] = []
        affiliatedCampusTreeData.value.map(item => {
          if (item.children && item.children.length > 0) {
            item.children.map(it => {
              list.push(it.key as string)
            })
          }
        })
        campusFormState.ocodes = list
        affiliatedCampusChecked.value = true
      }
    })
  }
  /**
   * 全选校区
   */
  const affiliatedCampusCheckedChange = (e: {
    nativeEvent: Event,
    preventDefault: () => void,
    stopPropagation: () => void,
    target: {
      checked: boolean
      defaultChecked: boolean
      prefixCls: string
      type: string
    }
  }) => {
    affiliatedCampusChecked.value = e.target.checked
    if (affiliatedCampusChecked.value) {
      const list: string[] = []
      affiliatedCampusTreeData.value.forEach((item: TreeDataItem) => {
        if (item.children && item.children.length > 0) {
          item.children.map((it: TreeDataItem) => {
            list.push(it.key as string)
          })
        }
      })
      campusFormState.ocodes = list
    } else {
      campusFormState.ocodes = []
    }
  }
  return {
    affiliatedCampusChecked,
    campusVisible,
    capmusFormRef,
    affiliatedCampusTreeData,
    campusFormState,
    campusFormRules,
    getCollegeList,
    affiliatedCampusCheckedChange,
    getCampusList,
    schoolDistrict,
    capmusConfirm,
    campusTreeChange
  }
}
