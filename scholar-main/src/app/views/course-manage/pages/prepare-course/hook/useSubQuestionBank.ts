import { createVNode, reactive, ref } from 'vue'
import { Json, SeqIdStandard } from '@/common/base'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { loop, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { conversionNode } from '@/app/views/course-manage/pages/prepare-course/utils'

export function useSubQuestionBank (packetInfo) {
  const subQuestionBankMap = reactive<{
    otherSetSubQuestionBankCurrentPre: string[],
    otherSetSubQuestionBankIntCurrentPre: string[],
    otherSetSubQuestionBank: Json[],
    otherSetSubQuestionBankInt: Json[]
  }>({
    otherSetSubQuestionBankCurrentPre: [], // 配套题库绑定id回显缓存
    otherSetSubQuestionBankIntCurrentPre: [], // 智能抽题绑定id回显缓存
    otherSetSubQuestionBank: [], // 配套题库绑定列表
    otherSetSubQuestionBankInt: [] // 智能抽题绑定列表
  })
  const listSublibrary = ref<Json[]>([]) // 配套题库 + 智能抽题列表
  const subQuestionBankCurrent = ref<string[]>([]) // 配套题库绑定id回显
  const subQuestionBankIntCurrent = ref<string[]>([]) // 智能抽题绑定id回显

  const otherSetExam = ref<TreeDataItem[]>([]) // 配套题库子题库树
  const otherSetIntelligent = ref<TreeDataItem[]>([]) // 智能抽题子题库树
  const otherSetModuleArr = ref<Json[]>([]) // 配套题库模块列表
  let idMap: Json = {}

  const consolidationModuleCurrent = ref<number | null>(null) // 巩固模块
  const consolidationModuleCurrentPre = ref<number | null>(null) // 巩固模块
  const consolidationModuleList = ref<Json[]>([])
  /**
   * 绑定巩固模块
   */
  const consolidationModuleCurrentChange = (e) => {
    if (consolidationModuleCurrentPre.value) {
      PrepareCourseApi.delSubLibrary({ id: consolidationModuleList.value[0].id }).then(res => {
        if (res.data.status === 204) {
          if (e) {
            addConsolidationModule(e)
          }
        }
      })
    } else {
      if (e) {
        addConsolidationModule(e)
      }
    }
  }

  /**
   * 增加巩固模块
   * @param e
   */
  const addConsolidationModule = (e) => {
    loop(otherSetIntelligent.value, e, (node) => {
      PrepareCourseApi.callSubLibrary({
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        busType: '3',
        quebankId: e,
        quebankName: node.name,
        quebankType: 1,
        seq: 1,
        quebankModuleType: 1
      }).then(res => {
        if (res.data.status === 201) {
          getSubLibrary()
        }
      })
    })
  }
  /**
   * 子题库列表拖拽
   * @param e
   * @param label
   */
  const otherSetSubQuestionBankDrag = (e, label: 'otherSetSubQuestionBank' | 'otherSetSubQuestionBankInt') => {
    const params: Json[] = []
    const arr = subQuestionBankMap[label].map((item) => String(item.quebankId))
    subQuestionBankMap[label + 'CurrentPre'] = arr
    subQuestionBankMap[label + 'Current'] = JSON.parse(JSON.stringify(arr))
    subQuestionBankMap[label].forEach((item, i) => {
      params.push({
        id: item.id,
        seq: i
      })
    })
    PrepareCourseApi.sortSubQuestionBank(params)
  }

  /**
   * 获取配套题库列表
   */
  const getSubLibrary = () => {
    PrepareCourseApi.getSubLibrary({
      coursePacketId: packetInfo.id,
      quebankType: 1
    }).then((res) => {
      if (res.data.status === 200) {
        /**
         * 配套题库绑定列表+智能抽题绑定列表
         */
        listSublibrary.value = res.data.data
          .sort((a, b) => Number(a.quebankId) > Number(b.quebankId) ? 1 : Number(a.quebankId) < Number(b.quebankId) ? -1 : 0)

        subQuestionBankMap.otherSetSubQuestionBank = // 配套题库绑定列表
          listSublibrary.value.filter(e => e.busType === '1').sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0)
        subQuestionBankMap.otherSetSubQuestionBankCurrentPre = // 配套题库绑定id回显缓存
          subQuestionBankMap.otherSetSubQuestionBank.map((item) => String(item.quebankId))
        subQuestionBankCurrent.value = JSON.parse(JSON.stringify(subQuestionBankMap.otherSetSubQuestionBankCurrentPre)) // 配套题库绑定id回显

        subQuestionBankMap.otherSetSubQuestionBankInt = // 智能抽题绑定列表
          listSublibrary.value.filter(e => e.busType === '2').sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0)
        subQuestionBankMap.otherSetSubQuestionBankIntCurrentPre = // 智能抽题绑定id回显缓存
          subQuestionBankMap.otherSetSubQuestionBankInt.map((item) => String(item.quebankId))
        subQuestionBankIntCurrent.value = JSON.parse(JSON.stringify(subQuestionBankMap.otherSetSubQuestionBankIntCurrentPre)) // 智能抽题绑定id回显

        /**
         * 回显巩固练习
         */
        consolidationModuleList.value = res.data.data.filter(e => e.busType === '3')
        consolidationModuleCurrent.value = (consolidationModuleList.value && consolidationModuleList.value[0])
          ? Number(consolidationModuleList.value[0].quebankId) : null
        consolidationModuleCurrentPre.value = consolidationModuleCurrent.value
      }
    })
  }

  /**
   * 子题库新增删除
   * @param data
   * @param type
   */
  const otherSubQuestionBankChange = (data: number[], type: 'otherSetSubQuestionBank' | 'otherSetSubQuestionBankInt') => {
    if (data.length > subQuestionBankMap[type + 'CurrentPre'].length) {
      loop((type === 'otherSetSubQuestionBank' ? otherSetExam.value : otherSetIntelligent.value), data[data.length - 1], (node) => {
        PrepareCourseApi.callSubLibrary({
          courseId: packetInfo.courseId,
          coursePacketId: packetInfo.id,
          busType: type === 'otherSetSubQuestionBank' ? '1' : '2',
          quebankId: node.id,
          quebankName: node.name,
          quebankType: 1,
          seq: ToolsUtil.getMaxSeq(subQuestionBankMap[type]),
          quebankModuleType: type === 'otherSetSubQuestionBankInt' ? '1' : idMap[data[data.length - 1]] === 'EXAM' ? '2' : '1'
        }).then(res => {
          if (res.data.status === 201) {
            getSubLibrary()
          }
        })
      })
    } else {
      subQuestionBankMap[type + 'CurrentPre'].every((item, i) => {
        if (data.indexOf(item) < 0) {
          PrepareCourseApi.delSubLibrary({ id: subQuestionBankMap[type][i].id }).then(res => {
            if (res.data.status === 204) {
              getSubLibrary()
            }
          })
        } else {
          return true
        }
      })
    }
  }

  /**
   * 删除子题库
   * @param item
   */
  const delListSublibraryItem = (e, item) => {
    Modal.confirm({
      title: '删除子题库',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '确定删除该子题库吗?',
      onOk () {
        return new Promise((resolve, reject) => {
          if (!(Number(packetInfo.isUsed) > 0)) {
            PrepareCourseApi.delSubLibrary({
              id: item.id
            }).then(res => {
              if (res.data.status === 204) {
                getSubLibrary()
                resolve(true)
              } else {
                reject(new Error(res.data.message))
              }
            }).catch(err => reject(err))
          }
        })
      }
    })
  }

  /**
   * 获取子题库模块树和模块列表
   */
  const getSubQuestionBank = () => {
    PrepareCourseApi.getSubQuestionBank({
      courseCode: packetInfo.code,
      type: ''
    }).then(res => {
      if (res.data.code === 200) {
        if (res.data.data && res.data.data.length) {
          /**
           * 获取模块列表
           */
          let reduce = []
          const moduleArr = JSON.parse(JSON.stringify(res.data.data))
          moduleArr.forEach(itemX => {
            reduce = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'EXAM').concat(reduce)
          })
          otherSetModuleArr.value = reduce

          /**
           *  获取智能抽题树
           */
          const bak = JSON.parse(JSON.stringify(res.data.data))
          bak.forEach(itemX => {
            itemX.sublibraryModuleList = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'PRACTICE')
          })
          otherSetIntelligent.value =
            conversionNode(bak, 'exercise').sort((a, b) => a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0)

          /**
           * 获取idMap
           */
          const idMaps = {}
          res.data.data.forEach(itemY => {
            itemY.sublibraryModuleList.forEach(itemP => {
              idMaps[itemP.id] = itemP.type
            })
          })
          idMap = idMaps

          /**
           *  获取配套题库树
           */
          otherSetExam.value =
            conversionNode(res.data.data, 'exam').sort((a, b) => a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0)
        } else {
          otherSetExam.value = []
          otherSetIntelligent.value = []
          otherSetModuleArr.value = []
        }
      }
    })
  }

  return {
    subQuestionBankMap,
    getSubQuestionBank,
    subQuestionBankCurrent,
    subQuestionBankIntCurrent,
    otherSubQuestionBankChange,
    otherSetExam,
    otherSetIntelligent,
    delListSublibraryItem,
    getSubLibrary,
    otherSetSubQuestionBankDrag,
    consolidationModuleCurrent,
    consolidationModuleCurrentChange
  }
}
