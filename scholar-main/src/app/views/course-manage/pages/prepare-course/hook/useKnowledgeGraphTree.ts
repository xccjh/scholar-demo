import { ref } from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'

export function useKnowledgeGraphTree (packetInfo, knowledgeGraphCheckedKeys, bindList, currentOtherSetSection) {
  const knowledgeGraphTreeData = ref<TreeDataItem[]>([])
  const knowledgeGraphExpandedKeys = ref<string[]>([])
  const knowledgeGraphTreeNodeClick = (keys: string[], info) => {
    const selectId: string[] = []
    const checkSectionNodes = info.checkedNodes.filter(item => item.props.dataRef.kType === '3')
    // 收集点选
    if (checkSectionNodes.length) {
      checkSectionNodes.forEach(item => {
        selectId.push(item.props.dataRef.id)
      })
    }
    // 存到缓存
    bindList.value.every((eee, iii) => {
      if (eee.courseSectionId === currentOtherSetSection.value.id || eee.courseSectionId === currentOtherSetSection.value.key) {
        bindList.value[iii].knowledgeUnitIdList = selectId
      } else {
        return true
      }
    })
  }

  /**
   * 获取知识图谱树
   */
  const getKnowledgeTreeData = () => {
    PrepareCourseApi.getTreeModuleUnit(packetInfo.knowledgeSubjectId).then(res => {
      knowledgeGraphTreeData.value = res.data.data ? [res.data.data] : []
      knowledgeGraphExpandedKeys.value = [knowledgeGraphTreeData.value[0]?.id]
    })
  }

  return {
    knowledgeGraphTreeData,
    knowledgeGraphCheckedKeys,
    knowledgeGraphExpandedKeys,
    knowledgeGraphTreeNodeClick,
    getKnowledgeTreeData
  }
}
