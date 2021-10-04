import { computed, defineComponent, onErrorCaptured, onUnmounted, reactive, ref, toRefs, UnwrapRef, watch } from 'vue'
import { LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { useStore } from 'vuex'
import { getMaterialName, MATERIAL_TYPE } from '@/common/constants'
import { useReadCourseTree, useReadCouseList, useReadTable, useReadTableOpterate } from './hook'
import { CourseDropItem } from '@/app/views/resource-manage/pages/read-lib/entity'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { Json } from '@/common/base'
import { useRoute } from 'vue-router'
import QRCodeVue3 from 'qrcode-vue3'
export default defineComponent({
  name: 'read-lib',
  components: {
    QRCodeVue3
  },
  async setup () {
    /**
     * 防止内存泄露
     */
    onUnmounted(() => {
      subject.unsubscribe()
    })
    onErrorCaptured((e) => {
      console.log(e)
    })
    const store = useStore()
    const route = useRoute()
    const loading = computed(() => store.state.loading)
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()
    const menuService = useRequiredInject(MenuServiceKey)

    /**
     * 当前课程code
     */
    const currentCourseCode = ref<string>(SessionStorageUtil.getReadtree() || SessionStorageUtil.getPacketInfoItem('code'))
    /**
     * 当前课程名称
     */
    const currentCourseName = computed(() => {
      return currentCourseCode.value
        ? (courseList.value.find(it => it.code === currentCourseCode.value)?.name || '--')
        : courseList.value[0]?.name
    })
    /**
     * 当前课程id
     */
    const currentCourseId = computed(() => {
      return currentCourseCode.value
        ? (courseList.value.find(it => it.code === currentCourseCode.value)?.id || '--')
        : courseList.value[0]?.id
    })

    /**
     * 下拉课程数据
     */
    const courseList = ref<CourseDropItem[]>([])

    /**
     * 查询条件
     */
    const conditionObj: UnwrapRef<{
      category: 100 | 200,
      knowledgeSubjectId: string,
      knowledgeModuleId: string,
      knowledgeUnitId: string,
      knowledgePointId: string,
    }> = reactive({
      category: 100, // 200 习题 100 素材
      knowledgeSubjectId: '', // 学科id
      knowledgeModuleId: '', // 知识模块id
      knowledgeUnitId: '', // 知识单元id
      knowledgePointId: '' // 知识点id
    })

    watch(currentCourseId, (currentCourseId, prevCurrentCourseId) => {
      getKnowledgeTree()
      if (prevCurrentCourseId && prevCurrentCourseId !== '--') {
        conditionObj.knowledgeSubjectId = currentCourseId
        conditionObj.knowledgeModuleId = ''
        conditionObj.knowledgeUnitId = ''
        conditionObj.knowledgePointId = ''
        resetData()
      }
    })
    /**
     * 课程树
     */
    const {
      treeNodeClick,
      getKnowledgeTree,
      treeData
    } = useReadCourseTree(currentCourseId, conditionObj, (param) => {
      searchData(param)
    })
    /**
     * 课程下拉
     */
    const {
      selectCourse,
      getCourseList
    } = useReadCouseList(courseList, currentCourseId, currentCourseCode, conditionObj)

    /**
     * 初始化查询条件
     */
    await getCourseList()
    conditionObj.knowledgeSubjectId = currentCourseId.value

    /**
     * 表格数据
     */
    const {
      searchList,
      resetData,
      storingData,
      tableState,
      searchData,
      getDate,
      subject,
      pagination,
      useTimeSortOrder,
      permitedCall,
      callResource,
      cancelCallResource,
      completeCall,
      callResourceData
    } = useReadTable(conditionObj, route, menuService, courseList)

    /**
     * 表格操作
     */
    const {
      addReadMaterials,
      preview,
      del,
      edit,
      downloadQrcode,
      qrCode,
      qrName,
      visible,
      qcode
    } = useReadTableOpterate(menuService, currentCourseId, conditionObj, searchData)

    return {
      loading,
      orgCode,
      userId,
      // 表格处理相关
      pagination,
      searchData,
      searchList,
      resetData,
      storingData,
      getDate,
      courseList,
      useTimeSortOrder,
      getMaterialName,
      ...toRefs(tableState),
      // 左侧下拉和树相关
      currentCourseCode,
      currentCourseName,
      selectCourse,
      treeData,
      treeNodeClick,
      // 二维码相关
      qrName,
      edit,
      del,
      qcode,
      visible,
      downloadQrcode,
      // 预览相关
      preview,
      addReadMaterials,
      materialMenus: MATERIAL_TYPE.filter((item) => item.id !== '104'),
      completeCall,
      fromOrigin: route.query.from,
      permitedCall,
      callResource,
      cancelCallResource,
      callResourceData,
      qrCode
    }
  }
})
