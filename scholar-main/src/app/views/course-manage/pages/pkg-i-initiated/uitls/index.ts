import { Json } from '@/common/base'

export function delIf (data: Json) {
  return String(data.status) !== '99'
}
