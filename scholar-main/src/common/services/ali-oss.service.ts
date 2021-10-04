import { queryParam, ToolsUtil } from '../utils/tools.util'
import * as OSS from 'ali-oss'
import { defer, of, throwError, timer } from 'rxjs'
import { delay, retryWhen, scan, switchMap, tap } from 'rxjs/operators'
import { hexSha1 } from '../utils/sha1'
import { post, service, getHeader, bareService, originService } from '@/app/api'
import { message } from 'ant-design-vue'
import {
  Json,
  PolicyData,
  PolicyDirectData,
  PolicyDirectDataType,
  PolicyMultData,
  PolicyMultDataType
} from '@/common/base'
import store from '@/app/store'

export interface CheckPoint {
  doneParts: {
    etag: string;
    number: number
  };
  file: File;
  fileSize: number;
  name: string;
  partSize: number;
  uploadId: string;
}

export interface UploadXHRArgs {
  action?: string;
  filename?: string;
  file: File;
  data?: {
    [key: string]: any;
  };
  headers?: {
    [key: string]: any;
  };
  withCredentials?: boolean;

  onProgress(e: any): void;

  onSuccess(ret: any, xhr: any): void;

  onError(err: any, ret: any): void;
}

/**
 * 直接上传：true， 分片上传： false
 */
export interface UploadTask {
  isDirect: boolean;
  policy: PolicyDirectDataType | PolicyMultDataType;
  uploadXhrArgs: UploadXHRArgs;
  objectName: string;
  undoneUploadPart: {
    done: boolean;
    lastCheckPoints: Json;
  };
}

export default class AliOssService {
  ossClient: OSS;
  uploadTasks: UploadTask[] = [];

  /**
   * 生成随机文件名
   * @param dir 上传目录
   * @param filename 上传文件名
   */
  createObjectName (dir: string, filename: string): string {
    return `${dir}${ToolsUtil.getRandomFileName()}.${ToolsUtil.getFileExt(filename)}`
  }

  /**
   * 添加上传任务
   * @param uploadXhrArgs
   * @param policy
   * @param isDirect
   */
  addUploadTask (uploadXhrArgs, policy: PolicyDirectDataType | PolicyMultDataType, isDirect: boolean): UploadTask {
    const task: UploadTask = {
      isDirect,
      uploadXhrArgs,
      policy,
      objectName: this.createObjectName(policy.dir, uploadXhrArgs.file.name),
      undoneUploadPart: {
        done: true,
        lastCheckPoints: {}
      }
    }
    this.uploadTasks.push(task)
    return task
  }

  /**
   * 通用文件下载
   * @param data
   */
  commonDownload (data) {
    const filename = data.attachmentName || data.materialName
    if (data.sourceType === '2') {
      const params: any = {
        ptime: (new Date()).getTime(),
        vid: data.attachmentPath
      }
      const sign = hexSha1(queryParam(params) + process.env.VUE_APP_secretkey)
      params.sign = sign.toUpperCase()
      const apiUrl = process.env.VUE_APP_polywayApi + 'v2/video/' + process.env.VUE_APP_userid + '/get-video-msg'
      service.get(apiUrl, { params }).then((res) => {
        if (res.data.code === 200) {
          if (res.data.data[0]) {
            let videoUrl = res.data.data[0].mp4
            if (window.location.href.includes('https') && videoUrl.includes('http')) {
              videoUrl = videoUrl.replace('http', 'https')
            }
            message.success('文件开始下载中...')
            this.blobDownload(videoUrl, filename)
          }
        }
      })
    } else {
      this.downloadFile(filename, data.attachmentPath || data.materialUrl)
    }
  }

  /**
   * blob方式文件下载
   * @param videoUrl 视频地址
   * @param filename 爆粗文件名
   */
  blobDownload (videoUrl: string, filename: string): void {
    this.urlToBlob(videoUrl).then((blob: Blob) => {
      this.downBlobStream(blob, filename)
    })
  }

  /**
   * 把文件地址转成blob
   * @param url string
   */
  urlToBlob (url: string): Promise<Blob> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob'
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response)
        }
      }
      xhr.send()
    })
  }

  /**
   * 下载blob数据
   * @param blob
   * @param filename
   */
  downBlobStream (blob: Blob, filename = '未命名'): void {
    /**
     *  Internet Explorer 10 的 msSaveBlob 和 msSaveOrOpenBlob 方法允许用户在客户端上保存文件
     *  msSaveBlob：只提供一个保存按钮
     *  msSaveOrOpenBlob：提供保存和打开按钮
     */
    if (typeof window.navigator.msSaveOrOpenBlob === 'function') {
      navigator.msSaveBlob(blob, filename)
    } else {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob) // 创建对象url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href) // 通过调用 URL.createObjectURL() 创建的 URL 对象
    }
  }

  /**
   * sdk方式下载文件
   * @param filename
   * @param objectName
   */
  downloadFile (filename: string, objectName: string) {
    this.getPolicyMult('/').then(async (res) => {
      if (res.data.status === 200) {
        this.createOssClient(res.data.data)
        if (objectName.startsWith(process.env.VUE_APP_OSS_URL)) {
          objectName = objectName.substring(process.env.VUE_APP_OSS_URL.length, objectName.length + 1)
        }
        message.success('文件开始下载中...')
        this.normalDownload('', await this.getSignatureUrl(filename, objectName))
      }
    })
  }

  /**
   * 根据名字获取上传任务
   * @param objectName
   */
  getUploadTask (objectName: string) {
    return this.uploadTasks.find((task) => task.objectName === objectName)
  }

  /**
   * 生成oss实例
   * @param policy
   */
  createOssClient (policy: PolicyDirectDataType | PolicyMultDataType): void {
    if (!this.ossClient) {
      const option: {
        endpoint: string,
        accessKeyId: string,
        bucket?: string,
        accessKeySecret?: string,
        stsToken?: string
      } = {
        endpoint: process.env.VUE_APP_endpoint,
        accessKeyId: policy.accessKeyId
      }
      if ('bucket' in policy) {
        option.bucket = policy.bucket
      }
      if ('accessKeySecret' in policy) {
        option.accessKeySecret = policy.accessKeySecret
      }
      if ('securitytoken' in policy) {
        option.stsToken = policy.securitytoken
      }
      this.ossClient = new OSS(option)
    }
  }

  /**
   * 算法获取分片大小
   * @param fileSize
   */
  getPartSize (fileSize: number) {
    const maxNumParts = 10 * 1000
    const defaultPartSize = 1 * 1024 * 1024
    const filesizeThreshold = 9 * 1000 * 1024 * 1024
    const g = 1000
    let partSize = 0
    for (let i = 1; i < g; i++) {
      if (fileSize <= i * filesizeThreshold) {
        partSize = i * defaultPartSize
        break
      }
    }
    return Math.max(Math.ceil(fileSize / maxNumParts), partSize)
  }

  /**
   * 分片进度报告
   * @param percentage
   * @param checkPoint
   * @param res
   */
  progressEvent = async (percentage: number, checkPoint: CheckPoint, res: any) => {
    const objectName = checkPoint.name
    const task = this.getUploadTask(objectName)
    if (!task) {
      return
    }
    task.undoneUploadPart.lastCheckPoints = checkPoint

    task.uploadXhrArgs.onProgress(
      { percent: percentage * 100, checkPoint }
    )
    if (percentage * 100 > 1) {
      timer(500).subscribe(() => {
        store.commit('setLoading', false)
      })
    }
  }

  /**
   * 分片上传
   * @param objectName 文件名
   * @param file 文件
   */
  async multipartUpload (uploadTask: UploadTask) {
    try {
      // object-name可以自定义为文件名（例如file.txt）或目录（例如abc/test/file.txt）的形式，实现将文件上传至当前Bucket或Bucket下的指定目录。
      const partSize = this.getPartSize(uploadTask.uploadXhrArgs.file.size)
      const opts: OSS.MultipartUploadOptions = {
        partSize,
        progress: this.progressEvent,
        checkpoint: uploadTask.undoneUploadPart.done
          ? undefined
          : uploadTask.undoneUploadPart.lastCheckPoints
      }
      const result = await this.ossClient.multipartUpload(
        uploadTask.objectName,
        uploadTask.uploadXhrArgs.file,
        opts
      )
      uploadTask.undoneUploadPart.done = true
      return { code: 200, data: result }
    } catch (e) {
      uploadTask.undoneUploadPart.done = false
      return { code: 400, data: e }
    }
  }

  /**
   * 断点续传重试
   * @param uploadTask
   */
  resumeUpload (uploadTask: UploadTask): Promise<string> {
    this.createOssClient(uploadTask.policy)
    return new Promise((resolve, reject) => {
      defer(async () => {
        store.commit('setLoading', true)
        return await this.multipartUpload(uploadTask)
      })
        .pipe(
          switchMap((res) => {
            if (res.code === 400) {
              return throwError(res.data)
            } else {
              return of(res.data)
            }
          }),
          retryWhen((err$) => {
            return err$.pipe(
              tap((err) => {
                console.log(err)
                message.error(
                  this.getErrorDesc(err.code) + ',5秒后重新尝试上传！'
                )
              }),
              delay(5000),
              scan((acc, curr) => {
                if (acc > 2) {
                  throw curr
                }
                return acc + 1
              }, 0)
            )
          })
        )
        .subscribe(
          (result) => {
            if (result.res.status === 200) {
              uploadTask.uploadXhrArgs.onSuccess(
                uploadTask,
                result
              )
              resolve(uploadTask.objectName)
            } else {
              uploadTask.uploadXhrArgs.onError(
                uploadTask,
                result
              )
              reject(new Error(result.res.message))
            }
          },
          (err) => {
            uploadTask.uploadXhrArgs.onError(err, uploadTask)
            if (err.code === 'ConnectionTimeoutError') {
              message.error(this.getErrorDesc(err.code) + ',请到更换网络再试！', 6000)
            } else if (err.code === 'RequestError') {
              message.error(
                this.getErrorDesc(err.code) + ',请检查是否有网络！', 6000)
            } else {
              message.error(this.getErrorDesc(err.code) + err.code, 6000)
            }
            reject(err)
          }
        )
    })
  }

  /**
   * 上传错误信息
   * @param code
   */
  getErrorDesc (code: string) {
    switch (code) {
      case 'ConnectionTimeoutError':
        return '网络超时'

      case 'RequestError':
        return '请求出错'

      default:
        return '未知错误'
    }
  }

  /**
   * 根据目录获取上传权限参数
   * @param dir
   */
  getPolicyMult (dir: string): Promise<PolicyMultData> {
    return post(
      'res/oss/getPolicyMult',
      { dir: dir + '/' + ToolsUtil.getRandomFileName() }
    )
  }

  /**
   * 根据目录获取上传权限参数
   * @param dir
   */
  getPolicyDirect (dir: string): Promise<PolicyDirectData> {
    return post(
      'res/oss/getPolicy', { dir: dir + '/' + ToolsUtil.getRandomFileName() }, {
        paramsSerializer (params) {
          return `dir=${params.dir}`
        }
      }
    )
  }

  /**
   * 获取上传权限
   * @param isDirect
   * @param uploadDir
   */
  getPolicy (isDirect: boolean, uploadDir: string): Promise<PolicyData> {
    if (isDirect) {
      return this.getPolicyDirect(uploadDir)
    } else {
      return this.getPolicyMult(uploadDir)
    }
  }

  /**
   * 大于20M分片
   * @param filesize
   */
  isDirectUpload (filesize: number): boolean {
    const filesizeThreshold = 20 * 1024 * 1024
    return filesize < filesizeThreshold
  }

  /**
   * 根据文件大小自动分片上传
   * @param uploadXhrArgs
   * @param uploadDir
   */
  upload2AliOSS (uploadXhrArgs: UploadXHRArgs, uploadDir: string): Promise<string> {
    const isDirect = this.isDirectUpload(uploadXhrArgs.file.size)

    return new Promise((resolve, reject) => {
      this.getPolicy(isDirect, uploadDir).then((res: PolicyData) => {
        if (res.data.status === 200) {
          const uploadTask: UploadTask = this.addUploadTask(uploadXhrArgs, res.data.data, isDirect)
          if (isDirect) {
            this.directUpload2AliOSS(uploadTask).then(url => (resolve(url))).catch(err => (reject(err)))
          } else {
            this.resumeUpload(uploadTask).then(url => (resolve(url))).catch(err => (reject(err)))
          }
        } else {
          uploadXhrArgs.onError(res.data.message, uploadXhrArgs)
          reject(new Error(res.data.message))
        }
      }).catch((err) => {
        uploadXhrArgs.onError(err, uploadXhrArgs)
        reject(err)
      })
    })
  }

  /**
   * 直接上传
   * uploadTask
   */
  directUpload2AliOSS (uploadTask: UploadTask): Promise<string> {
    return new Promise((resolve, reject) => {
      const policy = (uploadTask.policy as PolicyDirectDataType)
      const formData = new FormData()
      formData.append('key', uploadTask.objectName)
      formData.append('policy', policy.policy)
      formData.append('OSSAccessKeyId', policy.accessKeyId)
      formData.append('Signature', policy.signature)
      formData.append('file', uploadTask.uploadXhrArgs.file)
      formData.append('success_action_status', '200')
      bareService.post(process.env.VUE_APP_OSS_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: function (data) {
          return data
        },
        onUploadProgress: (progressEvent) => {
          uploadTask.uploadXhrArgs.onProgress(
            {
              percent: progressEvent.loaded / progressEvent.total * 100,
              progressEvent: progressEvent,
              url: uploadTask.objectName,
              uploadTask
            }
          )
        }
      }).then(res => {
        if (res.status === 200) {
          uploadTask.uploadXhrArgs.onSuccess(
            uploadTask,
            res
          )
          resolve(uploadTask.objectName)
        } else {
          reject(new Error(res.data.message))
        }
      }).catch((err) => {
        uploadTask.uploadXhrArgs.onError(err, uploadTask)
        reject(err)
      })
    })
  }

  /**
   * 获取原始地址重命名文件
   * @param filename
   * @param objectName
   */
  async getSignatureUrl (filename: string, objectName: string) {
    return this.ossClient.signatureUrl(objectName, { response: { 'content-disposition': `attachment; filename=${filename}` } })
  }

  /**
   * 普通下载文件方法
   * @param filename
   * @param fileUrl
   */
  normalDownload (filename: string, fileUrl: string) {
    const ele = document.createElement('iframe') as HTMLIFrameElement
    ele.src = fileUrl
    ele.width = '0px'
    ele.height = '0px'
    ele.style.display = 'none'
    document.body.appendChild(ele)
    timer(1000).subscribe(() => {
      document.body.removeChild(ele)
    })
    // 支持HTML5下载属性的浏览器
    // const link = document.createElement('a');
    // const url = fileUrl;
    // link.setAttribute('href', url);
    // link.setAttribute('download', filename);
    // link.style.visibility = 'hidden';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    // const $eleForm = document.createElement('form');
    // $eleForm.setAttribute('method', 'get');
    // $eleForm.setAttribute('action','xx');
    // document.body.appendChild($eleForm);
    // $eleForm.submit();
  }
}
const AliOssInstane = new AliOssService()
export {
  AliOssInstane
}
