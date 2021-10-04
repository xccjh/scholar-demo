import { ToolsUtil } from '../utils/tools.util'
import { post, bareService } from '@/app/api'
import { PolicyDirectDataType } from '@/common/base'

export class UploadOssService {
  uploadOss = (file, uploadDir = 'default/resourse') => {
    return new Promise<{url:string}>((resolve, reject) => {
      post('res/oss/getPolicy', { dir: uploadDir }).then(result => {
        if (result.data.status === 200) {
          this.customReq(file, result.data.data).then(url => {
            resolve({ url: ToolsUtil.getOssUrl(url) })
          }).catch(err => (reject(err)))
        }
      })
    })
  }

  customReq (file:File, policy: PolicyDirectDataType) {
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData()
      const key = policy.dir + ToolsUtil.getRandomFileName() + '.' + ToolsUtil.getFileExt(file.name)
      formData.append('OSSAccessKeyId', policy.accessKeyId)
      formData.append('policy', policy.policy)
      formData.append('key', key)
      formData.append('Signature', policy.signature)
      formData.append('success_action_status', '200')
      formData.append('file', file)
      bareService.post(process.env.VUE_APP_OSS_URL, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        onUploadProgress: (progressEvent) => {

        }
      }).then(res => {
        if (res.status === 200) {
          resolve(key)
        } else {
          reject(new Error(res.data.message))
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }
}
const uploadOssInstane = new UploadOssService()
export {
  uploadOssInstane
}
