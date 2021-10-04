import { computed, createVNode, defineComponent, onErrorCaptured, reactive, ref, toRaw, toRefs, UnwrapRef } from 'vue'
import { LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '@/common/utils'
import { useSearchTableAdance } from '@/app/views/hooks'
import { useStore } from 'vuex'
import { Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { CourseListApi } from './api'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { CourseListDataType, CourseListParams, DisciplinDataParams, FormState } from './entity'
import { CommonPagination, Json, win } from '@/common/base'
import { moment } from '@/main'
import { AxiosResponse } from 'axios'
import { BURRON_COURSE } from '@/common/constants'
import { MenuServiceKey } from '@/common/services'
import { useRequiredInject } from '@/common/hooks'

declare const window: win

export default defineComponent({
  name: 'course-list',
  setup () {
    const orgCode = ToolsUtil.getOrgCode()
    const userId = LocalStorageUtil.getUserId()
    onErrorCaptured((e) => {
      console.log(e)
    })
    const formState: UnwrapRef<Partial<FormState>> = reactive({
      id: '',
      name: '',
      leaderId: '',
      courseProviderId: '',
      createrName: ''
    })
    const formRules: UnwrapRef<Json> = reactive({
      name: [
        { whitespace: true, message: '学科名称不能为空', trigger: 'blur' },
        { required: true, message: '学科名称不能为空', trigger: 'blur' },
        { min: 0, max: 25, message: '学科名称不能超过25个字符', trigger: 'change' }
      ],
      leaderId: [
        { required: true, message: '课程负责人不能为空', trigger: 'change' }
      ],
      courseProviderId: [
        { required: true, message: '课程服务商不能为空', trigger: 'change' }
      ]
    })
    if (orgCode === 'zksd') {
      formState.majorIdList = []
      formState.eduLevel = []
      formState.courseType = ''
      formState.gbCode = ''
      formRules.majorIdList = [{
        required: true,
        message: '所属专业不能为空',
        trigger: 'change',
        type: 'array'
      }]
      formRules.eduLevel = [{
        required: true,
        message: '学历层次不能为空',
        trigger: 'change',
        type: 'array'
      }]
      formRules.courseType = [{
        required: true,
        message: '课程属性不能为空',
        trigger: 'change'
      }]
      formRules.gbCode = [{
        required: true,
        message: '国家编码不能为空',
        trigger: 'change'
      }]
    } else {
      formState.majorId = ''
      formRules.majorId = [{
        required: true,
        message: '所属学科不能为空',
        trigger: 'change'
      }]
    }
    const menuService = useRequiredInject(MenuServiceKey)
    const formRef = ref()
    const store = useStore()
    const visible = ref(false)
    const courseProvider = ref<Json[]>([])
    const courseProviderLoading = ref(false)
    const disciplinData = ref<Json[]>([])
    const disciplinDataLoading = ref(false)
    const roleArr = ref<Json[]>([])
    const roleLoading = ref(false)
    const isEdit = ref(false)
    const loading = computed(() => store.state.loading)

    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance<Partial<CourseListDataType>>('course-list', {
      selectedVal: '',
      searchWordVal: '',
      dateRangeVal: []
    }, (tableState) => {
      const param: CourseListParams = {
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        searchKey: tableState.searchWordValue.trim(),
        auditStatus: tableState.selectedValue || '',
        filterKey: 'MANAGER',
        startTime: '',
        endTime: ''
      }
      if (tableState.dateRangeValue.length) {
        param.startTime = moment(tableState.dateRangeValue[0]).format('YYYY-MM-DD')
        param.endTime = moment(tableState.dateRangeValue[1]).format('YYYY-MM-DD')
      }
      CourseListApi.getCourseList(param).then((res: AxiosResponse<CommonPagination<CourseListDataType>>) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map(item => ({
            ...item,
            key: item.id,
            eduLevel: (item.eduLevel as string)?.split(',')
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
     * 课程服务商家
     */
    const getCourseProvideList = (): Promise<Json[]> => {
      return new Promise((resolve, reject) => {
        courseProviderLoading.value = true
        CourseListApi.getCourseProvideList().then(
          result => {
            courseProviderLoading.value = false
            if (result.data.status === 200) {
              courseProvider.value = result.data.data
              resolve(result.data.data)
            } else {
              reject(result.data.message)
            }
          }
        ).catch((err) => {
          courseProviderLoading.value = false
          resolve(err)
        })
      })
    }
    /**
     * 专业学科列表
     */
    const getDisciplinData = (): Promise<Json[]> => {
      return new Promise((resolve, reject) => {
        const param: DisciplinDataParams = {
          page: 1,
          limit: 1000,
          orgCode,
          searchKey: '',
          startTime: '',
          endTime: '',
          filterKey: 'MANAGER'
        }
        disciplinDataLoading.value = true
        CourseListApi.getDisciplinData(param).then(res => {
          disciplinDataLoading.value = false
          if (res.data.status === 200) {
            disciplinData.value = res.data.data
            resolve(res.data.data)
          } else {
            reject(new Error(res.data.message))
          }
        }).catch((err) => {
          disciplinDataLoading.value = false
          reject(err)
        })
      })
    }

    /**
     * 新增编辑课程
     * */
    const showCourseModal = (data?) => {
      isEdit.value = !!data
      formState.id = data?.id
      formState.name = data?.name
      formState.createrName = data?.createrName
      formState.courseType = data?.courseType
      formState.gbCode = data?.gbCode
      formState.eduLevel = data?.eduLevel
      formState.leaderId = ''
      formState.courseProviderId = ''
      formState.majorIdList = []
      formState.majorId = ''
      getDisciplinData().then(disciplinData => {
        if (isEdit.value) {
          if (orgCode === 'zksd') {
            const majorIds: string[] = []
            data.majorIdList.forEach(majorId => {
              disciplinData.every(disciplin => {
                if (disciplin.id === majorId) {
                  majorIds.push(majorId)
                } else {
                  return true
                }
              })
            })
            formState.majorIdList = majorIds
          } else {
            disciplinData.every(disciplin => {
              if (disciplin.id === data.majorId) {
                formState.majorId = data.majorId
              } else {
                return true
              }
            })
          }
        }
      })
      getRoleList().then(roleList => {
        if (isEdit.value) {
          roleList.every(role => {
            if (role.id === data.leaderId) {
              formState.leaderId = data.leaderId
            } else {
              return true
            }
          })
        }
      })
      getCourseProvideList().then(courseProvideList => {
        if (isEdit.value) {
          courseProvideList.every(courseProvide => {
            if (courseProvide.id === data.courseProviderId) {
              formState.courseProviderId = data?.courseProviderId
            } else {
              return true
            }
          })
        }
      })
      visible.value = true
    }

    /**
     * 课程保存
     * */
    const confirm = () => {
      formRef.value
        .validate()
        .then(() => {
          const postData = toRaw(formState)
          postData.eduLevel = (postData.eduLevel as string[])?.join(',')
          CourseListApi.saveCourse(postData).then((res) => {
            if (res.data.status === 201) {
              tableState.pageIndex = 1
              searchData()
              visible.value = false
            }
          })
        })
        .catch((error: ValidateErrorEntity<FormState>) => {
          console.log('error', error)
        })
    }

    /**
     * 删除课程
     * @param record
     */
    const showDeleteConfirm = (record) => {
      const content = record.status === '1' ? '删除该课程后，该课程下的所有课包将同步进行删除，确定删除吗？' : '确定删除' + record.name + '课程吗？'
      Modal.confirm({
        title: '删除',
        icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
        content,
        onOk () {
          return new Promise((resolve, reject) => {
            CourseListApi.delCourse(record.id).then((res) => {
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
     * 学科负责人具有编辑全权限
     * @param data 课程item
     */
    const showEdit = (data: CourseListDataType) => {
      let flag = false
      if (data.zksdLeaderIds) {
        flag = data.zksdLeaderIds.split(',').indexOf(userId) > -1
      }
      if (!flag && data.majorLeaderId) {
        flag = data.majorLeaderId === userId
      }
      return flag && data.auditStatus !== '1'
    }
    /**
     * 课程预览
     * @param data
     */
    const preview = (data: CourseListDataType): void => {
      SessionStorageUtil.removeKnowledgeGraphTab() // 菜单栏切换需要保留tab状态，预览入口不需要
      SessionStorageUtil.putCourseType('0') // 返回区分标志
      menuService.gotoUrl({
        url: '/m/course-manage/course-preview',
        paramUrl: `/${data.id}`,
        title: '课程预览'
      })
    }
    /**
     * 课程建设
     * @param data 课程item
     */
    const curriculumConstruction = (data: CourseListDataType) => {
      SessionStorageUtil.putCourseName(data.name)
      menuService.gotoUrl({
        url: '/m/course-manage/scp-course',
        paramUrl: `/${data.id}/${data.knowledgeSubjectId}/${data.status}/${data.auditStatus}/${data.code}/${data.leaderId}`,
        title: '课程建设'
      })
    }
    /**
     * 数据统计
     * @param data
     */
    const statistics = (data) => {
      menuService.gotoUrl({
        url: '/m/course-manage/statistics',
        paramUrl: '?code=' + data.code,
        title: '数据统计'
      })
    }

    /**
     * 课程负责人
     * @param data 课程item
     */
    const showBuild = (data) => {
      return data.auditStatus !== '1' && (data.leaderId === userId)
    }

    const methods = {
      showCourseModal,
      showDeleteConfirm,
      preview,
      showEdit,
      showBuild,
      curriculumConstruction,
      statistics
    }

    const initButton = (data) => {
      if (data) {
        if (!data.upButtonArr) {
          const buttonArr = JSON.parse(JSON.stringify(BURRON_COURSE))
          buttonArr.forEach(item => {
            if (typeof item.show === 'string') {
              item.show = methods[item.show](data)
            }
          })
          data.upButtonArr = buttonArr.filter(item => item.show).slice(0, 3)
          data.dropButtonArr = buttonArr.filter(item => item.show).slice(3, BURRON_COURSE.length)
        }
      }
      return true
    }

    const methodChange = (data, i, key) => {
      methods[data[key][i].method](data)
    }

    return {
      courseProvider,
      disciplinData,
      roleArr,
      loading,
      courseProviderLoading,
      disciplinDataLoading,
      roleLoading,
      orgCode,
      userId,
      pagination,
      searchData,
      searchList,
      resetData,
      storingData,
      showCourseModal,
      showDeleteConfirm,
      confirm,
      visible,
      formRules,
      formState,
      isEdit,
      formRef,
      getDate,
      methodChange,
      initButton,
      ...toRefs(tableState)
    }
  }
})
