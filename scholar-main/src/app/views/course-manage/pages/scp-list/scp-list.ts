import { computed, createVNode, defineComponent, nextTick, onErrorCaptured, ref, toRefs } from 'vue'
import { getAuditStatus, getTeacheType, LocalStorageUtil, ToolsUtil } from '@/common/utils'
import { useStore } from 'vuex'
import { Modal, TreeSelect } from 'ant-design-vue'
import { PacketInfoListDataType } from './entity'
import { MenuServiceKey } from '@/common/services'
import { useRequiredInject } from '@/common/hooks'
import {
  useCampusTree,
  useConditionJudgment,
  useCourseList,
  useDynamicButton,
  usePackageOperate,
  useScpTable,
  useTableOperate
} from './hook'
import { Key } from 'ant-design-vue/es/_util/type'
import { InfoCircleOutlined } from '@ant-design/icons-vue/lib'
import { ScpListApi } from '@/app/views/course-manage/pages/scp-list/api'
import { customColumn } from '@/common/constants'
import { getPacketTagsDesc } from '@/app/views/course-manage/pages/scp-list/utils'

const SHOW_PARENT = TreeSelect.SHOW_PARENT

export default defineComponent({
  name: 'scp-list',
  setup () {
    onErrorCaptured((e) => {
      console.log(e)
    })
    const orgCode = ToolsUtil.getOrgCode()
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const curEditData = ref<Partial<PacketInfoListDataType>>({})
    const menuService = useRequiredInject(MenuServiceKey)
    const userId = LocalStorageUtil.getUserId()

    const selectedRowKey = ref<Key[]>([])
    const hasSelected = computed(() => selectedRowKey.value.length > 0)
    const onSelectChange = (selectedRowKeys: Key[]) => {
      selectedRowKey.value = selectedRowKeys
    }
    const customColumnVisibleCheckBoxClick = () => {
      nextTick(() => {
        customColumnVisible.value = true
      })
    }
    const customColumnVisible = ref(false)
    const customColumnValue = ref(LocalStorageUtil.getCustomColumnValue())
    const customColumnValueChange = () => {
      LocalStorageUtil.putCustomColumnValue(customColumnValue.value)
    }
    const showColumn = (label) => {
      return customColumnValue.value.indexOf(label) > -1
    }

    /**
     * ????????????
     * @param e
     */
    const batchSale = (e) => {
      const param: {
        id?: string | number,
        isSale?: '0' | '1'
      }[] = []
      selectedRowKey.value.forEach(id => {
        param.push({
          id,
          isSale: e.key
        })
      })
      Modal.confirm({
        title: (e.key === '1') ? '????????????' : '??????????????????',
        icon: createVNode(InfoCircleOutlined, { style: { color: '#21b8ff' } }),
        content: `??????????????????${selectedRowKey.value.length}?????????${e.key === '1' ? '????????????????????????' : '????????????'}??? ???`,
        onOk () {
          return new Promise((resolve, reject) => {
            ScpListApi.batchPkgOperate(param).then((res) => {
              if (res.data.status === 201) {
                searchData()
                resolve(true)
              } else {
                reject(new Error(res.data.message))
              }
            }).catch((err) => reject(new Error(err)))
          })
        }
      })
    }
    /**
     * ????????????
     * @param e
     */
    const batchUse = (e) => {
      const param: {
        id?: string | number,
        isUsed?: '0' | '1'
      }[] = []
      selectedRowKey.value.forEach(id => {
        param.push({
          id,
          isUsed: tableState.data.find(pkg => pkg.id === id)!.isUsed === '1' ? '2' : e.key
        })
      })
      Modal.confirm({
        title: (e.key === '1') ? '????????????' : '??????????????????',
        icon: createVNode(InfoCircleOutlined, { style: { color: '#21b8ff' } }),
        content: `??????????????????${selectedRowKey.value.length}?????????${e.key === '1' ? '????????????????????????' : '????????????'}??? ???`,
        onOk () {
          return new Promise((resolve, reject) => {
            ScpListApi.batchPkgOperate(param).then((res) => {
              if (res.data.status === 201) {
                searchData()
                resolve(true)
              } else {
                reject(new Error(res.data.message))
              }
            }).catch((err) => reject(new Error(err)))
          })
        }
      })
    }
    /**
     * ????????????
     */
    const {
      courseList,
      courseListSelect,
      courseMap
    } = useCourseList()

    /**
     * ????????????
     */
    const {
      searchList,
      resetData,
      storingData,
      tableState,
      searchData,
      getDate,
      pagination,
      courseSeriesNameSortOrder
    } = useScpTable()

    /**
     * ????????????
     */
    const {
      delIf,
      showEdit,
      joinSeriesJudgment,
      approvalling,
      statusIf,
      getDelCompetence,
      showUse
    } = useConditionJudgment(userId)
    /**
     * ??????????????????
     */
    const {
      affiliatedCampusChecked,
      campusVisible,
      capmusFormRef,
      affiliatedCampusTreeData,
      campusFormState,
      campusFormRules,
      affiliatedCampusCheckedChange,
      schoolDistrict,
      capmusConfirm,
      campusTreeChange
    } = useCampusTree(curEditData)

    /**
     * ??????????????????
     */
    const {
      confirm,
      startEdit,
      formRef,
      visible,
      isEdit,
      formState,
      formRules,
      courseSubjectTypeData
    } = usePackageOperate(curEditData, courseMap, tableState, searchData, courseList)

    /**
     * ????????????
     */
    const enterSeriesManagement = () => {
      menuService.gotoUrl({
        title: '????????????',
        url: '/m/course-manage/series-management',
        paramUrl: '?courseId=' + tableState.selectedValue
      })
    }

    /**
     * ????????????
     */
    const {
      labelSet,
      testPeriodLabel,
      testPeriodLabelList,
      phaseLabel,
      phaseLabelList,
      labelSetVisible,
      labelSetConfirm,
      labelSetPkgInfo,
      delPacketAction,
      grouping,
      usePacket,
      lessonBuy,
      historyList,
      copyPacket,
      preview,
      goPrepare,
      groupingVisible,
      groupingLabels,
      groupingFormRef,
      groupingFormState,
      groupingFormRules,
      seriesChange,
      groupingConfirm,
      feedbackStatistics
    } = useTableOperate(userId, menuService, searchData, delIf, curEditData)

    /**
     * ????????????????????????
     */
    const {
      getButtonTitle,
      initButton,
      methodChange
    } = useDynamicButton({
      startEdit,
      delPacketAction,
      preview,
      showEdit,
      showUse,
      goPrepare,
      copyPacket,
      historyList,
      lessonBuy,
      usePacket,
      schoolDistrict,
      grouping,
      joinSeriesJudgment,
      statusIf,
      feedbackStatistics,
      labelSet
    })

    return {
      loading,
      orgCode,
      userId,
      pagination,
      searchData,
      searchList,
      courseList,
      courseListSelect,
      resetData,
      storingData,
      getDate,
      curEditData,
      isEdit,
      startEdit,
      delPacketAction,
      confirm,
      visible,
      campusVisible,
      campusFormState,
      formState,
      campusFormRules,
      formRules,
      formRef,
      capmusFormRef,
      methodChange,
      initButton,
      getButtonTitle,
      getAuditStatus,
      getTeacheType,
      delIf,
      statusIf,
      approvalling,
      getDelCompetence,
      enterSeriesManagement,
      testPeriodLabel,
      testPeriodLabelList,
      phaseLabel,
      phaseLabelList,
      labelSetVisible,
      labelSetConfirm,
      labelSetPkgInfo,
      ...toRefs(tableState),
      ...toRefs(courseSubjectTypeData),
      ...toRefs(courseMap),
      // ????????????
      SHOW_PARENT,
      affiliatedCampusTreeData,
      affiliatedCampusChecked,
      affiliatedCampusCheckedChange,
      capmusConfirm,
      campusTreeChange,
      // ????????????
      groupingVisible,
      groupingLabels,
      groupingFormRef,
      groupingFormState,
      groupingFormRules,
      seriesChange,
      groupingConfirm,
      courseSeriesNameSortOrder,
      onSelectChange,
      selectedRowKey,
      batchSale,
      batchUse,
      hasSelected,
      customColumn,
      customColumnValue,
      showColumn,
      customColumnVisible,
      customColumnVisibleCheckBoxClick,
      customColumnValueChange,
      getPacketTagsDesc
    }
  }
})
