import { computed, defineComponent, onUnmounted, reactive, toRefs } from 'vue'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { useStore } from 'vuex'
import { getRuleType } from '@/common/utils'
import { useCourseList, useSeriesOperate, useSeriesTable, useSeriesTableOperate } from './hook'

export default defineComponent({
  name: 'series-management',

  async setup () {
    onUnmounted(() => {
      subject.unsubscribe()
    })
    const menuService = useRequiredInject(MenuServiceKey)
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const departmentBulletFormState = reactive({
      name: '',
      ruleType: '1',
      courseId: ''
    })
    const gotoback = () => {
      menuService.goBack(false)
      menuService.gotoUrl({
        url: '/m/course-manage/scp-list',
        paramUrl: '',
        title: '课包'
      })
    }

    /**
     * 课程下拉
     */
    const {
      courseList
    } = await useCourseList(departmentBulletFormState)

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
      pagination,
      subject
    } = useSeriesTable(courseList)

    /**
     * 系列操作
     */
    const {
      isEdit,
      curEditData,
      departmentBulletVisible,
      departmentBulletFormRef,
      departmentBulletFormRules,
      seriesOpterate,
      departmentBulletConfirm
    } = useSeriesOperate(departmentBulletFormState, searchData, courseList, tableState, storingData)

    /**
     * 系列表格操作
     */
    const {
      del
    } = useSeriesTableOperate(searchData)

    return {
      loading,
      gotoback,
      seriesOpterate,
      del,
      getRuleType,
      courseList,
      getDate,
      pagination,
      searchList,
      resetData,
      storingData,
      searchData,
      departmentBulletFormRules,
      departmentBulletFormState,
      departmentBulletFormRef,
      departmentBulletVisible,
      departmentBulletConfirm,
      isEdit,
      curEditData,
      ...toRefs(tableState)
    }
  }
})
