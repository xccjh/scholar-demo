import { ref } from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { CurrentLearnSetSection } from '../entity'
import { SessionStorageUtil } from '@/common/utils'
import { PrepareCourseApi } from '../api'
import { transformChaperTreeNodes } from '../utils'

export function useLearnSetTree (getTaskList, getHandoutFiles, packetInfo, currentLearnSetSection) {
  const learnsetTreeData = ref<TreeDataItem[]>([])
  const learnsetSelectedKeys = ref<string[]>([SessionStorageUtil.getSelection().id])
  const learnsetExpandedKeys = ref<string[]>([SessionStorageUtil.getChapter()!])
  /**
   * 点击节回调
   * @param e
   */
  const learnsetTreeNodeClick = (selectedKeys, e: { selected: boolean, selectedNodes, node, event }) => {
    SessionStorageUtil.setChapter(e.node.dataRef.courseChapterId)
    SessionStorageUtil.setSelection(e.node.dataRef)
    currentLearnSetSection.value = e.node.dataRef as CurrentLearnSetSection
    getTaskList()
    getHandoutFiles()
  }

  /**
   * 展开章回调
   * @param expandedKeys
   * @param info
   */
  const learnsetTreeNodeExpand = (expandedKeys, info: { expanded: boolean, node }) => {
    if (info.expanded && (!info.node.children || !info.node.children.length)) {
      learnsetSelectedKeys.value = []
      getLearnSetSection(info.node.dataRef)
    }
  }

  /**
   * 获取章数据
   */
  const getLearnSetChapter = () => {
    PrepareCourseApi.getListCourseChapter(packetInfo.id).then(res => {
      if (res.data.status === 200) {
        learnsetTreeData.value = transformChaperTreeNodes(res.data.data, false, 0)
        if (learnsetTreeData.value.length > 0) {
          if (SessionStorageUtil.getChapter()) {
            const currentChapterIndex = learnsetTreeData.value.findIndex(item => item.key === SessionStorageUtil.getChapter())
            getLearnSetSection(learnsetTreeData.value[currentChapterIndex])
          } else {
            learnsetExpandedKeys.value = [learnsetTreeData.value[0].id]
            getLearnSetSection(learnsetTreeData.value[0])
          }
        }
      }
    })
  }

  /**
   * 获取节数据
   * @param learnSetChapter
   */
  const getLearnSetSection = (learnSetChapter) => {
    PrepareCourseApi.getListCourseSection(learnSetChapter.id).then(res => {
      if (res.data.status === 200) {
        const sessionNodes = transformChaperTreeNodes(res.data.data, true, learnSetChapter.index)
        learnSetChapter.children = sessionNodes
        if (learnsetSelectedKeys.value[0]) {
          currentLearnSetSection.value = sessionNodes.find(item => item.key === learnsetSelectedKeys.value[0])
        } else {
          learnsetSelectedKeys.value = [sessionNodes[0].key]
          currentLearnSetSection.value = sessionNodes[0]
        }
        SessionStorageUtil.setChapter(currentLearnSetSection.value.courseChapterId)
        SessionStorageUtil.setSelection(currentLearnSetSection.value)
        getTaskList()
        getHandoutFiles()
      }
    })
  }

  // getLearnSetChapter()

  return {
    getLearnSetSection,
    getLearnSetChapter,
    learnsetTreeNodeExpand,
    learnsetTreeNodeClick,
    learnsetTreeData,
    learnsetSelectedKeys,
    learnsetExpandedKeys,
    currentLearnSetSection
  }
}
