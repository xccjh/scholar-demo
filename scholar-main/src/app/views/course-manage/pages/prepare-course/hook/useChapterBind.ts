import { createVNode, ref } from 'vue'
import { Json } from '@/common/base'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { useKnowledgeGraphTree } from '@/app/views/course-manage/pages/prepare-course/hook/useKnowledgeGraphTree'
import { useChapterSectionTree } from '@/app/views/course-manage/pages/prepare-course/hook/useChapterSectionTree'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { STATISTICALRULES } from '@/common/constants'
import { CommonApi } from '@/app/api'
import { Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'

export function useChapterBind (packetInfo) {
  const chapterBindVisible = ref(false)
  const listOfDataChapterBind = ref<Json[]>([])
  const knowledgeGraphCheckedKeys = ref([])
  const bindList = ref<Json[]>([])
  const currentOtherSetSection = ref<TreeDataItem>({})
  const chapterBindingEdit = ref(false)
  /**
   * 章节绑定弹框
   */
  const chapterBindModal = () => {
    chapterBindingEdit.value = false
    bindList.value = []
    getKnowledgeTreeData()
    getOtherSetChapter().then(() => {
      chapterBindVisible.value = true
    })
  }

  /**
   * 修改绑定
   */
  const modifyBind = (item) => {
    chapterBindingEdit.value = true
    bindList.value = []
    getKnowledgeTreeData()
    getOtherSetChapter(item).then(() => {
      chapterBindVisible.value = true
    })
  }
  /**
   * 章节绑定
   */
  const bindKnowledgePoints = () => {
    PrepareCourseApi.bindKnowledgePointsBatch(bindList.value).then(res => {
      if (res.data.status === 201) {
        const field = chapterBindingEdit ? 'modify' : 'addCode'
        CommonApi.statisticsLog({
          name: '章节绑定' + (chapterBindingEdit.value ? '修改' : '新增'),
          actionCode: STATISTICALRULES.packetInfo['intellectual-chapterbind-action'][field],
          content: JSON.stringify(bindList.value)
        })
        getChapterBindList()
      }
    })
  }

  /**
   * 解绑知识点
   * @param item
   */
  const untieKnowledgePoints = (item) => {
    Modal.confirm({
      title: '解绑',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '确定对“' + item.sectionName + '”与知识图谱进行解绑吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          PrepareCourseApi.unbindKnowledgePoints(item.sectionId).then(res => {
            if (res.data.status === 200) {
              CommonApi.statisticsLog({
                name: '章节绑定解绑',
                actionCode: STATISTICALRULES.packetInfo['intellectual-chapterbind-action'].delCode,
                content: JSON.stringify({ sectionId: item.sectionId })
              })
              bindList.value.every((item, itemIndex) => {
                if (item.id === item.sectionId) {
                  bindList.value.splice(itemIndex, 1)
                } else {
                  return true
                }
              })
              resolve(true)
              getChapterBindList()
            } else {
              reject(res.data.message)
            }
          }).catch(err => reject(err))
        })
      }
    })
  }

  /**
   * 获取章节绑定列表
   */
  const getChapterBindList = () => {
    PrepareCourseApi.getChapterBindList({
      courseId: packetInfo.courseId,
      coursePacketId: packetInfo.id
    }).then(res => {
      if (res.data.status === 200) {
        if (res.data.data.length > 0) {
          listOfDataChapterBind.value = res.data.data.map((e, i) => {
            return {
              sectionName: e.chapterSeq + '.' + e.sectionSeq + ' ' + e.sectionName,
              knowledgeUnits: e.knowledgeUnits,
              sectionId: e.sectionId,
              chapterId: e.chapterId,
              key: e.sectionId
            }
          })
        } else {
          listOfDataChapterBind.value = []
        }
      }
    })
  }

  /**
   * 知识图谱树
   */
  const {
    knowledgeGraphTreeData,
    knowledgeGraphTreeNodeClick,
    getKnowledgeTreeData,
    knowledgeGraphExpandedKeys
  } = useKnowledgeGraphTree(packetInfo, knowledgeGraphCheckedKeys, bindList, currentOtherSetSection)

  /**
   * 章节树
   */
  const {
    getOtherSetSection,
    getOtherSetChapter,
    otherSetTreeNodeExpand,
    otherSetTreeNodeClick,
    otherSetTreeData,
    otherSetSelectedKeys,
    otherSetExpandedKeys
  } = useChapterSectionTree(packetInfo, knowledgeGraphCheckedKeys, bindList, currentOtherSetSection)

  return {
    chapterBindVisible,
    bindKnowledgePoints,
    chapterBindModal,
    listOfDataChapterBind,
    getChapterBindList,
    getOtherSetSection,
    getOtherSetChapter,
    otherSetTreeNodeExpand,
    otherSetTreeNodeClick,
    otherSetTreeData,
    otherSetSelectedKeys,
    otherSetExpandedKeys,
    currentOtherSetSection,
    knowledgeGraphTreeData,
    knowledgeGraphCheckedKeys,
    knowledgeGraphExpandedKeys,
    knowledgeGraphTreeNodeClick,
    getKnowledgeTreeData,
    untieKnowledgePoints,
    modifyBind
  }
}
