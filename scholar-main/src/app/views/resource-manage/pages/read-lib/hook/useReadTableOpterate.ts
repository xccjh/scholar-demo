import { ReadMaterialsDataType } from '@/app/views/resource-manage/pages/read-lib/entity'
import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { ReadLibApi } from '@/app/views/resource-manage/pages/read-lib/api'
import { Json, PreviewFileOption } from '@/common/base'
import { shared } from '@/common/services'
import { showPreviewResourceModal, ToolsUtil } from '@/common/utils'
import { useQrcode } from './useQrcode'

export function useReadTableOpterate (menuService, currentCourseId, conditionObj, searchData) {
  /**
   * 二维码
   */
  const {
    downloadQrcode,
    qrName,
    visible,
    qcode,
    qrCode
  } = useQrcode()

  /**
   * 编辑资料
   * @param data
   */
  const edit = (data: ReadMaterialsDataType): void => {
    menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/${data.id}/${data.type}/${currentCourseId.value}`
    })
  }

  /**
   * 删除资料
   * @param data
   */
  const del = (data: ReadMaterialsDataType): void => {
    Modal.confirm({
      title: '删除',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: `确定删除${data.title}的阅读资源？`,
      onOk () {
        return new Promise((resolve, reject) => {
          ReadLibApi.delResource(data.id).then(res => {
            if (res.data.status === 200) {
              resolve(true)
              searchData()
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => reject(err))
        })
      }
    })
  }
  /**
   * 预览
   * @param data
   */
  const preview = (data: ReadMaterialsDataType): void => {
    const option: Partial<PreviewFileOption> = {
      polywayId: '',
      furl: '',
      share: '0',
      native: '1',
      ow365: '0',
      viewerId: shared.getUserInfo().id,
      orgCode: ToolsUtil.getOrgCode()
    }
    ReadLibApi.getResourceDetail(data.id, data.type).then(res => {
      if (res.data.status === 200) {
        const result = res.data
        option.title = result.data.title
        if (result.data.resourceUrl.indexOf('.') < 0 || result.data.sourceType === '2') {
          option.polywayId = result.data.resourceUrl
        } else if (result.data.sourceType === '3' || result.data.resourceUrl.indexOf('//') > -1) {
          option.attachmentPath = result.data.resourceUrl
        } else {
          option.furl = result.data.resourceUrl
        }
        showPreviewResourceModal(option)
      }
    })
  }

  /**
   * 新增阅读资料
   * @param e 菜单项信息
   */
  const addReadMaterials = (e: { domEvent: MouseEvent, item: Json, key: '101' | '102' | '103', keyPath: '101' | '102' | '103'[] }) => {
    if (!currentCourseId.value) {
      return message.error('还没有建立课程哦~')
    }
    menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/0/${e.key}/${currentCourseId.value}?knowledgePointId=${conditionObj.knowledgePointId || ''}&t=${new Date().getTime()}`,
      title: '新增' + (e.domEvent.currentTarget as HTMLElement).innerText
    })
  }

  return {
    addReadMaterials,
    preview,
    del,
    edit,
    downloadQrcode,
    qcode,
    qrName,
    visible,
    qrCode
  }
}
