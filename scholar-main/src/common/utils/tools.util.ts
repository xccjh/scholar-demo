import { Json, AtrFormOpt, win } from '../base/common'
import { Observable, Subscriber, timer } from 'rxjs'
import themeColor from '@/assets/plugins/themeColor'
import { codeJsonAES } from '@/common/utils/crypto'
import { CommonApi } from '@/app/api'
import store from '@/app/store'

declare const window: win

export class ToolsUtil {
  static ossPrefix = process.env.VUE_APP_OSS_URL;

  static themeMap = {
    normal: {
      themeLabel: 'normal',
      // primaryColor: '#00AB84'
      primaryColor: '#1890ff'
    },
    zksd: {
      themeLabel: 'educational',
      // primaryColor: '#FF9900'
      primaryColor: '#1890ff'
    }
  };

  static cacheOrgCode = '';

  /**
   * 从符合?xx&或?xx&v.里拿orgCode,注意符合?第一位加&,此外，切记不要只加=,即？qkc=拿到的是cjsd
   * /?qkc#/ /?qkc&aa=1#/ /#/?qkc /#/?qkc&aa=1 四种情况拿到qkc
   * /#/ 拿到cjsd
   * /?aa=1&qkc&bb=2#/ /#/?aa=1&qkc&bb=2 为了避免用户误删查询字符串导致拿错,这两种拿到cjsd
   * 不符合一律拿到cjsd
   */
  static getOrgCodeFromQuestionMark = () => {
    const hrefs = window.location.href.split('?')
    if (hrefs.length >= 2) {
      const paramStr = hrefs[1]
      let orgCodeEnd = hrefs[2]// hash后的?之后
      // 参数字符串里有没带 #&
      let orgCodePre = paramStr.split('#')[0] // hash前的?和#之间
      const test = /^[a-z]+$/
      if (orgCodePre) {
        if (test.test(orgCodePre)) {
          return orgCodePre
        } else {
          orgCodePre = orgCodePre.split('&')[0]
          if (test.test(orgCodePre)) {
            return orgCodePre
          } else {
            orgCodePre = orgCodePre.split('=v.')[0]
            if (test.test(orgCodePre)) {
              return orgCodePre
            }
          }
        }
      }
      if (orgCodeEnd) {
        if (test.test(orgCodeEnd)) {
          return orgCodeEnd
        } else {
          orgCodeEnd = orgCodeEnd.split('&')[0]
          if (test.test(orgCodeEnd)) {
            return orgCodeEnd
          } else {
            orgCodeEnd = orgCodeEnd.split('=v.')[0]
            if (test.test(orgCodeEnd)) {
              return orgCodeEnd
            }
          }
        }
      }
      return 'cjsd'
    } else {
      return 'cjsd'
    }
    // const hrefs = window.location.href.split('?');
    // if (hrefs.length >= 2) {
    //   const paramStr = hrefs[1];
    //   // 参数字符串里有没带 =?/#
    //   let orgCode = paramStr.split('=')[0];
    //   orgCode = orgCode.split('?')[0];
    //   orgCode = orgCode.split('/')[0];
    //   orgCode = orgCode.split('#')[0];
    //   orgCode = orgCode.split('/')[0];
    //   return orgCode;
    // } else {
    //   return '';
    // }
  }

  /**
   * 根据赛道初始化主题
   */
  static initTheme () {
    const sdTheme = this.themeMap[this.getOrgCode()]
    if (sdTheme && sdTheme.themeLabel) {
      themeColor.changeColor(sdTheme.primaryColor)
      window.$theme.style = sdTheme.themeLabel
    } else {
      themeColor.changeColor(this.themeMap.normal.primaryColor)
      window.$theme.style = this.themeMap.normal.themeLabel
    }
  }

  /**
   * 获取赛道对应题库编号
   * @param fn
   */
  static getProdId (fn) {
    const codeUid = localStorage.getItem('SCHOLAR_CODEUID_' + this.getOrgCode())
    if (codeUid) {
      fn(codeUid)
    } else {
      timer(100).subscribe(() => {
        this.getProdId(fn)
      })
    }
  }

  static getCodeUid (cb) {
    if (!store.getters.codeUid) {
      CommonApi.getCodeUid().then(res => {
        if (res.data.status === 200) {
          store.commit('setCodeUid', res.data.data.uid)
          cb(res.data.data.uid)
        }
      })
    } else {
      cb(store.getters.codeUid)
    }
  }

  static getTkToken (fn) {
    const tkTokenStr = localStorage.getItem('SCHOLAR_TkToken_' + this.getOrgCode())
    let tkToken: Json = {}
    if (tkTokenStr) {
      tkToken = codeJsonAES(JSON.parse(tkTokenStr), 'decode')
    }
    if (tkToken.token) {
      fn(tkToken)
    } else {
      timer(100).subscribe(() => {
        this.getTkToken(fn)
      })
    }
  }

  /**
   * 以同步方式保证获取到赛道对应题库编号
   */
  static async getProdIdSync () {
    return new Promise((resolve) => {
      this.getProdId((proId) => {
        resolve(proId)
      })
    })
  }

  /**
   * 固定赛道存储空间规划
   * @param prefix
   */
  static createCacheKey (prefix: string) {
    return `SCHOLARST_${prefix}_${ToolsUtil.getOrgCode()}`
  }

  /**
   * 超出50字符展示...
   * @param str
   */
  static getTwoWords (str) {
    if (str && str.replace(/[\u4e00-\u9fa5]/g, 'aa').length > 60) {
      return str.substring(0, 50) + '...'
    } else {
      return str || '--'
    }
  }

  /**
   * 获取数组中最大seq
   * @param arr
   */
  static getMaxSeq (arr) {
    if (!arr) {
      return 0
    }
    let max = 0
    arr.forEach(item => {
      if (item.seq > max) {
        max = item.seq
      }
    })
    return max + 1
  }

  /**
   * 响应式监听属性变化执行回调
   * @param watchObj
   * @param watchKey
   * @param initState
   * @param callback
   */
  static watchTool = (watchObj = {}, watchKey = 'flag', initState = false, callback = (val) => val) => {
    let watchFlag = initState
    Object.defineProperty(watchObj, watchKey, {
      get () {
        return watchFlag
      },
      set (val) {
        watchFlag = val
        callback(val)
      }
    })
  };

  /**
   * 原生ajax
   * @param url
   * @param data
   */
  static getAjax = (url, data?) => {
    return new Observable<any>((observer: Subscriber<any>) => {
      // XMLHttpRequest对象用于在后台与服务器交换数据
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        // readyState == 4说明请求已完成
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 304) {
            // 从服务器获得数据
            observer.next(xhr.responseText)
            observer.complete()
            // observer.unsubscribe();
          } else {
            observer.next('题库服务异常')
            observer.complete()
            // observer.unsubscribe();
          }
        }
      }
      let urls = url
      if (data) {
        urls += '?' + queryParam(data)
      }
      xhr.open('GET', urls, true)
      xhr.send()
    })
  };

  /**
   * 原生ajax
   * @param url
   * @param data
   */
  static postAjax = (url, data, contentType = { 'Content-Type': 'application/x-www-form-urlencoded' }) => {
    return new Observable<any>((observer: Subscriber<any>) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      // 添加http头，发送信息至服务器时内容编码类型
      contentType = { ...{ 'Content-Type': 'application/x--form-urlencoded' }, ...contentType }
      Object.keys(contentType).forEach(item => {
        xhr.setRequestHeader(item, contentType[item])
      })
      let params
      if (contentType['Content-Type'] !== 'application/x-www-form-urlencoded') {
        params = JSON.stringify(data)
      } else {
        params = queryParam(data)
      }
      xhr.send(params)
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 304) {
            observer.next(xhr.responseText)
            observer.complete()
            observer.unsubscribe()
          } else {
            observer.next('题库服务异常')
            observer.complete()
            observer.unsubscribe()
          }
        }
      }
    })
  };

  /**
   * 从子域名拿orgCode， qkc.xxxx.com
   */
  static getOrgCodeFromSubDN = () => {
    return location.host.split('.')[0]
  };

  /**
   * 通用获取orgCode方法
   */
  static getOrgCode = () => {
    if (ToolsUtil.cacheOrgCode !== '') {
      return ToolsUtil.cacheOrgCode
    }
    // if (window['__WHO__'] && window['__WHO__'] === 'mng') {
    //   ToolsUtil.cacheOrgCode = 'cjsd';
    // } else {
    const org = ToolsUtil.getOrgCodeFromQuestionMark()
    // const org = LocalStorageUtil.get
    // console.log("question:", org);
    if (org === '') {
      // ToolsUtil.cacheOrgCode = ToolsUtil.getOrgCodeFromSubDN();
      ToolsUtil.cacheOrgCode = 'cjsd'
    } else {
      ToolsUtil.cacheOrgCode = org
    }
    // }
    // console.log(ToolsUtil.cacheOrgCode)
    // const org = LocalStorageUtil.getClassMarketData()?.orgCode || '' //使用此方法会形成tools、localstorage文件循环调用
    // const org = JSON.parse(localStorage.getItem('MarketData'))?.orgCode || ''
    // if(org){
    //   ToolsUtil.cacheOrgCode = org
    // }else{
    //   ToolsUtil.cacheOrgCode = 'cjsd'
    // }
    return ToolsUtil.cacheOrgCode
  }

  /**
   * 获取oss正确路径
   * @param url string
   * @param ossPrefix 是否要前缀
   */
  static getOssUrl (url: string, ossPrefix = true) {
    if (!url) {
      return ''
    }
    if (url.startsWith('http')) {
      return url
    }
    if (!url.startsWith('/')) {
      url = '/' + url
    }
    return ossPrefix ? this.ossPrefix + url : url
  }

  /**
   * 指定位数生成随机字符串,默认32位数
   * @param num 位数
   */
  static randomString (num?: number) {
    num = num || 32
    const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    const a = t.length
    let n = ''
    for (let i = 0; i < num; i++) {
      n += t.charAt(Math.floor(Math.random() * a))
    }
    return n
  }

  /**
   * 固定29位字符串用来做文件夹名称
   */
  static getRandomFileName () {
    const timestimp = new Date().getTime().toString()
    const expect = 16
    let str = Math.random().toString(36).substring(2)
    while (str.length < expect) {
      str += Math.random().toString(36).substring(2)
    }
    return str.substring(0, expect) + timestimp
  }

  /**
   * 根据文件地址获取扩展名
   * @param fileName
   */
  static getFileExt (fileName) {
    if (!fileName || fileName.indexOf('//') > -1) {
      return ''
    }
    const index = fileName.lastIndexOf('.')
    const suffix = fileName.substr(index + 1)
    return suffix === fileName ? '' : suffix
  }

  /**
   * 根据文件地址获取文件名
   * @param fileName
   */
  static getFileName (fileName) {
    if (!fileName) {
      return ''
    }
    const index = fileName.lastIndexOf('/')
    const suffix = fileName.substr(index + 1)
    return suffix
  }

  /**
   * 换算时区格式化
   * @param date
   */
  static getFormatDate (date: Date): string {
    const localTime = date.getTime() // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    const localOffset = date.getTimezoneOffset() * 60000 // 格林威治时间和本地时间之间的时差,单位分
    const utcTime = localTime + localOffset // 已知本地时间，换算对应格林威治时间
    const curTime = utcTime + (3600000 * 8) // 换算东八区时间
    date.setTime(curTime)

    let month: string | number = date.getMonth() + 1
    let strDate: string | number = date.getDate()

    if (month <= 9) {
      month = '0' + month
    }

    if (strDate <= 9) {
      strDate = '0' + strDate
    }
    return date.toLocaleTimeString()
  }

  /**
   * 获取扩展名
   * @param name
   */
  static getExt (name: string | undefined): string {
    if (!name || typeof (name) !== 'string') {
      return ''
    }

    let suffix = ''
    try {
      const flieArr = name.split('.')
      suffix = flieArr[flieArr.length - 1]
    } catch (err) {
      suffix = ''
    }
    return suffix.toLocaleLowerCase()
  }

  static isMP3 (ext: string) {
    return /mp3/.test(ext)
  }

  /**
   * 根据文件地址获取文件类型
   * @param fileName
   */
  static getFileType (fileName): string {
    // 获取类型结果
    let result: any = ''
    const suffix = this.getExt(fileName)
    // fileName无后缀返回 false
    if (!suffix) {
      return ''
    }

    // 图片格式
    const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif']
    // 进行图片匹配
    result = imglist.find(item => item === suffix)
    if (result) {
      return 'image'
    }
    // 匹配txt
    const txtlist = ['txt']
    result = txtlist.find(item => item === suffix)
    if (result) {
      return 'txt'
    }
    // 匹配 excel
    const excelist = ['xls', 'xlsx']
    result = excelist.find(item => item === suffix)
    if (result) {
      return 'excel'
    }
    // 匹配 word
    const wordlist = ['doc', 'docx']
    result = wordlist.find(item => item === suffix)
    if (result) {
      return 'word'
    }
    // 匹配 pdf
    const pdflist = ['pdf']
    result = pdflist.find(item => item === suffix)
    if (result) {
      return 'pdf'
    }
    // 匹配 ppt
    const pptlist = ['ppt', 'pptx']
    result = pptlist.find(item => item === suffix)
    if (result) {
      return 'ppt'
    }
    // 匹配 视频
    const videolist = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v']
    result = videolist.find(item => item === suffix)
    if (result) {
      return 'video'
    }
    // 匹配 音频
    const radiolist = ['mp3', 'wav', 'wmv']
    result = radiolist.find(item => item === suffix)
    if (result) {
      return 'radio'
    }
    // 其他 文件类型
    return 'other'
  }

  static isPicture (path: string) {
    const suffix = this.getExt(path)
    return /(jpg|jpeg|png)$/.test(suffix)
  }

  static isDoc (path: string) {
    const suffix = this.getExt(path)
    return /(doc|docx)$/.test(suffix)
  }

  static isExl (path: string) {
    const suffix = this.getExt(path)
    return /(xls|xlsx)$/.test(suffix)
  }

  static isPPT (path: string) {
    const suffix = this.getExt(path)
    return /(ppt|pptx)$/.test(suffix)
  }

  static isPdf (path: string) {
    const suffix = this.getExt(path)
    return /pdf$/.test(suffix)
  }

  static isVideo (ext: string) {
    const suffix = this.getExt(ext)
    return /mp4|m2v|mkv|rmvb|wmv|avi|flv|mov/.test(suffix)
  }

  /**
   *
   * @param path 获取文件预览图地址
   */
  static getThumbUrl (path: string) {
    if (!path) {
      return ''
    }
    // 后缀获取
    const suffix = this.getExt(path)
    if (this.isPicture(suffix)) {
      return process.env.VUE_APP_OSS_URL + path
    } else if (this.isDoc(suffix)) {
      return process.env.VUE_APP_OSS_URL + '/common/doc.png'
    } else if (this.isExl(suffix)) {
      return process.env.VUE_APP_OSS_URL + '/common/excel.png'
    } else if (this.isPPT(suffix)) {
      return process.env.VUE_APP_OSS_URL + '/common/ppt.png'
    } else if (this.isPdf(suffix)) {
      return process.env.VUE_APP_OSS_URL + '/common/pdf.png'
    } else if (this.isVideo(suffix)) {
      return process.env.VUE_APP_OSS_URL + '/common/video.png'
    } else {
      return ''
    }
  }

  /**
   * 取一个key对数组sort
   * @param key
   */
  static compare (key: string) {
    return (obj1, obj2) => {
      const val1 = obj1[key]
      const val2 = obj2[key]
      if (val1 < val2) {
        return -1
      } else if (val1 > val2) {
        return 1
      } else {
        return 0
      }
    }
  }

  /**
   * 下载文件
   * @param url
   */
  static downLoadFile (url: string) {
    if (!url) {
      return console.log('无效连接')
    }
    const ele = document.createElement('iframe') as HTMLIFrameElement
    ele.src = url
    ele.width = '0px'
    ele.height = '0px'
    ele.style.display = 'none'
    document.body.appendChild(ele)
  }
}

/**
 * 查询字符串转对象
 * @param queryString
 */
export const parseToObject = (queryString) => {
  // 使用 & 符号将查询字符串分割开
  const parts = queryString.split('&')
  // 遍历所有的 "key=value" 字符串结构
  const obj = {}
  for (let i = 0, len = parts.length; i < len; i++) {
    // 使用 = 将 "key=value" 字符串分割开
    const arr = parts[i].split('=')
    // = 号前的内容是对象的属性名，= 号后的内容是对应属性的值
    const name = arr.shift()
    const value = arr.join('=')
    // 将属性添加到对象中
    obj[name] = value
  }
  // 返回创建好的对象
  return obj
}

/**
 * 收集obj的key存为一个数组
 * @param actual
 */
export const cleanArray = (actual: any[]): any[] => {
  const newArray: any[] = []
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}
/**
 * 字符串数组去重
 * @param arr
 */
export const uniArr = (arr: string[]): string[] => {
  const newArr: string[] = []
  for (let i = 0; i < arr.length; i++) {
    if (newArr.indexOf(arr[i]) === -1) {
      newArr.push(arr[i])
    }
  }
  return newArr
}
/**
 * 对象转查询字符串
 * @param string
 */
export const queryParam = (json?: Json): string => {
  if (!json) {
    return ''
  }
  return cleanArray(Object.keys(json).map(key => {
    if (json[key] === undefined) {
      return ''
    }
    return encodeURIComponent(key) + '=' +
      encodeURIComponent(json[key])
  })).join('&')
}
