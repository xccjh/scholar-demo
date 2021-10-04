
import CryptoJS from 'crypto-js'
import { AnyJson } from '@/common/base'

const key = 'qkc secret key 123'

/**
 * @description 字符串解密方法
 * @param word 待解密字符串
 * @param salt 盐
 * @return string
 */
function Decrypt (word:string, salt?:string):string {
  return JSON.parse(CryptoJS.AES.decrypt(word, (salt ? (salt + key) : key)).toString(CryptoJS.enc.Utf8))
}

/**
 * @description 加密方法
 * @param word 待加密字符串
 * @param salt 盐
 * @return string
 */
function Encrypt (word:string, salt?:string):string {
  return CryptoJS.AES.encrypt(JSON.stringify(word), (salt ? (salt + key) : key)).toString()
}

/**
 * @description 对obj的key和value进行非不可逆加解密
 * @param source 加解密对象
 * @param type  默认加密，encode解密
 */
function codeJsonAES (source: AnyJson, type = 'encode'): AnyJson {
  const result = {}
  const process = type === 'encode' ? Encrypt : Decrypt
  if (!source) {
    return result
  }
  for (const attr in source) {
    if (Object.prototype.hasOwnProperty.call(source, attr)) {
      result[process(attr)] = process(source[attr])
    }
  }
  return result
}

export {
  Decrypt,
  Encrypt,
  codeJsonAES
}
