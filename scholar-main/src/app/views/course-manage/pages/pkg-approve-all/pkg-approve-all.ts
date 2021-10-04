import { computed, defineComponent, onErrorCaptured, ref, toRefs } from 'vue'
import { getAuditStatusPkg, LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { useSearchTableAdance } from '@/app/views/hooks'
import { useStore } from 'vuex'
import { CommonPagination, Json, win } from '@/common/base'
import { CourseListDataType } from '../course-list/entity'
import { moment } from '@/main'
import { AxiosResponse } from 'axios'
import { PkgApproveAllApi } from './api'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { delIf } from '@/app/views/course-manage/pages/pkg-approve-all/utils'
import { PkgIInitiatedApi } from '@/app/views/course-manage/pages/pkg-i-initiated/api'
import { PacketInfoListDataType } from '@/app/views/course-manage/pages/scp-list/entity'
import { Encrypt } from '@/common/utils/crypto'
import { message } from 'ant-design-vue'

type Key = ColumnProps['key'];
declare const window: win

export default defineComponent({
  name: 'pkg-approve-all',
  setup () {
    onErrorCaptured((e) => {
      console.log(e)
    })

    const store = useStore()
    const visible = ref(false)
    const approveVisible = ref(false)
    const record = ref<Json>({})
    const loading = computed(() => store.state.loading)
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()

    const selectedRowKey = ref<Key[]>([])
    const hasSelected = computed(() => selectedRowKey.value.length > 0)
    const onSelectChange = (selectedRowKeys: Key[]) => {
      selectedRowKey.value = selectedRowKeys
    }

    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<CourseListDataType>>('iapproved', {
      searchWordVal: '',
      dateRangeVal: []
    }, (tableState) => {
      const param: Json = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        name: tableState.searchWordValue.trim(),
        auditStatus: '1,2,3',
        createTimeStart: '',
        createTimeEnd: '',
        orgCode: ToolsUtil.getOrgCode(),
        finalApproverId: LocalStorageUtil.getUserId()
      }
      if (tableState.dateRangeValue.length) {
        param.createTimeStart = moment(tableState.dateRangeValue[0]).format('YYYY-MM-DD')
        param.createTimeEnd = moment(tableState.dateRangeValue[1]).format('YYYY-MM-DD')
      }
      PkgIInitiatedApi.getPkgList(param).then((res: AxiosResponse<CommonPagination<CourseListDataType>>) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map(item => ({
            ...item,
            key: item.id
          }))
          tableState.total = res.data.page.totalResult
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

    /**
     * 请求审批接口
     * @param type 0 | 1 | 2 | 3 | 4 | 5
     * */
    const approveAll = (type) => {
      PkgApproveAllApi.approveAll({
        id: record.value?.id,
        auditStatus: type
      }).then((res) => {
        if (res.data.status === 201) {
          visible.value = false
          searchData()
        }
      })
    }

    const getCheckboxProps = (record) => ({
      disabled: record.auditStatus !== '1',
      pcode: record.pcode
    })

    /**
     * 打开审批弹框
     * @param data CourseListDataType
     * */
    const approvedReal = (data) => {
      visible.value = true
      record.value = data
    }

    /**
     * 审批操作获取信息
     * @param data CourseListDataType
     */
    const approved = (data: CourseListDataType): void => {
      approvedReal(data)
    }

    /**
     * 批量审批
     * @param action
     */
    const approvBatch = (action: 2 | 3) => {
      PkgApproveAllApi.batchApproval({
        ids: selectedRowKey.value,
        auditStatus: action
      }).then(res => {
        if (res.data.status === 201) {
          approveVisible.value = false
          searchData('button')
        }
      })
    }

    /**
     * 课包预览
     * @param data
     */
    const preview = (data: PacketInfoListDataType): void => {
      SessionStorageUtil.putPacketInfo(data, true)
      SessionStorageUtil.clearChapterSelection()
      if (data.teachType === '22') {
        open(window.location.href.split('#')[0]
          .replace('scholar', process.env.NODE_ENV === 'development' ? 'ky-scholar-web' : 'pkg-preview') +
          '#/o/outline')
      } else {
        open(window.location.href.split('#')[0]
          .replace('scholar', process.env.NODE_ENV === 'development' ? 'ky-scholar-web' : 'pkg-preview') +
          '#/of/outline-fl')
      }
    }
    const shareVisible = ref(false)
    const verificationCode = ref('')
    const shareLink = ref('')
    const currentPackage = ref<Json>({})
    /**
     * 分享
     */
    const share = (data) => {
      currentPackage.value = data
      refreshCode()
      shareVisible.value = true
    }

    /**
     * 关闭弹框
     */
    const closeShareModal = () => {
      shareVisible.value = false
      shareLink.value = ''
      verificationCode.value = ''
    }
    /**
     * 复制链接很二维码
     */
    const copyLinkAndVerificationCode = () => {
      const copyContent =
        `链接：${shareLink.value}

验证码:${verificationCode.value}

`
      const copyInput = document.createElement('input')
      copyInput.setAttribute('value', copyContent)
      document.body.appendChild(copyInput)
      copyInput.select()

      try {
        const copyed = document.execCommand('copy')
        if (copyed) {
          document.body.removeChild(copyInput)
          message.info('复制成功')
        }
      } catch {
        message.info('复制失败,浏览器版本不支持该功能')
      }
    }

    /**
     * 刷新二维码
     */
    const refreshCode = () => {
      const prexUrl = location.origin + (process.env.NODE_ENV !== 'development' ? '/pkg-preview/?' : '/ky-scholar-web/?') +
        ToolsUtil.getOrgCode() + '#/p/'
      const realUrl = currentPackage.value.teachType === '22' ? 'o/outline' : 'of/outline-fl'
      const expireDate = (new Date().getTime()) + 15 * 24 * 60 * 60 * 1000

      const lessonCount = currentPackage.value.lessonCount || '1'
      const isSmart = currentPackage.value.isSmart || '0'
      const auditStatus = currentPackage.value.auditStatus || '0'
      const { id, name, status, teachType, createrId, pcode, majorId, courseId, courseCode, majorLeaderId, knowledgeSubjectId } = currentPackage.value
      const packInfo = {
        id,
        name,
        status,
        teachType,
        createrId,
        professionId: majorId,
        code: courseCode,
        isSmart,
        auditStatus,
        lessonCount,
        courseId,
        pcode,
        majorLeaderId,
        knowledgeSubjectId
      }
      const user = LocalStorageUtil.getUser()
      verificationCode.value = Math.random().toString(36).substring(2).substr(0, 6)
      const secretUrl = Encrypt((expireDate + '@' + user.userName + '@' + user.password), verificationCode.value)
      const realUrls = realUrl + '/' + packInfo.pcode + '/'
      shareLink.value = prexUrl + realUrls + encodeURIComponent(secretUrl)
    }

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
      visible,
      approveVisible,
      approved,
      approveAll,
      preview,
      record,
      selectedRowKey,
      hasSelected,
      approvBatch,
      onSelectChange,
      delIf,
      share,
      getAuditStatusPkg,
      shareVisible,
      verificationCode,
      shareLink,
      currentPackage,
      copyLinkAndVerificationCode,
      closeShareModal,
      refreshCode,
      getCheckboxProps,
      ...toRefs(tableState)
    }
  }
})
