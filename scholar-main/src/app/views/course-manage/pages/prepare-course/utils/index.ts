import { LocalStorageUtil, queryParam, SessionStorageUtil, showPreviewResourceModal, ToolsUtil } from '@/common/utils'
import { AssocateItem, SectionDataType, TaskDataType } from '../entity'
import { Json, PacketInfo, PreviewFileOption } from '@/common/base'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { message } from 'ant-design-vue'
import { Ref } from 'vue'
import { PrepareCourseApi } from '../api'
import { shared } from '@/common/services'
import { CommonApi } from '@/app/api'
import { hexSha1 } from '@/common/utils/sha1'

/**
 *  过滤某一类型列表，比如讲义列表
 * @param type 类型
 */
export const getTypeData = (handouts: SectionDataType[], type: '101' | '102' | '103') => {
  const arr = handouts.filter(e => {
    return e.type === type
  }).map(ee => {
    const ext = ToolsUtil.getFileExt(ee.title)
    ee.aattachmentExt = Object.is(ext, ee.title) ? '' : ext
    ee.attachmentName = ee.title || ee.attachmentName
    ee.isMainFile = ee.isMainFile === '1'
    ee.isSummary = ee.isSummary === '1'
    return ee
  })
  arr.sort((a, b) => a.seq > b.seq ? -1 : a.seq < b.seq ? 1
    : a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0)
  return arr
}

/**
 * 转换章节树结构
 * @param nodes
 * @param isLeaf
 * @param chapterIdx
 */
export const transformChaperTreeNodes = (nodes: any[], isLeaf: boolean, chapterIdx: number): any[] => {
  return nodes.map((node, index) => {
    return {
      title: !isLeaf ? `第${index + 1}章   ${node.name}` : `${chapterIdx + 1}.${index + 1}节 ${node.name}`,
      key: node.id,
      selectable: !!isLeaf,
      index,
      isLeaf,
      ...node
    }
  })
}

// 任务类型：阅读任务(0)、案例任务(1)、作业任务(2)、实训任务(3)、考试任务(4)、实战任务(5)、问卷(6)、测评(7)
export const getDescType = (taskType: number) => {
  return [
    '阅读任务',
    '案例任务',
    '作业任务',
    '实训任务',
    '考试任务',
    '实战任务',
    '问卷',
    '测评'
  ][Number(taskType)].slice(0, 1)
}

export const getColor = (taskType: string) => {
  switch (taskType) {
    case '0':
      return '#f0a14d'
    case '1':
      return '#35ad8e'
    case '2':
      return '#b27fd7'
    case '3':
      return '#ecc13a'
    case '4':
      return '#33ade7'
    case '5':
      return '#5f88f2'
    case '6':
      return '#40a9ff'
    case '7':
      return '#567180'
  }
}

export const getFormingMethod = (type: number) => {
  switch (type) {
    case 1:
      return '选题组卷/录题组卷'
    case 2:
      return '题型难度'
    case 3:
      return '知识点难度抽题组卷'
    case 4:
      return '题型难度随机组卷'
  }
}

/**
 * 任务类型
 * @param type
 */
export function getText (type: string) {
  switch (String(type)) {
    case '0':
      return '读'
    case '1':
      return '例'
    case '2':
      return '作'
    case '3':
      return '训'
    case '4':
      return '考'
    case '5':
      return '战'
    case '6':
      return '问'
    case '7':
      return '测'
  }
}

/**
 * 获取考试任务类型描述
 * @param data
 */
export function getExamText (data: TaskDataType) {
  if (String(data.taskType) === '4') {
    return getExamType(data.paperType || '1') // 考试任务默认阶段考试
  } else {
    return ''
  }
}

/**
 * 任务信息
 * @param taskForm
 */
export function getTaskFormText (taskForm: string) {
  switch (taskForm) {
    case '0':
      return '【课前】'
    case '1':
      return '【课中】'
    case '2':
      return '【课后】'
  }
}

/**
 * 考试任务
 * @param item
 */
export function showExamType (item: TaskDataType) {
  return String(item.taskType) === '4'
}

/**
 * 作业任务
 * @param item
 * @constructor
 */
export function showJobType (item: TaskDataType) {
  return String(item.taskType) === '2'
}

/**
 * 考试任务类型
 * @param type
 */
export function getExamType (type) {
  switch (String(type)) {
    case '1' :
      return '【阶段考试】'
    case '2' :
      return '【单科考试】'
    case '3' :
      return '【模拟考试】'
    case '4' :
      return '【密押考试】'
    case '5' :
      return '【机考考试】'
    case '6' :
      return '【实操考试】'
  }
}

/**
 * 日志记录字段
 * @param type
 */
export const getField = (type: string) => {
  let field = ''
  if (type === '104') {
    field = 'learnSet-task-action'
  } else if (type === '101') {
    field = 'learnSet-lecture-action'
  } else if (type === '102') {
    field = 'learnSet-material-action'
  } else {
    field = 'learnSet-record-action'
  }
  return field
}

/**
 * 实训预览
 * @param item
 */
export const previewTrain = (item: TaskDataType) => {
  PrepareCourseApi.getAccountPeriodId(item.resourceId).then(res => {
    if (res.data.status === 200) {
      PrepareCourseApi.getPracticalDetail({
        id: item.resourceId,
        accountId: res.data.data.accountId
      }).then(resP => {
        if (resP.data.status === 200) {
          if (resP.data.data) {
            window.open(resP.data.data)
          }
        }
      })
    }
  })
}

/**
 * 预览资料类
 */
export const learnSetPreview = (item: SectionDataType | AssocateItem | TaskDataType) => {
  const option: Partial<PreviewFileOption> = {
    polywayId: '',
    furl: '',
    attachmentPath: '',
    share: '0',
    native: '0',
    ow365: '0',
    title: item.attachmentName || item.name,
    viewerId: shared.getUserInfo().id,
    orgCode: ToolsUtil.getOrgCode()
  }
  if (item.sourceType === '2' && item.attachmentPath?.indexOf('.') < 0) {
    option.polywayId = item.attachmentPath
  } else if (item.sourceType === '3') {
    option.attachmentPath = item.attachmentPath
  } else {
    option.furl = item.attachmentPath
  }
  showPreviewResourceModal(option)
}
/**
 * 预览案例
 * @param menuService
 * @param item
 */
export const previewCase = (menuService, item: TaskDataType) => {
  const url = '/m/rm/material-pre-case'
  const tabTitle = '预览案例'
  menuService.gotoUrl({
    url,
    paramUrl: `/${item.resourceId}/104/${item.courseChapterId}`,
    title: tabTitle
  })
}

/**
 * 预览试卷,作业,问卷,调研
 * @param item
 */
export const previewExaminationPaper = (item: TaskDataType, packetInfo: PacketInfo) => {
  ToolsUtil.getTkToken(tokenJson => {
    ToolsUtil.getCodeUid((uid) => {
      if (item.resourceId) {
        open(process.env.VUE_APP_questionBank + '#/paper/previewPaper?paperId=' + item.resourceId.split('-')[1] +
          '&token=' + tokenJson.token + '&refreshToken=' + tokenJson.refreshToken + '&proId=' + uid + '&courseCode=' + packetInfo.code)
      } else {
        open(process.env.VUE_APP_questionBank + '#/paper/previewPaper?paperId=' + item.id +
          '&token=' + tokenJson.token + '&refreshToken=' + tokenJson.refreshToken + '&proId=' + uid + '&courseCode=' + packetInfo.code)
      }
    })
  })
}

/**
 * 问卷枚举
 * @param evaluateId
 */
export const getQuestionnaireType = (evaluateId: '1' | '2') => {
  switch (evaluateId) {
    case '1':
      return '总部测评'
    case '2':
      return '校区测评'
  }
}

/**
 * 测评枚举
 * @param evaluateId
 */
export const getEvaluationType = (evaluateId: '1' | '2') => {
  switch (evaluateId) {
    case '1':
      return '招生测评'
    case '2':
      return '入学测评'
  }
}

/**
 * 问卷状态枚举
 * @param status
 */
export const getEvaluationStatus = (status: 1 | 2 | 3 | 4) => {
  switch (status) {
    case 1:
      return '未发布'
    case 2:
      return '已发布'
    case 3:
      return '已过期'
    case 4:
      return '未完成'
  }
}

/**
 * 子题库树节点数据转换
 * @param data 一个节点
 * @param label 类型
 */
export function conversionNode (data, label: 'exam' | 'exercise' | 'examSearch' | 'exerciseSearch') {
  if (data.length) {
    data.forEach((item, ii) => {
      if (item.sublibraryModuleList && item.sublibraryModuleList.length) {
        data[ii].children = item.sublibraryModuleList
        data[ii].children.forEach((child, iii) => {
          data[ii].children[iii].title = child.name
          data[ii].children[iii].key = child.id
          data[ii].children[iii].value = child.id
          data[ii].children[iii].isLeaf = true
        })
      }
      data[ii].title = item.name
      data[ii].key = item.sublibraryId
      data[ii].value = item.sublibraryId
      if (label === 'exam' || label === 'exercise') {
        data[ii].disabled = true
        data[ii].selectable = false
      }
      if (!item.sublibraryModuleList || !item.sublibraryModuleList.length) {
        data[ii].isLeaf = true
      }
    })
  }
  return data
}

/**
 * 编辑问卷测评考试作业
 * @param data
 */
export function otherEdit (data: TaskDataType) {
  ToolsUtil.getTkToken(tokenJson => {
    ToolsUtil.getCodeUid(uid => {
      const packetInfo = SessionStorageUtil.getPacketInfo()
      PrepareCourseApi.saveTkDefaultCourse({
        proId: uid,
        courseCode: packetInfo.code,
        mobile: LocalStorageUtil.getUser().userName
      }).then(res => {
        if (res.data.code === 200) {
          let url: string
          const str = 'courseCode=' + packetInfo.code +
            '&proId=' + uid + '&token=' + tokenJson.token + '&refreshToken=' + tokenJson.refreshToken + '&paperId='
          if (data.taskType === '7') {
            url = process.env.VUE_APP_questionBank +
              '#/PaperEvaluation/List?' +
              str
          } else if (data.taskType === '6') {
            url = process.env.VUE_APP_questionBank +
              '#/PaperQuestionnaire/List?' +
              str
          } else {
            url = process.env.VUE_APP_questionBank +
              '#/paper/createPaper?' +
              str
          }
          if (data.resourceId) {
            url += data.resourceId.split('-')[1]
          } else {
            url += data.id
          }
          open(url)
        }
      })
    })
  })
}

/**
 * 获取试卷类型
 * @param type
 */
export const getType = (type: number) => {
  switch (type) {
    case 1:
      return '真题'
    case 2:
      return '模拟'
    case 3:
      return '原创'
    case 4:
      return '测试卷'
  }
}

/**
 * 获取录播标签
 * @param label
 * @param reset
 */
export const getLabel = (label: 'polyway' | 'localVideo' | 'showInteraction', reset: boolean): string => {
  if (reset) {
    return label === 'polyway' ? '保利威' : label === 'showInteraction' ? '展示互动' : '本地上传'
  } else {
    return '编辑信息'
  }
}

/**
 * 获取保利威视频时长
 * @param videoUrl
 */
export const getDuration = (videoUrl: string) => {
  const params: Json = {
    ptime: (new Date()).getTime(),
    vids: videoUrl
  }
  const sign = hexSha1(queryParam(params) + process.env.VUE_APP_secretkey).toUpperCase()
  params.sign = sign
  return PrepareCourseApi.getVideoLength(params, process.env.VUE_APP_userid)
}

/**
 * 根据标准视频格式时间转换分钟
 * @param duration
 */
export const getVideoLength = (duration: string): number => {
  let videoLength = 0
  const arr = duration.split(':')
  const hour = Number(arr[0])
  const minute = Number(arr[1])
  const second = Number(arr[2])
  if (hour > 0) {
    videoLength += hour * 60
  }
  if (minute > 0) {
    videoLength += minute
  }
  if (second > 0) {
    videoLength += 1
  }
  return videoLength
}

/**
 * 对比文件改动
 * @param nzFileList
 * @param nzFileListBak
 */
export const diffFileChange = (nzFileList, nzFileListBak) => {
  if (nzFileList.length !== nzFileListBak.length) {
    return true
  } else {
    if (nzFileList.length) {
      if (nzFileList.filter(e => e.id).length !== nzFileList.length) {
        return true
      }
    }
  }
}

/**
 * 展示绑定知识图谱数据
 * @param knowledgeUnits
 */
export function getBingData (knowledgeUnits: string) {
  const knoArr = knowledgeUnits.split(',')
  if (knoArr.length > 5) {
    knoArr.length = 5
    return knoArr.join(',') + ',...'
  } else {
    return knowledgeUnits
  }
}

/**
 *  taskForm
 * 课前(0)、课中(1)、课后(2)
 * taskType: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
 * 任务类型：阅读任务(0)、案例任务(1)、作业任务(2)、实训任务(3)、考试任务(4)、实战任务(5)、问卷(6)、测评(7)
 * @param item
 * @constructor
 */
export function showCheck (item) {
  return (Number(item.taskForm) === 2 && Number(item.taskType) === 2) ||
    (Number(item.taskType) === 4 && Number(item.paperType) === 6) ||
    (Number(item.taskType) === 6)
}

/**
 * 是否已绑定过
 * @param task
 */
export function showBind (task) {
  return task.linkId
}

/**
 * 获取任务名称最大长度
 * @param task
 */
export const getWidth = (task) => {
  const arr = [task.linkId, task.taskType === '4', task.taskType === '2', showCheck(task)]
  const length = arr.filter(item => !!item).length
  return length === 0 ? '100%' : length === 1 ? 'calc(100% - 56px)' : length === 2 ? 'calc(100% - 112px)' : length === 3 ? 'calc(100% - 168px)' : '100%'
}

/**
 * 获取任务提示文字
 * @param item
 */
export function getTaskTitle (item) {
  let title = item.name
  if (showExamType(item)) {
    title += getExamText(item)
  }
  if (showJobType(item)) {
    title += getTaskFormText(item.taskForm)
  }
  if (showCheck(item)) {
    title += '【考核】'
  }
  if (item.linkId) {
    title += '【已绑】'
  }
  return title
}
