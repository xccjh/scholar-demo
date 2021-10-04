import { useKnowledgeForm, useKnowledgeTree, useKnowledgeHead } from './'
import { ref } from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'

export function useKnowledge (route, attachmentInformation) {
  const activedNode = ref<TreeDataItem>({})

  const {
    // 知识点表单
    formRefKnowledge,
    formStateKnowledge,
    chapterWeight,
    localVideoFileList,
    learningMaterialsFileList,
    disableLearningMaterialsFileUpload,
    handelChange,
    recoveryKnowledge,
    resetKnowledgeFrom,
    // 富文本
    config,
    loadObj,
    ClassicEditor,
    // 讲解视频
    uploadExplanationVideo,
    confirmUpload,
    removeFileItem,
    editFileItem,
    polywayVisible,
    localUploadvisible,
    polywayFromRef,
    localVideoFromRef,
    localVideoFromRules,
    polywayFromRules,
    videoUpload,
    resetKnowledges
  } = useKnowledgeForm(route, attachmentInformation, activedNode)

  const {
    expandedKeys,
    selectedKeys,
    searchValue,
    autoExpandParent,
    treeData,
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
  } = useKnowledgeTree(route, recoveryKnowledge, chapterWeight, attachmentInformation, formStateKnowledge, activedNode)

  const {
    disableImportAtlasFileList,
    importAtlasFileList,
    knowledgeExcelUploadPercent,
    knowledgeExcelUploading,
    importAtlasVisible,
    importAtlasCancel,
    importAtlasComfirm,
    importAtlasModal,
    exportKnowledgeExcel,
    exportKnowledgeDetail,
    resetMap,
    filterKnowledgePointsClick,
    businessLoading
  } = useKnowledgeHead(route, getKnowledgeTree)

  return {
    /**
     * 头操作
     */
    disableImportAtlasFileList,
    importAtlasFileList,
    importAtlasVisible,
    knowledgeExcelUploadPercent,
    knowledgeExcelUploading,
    importAtlasCancel,
    importAtlasComfirm,
    importAtlasModal,
    filterKnowledgePointsClick,
    exportKnowledgeExcel,
    exportKnowledgeDetail,
    resetMap,
    resetKnowledges,
    businessLoading,
    /**
     * 表单操作
     */
    // 知识点表单
    formRefKnowledge,
    formStateKnowledge,
    chapterWeight,
    localVideoFileList,
    learningMaterialsFileList,
    disableLearningMaterialsFileUpload,
    handelChange,
    recoveryKnowledge,
    resetKnowledgeFrom,
    // 富文本
    config,
    loadObj,
    ClassicEditor,
    // 讲解视频
    uploadExplanationVideo,
    confirmUpload,
    removeFileItem,
    editFileItem,
    polywayVisible,
    localUploadvisible,
    polywayFromRef,
    localVideoFromRef,
    localVideoFromRules,
    polywayFromRules,
    videoUpload,
    /**
     * 树操作
     */
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
