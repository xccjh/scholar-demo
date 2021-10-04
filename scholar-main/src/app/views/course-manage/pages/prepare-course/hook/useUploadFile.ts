import { FileItem } from '@/app/views/course-manage/pages/scp-course/entity'
import { checkSameName, ToolsUtil } from '@/common/utils'
import { message } from 'ant-design-vue'
import { AliOssInstane, UploadXHRArgs } from '@/common/services/ali-oss.service'
import { nextTick } from 'vue'

export function useUploadFile (localUploadFileList) {
  /**
   * 节信息文件上传校验
   * @param file
   */
  const prepareBeforeUpload = (file: FileItem, fileList: FileItem[]) => {
    const fileType = ToolsUtil.getFileType(file.name)
    if ((fileType === 'excel' || fileType === 'word' || fileType === 'pdf' || fileType === 'ppt')) {
      const isLt100M = file.size! / 1024 / 1024 < 100
      if (!isLt100M) {
        const msg = '请保证文档类文件小于100MB!'
        message.warning(msg)
        nextTick(() => {
          localUploadFileList.value.splice(localUploadFileList.value.findIndex(item => item.uid === file.uid), 1)
        })
        return false
      }
    }

    if (file.name.length > 100) {
      const msg = file.name + '名称太长，文件名包含扩展名请保持100个字符以内'
      message.warning(msg)
      nextTick(() => {
        localUploadFileList.value.splice(localUploadFileList.value.findIndex(item => item.uid === file.uid), 1)
      })
      return false
    }

    if (!checkSameName(file.name, localUploadFileList.value.filter(item => (!fileList.find(innerItem => innerItem.uid === item.uid))))) {
      const msg = '请不要重复上传，文件名重复'
      message.warning(msg)
      nextTick(() => {
        localUploadFileList.value.splice(localUploadFileList.value.findIndex(item => item.uid === file.uid), 1)
      })
      return false
    }
    return true
  }

  /**
   * oss自定义上传文件
   * */
  const customRequest = (dir) => {
    return (args: UploadXHRArgs) => {
      const uploadDir = dir
      AliOssInstane.upload2AliOSS(args, uploadDir).then((imageUrl: string) => {
      }).catch((err) => {
        console.log(err)
        message.error('上传出错，请稍后再试')
      })
    }
  }

  return {
    prepareBeforeUpload,
    customRequest
  }
}
