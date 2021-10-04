import { computed, defineComponent, onErrorCaptured, toRefs } from 'vue'
import { LocalStorageUtil, ToolsUtil } from '@/common/utils'
import { useStore } from 'vuex'
import { useCourseList, usePreviewTeacher, useRecordOperate, useRecordTable } from '@/app/views/archives-manage/hooks'

export default defineComponent({
  name: 'recording-lecturer',
  setup () {
    onErrorCaptured((e) => {
      console.log(e)
    })
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()
    const { courseList } = useCourseList()

    const {
      pagination,
      searchList,
      resetData,
      storingData,
      tableState,
      searchData,
      getDate
    } = useRecordTable()

    const {
      previewVisible,
      previewData,
      previewTeacher
    } = usePreviewTeacher()

    const {
      editItem,
      delItem,
      handlePreViewVideo,
      guideTeacherVisible,
      teacherFormRules,
      teacherFormRef,
      teacherFormState,
      isEdit,
      customRequest,
      filePreview,
      confirmModal,
      showTeacherModal,
      fileList,
      removeFile
    } = useRecordOperate(searchData, tableState, courseList)

    return {
      loading,
      orgCode,
      userId,
      pagination,
      searchData,
      searchList,
      resetData,
      storingData,
      getDate,
      courseList,
      ...toRefs(tableState),
      prefix: process.env.VUE_APP_OSS_URL,
      previewVisible,
      previewTeacher,
      previewData,
      editItem,
      delItem,
      handlePreViewVideo,
      guideTeacherVisible,
      teacherFormRules,
      teacherFormRef,
      teacherFormState,
      isEdit,
      customRequest,
      filePreview,
      confirmModal,
      showTeacherModal,
      fileList,
      removeFile
    }
  }
})
