import { reactive } from 'vue'
import { uploadOssInstane } from '@/common/services/upload-oss.service'
import { CONFIG } from '@/common/constants'
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload'

export function useCkeditor () {
  const loadObj = reactive({
    editorOne: false
  })
  const getResolver = (label) => {
    return (file: File) => {
      return new Promise((resolve, reject) => {
        loadObj[label] = true
        uploadOssInstane.uploadOss(file).then((urlObj: { url: string }) => {
          loadObj[label] = false
          resolve(urlObj)
        }).catch(err => {
          reject(err)
          loadObj[label] = false
        })
      })
    }
  }
  const getImgVideoReosolver = (label) => {
    return {
      videoUpload: getResolver(label),
      imageUpload: getResolver(label)
    }
  }
  const config = Object.assign({}, CONFIG, getImgVideoReosolver('editorOne'))
  return { config, loadObj, ClassicEditor }
}
