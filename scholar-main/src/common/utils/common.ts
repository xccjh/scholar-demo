import { app } from '@/main'
import { SessionStorageUtil } from '@/common/utils/sessionstorage.util'
import { Json, Menu, PreviewFileOption, Sorter } from '@/common/base'
import { MicroApp } from 'qiankun/es/interfaces'
import { ToolsUtil } from '@/common/utils/tools.util'
import { Shared } from '@/common/services/qiankun-share'
import { loadMicroApp } from 'qiankun'
import { message, Modal } from 'ant-design-vue'
import { Component, createApp, h, Ref, ref, UnwrapRef } from 'vue'
import { PreviewResourse } from '@/common/components'
import { oMultiDiff, strChineseFirstPY } from '@/common/constants'
import { SearchTableState } from '@/app/views/entity'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { timer } from 'rxjs'
import { LocalStorageUtil } from '@/common/utils/localstorage.util'

/**
 * @description 动态生成script引入并缓存
 * @param src
 */
export function loadScript (src) {
  const headElement = document.head || document.getElementsByTagName('head')[0]

  return new Promise((resolve, reject) => {
    if (src in app.config.globalProperties.importedScript) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.type = 'text/javascript';
    (script as any).ignore = true
    script.onerror = () => {
      headElement.removeChild(script)
      reject(new URIError(`The Script ${src} is no accessible.`))
    }
    script.onload = () => {
      app.config.globalProperties.importedScript[src] = true
      resolve(true)
    }
    headElement.appendChild(script)
    script.src = src
  })
}

/**
 * @description 串行化执行promises
 * @param promises Promise数组
 * @param fn 最终回调
 */
export function serialPromises2 (promises, fn?) {
  if (!Array.isArray(promises)) {
    return
  }
  const process = (idx) => {
    const curr = promises[idx]
    // next 需要能够接收参数
    const next = function (res) {
      // 基于递归实现promise的串行
      process(++idx)
    }
    if (curr) {
      curr.then(next).catch(next)
    } else {
      fn && fn()
    }
  }
  process(0)
}

/**
 * @description 保证val转换在min和max之间
 * @param val
 * @param min
 * @param max
 */
export function limitNumberInRange (val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

/**
 * @description 计算val在max和min的百分比
 * @param min
 * @param max
 * @param val
 */
export function getPercent (min: number, max: number, val: number): number {
  return ((val - min) / (max - min)) * 100
}

/**
 *  @description 取[min, max]之间的一个随机数
 *  @param range
 */
export function getRandomInt (range: [number, number]): number {
  return Math.floor(Math.random() * (range[1] - range[0] + 1) + range[0])
}

/**
 * @description 随机数组索引
 * @param arr
 */
export function shuffle<T> (arr: T[]): T[] {
  const result = arr.slice()
  for (let i = 0; i < result.length; i++) {
    // 0和i 之间的一个随机数
    const j = getRandomInt([0, i]);

    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * @description  通用获取文件预览图地址
 * @param type
 */
export function getFileThumbUrl (type: string): string {
  let thumbUrl = ''
  if (
    type === 'application/msword' ||
    type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    type === 'doc' ||
    type === 'docx' || type === 'zip' || type === 'rar'
  ) {
    thumbUrl = process.env.VUE_APP_OSS_URL + '/common/doc.png'
  } else if (
    type === 'application/vnd.ms-excel' ||
    type === 'application/x-xls' ||
    type ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    type === 'xls' ||
    type === 'xlsx'
  ) {
    thumbUrl = process.env.VUE_APP_OSS_URL + '/common/excel.png'
  } else if (
    type === 'application/x-ppt' ||
    type === 'application/vnd.ms-powerpoint' ||
    type ===
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    type === 'ppt' ||
    type === 'pptx'
  ) {
    thumbUrl = process.env.VUE_APP_OSS_URL + '/common/ppt.png'
  } else if (type === 'application/pdf' || type === 'pdf') {
    thumbUrl = process.env.VUE_APP_OSS_URL + '/common/pdf.png'
  } else if (type === 'video/mp4' || type === 'mp4' || type === 'webm' || type === 'ogg') {
    thumbUrl = process.env.VUE_APP_OSS_URL + '/common/video.png'
  }
  return thumbUrl || process.env.VUE_APP_OSS_URL + '/common/video.png'
}

/**
 * @description 转换帕斯卡
 * @param str
 */
export function toCamelCase (str) {
  if (str) {
    return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('')
  }
}

/**
 * @description 转换小驼峰
 * @param str
 */
export function camelCase (str) {
  const s =
    str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('')
  return s.slice(0, 1).toLowerCase() + s.slice(1)
}

/**
 * @description 去除参数位
 * @param link
 * @return string
 * @example "/m/scp/prepare-course/:id/:name/:courseId/:professionId/:status?text=1" => "/m/scp/prepare-course"
 * @example "/m/scp/prepare-course/?text=1" => "/m/scp/prepare-course/?text=1"
 * @example "/m/scp/prepare-course?text=1" => "/m/scp/prepare-course?text=1"
 */
export function getPureLink (link: string): string {
  return link.replace(/\/:.+(\/)?/g, '')
}

/**
 * @description 截去参数位和查询位，保留最后/
 * @param str
 * @example "/m/scp/prepare-course/:id/:name/:courseId/:professionId/:status?text=1" => "/m/scp/prepare-course/"
 * @example "/m/scp/prepare-course" => "/m/scp/prepare-course"
 */
export function getNoParamUrl (str: string): string {
  const idx = str.indexOf('/:')
  return idx === -1 ? str : str.substr(0, idx + 1)
}

/**
 * @description 宽判断路由地址和菜单数据地址是否相等
 * @param menuUrl 菜单数据的url
 * @param url 路由地址-router.path-没有查询参数
 */
export function isUrlEqMenu (menuUrl: string, url: string): boolean {
  if (menuUrl === '') {
    return false
  }
  /**
   * originMenuUrl可能不以/结尾，实现目的：
   * (/test/:id)转originMenuUrl:(/test/)匹配路由(/test/或/test/1)
   * (/test)转originMenuUrl:(/test)匹配路由(/test/或/test)
   * 即 originMenuUrl.length <= url.length恒成立
   */
  let originMenuUrl = getNoParamUrl(menuUrl)

  /**
   * originMenuUrl.length === url.length
   * (/test)转(/test) === (/test)
   * todo: (/test/:id)转(/test/) === (/test/) 匹配到了空参
   */
  if (originMenuUrl === url) {
    return true
    /**
     * originMenuUrl.length < url.length
     * 兼容参数的匹配,这种菜单路由/test兼容可以和地址路由/test/匹配
     * 如菜单路由/test/a:1转为(/test/) === 地址路由(/test/2) => startsWith的作用
     * 如菜单路由/test转为(/test/) === 地址路由(/test/)
     */
  } else if (originMenuUrl.length < url.length) {
    if (originMenuUrl[originMenuUrl.length - 1] !== '/') {
      originMenuUrl += '/'
    }
    if (url.startsWith(originMenuUrl)) {
      return true
    }
  }

  return false
}

/**
 * @description 去除查询对比路由地址相等
 * @param purePath 菜单路由获取纯哈希地址，不会有查询参数
 * @param urlPath 普通路由地址
 * @example /m/test === /m/test
 * @example /m/test === /m/test/
 * @example /m/test === /m/test?zz=1
 * @example /m/text !== /m/test
 */
export const comparePath = (purePath: string, urlPath: string) => {
  const pureArr = purePath.split('/')
  const urlArr = urlPath.split('?')[0].split('/')
  if (pureArr.length > urlArr.length) {
    return false
  }
  let isOk = true
  for (let i = 0; i < pureArr.length; i++) {
    if (pureArr[i] !== urlArr[i]) {
      isOk = false
      break
    }
  }
  return isOk
}

/**
 * @description 根据pureLink找到menu中的item
 * @param menus
 * @param url 对路由地址getPureLink后的pureLink
 */
export function getMenuByUrl (menus: Menu[], url: string): Menu | null {
  let tempMenu: Menu | null = null
  for (const menu of menus) {
    if (getPureLink(menu.link!) === url) {
      tempMenu = menu
      break
    } else if (menu.children && menu.children.length > 0) {
      const menuChildren = getMenuByUrl(menu.children!, url)
      if (menuChildren !== null) {
        tempMenu = menuChildren
        break
      }
    }
  }
  return tempMenu
}

/**
 * @description 持久化菜单数据
 * @param menus
 */
export const storeMenus = (menus: Menu[]): void => {
  SessionStorageUtil.putMenus(menus)
}
/**
 * @description 还原菜单数据缓存
 */
export const restoreMenus = (): Menu[] => {
  return SessionStorageUtil.getMenus()
}

/**
 * @description 路由跳转时自动卸载微应用防止内存泄露
 * @param next
 */
export const microhandler = (next) => {
  // 路由跳转卸载局部微应用
  const micro: { [index: string]: MicroApp } = app.config.globalProperties.micro
  const microArr: Promise<null>[] = []
  const keys: string[] = Object.keys(micro)
  if (keys.length) {
    keys.forEach(key => {
      const microItem: MicroApp = micro[key]
      if (microItem && microItem.unmount) {
        microArr.push(microItem.unmount())
      }
    })
    serialPromises2(microArr, () => {
      keys.forEach(childItem => {
        const child = document.getElementById(childItem)
        if (child) {
          document.body.removeChild(child)
        }
        delete app.config.globalProperties.micro[childItem]
      })
      next()
    })
  } else {
    next()
  }
}
/**
 * @description 保留全参数跳转hash
 * @param hash
 */
export const gotoReview = (hash) => {
  const hashArr = location.href.split('#')
  let preQuery = ''
  let afterQuery = ''
  if (hashArr && hashArr[0]) {
    let preHash
    if (location.port) {
      preHash = hashArr[0].split(location.port)
    } else {
      preHash = hashArr[0].split(location.host)
    }
    if (preHash && preHash[1]) {
      preQuery = preHash[1]
    }
  }
  if (hashArr && hashArr[1]) {
    const afterHash = hashArr[1].split('?')
    if (afterHash && afterHash[1]) {
      afterQuery = afterHash[1]
    }
  }
  location.href = location.protocol + '//' + location.host + (preQuery || '/') + '#/' + hash + (afterQuery ? '?' + afterQuery : '')
}

/**
 * 防抖函数
 * fu 延时调用函数
 * delay 延迟多长时间
 * antd树组件根据当前key获取至祖先节点key
 * @param key
 * @param treeData
 */
export const debounce = (fn, delayTime?) => {
  const delay = delayTime || 200
  let timer
  return function () {
    // @ts-ignore
    const th = this
    const args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(function () {
      timer = null
      fn.apply(th, args)
    }, delay)
  }
}

/**
 * @description 指定位数获取随机字符串
 * @param bit
 */
export function randomString (bit?) {
  const e = bit || 32
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const a = t.length
  let n = ''
  for (let i = 0; i < e; i++) {
    n += t.charAt(Math.floor(Math.random() * a))
  }
  return n
}

/**
 * @description 根据文件地址获取文件名
 * @param videoUrl
 */
export const getName = (videoUrl: string) => {
  const pos = videoUrl.lastIndexOf('/')
  return videoUrl.substring(pos + 1)
}
/**
 * @description 扩展名判断图片
 * @param ext
 */
export const isPicture = (ext: string) => {
  const picExt = 'jpg,jpeg,png'
  return picExt.indexOf(ext) > -1
}
/**
 * @description 通用获取文件预览图
 * @param attachmentPath
 */
export const getPreview = (attachmentPath: string) => {
  const ext = ToolsUtil.getExt(attachmentPath)
  if (isPicture(ext)) {
    return process.env.VUE_APP_OSS_URL + attachmentPath + '?x-oss-process=image/resize,m_fill,h_50,w_50'
  } else {
    return getFileThumbUrl(ext)
  }
}

/**
 * @description 自由dom方式公共预览文件
 * @param option Partial<PreviewFileOption>
 */
export const previewFileFree = (option: Partial<PreviewFileOption>) => {
  const micro = app.config.globalProperties.micro
  const loadPreview = (option) => {
    const shared = new Shared(option.sharedKey || 'one')
    shared.setFilePreviewState(option)
    micro[option.microKey || 'microApp1'] = loadMicroApp({
      name: option.title || '资料预览',
      entry: process.env.VUE_APP_commonViewer,
      container: option.container || '#microApp1',
      props: {
        name: option.title || '资料预览',
        shared
      }
    }, {
      sandbox: {
        experimentalStyleIsolation: true
      }
    })
  }
  const divDom1 = document.createElement('div')
  divDom1.id = option.container?.split('#')[1] || 'microApp1'
  divDom1.style.width = '800px'
  divDom1.style.height = '600px'
  divDom1.style.position = 'fixed'
  divDom1.style.zIndex = '99999'
  divDom1.style.overflow = 'auto'
  divDom1.style.left = '50%'
  divDom1.style.top = '40%'
  divDom1.style.backgroundColor = 'white'
  divDom1.style.transform = 'translate(-50%,-50%)'
  divDom1.style.boxShadow = '0 0 10px grey'
  document.body.appendChild(divDom1)
  if (option.polywayId) {
    // {
    //   polywayId: 'a647f95e6e8a407915e0d24d6b5adc48_a',
    //   share: '0',
    //   furl: '',
    //   native: '1',
    //   ow365: '0',
    //   viewerId: shared.getUserInfo().id,
    //   orgCode: 'cjsd',
    //   showTimer: '1',
    //   filePreviewCallBack () {
    //      alert('阅读完成了')
    //   }
    // }
    loadScript('//player.polyv.net/resp/vod-player/latest/player.js').then(flag => {
      if (flag) {
        loadPreview(option)
      }
    }).catch(() => {
      message.error('网络异常，请稍后再试！')
    })
  } else {
    // {
    //   polywayId: '',
    //   share: '0',
    //   furl: '/data/courseware/case/doc/s1hs19kvlrc2bfxe1603440271989/0n8qj0e382xdyona1603440593259.ppt',
    //   native: '1',
    //   ow365: '0',
    //   viewerId: shared.getUserInfo().id,
    //   orgCode: 'cjsd',
    //   showTimer: '1',
    //   filePreviewCallBack () {
    //      alert('阅读完成了')
    //   }
    // }
    loadPreview(option)
  }
}

/**
 * @description 自由dom方式公共卸载微应用
 * @param microKey  微应用key,随机指定用来自动回收防止内存泄露
 * @param container 挂载容器
 */
export const unMountpreviewFree = (microKey?: string, container?: string) => {
  const uniqueMicro = microKey || 'microApp1'
  const micro = app.config.globalProperties.micro
  if (micro[uniqueMicro] && micro[uniqueMicro].getStatus() === 'MOUNTED') {
    micro[uniqueMicro].unmount().then(() => {
      delete app.config.globalProperties.micro[uniqueMicro]
      const child1 = document.querySelector(container || '#microApp1')
      if (child1) {
        document.body.removeChild(child1)
      }
    })
  }
}

/**
 * @description modal方式公共预览文件
 * @param option Partial<PreviewFileOption>
 */
export const previewFile = (option: Partial<PreviewFileOption>) => {
  const micro = app.config.globalProperties.micro
  const loadPreview = (option) => {
    const shared = new Shared(option.sharedKey || 'one')
    shared.setFilePreviewState(option)
    micro[option.microKey || 'microApp1'] = loadMicroApp({
      name: option.title || '资料预览',
      entry: process.env.VUE_APP_commonViewer,
      container: option.container || (
        ToolsUtil.getFileType(option.furl) === 'image' ? '.preview-modal .preview-container-pic' : '.preview-modal .preview-container'
      ),
      props: {
        name: option.title || '资料预览',
        shared
      }
    }, {
      sandbox: {
        experimentalStyleIsolation: true
      }
    })
  }
  if (option.polywayId || (option.native === '1' && ToolsUtil.getFileType(option.furl) === 'video')) {
    // {
    //   polywayId: 'a647f95e6e8a407915e0d24d6b5adc48_a',
    //   share: '0',
    //   furl: '',
    //   native: '1',
    //   ow365: '0',
    //   viewerId: shared.getUserInfo().id,
    //   orgCode: 'cjsd',
    //   showTimer: '1',
    //   filePreviewCallBack () {
    //      alert('阅读完成了')
    //   }
    // }
    loadScript('//player.polyv.net/resp/vod-player/latest/player.js').then(flag => {
      if (flag) {
        loadPreview(option)
      }
    }).catch(() => {
      message.error('网络异常，请稍后再试！')
    })
  } else {
    // {
    //   polywayId: '',
    //   share: '0',
    //   furl: '/data/courseware/case/doc/s1hs19kvlrc2bfxe1603440271989/0n8qj0e382xdyona1603440593259.ppt',
    //   native: '1',
    //   ow365: '0',
    //   viewerId: shared.getUserInfo().id,
    //   orgCode: 'cjsd',
    //   showTimer: '1',
    //   filePreviewCallBack () {
    //      alert('阅读完成了')
    //   }
    // }
    loadPreview(option)
  }
}

/**
 * @description modal方式公共卸载微应用
 * @param microKey  微应用key
 * @param container 挂载容器
 */
export const unMountpreview = (microKey?: string, container?: string, cb?: () => any) => {
  const uniqueMicro = microKey || 'microApp1'
  const micro = app.config.globalProperties.micro
  if (micro[uniqueMicro] && micro[uniqueMicro].getStatus() === 'MOUNTED') {
    micro[uniqueMicro].unmount().then(() => {
      delete app.config.globalProperties.micro[uniqueMicro]
      cb && cb()
    })
  }
}

/**
 * 对比两个字符串数组相等
 */
export const compareArrayChange = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) {
    return true
  }
  let flag = false
  const flag1 = arr2.every(inner => {
    return arr1.indexOf(inner) > -1
  })
  if (flag1) {
    flag = arr1.every(inner1 => {
      return arr2.indexOf(inner1) > -1
    })
  }
  return !(flag1 && flag)
}

/**
 * 是否全屏
 */
export function isFullScreen () {
  return !!(
    document.fullscreen ||
    (document as any).mozFullScreen ||
    (document as any).webkitIsFullScreen ||
    (document as any).webkitFullScreen ||
    (document as any).msFullScreen
  )
}

export const getCssAll = (dom) => {
  if (dom.currentStyle) {
    // 兼容ie
    return dom.currentStyle
  } else {
    return getComputedStyle(dom, null)
  }
}

export const judgmentFullScreenOver = (cb) => {
  if (window.screen.height === window.innerHeight) {
    cb()
  } else {
    timer(200).subscribe(() => {
      judgmentFullScreenOver(cb)
    })
  }
}

export const getMicroViewerContainer = (cb) => {
  const microViewerContainer = document.querySelector('.preview-container-pic .viewer-container') as any
  if (microViewerContainer) {
    cb(microViewerContainer)
  } else {
    timer(50).subscribe(() => {
      getMicroViewerContainer(cb)
    })
  }
}

/**
 * 退出全屏
 */
export function exitFullscreen () {
  if (!isFullScreen()) {
    return
  }
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen()
  } else if ((document as any).mozCancelFullScreen) {
    (document as any).mozCancelFullScreen()
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen()
  }
}

/**
 * 进入全屏
 */
export function fullScreens () {
  if (isFullScreen()) {
    return
  }
  const elem = document.body
  if ((elem as any).webkitRequestFullScreen) {
    (elem as any).webkitRequestFullScreen()
  } else if ((elem as any).mozRequestFullScreen) {
    (elem as any).mozRequestFullScreen()
  } else if ((elem as any).requestFullScreen) {
    (elem as any).requestFullscreen()
  } else {
  }
}

/**
 * 全局动态挂载组件工具
 * @param RootComponent 任意组件
 */
export function mountComponent (RootComponent: Component, containerId = 'preview-modal-container') {
  const app = createApp(RootComponent).use(Modal)
  const root = document.createElement('div')
  root.id = containerId
  document.body.appendChild(root)
  return {
    instance: app.mount(root),
    unmount () {
      if (document.body.querySelector('#' + containerId)) {
        app.unmount()
        document.body.removeChild(root)
      }
    }
  }
}

/**
 * 全局公共预览方法
 * @param option
 */
export function showPreviewResourceModal (option: Partial<PreviewFileOption>) {
  const visible = ref(true)
  const ComTool = mountComponent({
    setup () {
      return () => (h(PreviewResourse, {
        attachmentPath: option.attachmentPath,
        imageType: ToolsUtil.getFileType(option.furl) === 'image',
        visible: visible.value,
        'onUpdate:visible': (toggle: boolean | { visible: boolean }) => {
          if ((typeof toggle === 'object' && !toggle.visible) || !toggle) {
            ComTool.unmount()
          }
        },
        previewTitle: option.title || '资料预览'
      }))
    }
  })
  if (!option.attachmentPath) {
    previewFile(option)
  }
  return ComTool
}

/**
 * 课程审批状态
 * @param status
 */
export const getAuditStatus = (status: string) => {
  switch (status) {
    case '0':
      return '草稿'
    case '1':
      return '待审批'
    case '2':
      return '标准'
    case '3':
      return '未通过'
    case '4':
      return '撤回'
    default :
      return '未知'
  }
}
/**
 * 课包审批状态
 * @param status
 */
export const getAuditStatusPkg = (status: string) => {
  switch (status) {
    case '0':
      return '草稿'
    case '1':
      return '待审批'
    case '2':
      return '已通过'
    case '3':
      return '未通过'
    case '4':
      return '撤回'
    default :
      return '未知'
  }
}

/**
 * 获取讲师类型
 * @param teachType
 */
export const getTeacheType = (teachType: string) => {
  switch (teachType) {
    case '11':
      return '面授'
    case '12':
      return '双师'
    case '21':
      return '直播'
    case '22':
      return '录播'
    default :
      return '--'
  }
}

/**
 * 获取长度
 * @param title
 */
export function getContentLength (title: string): number {
  return title.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, 'a').replace(/\s/g, 'a').replace(/[\u0391-\uFFE5]/g, 'a').length
}

/**
 * 获取单个拼音首字母
 * @param ch :string
 */
export function checkCh (ch: string) {
  const uni = ch.charCodeAt(0)
  // 如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数
  if (uni > 40869 || uni < 19968) {
    return ch
  } // dealWithOthers(ch);
  // 检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母
  return (oMultiDiff[uni] ? oMultiDiff[uni] : (strChineseFirstPY.charAt(uni - 19968)))
}

/**
 * 获取全部拼音首字母
 * @param str string
 */
export function makePy (str: string) {
  const arrResult: string[] = [] // 保存中间结果的数组
  for (let i = 0, len = str.length; i < len; i++) {
    // 获得unicode码
    const ch = str.charAt(i)
    // 检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理
    arrResult.push(checkCh(ch))
  }
  // 处理arrResult,返回所有可能的拼音首字母串数组
  return mkRslt(arrResult)
}

/**
 * 返回所有可能的拼音首字母串数组
 * @param arr
 */
export function mkRslt (arr: string[]) {
  let arrRslt = ['']
  for (let i = 0, len = arr.length; i < len; i++) {
    const str = arr[i]
    const strlen = str.length
    if (strlen === 1) {
      for (let k = 0; k < arrRslt.length; k++) {
        arrRslt[k] += str
      }
    } else {
      const tmpArr = arrRslt.slice(0)
      arrRslt = []
      for (let k = 0; k < strlen; k++) {
        // 复制一个相同的arrRslt
        const tmp = tmpArr.slice(0)
        // 把当前字符str[k]添加到每个元素末尾
        for (let j = 0; j < tmp.length; j++) {
          tmp[j] += str.charAt(k)
        }
        // 把复制并修改后的数组连接到arrRslt上
        arrRslt = arrRslt.concat(tmp)
      }
    }
  }
  return arrRslt
}

/**
 *  课包列表排序
 * @param tableState
 * @param sorter
 */
export function sortScpData<T> (tableState: UnwrapRef<SearchTableState<T>>, sorter?: Sorter) {
  if (sorter) {
    const dataList = JSON.parse(JSON.stringify(tableState.data))
    if (sorter.order === 'ascend') {
      tableState.data = dataList.sort((stringA, stringB) => {
        const sA = makePy(stringA.courseSeriesName || '--')[0].toLowerCase()
        const sB = makePy(stringB.courseSeriesName || '--')[0].toLowerCase()
        if (sA < sB) {
          return -1
        }
        if (sA > sB) {
          return 1
        }
        if ((stringA.packetVer || 0) > (stringB.packetVer || 0)) {
          return 1
        }
        if ((stringA.packetVer || 0) < (stringB.packetVer || 0)) {
          return -1
        }
        return 0
      })
    } else if (sorter.order === 'descend') {
      tableState.data = dataList.sort((stringB, stringA) => {
        const sA = makePy(stringA.courseSeriesName || '--')[0].toLowerCase()
        const sB = makePy(stringB.courseSeriesName || '--')[0].toLowerCase()
        if (sA < sB) {
          return -1
        }
        if (sA > sB) {
          return 1
        }
        if ((stringA.packetVer || 0) > (stringB.packetVer || 0)) {
          return 1
        }
        if ((stringA.packetVer || 0) < (stringB.packetVer || 0)) {
          return -1
        }
        return 0
      })
    } else {
      tableState.data = dataList.sort((stringB, stringA) => {
        if (stringA.lastModifiedTime < stringB.lastModifiedTime) {
          return -1
        }
        if (stringA.lastModifiedTime > stringB.lastModifiedTime) {
          return 1
        }
        return 0
      })
    }
  }
}

/**
 * 排课枚举
 * @param ruleType
 */
export const getRuleType = (ruleType: '1' | '2') => {
  switch (ruleType) {
    case '1':
      return '自由排课'
    case '2':
      return '只升不降'
    default:
      return '--'
  }
}

/**
 * 找出数组所有匹配的索引
 * @param a
 * @param x
 */
export function findAll (a: string[], x: string): number[] {
  const results: number[] = []
  const len = a.length
  let pos = 0
  while (pos < len) {
    pos = a.indexOf(x, pos)
    if (pos === -1) { // 未找到就退出循环完成搜索
      break
    }
    results.push(pos) // 找到就存储索引
    pos += 1 // 并从下个位置开始搜索
  }
  return results
}

/**
 * antd树组件根据key获取当前节点
 * @param tree 树数据
 * @param key 某个节点的key
 * @param callback 找到节点后的回调
 */
export const loop = (tree: TreeDataItem[], key: string | number, callback: any) => {
  // tree.forEach((item, index, arr) => {
  //   if (item.id === key || item.key === key) {
  //     return callback(item, index, arr)
  //   }
  //   if (item.children) {
  //     return loop(item.children, key, callback)
  //   }
  // })
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === key || tree[i].key === key) {
      return callback(tree[i], i, tree)
    }
    if (tree[i].children && tree[i].children!.length) {
      loop(tree[i].children!, key, callback)
    }
  }
}

/**
 *
 * @param tree
 * @param key
 * @param callback
 */
export const changeLoop = (tree: TreeDataItem[], callback: any) => {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].status === '2' || tree[i].status === '3') {
      return callback(tree[i], i)
    }
    if (tree[i].children) {
      changeLoop(tree[i].children!, callback)
    }
  }
}

/**
 * antd树组件获取当前节点父节点
 * @param key
 * @param tree
 */
export const getParentKey = (key: string, tree: TreeDataItem[]): { parentKey: string; parentNode: TreeDataItem } | undefined => {
  let parentKey
  let parentNode
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.key === key || item.id === key)) {
        parentKey = node.id || node.key
        parentNode = node
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)?.parentKey
        parentNode = getParentKey(key, node.children)?.parentNode
      }
    }
  }
  if (parentKey) {
    return {
      parentKey,
      parentNode
    }
  }
}

/**
 * antd树组件获取整棵树第一个节点的最终子节点
 */
export const getFirstNodeFinalKey = (treeData: TreeDataItem[]): string => {
  let finalKey
  treeData.every(node => {
    if (!finalKey) {
      if (node.children && node.children.length) {
        finalKey = getFirstNodeFinalKey(node.children)
      } else {
        finalKey = node.id || node.key
      }
    }
  })
  return finalKey
}

/**
 * antd树组件根据当前key获取至祖先节点key
 * @param key
 * @param treeData
 */
export const getCurParentToAncestorkey = (key: string, treeData: TreeDataItem[]): string[] => {
  const { parentNode, parentKey } = getParentKey(key, treeData)!
  return TreeRecursivelyLimit({
    limit: 1,
    result: [parentKey],
    current: Number(parentNode.kType)
  }, treeData, parentKey) as string[]
}

/**
 * antd树组件根据当前key获取至指定深度父节点key
 * @param limitInfo {limit:number, result:string[], current:number}
 * @param treeData TreeDataItem[]
 * @param initKey 初始化key
 */
const TreeRecursivelyLimit = (limitInfo: { limit: number, result: string[], current: number }, treeData: TreeDataItem[], initKey: string): string[] | undefined => {
  if (limitInfo.limit < limitInfo.current) {
    limitInfo.current--
    const { parentKey } = getParentKey(initKey, treeData)!
    limitInfo.result.push(parentKey)
    return TreeRecursivelyLimit(limitInfo, treeData, parentKey)
  } else {
    return limitInfo.result
  }
}

/**
 * antd树组件从树中删除此节点
 * @param node
 */
export const removeTreeNode = (node: TreeDataItem, treeData: Ref<TreeDataItem[]>): void => {
  const { parentNode } = getParentKey(node.id, treeData.value)!
  parentNode.children = (parentNode.children || []).filter(child => child.id !== node.id)
}

/**
 * 检验重名
 * @param name
 */
export const checkSameName = (name: string, fileList: Json[]): boolean => {
  return fileList.every((file) => {
    if (file.name !== name) {
      return true
    }
  })
}

/**
 * 获取平台描述
 * @param platform
 */
export const getPlatformName = (platform: string) => {
  if (platform === 'platform-officer') {
    return '教务工作台'
  } else if (platform === 'platform-operator') {
    return '运营工作台'
  } else if (platform === 'platform-scholar') {
    return '教研工作台'
  } else if (platform === 'platform-teacher') {
    return '讲师工作台'
  }
}

/**
 * 跳转对应平台
 */
export const goPlatform = (platform: string) => {
  const userInfo = LocalStorageUtil.getUser()
  let url = '#/m/e/empty'
  if (platform === 'platform-officer') {
    LocalStorageUtil.putOfficerUser(userInfo)
    url = '#/m/e/empty'
  } else if (platform === 'platform-operator') {
    LocalStorageUtil.putOperatorUser(userInfo)
    url = '#/m/empty'
  } else if (platform === 'platform-teacher') {
    LocalStorageUtil.putTeacherUser(userInfo)
    url = '#/index/h'
  }
  window.open(window.location.href.split('#')[0].replace('scholar', platform.replace('platform-', '')) + url)
}
