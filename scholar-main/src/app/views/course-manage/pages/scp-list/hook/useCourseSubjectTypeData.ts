import { reactive } from 'vue'
import { ScpListApi } from '../api'

export function useCourseSubjectTypeData () {
  const courseSubjectTypeData = reactive<{
    courseSubjectTypeArr: { VALUE: string, NAME: string }[],
    courseSubjectTypeMap: { [key: string]: string }
  }>({
    courseSubjectTypeArr: [],
    courseSubjectTypeMap: {}
  })
  const getCourseSubjectTypeArr = (): Promise<{ VALUE: string, NAME: string }[]> => {
    return new Promise((resolve, reject) => {
      ScpListApi.getCoursePackList().then(res => {
        if (res.data && typeof res.data !== 'string' && res.data.length) {
          courseSubjectTypeData.courseSubjectTypeArr = res.data
          courseSubjectTypeData.courseSubjectTypeArr.forEach(e => {
            courseSubjectTypeData.courseSubjectTypeMap[e.VALUE] = e.NAME
          })
          resolve(res.data)
        } else {
          courseSubjectTypeData.courseSubjectTypeArr = []
          resolve([])
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }
  getCourseSubjectTypeArr()
  return { courseSubjectTypeData, getCourseSubjectTypeArr }
}
