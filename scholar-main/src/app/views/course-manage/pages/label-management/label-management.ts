import { computed, createVNode, defineComponent, reactive, ref, toRefs } from 'vue'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { useStore } from 'vuex'
import { Json } from '@/common/base'
import { Modal } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { FormState } from '@/app/views/archives-manage/entity'
import { useSearchTableAdance } from '@/app/views/hooks'
import { LabelManagementApi } from './api'
import { useRoute } from 'vue-router'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { getTagType } from '@/app/views/course-manage/pages/label-management/utils'

export default defineComponent({
  name: 'label-management',

  setup () {
    const menuService = useRequiredInject(MenuServiceKey)
    const store = useStore()
    const loading = computed(() => store.state.loading)
    const route = useRoute()
    const curEditData = ref<Json>({})
    const isEdit = ref(false)
    const lableManageVisible = ref(false)
    const lableManageFormRef = ref()
    const lableManageFormState = reactive({
      name: '',
      type: '1'
    })
    const lableManageFormRules = {
      name: [
        { whitespace: true, message: '标签名称不能为空', trigger: 'blur' },
        { required: true, message: '标签名称不能为空', trigger: 'blur' },
        { min: 0, max: 6, message: '标签名称不能超过6个字符', trigger: 'change' }
      ],
      type: [
        { required: true, message: '标签类型不能为空', trigger: 'blur' }
      ]
    }
    const { searchList, resetData, storingData, tableState, searchData, getDate } = useSearchTableAdance('label-management', {
      nameVal: '',
      tagTypeVal: ''
    }, (tableState) => {
      LabelManagementApi.getLabelList({
        majorId: route.query.majorId,
        page: tableState.pageIndex,
        limit: tableState.pageSize,
        name: tableState.name,
        tagType: tableState.tagType
      }).then((res) => {
        if (res.data.status === 200) {
          tableState.data = res.data.data.map(item => ({
            ...item,
            key: item.id
          }))
          tableState.total = res.data.page.totalResult || 0
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
     * 标签上移
     * @param id
     */
    const moveUp = (record) => {
      LabelManagementApi.moveUp(record.id).then((res) => {
        if (res.data.status === 204) {
          searchData()
        }
      })
    }
    /**
     * 标签下移
     * @param id
     */
    const moveDown = (record) => {
      LabelManagementApi.moveDown(record.id).then((res) => {
        if (res.data.status === 204) {
          searchData()
        }
      })
    }
    /**
     * 新增编辑系列
     * @param data
     */
    const lableOpterate = (data?) => {
      isEdit.value = !!data.id
      curEditData.value = data
      lableManageVisible.value = true
      lableManageFormState.name = data.name || ''
      lableManageFormState.type = data.type || '1'
    }

    /**
     * 保存系类信息
     */
    const lableManageConfirm = () => {
      lableManageFormRef.value
        .validate()
        .then(() => {
          LabelManagementApi.saveOrEditLabel({
            majorId: route.query.majorId,
            name: lableManageFormState.name,
            tagType: lableManageFormState.type,
            id: curEditData.value.id
          }).then((res) => {
            if (res.data.status === 201) {
              tableState.pageIndex = 1
              searchData()
              lableManageVisible.value = false
            }
          })
        })
        .catch((error: ValidateErrorEntity<FormState>) => {
          console.log('error', error)
        })
    }

    /**
     * 删除标签
     * @param data
     */
    const del = (data) => {
      Modal.confirm({
        title: '删除标签',
        icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
        content:
          data.usedCoursePacketNumber
            ? '删除标签将同步解除该标签与课包的绑定关系，确定要删除“' + data.name + '”标签吗？'
            : '确定删除"' + data.name + '"标签吗？',
        onOk () {
          return new Promise((resolve, reject) => {
            LabelManagementApi.delLabel(data.id).then((res) => {
              if (res.data.status === 204) {
                searchData()
                resolve(true)
              } else {
                reject(new Error(res.data.message))
              }
            }).catch(err => {
              reject(err)
            })
          })
        }
      })
    }

    const gotoback = () => {
      menuService.goBack(false)
      menuService.gotoUrl({
        url: '/m/course-manage/profession-list',
        paramUrl: '',
        title: '专业管理'
      })
    }

    return {
      loading,
      gotoback,
      lableOpterate,
      del,
      getDate,
      pagination,
      searchList,
      resetData,
      storingData,
      searchData,
      lableManageFormRules,
      lableManageFormState,
      lableManageFormRef,
      lableManageVisible,
      lableManageConfirm,
      isEdit,
      curEditData,
      getTagType,
      moveUp,
      moveDown,
      ...toRefs(tableState)
    }
  }
})
