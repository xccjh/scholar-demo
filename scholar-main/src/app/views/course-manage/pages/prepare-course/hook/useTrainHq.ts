import { createVNode, reactive, ref } from 'vue'
import { HqItem } from '@/app/views/course-manage/pages/prepare-course/entity'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/common/base'

export function useTrainHq (packetInfo) {
  const hqOn = ref(packetInfo.isHqTrain === '1')
  const hqLists = ref<HqItem[]>([])
  const isEditTrainHq = ref(false)
  const currentTrainHq = ref<Partial<HqItem>>({})
  const trainHqVisible = ref(false)
  const trainHqFromRef = ref()
  const trainHqFromState = reactive<{
    accountHqId?:string
    name?:string
  }>({
    accountHqId: '',
    name: ''
  })
  const trainHqFromRules = {
    name: [
      { required: true, message: '实训名称不能为空', trigger: 'change' },
      { whitespace: true, message: '实训名称不能为空', trigger: 'change' },
      { min: 0, max: 40, message: '实训名称不能超过40个字符', trigger: 'change' }
    ],
    accountHqId: [
      { required: true, message: '账套ID不能为空', trigger: 'change' },
      { whitespace: true, message: '账套ID不能为空', trigger: 'change' },
      { min: 0, max: 40, message: '账套ID不能超过40个字符', trigger: 'change' }
    ]
  }

  /**
   * 开启恒企实训
   * @param val
   */
  const hqOnChange = (val: boolean) => {
    const flag = val ? '1' : '0'
    packetInfo.isHqTrain = flag
    PrepareCourseApi.packageInfoUpdate({ id: packetInfo.id, isHqTrain: flag }).then(
      res => {
        if (res.data.status === 201) {
          if (flag === '1') {
            getHqlist()
          }
          SessionStorageUtil.putPacketInfoItem('isHqTrain', flag)
        }
      }
    )
  }
  /**
   * 新增恒企实训列表
   */
  const trainHqConfirm = () => {
    trainHqFromRef.value.validate().then(() => {
      const params = {
        id: currentTrainHq.value.id,
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        name: trainHqFromState.name,
        accountHqId: trainHqFromState.accountHqId,
        seq: currentTrainHq.value.seq || ToolsUtil.getMaxSeq(hqLists.value),
        status: 1
      }
      PrepareCourseApi.addCoursePacketHq(params).then(res => {
        if (res.data.status === 201) {
          // const edit = !!this.hqItem.id;
          // const field = edit ? 'modify' : 'addCode';
          // this.statisticsLogService.statisticsPacketInfoLog({
          //   name: edit ? '修改恒企实习系统实训信息' : '新增恒企实习系统实训',
          //   actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'][field],
          //   content: JSON.stringify(params),
          // });
          getHqlist()
          trainHqVisible.value = false
        }
      })
    }).catch((error: ValidateErrorEntity<{
      accountHqId?:string
      name?:string
    }>) => {
      console.log('error', error)
    })
  }
  /**
   * 删除实训
   * @param item
   */
  const deleteHq = (item) => {
    Modal.confirm({
      title: '删除实训',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: ('确定删除' + item.name + '实训吗？'),
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.hqDel(item.id).then(res => {
            if (res.data.status === 204) {
              getHqlist()
              // CommonApi.statisticsLog({
              //   name: '删除公司',
              //   actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'].delCode,
              //   content: item.id
              // })
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
   * 获取恒企实训列表
   */
  const getHqlist = () => {
    PrepareCourseApi.getHqlist(packetInfo.id).then(
      res => {
        if (res.data.status === 200) {
          hqLists.value = res.data.data
        }
      })
  }

  /**
   * 打开实训弹框
   * @param item
   */
  const addOrEditHq = (item) => {
    isEditTrainHq.value = !!item.id
    currentTrainHq.value = item || {}
    trainHqFromState.name = item.name || ''
    trainHqFromState.accountHqId = item.accountHqId || ''
    trainHqVisible.value = true
  }

  return {
    hqOnChange,
    trainHqConfirm,
    addOrEditHq,
    trainHqVisible,
    trainHqFromRules,
    isEditTrainHq,
    currentTrainHq,
    trainHqFromRef,
    trainHqFromState,
    hqOn,
    hqLists,
    getHqlist,
    deleteHq
  }
}
