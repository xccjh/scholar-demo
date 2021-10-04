import { FormState, PacketInfoListDataType } from '../entity'
import { Modal } from 'ant-design-vue'
import { createVNode, reactive, ref, UnwrapRef } from 'vue'
import { CloseCircleOutlined, QuestionOutlined } from '@ant-design/icons-vue/lib'
import { ScpListApi } from '../api'
import { SessionStorageUtil } from '@/common/utils'
import { Json } from '@/common/base'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { LabelManagementApi } from '@/app/views/course-manage/pages/label-management/api'

export function useTableOperate (userId, menuService, searchData, delIf, curEditData) {
  const groupingVisible = ref(false)
  const groupingLabels = ref<{ name: string; id: string }[]>([])
  const groupingFormRef = ref()
  const groupingFormState: UnwrapRef<Partial<{ series: string, packetVer: number }>> = reactive({
    series: '',
    packetVer: 1
  })
  const groupingFormRules: Json = {
    series: [
      { required: true, message: '请选择系列名称', trigger: 'blur' }
    ],
    packetVer: [
      { whitespace: true, message: '课包版本不能为空', trigger: 'blur', type: 'number' },
      { required: true, message: '课包版本不能为空', trigger: 'blur', type: 'number' },
      { min: 0, max: 50, message: '课包版本不能超过50个字符', trigger: 'change', type: 'number' }
    ]
  }
  /**
   * 获取系列下拉
   */
  const getPackageSeriesList = () => {
    ScpListApi.getPackageSeriesList({
      courseId: curEditData.value.courseId,
      page: 1,
      limit: 10000
    }).then(res => {
      if (res.data.status === 200) {
        groupingLabels.value = res.data.data
      }
    })
  }

  /**
   * 系列变更自动查询版本号
   * @param e
   */
  const seriesChange = (courseSeriesId) => {
    if (courseSeriesId) {
      ScpListApi.getVersionNumber({
        id: curEditData.value.id,
        courseSeriesId
      }).then(res => {
        if (res.data.status === 200) {
          groupingFormState.packetVer = res.data.data
        }
      })
    }
  }

  /**
   * 打开课包分组弹框
   * @param data PacketInfoListDataType
   */
  const grouping = (data: PacketInfoListDataType) => {
    curEditData.value = data
    getPackageSeriesList()
    groupingFormState.series = data.courseSeriesId
    // 新增自动计算最新版本号
    if (!data.packetVer) {
      ScpListApi.getVersionNumber({
        id: data.id,
        courseSeriesId: data.courseSeriesId
      }).then((res) => {
        if (res.data.status === 200) {
          groupingFormState.packetVer = res.data.data
          groupingVisible.value = true
        }
      })
    } else {
      // 编辑回显版本号
      groupingFormState.packetVer = data.packetVer
      groupingVisible.value = true
    }
  }

  /**
   * 保存课包分组设置
   */
  const groupingConfirm = () => {
    groupingFormRef.value.validate()
      .then(() => {
        ScpListApi.savePacket({
          id: curEditData.value.id,
          courseSeriesId: groupingFormState.series,
          packetVer: groupingFormState.packetVer
        }).then(res => {
          if (res.data.status === 201) {
            searchData()
            groupingVisible.value = false
          }
        })
      })
      .catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
  }

  /**
   * 标签设置
   */
  const testPeriodLabel = ref('')
  const testPeriodLabelList = ref([])
  const phaseLabel = ref('')
  const phaseLabelList = ref([])
  const labelSetPkgInfo = ref<Json>({})
  const labelSetVisible = ref(false)
  /**
   * 获取标签列表下拉
   */
  const getLabelList = () => {
    return new Promise((resolve, reject) => {
      LabelManagementApi.getLabelList({
        majorId: labelSetPkgInfo.value.majorId,
        page: 1,
        limit: 10000,
        name: '',
        tagType: ''
      }).then((res) => {
        if (res.data.status === 200) {
          testPeriodLabelList.value = res.data.data.filter(item => item.tagType === '1')
          phaseLabelList.value = res.data.data.filter(item => item.tagType === '2')
          resolve(true)
        } else {
          testPeriodLabelList.value = []
          phaseLabelList.value = []
        }
      })
    })
  }
  /**
   * 标签设置确认
   */
  const labelSetConfirm = () => {
    if (testPeriodLabel.value || phaseLabel.value) {
      labelSetVisible.value = false
      searchData()
    } else {
      labelSetVisible.value = false
    }
  }

  /**
   * 标签设置弹框
   */
  const labelSet = (item) => {
    labelSetPkgInfo.value = item
    getLabelList().then(() => {
      labelSetVisible.value = true
    })
  }

  /**
   * 删除课包
   * @param record
   */
  const delPacketAction = (record: PacketInfoListDataType) => {
    if (delIf(record)) {
      Modal.confirm({
        title: '删除课包',
        icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
        content: '确定删除课包？',
        onOk () {
          return new Promise((resolve, reject) => {
            ScpListApi.delPacket(record.id, record.status).then((res) => {
              if (res.data.status === 204) {
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
  }

  /**
   * 课程建设
   * @param data PacketInfoListDataType
   */
  const goPrepare = (data: PacketInfoListDataType, preview?: boolean) => {
    SessionStorageUtil.putPacketInfo(data, preview)
    SessionStorageUtil.clearChapterSelection()
    SessionStorageUtil.putPkgType('pk')
    menuService.gotoUrl({
      title: '课包建设',
      url: '/m/course-manage/prepare-course',
      paramUrl: ''
    })
  }

  const feedbackStatistics = (data: PacketInfoListDataType) => {
    menuService.gotoUrl({
      title: '讲师反馈',
      url: '/m/course-manage/feedback-statistics',
      paramUrl: '?coursePacketId=' + data.id
    })
  }

  /**
   * 课包预览
   * @param data
   */
  const preview = (data: PacketInfoListDataType) => {
    goPrepare(data, true)
  }

  /**
   * 复制课包
   * @param data PacketInfoListDataType
   */
  const copyPacket = (data: PacketInfoListDataType) => {
    Modal.confirm({
      title: '课包复制',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '您确定复制' + data.name + '课包吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          ScpListApi.copyPacket(data.id).then((res) => {
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
   * 课包历史
   * @param data
   */
  const historyList = (data: PacketInfoListDataType) => {
    menuService.gotoUrl({
      url: '/m/course-manage/operation-log',
      title: '操作日志',
      paramUrl: '?pcode=' + data.pcode
    })
  }
  /**
   * 课包售卖
   * @param data
   */
  const lessonBuy = (data: PacketInfoListDataType) => {
    Modal.confirm({
      title: ((!data.isSale) || data.isSale === '0') ? '售卖' : '取消售卖',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: ((!data.isSale) || data.isSale === '0') ? `确定将“${data.name}”课包投入网校进行售卖吗 ？` : '该课包正在网校售卖，确定取消售卖吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          const isSale = ((!data.isSale) || data.isSale === '0') ? '1' : '0'
          ScpListApi.lessonBuy(data.id, isSale).then((res) => {
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
   * 课包使用
   * @param data
   */
  const usePacket = (data: PacketInfoListDataType) => {
    Modal.confirm({
      title: data.isUsed === '1' ? '取消启用' : '启用',
      icon: createVNode(QuestionOutlined, { style: { color: '#fab11f' } }),
      content: (data.isUsed === '1' ? '取消启用后，教务将不能再对该课包进行新的排课！' : '确定将“' + data.name + '"课包投入使用吗？启用后不能再对课包结构 、总课次、智适应开启/关闭 进行修改。'),
      onOk () {
        return new Promise((resolve, reject) => {
          const isUsed = data.isUsed === '1' ? '2' : '1'
          ScpListApi.startUse(data.id, isUsed).then((res) => {
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

  return {
    delPacketAction,
    labelSet,
    testPeriodLabel,
    testPeriodLabelList,
    phaseLabel,
    phaseLabelList,
    labelSetVisible,
    labelSetConfirm,
    labelSetPkgInfo,
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
  }
}
