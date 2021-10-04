import { hexSha1 } from '../utils/sha1'
import { bareService } from '@/app/api'
import { UploadXHRArgs } from '@/common/services/ali-oss.service'
import { message } from 'ant-design-vue'

export class UploadPolywayService {
  uploadPolyway = (uploadXhrArgs: UploadXHRArgs, title?: string, tag?: string, desc?: string): Promise<{ mp4: string, vid: string, duration: string }> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      const JSONRPC = JSON.stringify({
        title: title || uploadXhrArgs.file.name || '未命名',
        tag: tag || uploadXhrArgs.file.name || '没有标签',
        desc: desc || uploadXhrArgs.file.name || '没有描述'
      })
      formData.append('JSONRPC', JSONRPC)
      formData.append('Filedata', uploadXhrArgs.file)
      formData.append('writetoken', process.env.VUE_APP_writetoken)
      formData.append('cataid', process.env.VUE_APP_cataid)
      formData.append('fcharset', 'ISO-8859-1')
      const str = `cataid=${process.env.VUE_APP_cataid}&JSONRPC=${JSONRPC}&writetoken=${process.env.VUE_APP_writetoken}${process.env.VUE_APP_secretkey}`
      const sign = hexSha1(str).toUpperCase()
      formData.append('sign', sign)
      bareService.post(process.env.VUE_APP_polywayUpload + 'uc/services/rest/?method=uploadfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: function (data) {
          return data
        },
        onUploadProgress: (progressEvent) => {
          uploadXhrArgs.onProgress(
            {
              percent: progressEvent.loaded / progressEvent.total * 100,
              progressEvent: progressEvent,
              uploadXhrArgs,
              formData
            }
          )
        }
      }).then(res => {
        if (res.data.error === '0') {
          const { mp4, vid, duration } = res.data.data[0]
          uploadXhrArgs.onSuccess(
            {
              uploadXhrArgs,
              vid,
              duration,
              objectName: mp4,
              polyway: true,
              thumbUrl: process.env.VUE_APP_OSS_URL + '/common/video.png'
            },
            res.data
          )
          resolve({ mp4, vid, duration })
        } else {
          uploadXhrArgs.onError(
            '错误码' + res.data.error,
            uploadXhrArgs
          )
          message.warning('上传错误，保利威错误码' + res.data.error)
          reject(new Error('上传错误，保利威错误码' + res.data.error))
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }
}

const uploadPolywayInstane = new UploadPolywayService()
export {
  uploadPolywayInstane
}
