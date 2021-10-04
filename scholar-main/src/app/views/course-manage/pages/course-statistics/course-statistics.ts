import { computed, defineComponent, ref, toRefs } from 'vue'
import { Bus } from '@/common/services'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
import { useSearchTableAdance } from '@/app/views/hooks'
import { AxiosResponse } from 'axios'
import { CommonStatisticsPagination } from '@/common/base'
import { useStore } from 'vuex'
import { StatisticsListDataType, StatisticsListParams } from './entity'
import { CourseStatisticsApi } from './api'
import { blobDownload, SessionStorageUtil, ToolsUtil } from '@/common/utils'

export default defineComponent({
  name: 'course-statistics',

  setup () {
    const store = useStore()
    const route: RouteLocationNormalizedLoaded = useRoute()
    const moreDifficult = ref(0)
    const difficult = ref(0)
    const medium = ref(0)
    const easy = ref(0)
    const moreEasy = ref(0)
    const numberOfExercises = ref(0)
    const knowledgePoints = ref(0)
    const exportLoading = ref(false)
    const loading = computed(() => store.state.loading)
    const { searchList, resetData, storingData, tableState, searchData } = useSearchTableAdance<Partial<StatisticsListDataType>>('statistics', {
      searchWordVal: '',
      selectedVal: ''
    }, (tableState) => {
      const param: StatisticsListParams = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        searchKey: tableState.searchWordValue.trim(),
        courseCode: route.query.code,
        questionNum: tableState.selectedValue || '全部'
      }

      CourseStatisticsApi.getStatistics(param).then((res: AxiosResponse<CommonStatisticsPagination<StatisticsListDataType>>) => {
        if (res.data.status === 200) {
          const { total, list } = res.data.data
          if (total) {
            const {
              totalEasyNum, totalHardNum, totalKnowledgePointNum,
              totalMiddleNum, totalQuestionNum, totalMoreEasyNum, totalMoreHardNum
            } =
              res.data.data.total
            difficult.value = totalHardNum || 0
            medium.value = totalMiddleNum || 0
            easy.value = totalEasyNum || 0
            moreDifficult.value = totalMoreHardNum || 0
            moreEasy.value = totalMoreEasyNum || 0
            numberOfExercises.value = totalQuestionNum || 0
            knowledgePoints.value = totalKnowledgePointNum || 0
          }
          tableState.data = (list && list.data.map(itemI => {
            itemI.key = ToolsUtil.randomString()
            return itemI
          })) || []
          tableState.total = (list && list.totalSize) || 0
        }
      })
    })

    const pagination = computed(() => ({
      total: tableState.total,
      current: tableState.pageIndex,
      pageSize: tableState.pageSize,
      showSizeChanger: true,
      defaultPageSize: 15,
      pageSizeOptions: ['15', '20', '30', '40', '50'],
      showTotal: (total) => (`共 ${total} 条记录`)
    }))

    const goback = () => {
      Bus.$emit('goBack', false)
      Bus.$emit('gotoUrl', '/m/course-manage/course-list', '', '课程管理')
    }

    const exportStatistics = () => {
      CourseStatisticsApi.exportExcelCourse({
        courseCode: route.query.code,
        searchKey: tableState.searchWordValue.trim(),
        questionNum: tableState.selectedValue || '全部'
      }).then(res => {
        blobDownload(res.data, '课程数据统计.xls')
      })
    }

    return {
      goback,
      moreDifficult,
      difficult,
      medium,
      easy,
      moreEasy,
      numberOfExercises,
      knowledgePoints,
      loading,
      pagination,
      searchData,
      searchList,
      resetData,
      storingData,
      exportLoading,
      exportStatistics,
      ...toRefs(tableState)
    }
  }
})
