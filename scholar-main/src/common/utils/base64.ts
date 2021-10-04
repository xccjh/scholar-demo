import { Base64 } from 'js-base64'
import { AnyJson } from '../base/common'

/**
 * @description 对obj的key和value进行base64加解密
 * @param source 加解密对象
 * @param type  默认加密，encode解密
 */
export function codeJson (source: AnyJson, type = 'encode'): AnyJson {
  const result = {}
  if (!source) {
    return result
  }
  for (const attr in source) {
    if (Object.prototype.hasOwnProperty.call(source, attr)) {
      result[Base64[type](attr)] = Base64[type](source[attr])
    }
  }
  return result
}
