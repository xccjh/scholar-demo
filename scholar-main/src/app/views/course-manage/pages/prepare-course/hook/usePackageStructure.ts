import { useChapterOperate } from './useChapterOperate'
import { useChapterStructueTopOpterate } from './useChapterStructueTopOpterate'

export function usePackageStructure (packetInfo, chapterStructureData) {
  /**
   * 课包结构主体逻辑
   */
  const {
    addChapterVisible,
    addSectionVisible,
    isEditSection,
    isEditChapter,
    addSectionFormRef,
    addChapterFormRef,
    addChapterFormState,
    addSectionFormState,
    addChapterFormRules,
    addSectionFormRules,
    chapterStructureActiveKey,
    getChapter,
    openSection,
    sectionChange,
    addChapter,
    addChapterConfirm,
    delChapter,
    addSection,
    delSection,
    addSectionConfirm,
    chapterStructureDrag,
    sectionStructureDrag
  } = useChapterOperate(packetInfo, chapterStructureData)

  /**
   * 课包结构顶部按钮
   */
  const {
    chapterStructureVisible,
    chapterStructureFileList,
    disableChapterStructureFileList,
    businessLoading,
    chapterImport,
    chapterExport,
    templateDownload,
    knowledgeGraphImport
  } = useChapterStructueTopOpterate(getChapter, packetInfo)

  return {
    addChapterVisible,
    addSectionVisible,
    isEditSection,
    isEditChapter,
    addSectionFormRef,
    addChapterFormRef,
    addChapterFormState,
    addSectionFormState,
    addChapterFormRules,
    addSectionFormRules,
    chapterStructureActiveKey,
    getChapter,
    openSection,
    sectionChange,
    addChapter,
    addChapterConfirm,
    delChapter,
    addSection,
    delSection,
    addSectionConfirm,
    chapterStructureDrag,
    sectionStructureDrag,
    chapterStructureVisible,
    chapterStructureFileList,
    disableChapterStructureFileList,
    businessLoading,
    chapterImport,
    chapterExport,
    templateDownload,
    knowledgeGraphImport
  }
}
