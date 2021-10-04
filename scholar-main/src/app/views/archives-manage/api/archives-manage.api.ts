import { get, post, postBody } from '@/app/api'

export const RecordinLecturerApi = {
  getCourseList () {
    return post('pkg/course/list')
  },
  getGuideTeacherTableList (params) {
    return post('pkg/Lecturer/list', params)
  },
  guideTeacherDel (id) {
    return get('pkg/Lecturer/del', { id })
  },
  guideTeacherAddEdit (param) {
    return postBody('pkg/Lecturer/save', param)
  }
}
