/**
 * @description blob方式实现二进制流下载
 * @param template  二进制流 blob或file
 * @param filename 文件名
 * @param fileType 文件类型
 */
export function commonDownload (template, filename = '未命名', fileType) {
  let blob
  if (template instanceof Blob) {
    blob = template
  } else {
    blob = new Blob([template], { type: fileType })
  }
  let link: any = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(blob)
  link.click()
  link = null
}

/**
 * @description 根据文件地址下载文件
 * @param linkBlob Blob
 * @param name 文件名
 */
export function blobDownload (linkBlob:Blob, name:string) {
  const link = document.createElement('a')
  const url = window.URL.createObjectURL(linkBlob)
  link.setAttribute('href', url)
  link.setAttribute('download', name)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
