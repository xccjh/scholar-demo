import { computed, defineComponent, toRefs } from 'vue'
import { MenuServiceKey } from '@/common/services'
import { useRequiredInject } from '@/common/hooks'
import { useSearchTableAdance } from '@/app/views/hooks'
import { PacketInfoListDataType } from '@/app/views/course-manage/pages/scp-list/entity'
import { LocalStorageUtil, ToolsUtil } from '@/common/utils'
import { AxiosResponse } from 'axios'
import { CommonDataLogObj, MaterialPagination } from '@/common/base'
import { OperationLogApi } from '@/app/views/course-manage/pages/operation-log/api'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
import { STATISTICALRULES } from '@/common/constants'

import { useStore } from 'vuex'

export default defineComponent({
  name: 'operation-log',
  setup () {
    const menuService = useRequiredInject(MenuServiceKey)
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const route: RouteLocationNormalizedLoaded = useRoute()
    const userId = LocalStorageUtil.getUserId()
    const gotoback = () => {
      menuService.goBack(false)
      menuService.gotoUrl({
        url: '/m/course-manage/scp-list',
        paramUrl: '',
        title: '课包'
      })
    }
    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<PacketInfoListDataType>>('operation-log', {
      searchWordVal: ''
    }, (tableState) => {
      OperationLogApi.getPackageOperatLogList({
        current: tableState.pageIndex,
        size: tableState.pageSize,
        orgCode: ToolsUtil.getOrgCode(),
        informationId: route.query.pcode as string,
        source: 1,
        keyword: tableState.searchWordValue.trim(),
        userId,
        businessCode: STATISTICALRULES.packetInfo.businessId
      }).then((res: AxiosResponse<CommonDataLogObj<MaterialPagination<PacketInfoListDataType>>>) => {
        if (res.data.code === 200) {
          tableState.data = res.data.data.records.map(item => ({
            ...item,
            key: ToolsUtil.randomString()
          }))
          tableState.total = res.data.data.total
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

    return {
      gotoback,
      pagination,
      searchList,
      resetData,
      storingData,
      ...toRefs(tableState),
      searchData,
      getDate,
      loading
    }
  }
})
