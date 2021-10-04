import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { message } from 'ant-design-vue'
import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { PreviewFileOption } from '@/common/base'
import { shared } from '@/common/services'
import { loop, showPreviewResourceModal, ToolsUtil } from '@/common/utils'

/**
 * 根据不同层级节点给出不同提示
 * @param node
 */
export const modalTip = (node: TreeDataItem): Promise<string> => {
  return new Promise((resolve) => {
    const kType = node.kType
    const children = node.children
    let text = ''
    if (kType === '2') {
      if (children && children.length) {
        const unitCount = children.length
        let pointCount = 0
        for (let index = 0; index < unitCount; index++) {
          const grandSon = children[index].children
          if (grandSon && grandSon.length) {
            pointCount += grandSon.length
          }
        }
        text = `删除章，将会导致该章下的${unitCount}个节${pointCount}个知识点一起删除，确定删除？`
      } else {
        text = '确定删除该章？'
      }
    } else if (kType === '3') {
      if (children && children.length) {
        text = `删除节，将会导致该节下的${children.length}个知识点一起删除，确定删除？`
      } else {
        text = '确定删除该节？'
      }
    } else {
      text = '确定删除该知识点？'
    }
    resolve(text)
  })
}

/**
 * 同级树阶点同名校验
 * @param title
 * @param id
 * @param nodes
 * @param kType
 */
export const hasAameTitle = (editName: string, id: string, nodes: TreeDataItem[] = [], kType: string) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].name === editName && id !== nodes[i].id) {
      showKtypeError(kType)
      return true
    }
  }
  return false
}
/**
 * 显示不同层级错误信息
 * @param kType
 */
export const showKtypeError = (kType: string) => {
  switch (Number(kType)) {
    case 1:
      message.warning('已存在同名课程')
      break
    case 2:
      message.warning('已存在同名章')
      break
    case 3:
      message.warning('已存在同名节')
      break
    case 4:
      message.warning('已存在同名知识点')
      break
    default:
      message.warning('该名称已存在')
  }
}
/**
 * 文件上传校验
 * @param file
 */
export const beforeUpload = (file: FileItem) => {
  return new Promise((resolve, reject) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.warning('请上传后缀名为jpg 、jpeg 、png的文件!')
      reject(new Error('请上传后缀名为jpg 、jpeg 、png的文件!'))
    }
    const isLt2M = file.size! / 1024 / 1024 < 2
    if (!isLt2M) {
      message.warning('请保证文件小于2MB!')
      reject(new Error('请保证文件小于2MB!'))
    }
    resolve(true)
  })
}

/**
 * 知识图谱下载
 */
export const templateDownload = () => {
  location.href = process.env.VUE_APP_OSS_URL + '/template/scholar/知识图谱导入模板.xls'
}

/**
 * 检查切换知识点是否有改动,更改了return true
 * @param node 树节点
 */
export const checkChange = (node: TreeDataItem, formStateKnowledge, learningMaterialsBak, explanationVideoBak) => {
  const { content, isDone, isFinal, isStable, isSprint, keyLevel, opsType } = node.value
  if ((content || '') !== formStateKnowledge.content ||
    (isFinal || false) !== formStateKnowledge.isFinal ||
    (isDone || false) !== formStateKnowledge.isDone ||
    (isStable || false) !== formStateKnowledge.isStable ||
    (opsType || 0) !== formStateKnowledge.opsType ||
    (keyLevel || 1) !== formStateKnowledge.keyLevel ||
    (isSprint || false) !== formStateKnowledge.isSprint ||
    attachmentDifferenceCheck(formStateKnowledge, learningMaterialsBak, explanationVideoBak)) {
    return true
  } else {
    return false
  }
}

/**
 * 附件变更检测，如果更改了return true
 */
export const attachmentDifferenceCheck = (formStateKnowledge, learningMaterialsBak, explanationVideoBak) => {
  const {
    learningMaterials,
    explanationVideo
  } = formStateKnowledge
  if (learningMaterials.length !== learningMaterialsBak.length || explanationVideo.length !== explanationVideoBak.length) {
    return true
  }
  let flag1 = false // 默认没改
  let flag2 = false // 默认没改
  if (learningMaterialsBak.length) {
    flag1 = learningMaterials.some((material) => { // 只要有一个改了 return true
      const checks: any = {}
      const checki: any = {}
      const checkArr = ['seq']
      checkArr.concat(['id']).forEach(item => {
        checks[item + 's'] = learningMaterialsBak.map(e => e[item])
        checki[item + 'i'] = checks[item + 's'].indexOf(material[item])
      })
      const Innerflag1 = Object.keys(checki).every(ev => { // 只要有一个改了return false
        return checki[ev] > -1
      })

      if (Innerflag1) { // 没改。需要继续校验对应项匹配
        return !(checkArr.every(evc => {
          return learningMaterialsBak[checki.idi][evc] === material[evc] // 只要有一个改了return true
        }))
      } else { // 改了，return true
        return true
      }
    })
  }

  if (!flag1 && explanationVideoBak.length) { // 如果学习资料没改，继续校验讲解视频,如果有一个改了 return true
    flag2 = explanationVideo.some((explanation, explanationI) => { // 只要有一个改了 return true
      const checks: any = {}
      const checki: any = {}
      const checkArr = ['attachmentName', 'seq', 'attachmentPath']
      checkArr.concat(['id']).forEach(item => {
        checks[item + 's'] = explanationVideoBak.map(e => e[item])
        checki[item + 'i'] = checks[item + 's'].indexOf(explanation[item])
      })
      const Innerflag1 = Object.keys(checki).every(evl => { // 只要有一个改了return false
        return checki[evl] > -1
      })
      if (Innerflag1) { // 没改。需要继续校验对应项匹配
        return !(checkArr.every(evcl => {
          return explanationVideoBak[checki.idi][evcl] === explanation[evcl] // 只要有一个改了return true
        }))
      } else { // 改了，return true
        return true
      }
    })
  }
  return flag2 || flag1 // 只要有一个true说明改了
}
/**
 * 知识图谱预览附件
 * */
export const previewItem = (itemFile) => {
  const option: Partial<PreviewFileOption> = {
    polywayId: '',
    furl: '',
    share: '0',
    native: '0',
    ow365: '0',
    title: itemFile.attachmentName,
    viewerId: shared.getUserInfo().id,
    orgCode: ToolsUtil.getOrgCode()
  }
  if (itemFile.attachmentPath?.indexOf('.') < 0) {
    option.polywayId = itemFile.attachmentPath
  } else {
    option.furl = itemFile.attachmentPath
  }
  showPreviewResourceModal(option)
}
/**
 * antd上传组件文件预览
 */
export const filePreview = (e) => {
  const option: Partial<PreviewFileOption> = {
    polywayId: '',
    furl: '',
    share: '0',
    native: '1',
    ow365: '0',
    title: e.name,
    viewerId: shared.getUserInfo().id,
    orgCode: ToolsUtil.getOrgCode()
  }
  if (e.response.polyway) {
    option.polywayId = e.response.vid
  } else {
    option.furl = ToolsUtil.getOssUrl(e.response.objectName)
  }
  showPreviewResourceModal(option)
}
