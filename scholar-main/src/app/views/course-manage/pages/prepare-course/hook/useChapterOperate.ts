import { createVNode, reactive, ref } from 'vue'
import { Json } from '@/common/base'
import { PrepareCourseApi } from '../api'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/app/views/course-manage/pages/scp-list/entity'
import { Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'

export function useChapterOperate (packetInfo, chapterStructureData) {
  const addChapterVisible = ref(false)
  const addSectionVisible = ref(false)
  const isEditChapter = ref(false)
  const isEditSection = ref(false)
  const addChapterFormRef = ref()
  const addSectionFormRef = ref()
  const addChapterFormState = reactive({
    name: ''
  })
  const addSectionFormState = reactive({
    name: ''
  })
  const addChapterFormRules = {
    name: [
      {
        required: true, message: '章名称不能为空', trigger: 'change'
      },
      {
        min: 0, max: 60, message: '章名称不能超过60个字符', trigger: 'change'
      },
      { whitespace: true, message: '章名称不能为空', trigger: 'change' }
    ]
  }
  const addSectionFormRules = {
    name: [
      {
        required: true, message: '节名称不能为空', trigger: 'change'
      },
      {
        min: 0, max: 60, message: '节名称不能超过60个字符', trigger: 'change'
      },
      { whitespace: true, message: '节名称不能为空', trigger: 'change' }
    ]
  }
  const chapterStructureActiveKey = ref<string[]>([])
  const curChapter = ref<Json>({})
  const curSection = ref<Json>({})
  const getChapter = () => {
    PrepareCourseApi.getListCourseChapter(packetInfo.id).then(res => {
      if (res.data.status === 200) {
        res.data.data.forEach(data => {
          data.active = false
        })
        chapterStructureData.value = res.data.data as any[]
        if (chapterStructureData.value.length > 0) {
          chapterStructureActiveKey.value = [res.data.data[0].id]
          sectionChange(chapterStructureData.value[0])
        }
      }
    })
  }
  const openSection = (chapterIds: string[]) => {
    chapterIds.forEach(chapterId => {
      sectionChange(chapterStructureData.value.find(item => item.id === chapterId))
    })
  }
  const sectionChange = (chapter) => {
    if (chapter) {
      curChapter.value = chapter
      if (!chapter.children || chapter.children.length === 0) {
        getSection(chapter)
      }
    }
  }
  const getSection = (chapter) => {
    PrepareCourseApi.getListCourseSection(chapter.id).then(res => {
      if (res.data.status === 200) {
        chapter.children = res.data.data
      }
    })
  }
  /**
   * 新增章弹框
   * @param chapter
   */
  const addChapter = (chapter?) => {
    isEditChapter.value = !!chapter
    curChapter.value = chapter
    addChapterVisible.value = true
    addChapterFormState.name = chapter?.name
  }
  /**
   * 新增章
   */
  const addChapterConfirm = () => {
    addChapterFormRef.value.validate().then(() => {
      PrepareCourseApi.addChapter({
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        chapters: [
          {
            id: curChapter.value?.id,
            name: addChapterFormState.name,
            seq: curChapter.value?.seq ? curChapter.value?.seq : (chapterStructureData.value.length > 0 ? chapterStructureData.value.length + 1 : 1)
          }
        ]
      }).then(res => {
        if (res.data.status === 200) {
          const chapter = res.data.data[0]
          chapter.children = []
          if (isEditChapter.value) { // 编辑章改名
            curChapter.value.name = addChapterFormState.name
          } else { // 新增章
            chapterStructureData.value = [...chapterStructureData.value, chapter]
            if (chapterStructureActiveKey.value.indexOf(chapter.id) < 0) {
              chapterStructureActiveKey.value = [...chapterStructureActiveKey.value, chapter.id]
            }
          }
          addChapterVisible.value = false
        }
      })
    })
      .catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
  }
  /**
   * 删除章
   * @param chapter
   */
  const delChapter = (chapter) => {
    Modal.confirm({
      title: '提示',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '确认要删除' + chapter.name + '吗? ',
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.delChapter(chapter.id).then((res) => {
            if (res.data.status === 204) {
              const chapterIdx = chapterStructureData.value.findIndex(chapterItem => chapterItem.id === chapter.id)
              chapterStructureData.value.splice(chapterIdx, 1)
              PrepareCourseApi.addChapter({
                courseId: packetInfo.courseId,
                coursePacketId: packetInfo.id,
                chapters: chapterStructureData.value.map((item, index) => ({
                  id: item.id,
                  seq: index + 1
                }))
              })
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          })
        })
      }
    })
  }

  /**
   * 章拖拽
   * @param e
   */
  const chapterStructureDrag = (e: { moved: { element: Json, newIndex: number, oldIndex: number } }) => {
    PrepareCourseApi.addChapter({
      courseId: packetInfo.courseId,
      coursePacketId: packetInfo.id,
      chapters: chapterStructureData.value.map((chapter, index) => {
        chapter.seq = index + 1
        return {
          id: chapter.id,
          seq: index + 1
        }
      })
    })
  }

  /**
   *  节拖拽
   * @param e
   */
  const sectionStructureDrag = (e: {
    moved?: { element: Json, newIndex: number, oldIndex: number },
    added?: { element: Json, newIndex: number, oldIndex: number }
  }, chapter) => {
    if (e.moved) {
      const currentChapter = chapterStructureData.value.find(item => item.id === e.moved!.element.courseChapterId)
      PrepareCourseApi.addChapter({
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        chapters: [
          {
            id: currentChapter.id,
            seq: currentChapter.seq,
            sections: currentChapter.children.map((section, index) => {
              section.seq = index + 1
              return {
                id: section.id,
                seq: index + 1
              }
            })
          }
        ]
      })
    } else {
      console.log(chapter)
    }
  }

  /**
   * 新增节
   * @param chapter
   * @param section
   */
  const addSection = (chapter, section?) => {
    isEditSection.value = !!section
    curChapter.value = chapter
    curSection.value = section
    addSectionVisible.value = true
    addSectionFormState.name = section?.name
  }

  const addSectionConfirm = () => {
    addSectionFormRef.value.validate().then(() => {
      PrepareCourseApi.addChapter({
        courseId: packetInfo.courseId,
        coursePacketId: packetInfo.id,
        chapters: [
          {
            id: curChapter.value.id,
            name: curChapter.value.name,
            seq: curChapter.value.seq,
            sections: [
              {
                id: curSection.value?.id,
                name: addSectionFormState.name,
                seq: curSection.value?.seq ? curSection.value?.seq : (curChapter.value.children?.length > 0 ? curChapter.value.children?.length + 1 : 1)
              }
            ]
          }
        ]
      }).then(res => {
        if (res.data.status === 200) {
          getSection(curChapter.value)
          addSectionVisible.value = false
        }
      })
    })
      .catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
  }
  /**
   * 删除节
   * @param chapter
   * @param section
   */
  const delSection = (chapter, section) => {
    curChapter.value = chapter
    Modal.confirm({
      title: '提示',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '确认要删除' + section.name + '吗? ',
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.delSection(section.id).then((res) => {
            if (res.data.status === 204) {
              chapter.children.splice(chapter.children.findIndex(sectionItem => sectionItem.id === section.id), 1)
              PrepareCourseApi.addChapter({
                courseId: packetInfo.courseId,
                coursePacketId: packetInfo.id,
                chapters: [
                  {
                    id: chapter.id,
                    seq: chapter.seq,
                    sections: chapter.children.map((item, index) => ({
                      id: item.id,
                      seq: index + 1
                    }))
                  }
                ]
              })
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          })
        })
      }
    })
  }

  // getChapter()

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
    chapterStructureData,
    getChapter,
    openSection,
    sectionChange,
    getSection,
    addChapter,
    addChapterConfirm,
    delChapter,
    delSection,
    addSection,
    addSectionConfirm,
    chapterStructureDrag,
    sectionStructureDrag
  }
}
