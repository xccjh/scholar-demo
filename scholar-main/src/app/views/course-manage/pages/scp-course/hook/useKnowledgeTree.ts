import { createVNode, nextTick, ref } from 'vue'
import { DropEvent, TreeDataItem, TreeDragEvent } from 'ant-design-vue/es/tree/Tree'
import { CoursePreviewApi } from '@/app/views/course-manage/pages/course-preview/api'
import {
  getCurParentToAncestorkey,
  getFirstNodeFinalKey,
  getParentKey,
  loop,
  randomString,
  removeTreeNode,
  ToolsUtil,
  uniArr
} from '@/common/utils'
import { ScpCourseApi } from '../api'
import { checkChange, hasAameTitle, modalTip } from '../utils'
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue/lib'
import { AxiosResponse } from 'axios'
import { CommonStructure, Json } from '@/common/base'

export function useKnowledgeTree (route, recoveryKnowledge, chapterWeight, attachmentInformation, formStateKnowledge, activedNode) {
  const expandedKeys = ref<string[]>([])
  const selectedKeys = ref<string[]>([route.params.knowledgeSubjectId as string])
  const searchValue = ref<string>('')
  const autoExpandParent = ref<boolean>(true)
  const treeData = ref<TreeDataItem[]>([])
  const totalWeight = ref(0)

  const onExpand = (keys: string[]) => {
    expandedKeys.value = keys
    autoExpandParent.value = false
  }
  /**
   * 初始化知识图谱树
   * */
  const getKnowledgeTree = (isDone: '' | '1' | '2' = '') => {
    CoursePreviewApi.getKnowledgeTree(route.params.knowledgeSubjectId, isDone).then(res => {
      if (res.data.status === 200) {
        totalWeight.value = 0
        treeData.value = [res.data.data]
        activedNode.value = res.data.data
        nextTick(() => {
          if (res.data.data.children && res.data.data.children.length) {
            expandedKeys.value = getCurParentToAncestorkey(getFirstNodeFinalKey([res.data.data]), treeData.value)
          } else {
            expandedKeys.value = [res.data.data.id]
          }
        })
        const { children } = res.data.data
        if (children && children.length) {
          children.filter((node) => (node.status !== '3')).forEach(rr => {
            totalWeight.value += rr.weight
          })
        }
      }
    })
  }

  /**
   * 知识图谱节点拖拽
   * @param info
   */
  const onDragEnter = (info: TreeDragEvent) => {
    // console.log(info)
    // expandedKeys 需要展开时
    // expandedKeys.value = info.expandedKeys
  }

  /**
   * 判断是否同级跨父级
   */
  const judgePeers = (dragNode, dropNode) => {
    if (dragNode.kType !== '1' && dropNode.kType !== '1') {
      const { parentNode: parentdragNode } = getParentKey(dragNode.id || dragNode.id.key, treeData.value)!
      const { parentNode: parentdropNode } = getParentKey(dropNode.id || dropNode.id.key, treeData.value)!
      if (parentdragNode && parentdropNode && (parentdragNode.id || parentdragNode.key) === (parentdropNode.id || parentdropNode.key)) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * 树节点拖拽
   * @param info
   */
  const onDrop = (info: DropEvent) => {
    if (info.dropToGap && // 禁止拖拽放节点
      info.dragNode.dataRef.kType === info.node.dataRef.kType && // 只能同级拖拽
      judgePeers(info.dragNode.dataRef, info.node.dataRef)
    ) {
      const dropKey = info.node.eventKey
      const dragKey = info.dragNode.eventKey
      const dropPos = info.node.pos.split('-')
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
      const data = [...treeData.value]
      // Find dragObject
      let dragObj: TreeDataItem = {}
      loop(data, dragKey, (item: TreeDataItem, index: number, arr: TreeDataItem[]) => {
        arr.splice(index, 1)
        dragObj = item
      })
      let ar: TreeDataItem[] = []
      let i = 0
      loop(data, dropKey, (item: TreeDataItem, index: number, arr: TreeDataItem[]) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }

      const { parentNode } = getParentKey(dropKey, data)!
      const postData = (parentNode.children || []).map((ele, idx) => ({
        id: ele.id,
        seq: idx + 1,
        kType: ele.kType
      }))
      let interfaceUrl = 'knowledge-point'
      if (info.dragNode.dataRef.kType === '3') {
        interfaceUrl = 'knowledge-unit'
      } else if (info.dragNode.dataRef.kType === '2') {
        interfaceUrl = 'knowledge-module'
      }
      ScpCourseApi.sortKnowledgeNode(postData, interfaceUrl).then(res => {
        if (res.data.status === 201) {
          treeData.value = data
        }
      })
    }
  }

  /**
   * 点击树节点
   * @param selectedKeys
   * @param e
   */
  const selectTree = (selectedKeys: string[], e: { selected: boolean, selectedNodes, node, event }) => {
    const currentNode = e.node.dataRef
    if (activedNode.value.id === currentNode.id) {
      return
    } else if (activedNode.value.isEdit) { // 处于编辑状态，失去焦点时，还原之前的状态
      cancelEdit({ dataRef: activedNode.value })
    }
    // 跳过选中当前编辑的节点
    let skipKey = ''
    if (selectedKeys[0] !== treeData.value[0].id) {
      const { parentKey } = getParentKey(selectedKeys[0], treeData.value)!
      skipKey = parentKey
    }
    // 新增节点自动移除
    expandedKeys.value.filter(key => key !== skipKey).forEach(validKey => {
      loop(treeData.value, validKey, (currentNode) => {
        if (currentNode.children && currentNode.children.length) {
          const lastNode = currentNode.children[currentNode.children.length - 1]
          if (lastNode.id.indexOf('qkc') > -1) {
            removeTreeNode(lastNode, treeData)
          }
        }
      })
    })
    if (activedNode.value.id.indexOf('qkc') < 0) { // 旧节点去除选中执行内容变更检测自动保存
      if (activedNode.value.kType === '2') {
        crossFlow(chapterWeight.value !== Number(activedNode.value.weight || 0), currentNode)
      } else if (activedNode.value.kType === '4') {
        crossFlow(checkChange(activedNode, formStateKnowledge, attachmentInformation.learningMaterialsBak, attachmentInformation.explanationVideoBak), currentNode)
      } else {
        const node = activedNode.value = e.node.dataRef
        recoveryKnowledge(node)
      }
    } else { // 新增的节点去除选中直接回显
      const node = activedNode.value = e.node.dataRef
      recoveryKnowledge(node)
    }
  }

  /**
   * 点击勾号
   * @param node
   */
  const confirmEdit = (node: TreeDataItem) => {
    const { editName, id, kType } = node.dataRef
    if (editName === '') {
      message.warning('数据不能为空')
      return
    }
    const { parentNode } = getParentKey(id, treeData.value)!
    if (
      hasAameTitle(
        editName,
        id,
        parentNode.children,
        kType
      )
    ) {
      return
    }
    node.dataRef.name = editName
    saveNode(node.dataRef).then(() => {
      activedNode.value = node.dataRef
      // expandedKeys.value = uniArr([...expandedKeys.value, node.id])
    })
  }

  /**
   * 点击叉符号
   * @param node
   */
  const cancelEdit = (node: TreeDataItem) => {
    node.dataRef.name = node.dataRef.cacheName
    node.dataRef.isEdit = false
    if (node.dataRef.id.indexOf('qkc') !== -1) {
      removeTreeNode(node.dataRef, treeData)
    }
  }

  /**
   * 点击编辑符号
   * @param node
   */
  const editNode = (node: TreeDataItem) => {
    node.dataRef.editName = node.dataRef.cacheName = node.dataRef.name
    node.dataRef.isEdit = true
  }

  /**
   * 点击删除符号
   * @param node
   */
  const delNode = (node: TreeDataItem): void => {
    modalTip(node.dataRef).then((text: string) => {
      Modal.confirm({
        title: '警告',
        content: text,
        icon: createVNode(ExclamationCircleOutlined),
        onOk () {
          return deleteNode(node)
        }
      })
    })
  }

  /**
   * 根据不同状态同步删除节点的状态信息
   * @param node
   */
  const deleteNode = (node: TreeDataItem): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      ScpCourseApi.delTreeNode({
        id: node.id || node.key,
        kType: node.kType
      }).then(
        (result: AxiosResponse<CommonStructure>) => {
          if (result.data.status === 204) {
            if (route.params.status === '0') { // 未审核直接删除
              removeTreeNode(node.dataRef, treeData)
              if (node.kType === '2') {
                totalWeight.value -= chapterWeight.value
              }
              if (result.status === 200) {
                message.success('删除成功')
              }
              // 删除后选中顶级节点
              nextTick(() => {
                selectedKeys.value = [treeData.value[0].id]
              })
              activedNode.value = treeData.value[0]
            } else {
              if (node.kType === '2') { // 章节点
                totalWeight.value -= chapterWeight.value
                if (node.status === '2') { // 已审核课包新增直接删除
                  removeTreeNode(node.dataRef, treeData)
                  // 删除后选中顶级节点
                  nextTick(() => {
                    selectedKeys.value = [treeData.value[0].id]
                  })
                  activedNode.value = treeData.value[0]
                } else { // 章节点删除确保节点下所有节点状态更新
                  node.dataRef.status = '3'
                  const children = node.dataRef.children
                  if (children && children.length) {
                    children.forEach((child, childIndex) => {
                      if (child.status === '2') { // 新增的未审核过的节节点直接删除
                        removeTreeNode(child, treeData)
                      } else {
                        children[childIndex].status = '3'
                        const grandSon = children[childIndex].children
                        if (grandSon && grandSon.length) {
                          grandSon.forEach((grandChild, grandChildIndex) => {
                            if (grandChild.status === '2') { // 新增的未审核过的知识点直接删除
                              removeTreeNode(grandChild, treeData)
                            } else {
                              children[childIndex].children[grandChildIndex].status = '3'
                            }
                          })
                        }
                      }
                    })
                  }
                }
              } else if (node.kType === '3') {
                if (node.status === '2') {
                  removeTreeNode(node.dataRef, treeData)
                  // 删除后选中顶级节点
                  nextTick(() => {
                    selectedKeys.value = [treeData.value[0].id]
                  })
                  activedNode.value = treeData.value[0]
                } else {
                  node.dataRef.status = '3'
                  const children = node.dataRef.children
                  if (children && children.length) {
                    children.forEach((child, childIndex) => {
                      if (child.status === '2') {
                        removeTreeNode(child, treeData)
                      } else {
                        children[childIndex].status = '3'
                      }
                    })
                  }
                }
              } else {
                if (node.status === '2') {
                  removeTreeNode(node, treeData)
                  // 删除后选中顶级节点
                  nextTick(() => {
                    selectedKeys.value = [treeData.value[0].id]
                  })
                  activedNode.value = treeData.value[0]
                } else {
                  node.dataRef.status = '3'
                }
              }
            }
            resolve(true)
          } else {
            resolve(false)
          }
        }
      ).catch((err) => reject(err))
    })
  }

  /**
   * 点击加符号
   * @param currentNode 加号在的节点
   */
  const addNode = (currentNode: TreeDataItem) => {
    const node = currentNode.dataRef
    if (node.children && node.children.length > 0) {
      if (node.children[node.children.length - 1].add) {
        return message.warning('请先完成当前节点操作')
      }
    }
    const addId = `qkc${new Date().getTime()}`
    const kType = node.kType
    // const { parentNode } = getParentKey(node.id, treeData.value)!
    const treeOpt: TreeDataItem = {
      name: '',
      editName: '',
      id: addId,
      key: addId,
      isEdit: true,
      kType: (parseInt(kType, 10) + 1).toString(),
      add: true,
      status: 2,
      seq: ToolsUtil.getMaxSeq(node.children)
    }
    if (node.children) {
      node.children.push(treeOpt)
    } else {
      node.children = [treeOpt]
    }
    nextTick(() => {
      expandedKeys.value = uniArr([...expandedKeys.value, node.id || node.key])
    })
  }

  /**
   * 切换是否保存知识点分流
   * @param change 是否变更
   * @param node 当前节点
   */
  const crossFlow = (change: boolean, node: TreeDataItem) => {
    if (!change) {
      activedNode.value = node
      recoveryKnowledge(node)
    } else {
      saveNode(activedNode.value).then(success => {
        if (success) {
          activedNode.value = node
          recoveryKnowledge(node)
          // expandedKeys.value = [...expandedKeys.value, node.id]
        }
      })
    }
  }

  /**
   * 收集参数，保存节点，同步节点信息
   * @param node
   */
  const saveNode = (node: TreeDataItem): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (checkTreeNode(node)) {
        if (node.kType > 1) {
          const { parentKey, parentNode } = getParentKey(node.id || node.key, treeData.value)!
          const maxSeq = ToolsUtil.getMaxSeq(parentNode.children)
          const param: Json = {
            knowledgeSubjectId: route.params.knowledgeSubjectId,
            name: node.editName || node.name,
            seq: node.id && node.id.indexOf('qkc') === -1 ? node.seq : maxSeq,
            id: node.id && node.id.indexOf('qkc') === -1 ? node.id : ''
          }
          if (node.kType === '2') {
            param.weight = chapterWeight.value
          }
          if (node.kType === '3') {
            param.knowledgeModuleId = parentKey
            param.seq = parentNode.seq * 100 + Number(param.seq)
          }
          if (node.kType === '4') {
            const grandNode = getParentKey(parentKey, treeData.value)!
            param.knowledgeModuleId = grandNode.parentKey
            param.knowledgeUnitId = parentKey
            param.fileList = []
            param.code = formStateKnowledge.code
            param.content = formStateKnowledge.content
            param.keyLevel = formStateKnowledge.keyLevel
            param.isSprint = formStateKnowledge.isSprint
            param.isStable = formStateKnowledge.isStable
            param.isFinal = formStateKnowledge.isFinal
            param.opsType = formStateKnowledge.opsType
            param.isDone = formStateKnowledge.isDone
            if (formStateKnowledge.explanationVideo.length) {
              param.fileList = param.fileList.concat(formStateKnowledge.explanationVideo.map((e) => ({
                fileType: 1,
                seq: e.seq,
                attachmentName: e.attachmentName,
                id: e.id,
                sourceType: e.attachmentPath!.indexOf('.') > -1 ? 1 : 2,
                attachmentPath: e.attachmentPath
                // attachmentExt: ToolsUtil.getExt(e.attachmentPath)
              })))
            }
            if (formStateKnowledge.learningMaterials.length) {
              param.fileList = param.fileList.concat(formStateKnowledge.learningMaterials.map((e) => ({
                fileType: 2,
                attachmentPath: e.attachmentPath,
                // attachmentExt: ToolsUtil.getExt(e.attachmentPath),
                attachmentName: e.attachmentName,
                seq: e.seq,
                sourceType: 1,
                id: e.id
              })))
            }
          }

          ScpCourseApi.saveTreeNode(param, node).then(res => {
            const result = res.data
            if (result.status === 201) {
              if (node.kType === '2') {
                if (node.weight) {
                  totalWeight.value = totalWeight.value + chapterWeight.value - node.weight
                } else {
                  totalWeight.value += chapterWeight.value
                }
              }
              if (node.kType === '4') {
                formStateKnowledge.code = result.data.code
                node.id = result.data.id
                node.code = result.data.code
                node.fileList = param.fileList
              } else {
                node.id = result.data
              }
              if (node.editName) {
                node.cacheName = node.editName
                node.name = node.editName
              }
              node.isEdit = false
              if (!node.seq) {
                node.seq = maxSeq
              }
              const {
                isDone,
                content,
                isFinal,
                isStable,
                keyLevel,
                isSprint,
                opsType
              } = formStateKnowledge
              node.isDone = isDone
              node.content = content
              node.isFinal = isFinal
              node.isStable = isStable
              node.keyLevel = keyLevel
              node.isSprint = isSprint
              node.opsType = opsType
              node.weight = chapterWeight.value
              if (node.add) {
                delete node.add
                node.status = '2'
              }
              resolve(true)
            } else {
              resolve(false)
              reject(new Error(result.message))
            }
          }).catch(err => {
            resolve(false)
            reject(err)
          })
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    })
  }

  /**
   * 检查知识点内容合法性
   * @param node
   */
  const checkTreeNode = (node: TreeDataItem) => {
    if (node.kType === '2' && !chapterWeight.value) {
      message.warning('请输入本章考试权重')
      return
    }
    if (node.kType === '4') {
      // formRefKnowledge.value.validate() .then(() => {
      // }).catch(err=>{
      //   message.warning('请按规则填写知识点所有必填项');
      //   console.log(err)
      // })
      if (formStateKnowledge.content.replace(/<[^>]+>/g, '').replace(/[\u0391-\uFFE5]/g, 'a').length > 2000) {
        message.warning('知识点定义文字个数请不要超过2000个')
        return
      }
    }
    return true
  }

  return {
    expandedKeys,
    selectedKeys,
    searchValue,
    autoExpandParent,
    treeData,
    activedNode,
    totalWeight,
    onExpand,
    getKnowledgeTree,
    saveNode,
    onDragEnter, // 拖
    onDrop, // 拽
    addNode, // 加
    delNode, // 删
    editNode, // 笔
    cancelEdit, // 勾
    confirmEdit, // 叉
    selectTree // 点
  }
}
