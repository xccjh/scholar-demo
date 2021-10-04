import { nextTick, ref } from 'vue'
import { ReadMaterialsDataType } from '../entity'
import { ReadLibApi } from '../api'
import { ToolsUtil } from '@/common/utils'

export function useQrcode () {
  const qrName = ref('')
  const qrCode = ref('')
  const visible = ref(false)
  const qcode = (data: ReadMaterialsDataType): void => {
    ReadLibApi.getResourceDetail(data.id, data.type).then(res => {
      if (res.data.status === 200) {
        const { title, sourceType, resourceUrl } = res.data.data
        qrName.value = title
        if (sourceType === '2' || resourceUrl.indexOf('.') === -1) {
          qrCode.value = window.location.protocol + '//' + window.location.host + process.env.VUE_APP_commonViewer +
            '?polywayId=' + resourceUrl +
            '&share=0&native=0&ow365=1'
        } else if (sourceType === '3' || resourceUrl.indexOf('//') > -1) {
          qrCode.value = resourceUrl
        } else {
          qrCode.value = window.location.protocol + '//' + window.location.host + process.env.VUE_APP_commonViewer +
            '?furl=' + process.env.VUE_APP_OSS_URL + ToolsUtil.getOssUrl(resourceUrl, false) +
            '&share=0&native=0&ow365=1'
        }
        visible.value = true
      }
    })
  }

  /**
   * 下载二维码
   */
  const downloadQrcode = () => {
    const qrcodeContainer = document.getElementById('qrcode-container')
    if (qrcodeContainer) {
      const link = document.createElement('a')
      link.setAttribute('href', qrcodeContainer.querySelector('img')!.src)
      link.setAttribute('download', (qrName.value.indexOf('.') > -1 ? qrName.value.split('.')[0] : qrName.value) + '.png')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
  return {
    downloadQrcode,
    qrName,
    visible,
    qcode,
    qrCode
  }
}
