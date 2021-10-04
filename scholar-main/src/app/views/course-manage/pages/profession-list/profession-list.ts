import {
  computed,
  createVNode,
  defineComponent,
  onErrorCaptured,
  onMounted,
  reactive,
  ref,
  toRaw,
  toRefs,
  UnwrapRef
} from 'vue'
import { LocalStorageUtil, ToolsUtil } from '@/common/utils'
import { useSearchTableAdance } from '@/app/views/hooks'
import { useStore } from 'vuex'
import { message, Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { ProfessionListApi } from './api'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState, ProfessionalListParams, ProfessionListDataType } from './entity'
import { CommonPagination, Json, win } from '@/common/base'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { CourseListApi } from '@/app/views/course-manage/pages/course-list/api'
import { moment } from '@/main'
import { CourseManageApi } from '@/app/views/course-manage/api'
import { AxiosResponse } from 'axios'

declare const window: win

export default defineComponent({
  name: 'profession-list',
  setup () {
    onErrorCaptured((e) => {
      console.log(e)
    })
    onMounted(() => {
      judgmentAuthority()
    })
    const formState: UnwrapRef<FormState> = reactive({
      id: '',
      name: '',
      leaderId: '',
      finalApproverId: '',
      majorType: '',
      productLineId: ''
    })
    const formRules = {
      name: [
        { whitespace: true, message: '学科名称不能为空', trigger: 'blur' },
        { required: true, message: '学科名称不能为空', trigger: 'blur' },
        { min: 0, max: 25, message: '学科名称不能超过25个字符', trigger: 'change' }
      ],
      leaderId: [
        { required: true, message: '学科负责人不能为空', trigger: 'change' }
      ],
      finalApproverId: [
        { required: true, message: '终审人不能为空', trigger: 'change' }
      ],
      productLineId: [
        { required: true, message: '产品线不能为空', trigger: 'change' }
      ]
    }
    const formRef = ref()
    const store = useStore()
    const visible = ref(false)
    const isManager = ref('0')
    const isEdit = ref(false)
    const allLine = ref<Json[]>([])
    const roleArr = ref<Json[]>([])
    const allLineLoading = ref(false)
    const roleLoading = ref(false)
    const loading = computed(() => store.state.loading)
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()
    const menuService = useRequiredInject(MenuServiceKey)

    // const windowWith = ref(document.body.clientWidth)
    // const scrollConfig = computed(() => {
    //   const config = windowWith.value >= 1600 ? { y: '100%' } : {
    //     x: orgCode === 'zksd' ? 1260 : 940,
    //     y: '100%'
    //   }
    //   return config
    // })
    const { searchList, resetData, storingData, tableState, searchData } = useSearchTableAdance<Partial<ProfessionListDataType>>('profession-list', {
      searchWordVal: '',
      dateRangeVal: []
    }, (tableState) => {
      const param: ProfessionalListParams = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        orgCode: ToolsUtil.getOrgCode(),
        searchKey: tableState.searchWordValue.trim(),
        filterKey: 'MANAGER'
      }
      if (tableState.dateRangeValue.length) {
        param.startTime = moment(tableState.dateRangeValue[0]).format('YYYY-MM-DD')
        param.endTime = moment(tableState.dateRangeValue[1]).format('YYYY-MM-DD')
      }
      CourseManageApi.getMajorList(param).then((res: AxiosResponse<CommonPagination<ProfessionListDataType>>) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map((item) => {
            item.key = item.id
            return item
          })
          tableState.total = res.data.page.totalResult
          // tableState.data = []
          // tableState.total = 0
        }
      })
    })

    // const refreshScrollConfig = debounce(() => {
    //   windowWith.value = document.body.clientWidth
    // }, 200)
    // window.addEventListener('resize', refreshScrollConfig)

    const pagination = computed(() => ({
      total: tableState.total,
      current: tableState.pageIndex,
      pageSize: tableState.pageSize,
      showSizeChanger: true,
      defaultPageSize: 15,
      pageSizeOptions: ['15', '20', '30', '40', '50'],
      showTotal: (total) => (`共 ${total} 条记录`)
    }))

    const gotoLabelManagement = (item) => {
      menuService.gotoUrl({
        url: '/m/course-manage/label-management',
        paramUrl: '?majorId=' + item.id,
        title: '标签管理'
      })
    }

    /**
     * 获取所有产品线
     */
    const getAllLine = (): Promise<Json[]> => {
      return new Promise((resolve, reject) => {
        allLineLoading.value = true
        ProfessionListApi.getAllLine().then(
          result => {
            allLineLoading.value = false
            if (result.data.status === 200) {
              allLine.value = result.data.data
              resolve(result.data.data)
            } else {
              reject(new Error(result.data.message))
            }
          }
        ).catch((err) => {
          allLineLoading.value = false
          reject(err)
        })
      })
    }

    /**
     * 负责人查询
     */
    const getRoleList = (): Promise<Json[]> => {
      return new Promise((resolve, reject) => {
        roleLoading.value = true
        const param = {
          platformId: window.__platform__,
          subCode: ToolsUtil.getOrgCode()
        }
        CourseListApi.getChargeList(param).then(
          result => {
            roleLoading.value = false
            if (result.data.status === 200) {
              roleArr.value = result.data.data
              resolve(result.data.data)
            } else {
              reject(new Error(result.data.message))
            }
          }
        ).catch((err) => {
          roleLoading.value = false
          reject(err)
        })
      })
    }

    /**
     * 新增编辑学科
     * */
    const showProfessionModal = (data?) => {
      visible.value = true
      isEdit.value = !!data
      formState.id = data?.id
      formState.name = data?.name
      formState.majorType = data?.majorType || ''
      formState.productLineId = ''
      formState.leaderId = ''
      formState.finalApproverId = ''
      getAllLine().then((resLine) => {
        if (isEdit.value) {
          resLine.every(line => {
            if (line.id === data.productLineId) {
              formState.productLineId = data.productLineId
            } else {
              return true
            }
          })
        }
      })
      getRoleList().then((resRole) => {
        if (isEdit.value) {
          resRole.every(role => {
            if (role.id === data.leaderId) {
              formState.leaderId = data.leaderId
            } else {
              return true
            }
          })
          resRole.every(role => {
            if (role.id === data.finalApproverId) {
              formState.finalApproverId = data.finalApproverId
            } else {
              return true
            }
          })
        }
      })
    }

    /**
     * 学科保存
     * */
    const confirm = () => {
      return new Promise((resolve, reject) => {
        formRef.value
          .validate()
          .then(() => {
            submitForm().then(() => {
              resolve(true)
            }).catch(err => {
              reject(err)
            })
          })
          .catch((error: ValidateErrorEntity<FormState>) => {
            console.log('error', error)
            reject(error)
          })
      })
    }

    const submitForm = (subjectManager?) => {
      return new Promise((resolve, reject) => {
        const postData = toRaw(formState)
        if (postData.majorType === '1') {
          postData.majorTypeName = '财会证书'
        } else if (postData.majorType === '2') {
          postData.majorTypeName = '会计实操'
        } else {
          postData.majorTypeName = ''
        }
        if (!postData.majorTypeName) {
          postData.majorType = ''
        }
        postData.managerId = subjectManager || userId
        ProfessionListApi.saveMajor(postData).then((res) => {
          if (res.data.status === 201) {
            tableState.pageIndex = 1
            searchData()
            visible.value = false
            resolve(true)
          } else {
            reject(new Error(res.data.message))
          }
        }).catch(err => {
          reject(err)
        })
      })
    }

    /**
     * 删除学科
     * @param record
     */
    const showDeleteConfirm = (record) => {
      const label = orgCode === 'zksd' ? '专业' : '学科'
      const content = `删除该${label}后，该${label}下的课程 、课包将进行同步删除。确定删除该${label}吗？`
      Modal.confirm({
        title: '删除',
        icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
        content,
        onOk () {
          return new Promise((resolve, reject) => {
            ProfessionListApi.delMajor(record.id).then((res) => {
              if (res.data.status === 204) {
                searchData()
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
     * 教研总管
     */
    const judgmentAuthority = () => {
      menuService.loadMenus().then((ret) => {
        if (ret && ret.length) {
          if (ret[0].children && ret[0].children.length) {
            const flag = ret[0].children.every(ee => {
              if (ee.text === '教研总管') {
                isManager.value = '1'
              } else {
                return true
              }
            })
            if (flag) {
              isManager.value = '0'
            }
          }
        }
      })
    }
    const transferSubjectsVisible = ref(false)
    const subjectsManager = ref('')

    const transferSubjects = (data) => {
      transferSubjectsVisible.value = true
      formState.id = data.id
      formState.name = data.name
      formState.majorType = data.majorType
      formState.productLineId = data.productLineId
      formState.leaderId = data.leaderId
      formState.finalApproverId = data.finalApproverId
      subjectsManager.value = ''
      getRoleList().then(() => {
        subjectsManager.value = data.managerId
      })
    }

    const confirmSubjectsManager = () => {
      if (!subjectsManager.value) {
        message.warning('请选择学科管理人')
        return
      }
      submitForm(subjectsManager.value).then(() => {
        transferSubjectsVisible.value = false
      })
    }

    return {
      loading,
      allLine,
      roleArr,
      allLineLoading,
      roleLoading,
      orgCode,
      userId,
      pagination,
      searchData,
      searchList,
      resetData,
      storingData,
      isManager,
      showProfessionModal,
      showDeleteConfirm,
      confirm,
      visible,
      formRules,
      formState,
      isEdit,
      formRef,
      transferSubjects,
      transferSubjectsVisible,
      subjectsManager,
      confirmSubjectsManager,
      // scrollConfig,
      // windowWith,
      gotoLabelManagement,
      ...toRefs(tableState)
    }
  }
})
