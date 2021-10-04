import { ref } from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { CoursePreviewApi } from '@/app/views/course-manage/pages/course-preview/api'

export function useCaseCourseTree (currentCourseId, conditionObj, searchData) {
  const treeData = ref<TreeDataItem[]>([])

  /**
   * 知识图谱树点击
   * @param selectedKeys
   * @param e
   */
  const treeNodeClick = (selectedKeys, e: { selected: boolean, selectedNodes, node, event }) => {
    let kType = '1'
    if (e.selectedNodes.length) {
      kType = e.selectedNodes[0].props.kType
    }
    if (kType === '1') {
      conditionObj.knowledgeSubjectId = e.selectedNodes.length ? selectedKeys[0] : currentCourseId.value
      conditionObj.knowledgeModuleId = ''
      conditionObj.knowledgeUnitId = ''
      conditionObj.knowledgePointId = ''
    } else if (kType === '2') {
      conditionObj.knowledgeSubjectId = ''
      conditionObj.knowledgeModuleId = selectedKeys[0]
      conditionObj.knowledgeUnitId = ''
      conditionObj.knowledgePointId = ''
    } else if (kType === '3') {
      conditionObj.knowledgeSubjectId = ''
      conditionObj.knowledgeModuleId = ''
      conditionObj.knowledgeUnitId = selectedKeys[0]
      conditionObj.knowledgePointId = ''
    } else if (kType === '4') {
      conditionObj.knowledgeSubjectId = ''
      conditionObj.knowledgeModuleId = ''
      conditionObj.knowledgeUnitId = ''
      conditionObj.knowledgePointId = selectedKeys[0]
    }
    searchData('button')
  }
  /**
   * 获取知识图谱树
   */
  const getKnowledgeTree = () => {
    treeData.value = []
    CoursePreviewApi.getKnowledgeTree(currentCourseId.value).then(res => {
      if (res.data.status === 200) {
        treeData.value = [res.data.data]
      }
    })
  }
  return { getKnowledgeTree, treeNodeClick, treeData }
}
