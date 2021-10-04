import { createVNode, reactive, ref } from 'vue'
import { FormState, Json } from '@/common/base'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { message, Modal } from 'ant-design-vue'
import { checkSameName, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { diffFileChange } from '@/app/views/course-manage/pages/prepare-course/utils'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'

export function useBreakthrough (packetInfo, menuService) {
  const breakthroughMode = ref(packetInfo.isCard === '1')
  const levelLists = ref<Json[]>([])
  const moduleArr = ref<Json[]>([])
  const paperArr = ref<Json[]>([])
  const paperIdToName: { [key: number]: any } = {}
  const examIdToPaperUUId: { [key: number]: any } = {}
  const levelModalVisible = ref(false)
  const isEditLevel = ref(false)
  const totalTestPaperScore = ref(0)
  const currentLevel = ref<Json>({})
  const levelFromRef = ref()
  const levelFromState = reactive<{
    newLevel?: number,
    testPaperName?: number,
    complianceConditions?: number
  }>({
    newLevel: undefined,
    testPaperName: undefined,
    complianceConditions: undefined
  })
  const levelFromRules = {
    newLevel: [
      {
        required: true, message: '模块名称不能为空', trigger: 'change', type: 'number'
      }
    ],
    testPaperName: [
      {
        required: true, message: '试卷名称不能为空', trigger: 'change', type: 'number'
      }
    ],
    complianceConditions: [
      {
        required: true, message: '达标条件不能为空', trigger: 'change', type: 'number'
      },
      { whitespace: true, message: '达标条件不能为空', trigger: 'change', type: 'number' }
    ]

  }
  const rewardSetVisible = ref(false)
  const rewardSetFileList = ref<FileItem[]>([])
  let rewardSetFileListBak = []

  /**
   * 新增奖励设置
   */
  const rewardSetConfirm = () => {
    if (!rewardSetFileList.value.length) {
      message.warning('请先上传文件')
      return
    }
    const params: Json[] = []
    rewardSetFileList.value.forEach((itemP, iP) => {
      const param: any = {
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        coursePacketCardId: currentLevel.value.id,
        seq: iP,
        id: itemP.id
      }
      if (itemP.response) {
        param.attachmentPath = ToolsUtil.getOssUrl(itemP.response.objectName, false)
      }
      if (itemP.originFileObj) {
        param.title = itemP.originFileObj.name
      }
      params.push(param)
    })
    PrepareCourseApi.levelInfoBatchUpload(params).then(res => {
      if (res.data.status === 201) {
        if (diffFileChange(rewardSetFileList.value, rewardSetFileListBak)) {
          CommonApi.statisticsLog({
            name: '关卡奖励设置本地上传',
            actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].modify,
            content: JSON.stringify(params)
          })
        }
        getLevelList()
        rewardSetVisible.value = false
      }
    })
  }
  /**
   * 奖励设置资源调用
   */
  const rewardSetResourceCall = () => {
    SessionStorageUtil.putScpResourceMaterial({
      type: 'scp-section-handout',
      professionId: packetInfo.professionId,
      sectionInfo: {
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        coursePacketCardId: currentLevel.value.id
      },
      seq: ToolsUtil.getMaxSeq(rewardSetFileList.value),
      nodes: rewardSetFileList.value.map(el => {
        return {
          taskId: el.id,
          id: el.resourceId
        }
      }),
      isStandard: packetInfo.isUsed > 0 ? '1' : '',
      limit: 100000
    })
    SessionStorageUtil.removeReadtree()
    menuService.gotoUrl({
      url: '/m/rm/read',
      paramUrl: '?from=scp&task=2&reward=1'
    })
  }

  /**
   * 奖励设置弹框
   */
  const rewardSettings = (item) => {
    if (item.coursePacketCardRecourseList && item.coursePacketCardRecourseList.length) {
      item.coursePacketCardRecourseList.forEach((itemx) => {
        itemx.thumbUrl = null
        itemx.name = itemx.title
      })
    }
    currentLevel.value = item || {}
    rewardSetFileList.value = item.coursePacketCardRecourseList || []
    rewardSetFileListBak = JSON.parse(JSON.stringify(rewardSetFileList.value))
    rewardSetVisible.value = true
  }

  /**
   * 奖励文件上传校验
   * @param file
   * @param fileList
   */
  const rewardSetBeforeUpload = (file: FileItem, fileList: FileItem[]) => {
    return new Promise((resolve, reject) => {
      const fileType = ToolsUtil.getFileType(file.name)
      if ((fileType === 'excel' || fileType === 'word' || fileType === 'pdf' || fileType === 'ppt')) {
        const isLt100M = file.size! / 1024 / 1024 < 100
        if (!isLt100M) {
          const msg = '请保证文档类文件小于100MB!'
          message.warning(msg)
          reject(new Error(msg))
        }
      }

      if (file.name.length > 35) {
        const msg = file.name + '名称太长，文件名包含扩展名请保持35个字符以内'
        message.warning(msg)
        reject(new Error(msg))
      }

      if (!checkSameName(file.name, rewardSetFileList.value)) {
        const msg = '请不要重复上传，文件名重复'
        message.warning(msg)
        reject(new Error(msg))
      }
      resolve(fileList)
    })
  }

  /**
   * 试卷变更更新总分
   * @param examId
   */
  const testPaperNameChange = (examId?: number) => {
    if (examId) {
      paperArr.value.every((paper) => {
        if (paper.examId === examId) {
          totalTestPaperScore.value = paper.score
          if (totalTestPaperScore.value < levelFromState.complianceConditions!) {
            levelFromState.complianceConditions = totalTestPaperScore.value
          }
        } else {
          return true
        }
      })
    } else {
      totalTestPaperScore.value = 0
      levelFromState.complianceConditions = totalTestPaperScore.value
    }
  }
  /**
   * 保存关卡
   */
  const saveLevelOperate = () => {
    levelFromRef.value.validate().then(() => {
      const examId = levelFromState.testPaperName!
      const params = {
        id: currentLevel.value.id,
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        quebankId: levelFromState.newLevel,
        name: paperIdToName[examId],
        examId: examIdToPaperUUId[examId] + '-' + levelFromState.testPaperName, // paperUuid + examId
        passScore: levelFromState.complianceConditions,
        seq: currentLevel.value.seq || ToolsUtil.getMaxSeq(levelLists.value)
      }
      PrepareCourseApi.addCoursePacketCard(params).then(res => {
        if (res.data.status === 201) {
          const edit = !!currentLevel.value.id
          const field = edit ? 'modify' : 'addCode'
          CommonApi.statisticsLog({
            name: edit ? '修改关卡试卷' : '新增关卡',
            actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'][field],
            content: JSON.stringify(params)
          })
          getLevelList()
          levelModalVisible.value = false
        }
      })
    }).catch((error: ValidateErrorEntity<FormState>) => {
      console.log('error', error)
    })
  }

  /**
   * 新增编辑闯关
   * @param levelItem
   */
  const addOrEditLevel = (levelItem) => {
    isEditLevel.value = !!levelItem.id
    currentLevel.value = levelItem || {}
    PrepareCourseApi.getSubmodule({
      courseCode: packetInfo.code,
      type: ''
    }).then(res => {
      if (res.data.code === 200) {
        if (res.data.data) {
          let reduce = []
          if (res.data.data.length) {
            // 获取模块列表
            JSON.parse(JSON.stringify(res.data.data)).forEach(itemX => {
              reduce = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'EXAM').concat(reduce)
            })
            moduleArr.value = reduce
          } else {
            moduleArr.value = []
          }
          if (reduce.length) { // 有可用子模块
            const levelId = SessionStorageUtil.getSubmodule()
            // 回显模块（不会过期）
            levelFromState.newLevel = levelItem.id ? Number(levelItem.quebankId) : levelId ? Number(levelId) : moduleArr.value[0]?.id
            if (levelFromState.newLevel) { // 回显到了模块
              getPapers(false).then(() => { // 回显试卷
                if (levelItem.id) { // 编辑回显
                  levelFromState.complianceConditions = levelItem.passScore
                  levelFromState.testPaperName = Number(levelItem.examId.split('-')[1])
                } else { // 新增回显第一个
                  levelFromState.testPaperName = paperArr.value[0] ? Number(paperArr.value[0].examId) : undefined
                }
                // 新增一定存在除了没有可用试卷
                if (Object.keys(examIdToPaperUUId).length && levelFromState.testPaperName && examIdToPaperUUId[levelFromState.testPaperName]) {
                  // 试卷变更更新总分
                  testPaperNameChange(levelFromState.testPaperName)
                  levelModalVisible.value = true
                } else {
                  if (isEditLevel.value) {
                    message.warning('该试卷已过结束时间或取消发布了或被删除了，不支持编辑操作')
                  } else { // 新增没有可用试卷
                    levelModalVisible.value = true
                  }
                }
              })
            } else {
              if (isEditLevel.value) {
                message.warning('该试卷所在子题库模块不可用，请到开元智能题库系统检查不可用原因')
              } else {
                message.warning('该课包的课程没有可用的SEEAI考试类型的子题库模块，请到题库新加子题库模块再来新增关卡')
              }
            }
          } else {
            message.warning('该课包的课程没有可用的SEEAI考试类型的子题库模块，请到题库新加子题库模块再来新增关卡')
          }
        } else {
          message.warning('该课包的课程没有可用的SEEAI考试类型的子题库模块，请到题库新加子题库模块再来新增关卡')
        }
      }
    })
  }

  /**
   * 获取试卷下拉
   * @param change
   */
  const getPapers = (change: boolean) => {
    if (change) { // 记录缓存
      SessionStorageUtil.putSubmodule(levelFromState.newLevel!)
    }
    return new Promise((resolve, reject) => {
      PrepareCourseApi.getExamInfoByModuleId({
        sublibraryModuleIdList: [levelFromState.newLevel], pageNum: 1, pageSize: 10000
      }).then(res => {
        if (res.data.code === 200) {
          paperArr.value = res.data.data.rows
          if (change) { // 回显试卷
            levelFromState.testPaperName = (paperArr.value[0] && paperArr.value[0].examId) ? Number(paperArr.value[0].examId) : undefined
            levelFromRef.value.clearValidate()
            // 试卷变更更新总分
            if (levelFromState.testPaperName) {
              testPaperNameChange(levelFromState.testPaperName)
            }
          }
          paperArr.value.forEach(itemPaper => {
            paperIdToName[itemPaper.examId] = itemPaper.examName
            examIdToPaperUUId[itemPaper.examId] = itemPaper.paperUuid
          })
        } else {
          paperArr.value = []
        }
        resolve(true)
      }).catch(err => {
        paperArr.value = []
        reject(err)
      })
    })
  }

  /**
   * 删除奖励
   * @param item
   */
  const deleteGift = (item) => {
    Modal.confirm({
      title: '删除奖励',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '确定删除该资源吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.deleteLevelData(item.id).then((res) => {
            if (res.data.status === 204) {
              CommonApi.statisticsLog({
                name: '删除奖励',
                actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].delCode,
                content: item.id
              })
              getLevelList()
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
   * 删除关卡
   * @param item
   */
  const deleteLevel = (item) => {
    Modal.confirm({
      title: '删除关卡',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: packetInfo.status ? '删除该关卡将同步删除所有学员在此关卡上的所有闯关记录。' : '确定删除' + item.name + '关卡吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.deleteLevel(item.id).then((res) => {
            if (res.data.status === 204) {
              getLevelList()
              CommonApi.statisticsLog({
                name: '删除关卡',
                actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].delCode,
                content: item.id
              })
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
   * 闯关列表
   */
  const getLevelList = () => {
    PrepareCourseApi.getLevelList(packetInfo.id).then(
      res => {
        if (res.data.status === 200) {
          const levelList = res.data.data.sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0)
          levelList.forEach((item) => {
            if (item.coursePacketCardRecourseList) {
              item.coursePacketCardRecourseList =
                item.coursePacketCardRecourseList.sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0)
            }
          })
          levelLists.value = levelList
        }
      })
  }
  /**
   * 开启闯关
   * @param val
   */
  const breakthroughModeChange = (val: boolean) => {
    const flag = val ? '1' : '0'
    PrepareCourseApi.packageInfoUpdate({ id: packetInfo.id, isCard: flag }).then(
      res => {
        if (res.data.status === 201) {
          packetInfo.isCard = flag
          if (flag === '1') {
            getLevelList()
          }
          SessionStorageUtil.putPacketInfoItem('isCard', flag)
        }
      }
    )
  }

  return {
    breakthroughMode,
    addOrEditLevel,
    deleteGift,
    deleteLevel,
    rewardSettings,
    breakthroughModeChange,
    levelLists,
    moduleArr,
    paperArr,
    levelModalVisible,
    levelFromState,
    levelFromRules,
    levelFromRef,
    saveLevelOperate,
    isEditLevel,
    totalTestPaperScore,
    testPaperNameChange,
    rewardSetVisible,
    rewardSetFileList,
    rewardSetConfirm,
    rewardSetResourceCall,
    rewardSetBeforeUpload,
    getLevelList,
    getPapers
  }
}
