import { get } from '@/app/api'

export const CasePreviewApi = {
  getXxxList () {
    // 便捷导航配置
    const url = '/xx'
    return get(url)
  }
}
