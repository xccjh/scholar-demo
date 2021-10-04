import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { ref, nextTick } from 'vue'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { transformChaperTreeNodes } from '@/app/views/course-manage/pages/prepare-course/utils'

export function useChapterSectionTree (
  packetInfo,
  knowledgeGraphCheckedKeys,
  bindList,
  currentOtherSetSection
) {
  const otherSetTreeData = ref<TreeDataItem[]>([])
  const otherSetSelectedKeys = ref<string[]>([])
  const otherSetExpandedKeys = ref<string[]>([])

  /**
   * 点击节回调
   * @param e
   */
  const otherSetTreeNodeClick = (selectedKeys, e: { selected?: boolean, selectedNodes?, node, event? }) => {
    currentOtherSetSection.value = e.node.dataRef
    let idx
    if (bindList.value.every((e, i) => {
      if (e.courseSectionId === currentOtherSetSection.value.id) {
        idx = i
      } else {
        return true
      }
    })) {
      // 没有缓存
      PrepareCourseApi.getChapterBindKnowledgePoints({
        courseSectionId: currentOtherSetSection.value.id,
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id
      }).then(res => {
        if (res.data.status === 200) {
          knowledgeGraphCheckedKeys.value = res.data.data.map(e => e.knowledgeUnitId)
          bindList.value.push({
            courseSectionId: currentOtherSetSection.value.id,
            courseId: packetInfo.courseId,
            coursePacketId: packetInfo.id,
            knowledgeUnitIdList: JSON.parse(JSON.stringify(knowledgeGraphCheckedKeys.value))
          })
        }
      })
    } else {
      // 从缓存中取
      knowledgeGraphCheckedKeys.value = bindList.value.filter((ee, ii) => ii === idx)[0].knowledgeUnitIdList
    }
  }

  /**
   * 展开章回调
   * @param expandedKeys
   * @param info
   */
  const otherSetTreeNodeExpand = (expandedKeys, info: { expanded: boolean, node }) => {
    if (info.expanded && (!info.node.children || !info.node.children.length)) {
      getOtherSetSection(info.node.dataRef)
    }
  }

  /**
   * 获取章数据
   */
  const getOtherSetChapter = (chapter?) => {
    return new Promise((resolve) => {
      PrepareCourseApi.getListCourseChapter(packetInfo.id).then(res => {
        if (res.data.status === 200) {
          otherSetTreeData.value = transformChaperTreeNodes(res.data.data, false, 0)
          if (otherSetTreeData.value.length > 0) {
            if (chapter) {
              otherSetExpandedKeys.value = [chapter.chapterId.split(',')[0]]
            } else {
              otherSetExpandedKeys.value = [otherSetTreeData.value[0].id]
            }
            getOtherSetSection(chapter || otherSetTreeData.value[0]).then(res => {
              resolve(res)
            })
          }
        }
      })
    })
  }

  /**
   * 获取节数据
   * @param learnSetChapter
   */
  const getOtherSetSection = (otherSetChapter) => {
    return new Promise((resolve) => {
      const chapterId = otherSetChapter.chapterId ? otherSetChapter.chapterId.split(',')[0] : otherSetChapter.id
      PrepareCourseApi.getListCourseSection(chapterId).then(res => {
        if (res.data.status === 200) {
          let chapterNode:TreeDataItem = {}
          let sessionNodes:TreeDataItem = {}
          otherSetTreeData.value.every(item => {
            if (item.id === chapterId) {
              // 获取章节点
              chapterNode = item
              // 获取节集合 + 追加章下节
              item.children = sessionNodes = transformChaperTreeNodes(res.data.data, true, chapterNode.index)
            } else {
              return true
            }
          })
          const sectionId = otherSetChapter.sectionId ? otherSetChapter.sectionId : sessionNodes[0].key
          otherSetSelectedKeys.value = [sectionId] // 回显点住节
          currentOtherSetSection.value = sessionNodes.find(item => item.id === sectionId) // 当前选中节
          otherSetTreeNodeClick([], { node: { dataRef: currentOtherSetSection.value } }) // 回显点主节的绑定知识图谱
          resolve(true)
        }
      })
    })
  }

  return {
    getOtherSetSection,
    getOtherSetChapter,
    otherSetTreeNodeExpand,
    otherSetTreeNodeClick,
    otherSetTreeData,
    otherSetSelectedKeys,
    otherSetExpandedKeys,
    currentOtherSetSection
  }
}
