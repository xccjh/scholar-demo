import { defineComponent, reactive, ref } from 'vue'
import { exitFullscreen, fullScreens, SessionStorageUtil, showPreviewResourceModal, ToolsUtil } from '@/common/utils'
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload'
import { Json } from '@/common/base'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
import { SaveReadApi } from '@/app/views/resource-manage/pages/save-read/api'
import { CaseMaterialsDataType, CaseMaterialsItem } from './entity'
import { MenuServiceKey, shared } from '@/common/services'
import { useRequiredInject } from '@/common/hooks'
import { CONFIG } from '@/common/constants'

export default defineComponent({
  name: 'case-preview',

  setup () {
    const fullScreen = ref(false)
    const menuService = useRequiredInject(MenuServiceKey)
    const enterFullscreen = (fullscreen:boolean) => {
      fullScreen.value = fullscreen
      fullscreen ? fullScreens() : exitFullscreen()
    }
    const data = reactive<CaseMaterialsDataType>({
      title: '',
      background: '',
      analysis: '',
      guide: '',
      caseAttch: []
    })
    const handleClick = (menuItem: {key:0|1|2, item:Json, domEvent:MouseEvent, keyPath:0|1|2[]}) => {
      document.getElementById('materialSection' + menuItem.key)!.scrollIntoView({
        behavior: 'smooth'
      })
    }
    const selectedKeys = ref([1])

    const previewAttachment = (fileItemInfo:CaseMaterialsItem) => {
      showPreviewResourceModal({
        polywayId: '',
        furl: fileItemInfo.attachmentPath,
        share: '0',
        native: '1',
        ow365: '0',
        title: fileItemInfo.attachmentName,
        viewerId: shared.getUserInfo().id,
        orgCode: ToolsUtil.getOrgCode()
      })
    }
    const route:RouteLocationNormalizedLoaded = useRoute()

    const recoveryData = () => {
      SaveReadApi.getResourceDetail(route.params.resourceId as string, route.params.materialType as string).then(res => {
        if (res.data.status === 200) {
          const result = res.data.data
          data.title = result.title
          data.background = result.background
          data.guide = result.guide
          data.analysis = result.analysis
          data.caseAttch = result.attachment.map(el => {
            const isPic = ToolsUtil.isPicture(el.aattachmentExt)
            const isVideo = ToolsUtil.isVideo(el.aattachmentExt)
            const originAttachmentPath = el.attachmentPath
            const attachmentPath = ToolsUtil.getOssUrl(el.attachmentPath)
            const thumbnail = ToolsUtil.getThumbUrl(el.aattachmentExt)
            return { ...el, attachmentPath, isPic, isVideo, thumbnail, originAttachmentPath }
          })
        }
      })
    }

    const gotoBack = () => {
      menuService.goBack(false)
      menuService.gotoUrl({
        url: SessionStorageUtil.getCaseBackPath() || '/m/rm/case',
        paramUrl: '',
        title: '案例库'
      })
    }

    recoveryData()

    return {
      fullScreen,
      enterFullscreen,
      ClassicEditor,
      config: CONFIG,
      data,
      handleClick,
      selectedKeys,
      previewAttachment,
      gotoBack
    }
  }
})
