import { InjectionKey, inject } from 'vue'

/**
 * 注入值不能是空
 * @param key 依赖注入的key
 * @returns
 */
export default function useRequiredInject<T> (key: InjectionKey<T>): T {
  const val = inject(key)
  if (!val) {
    throw new Error('注入值必须不能空')
  }

  return val
}
