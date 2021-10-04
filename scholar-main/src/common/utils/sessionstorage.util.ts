import { Json, DictGroup, PacketInfo, Menu } from '../base'
import { ToolsUtil } from './tools.util'
import { LocalStorageUtil } from '@/common/utils/localstorage.util'

export class SessionStorageUtil {
  static putCourseInfoItem (data: any) {
    const key = ToolsUtil.createCacheKey('courseProgress_VUE')
    sessionStorage.setItem(key, JSON.stringify(data))
  }

  static getCourseInfoItem () {
    const key = ToolsUtil.createCacheKey('courseProgress_VUE')
    return sessionStorage.getItem(key)
  }

  static removeCourseInfoItem () {
    const key = ToolsUtil.createCacheKey('courseProgress_VUE')
    return sessionStorage.removeItem(key)
  }

  static putCaseBackPath (caseBackPath: string) {
    const key = ToolsUtil.createCacheKey('caseBackPath_VUE')
    sessionStorage.setItem(key, caseBackPath)
  }

  static getCaseBackPath () {
    const key = ToolsUtil.createCacheKey('caseBackPath_VUE')
    return sessionStorage.getItem(key)
  }

  static removeCaseBackPath () {
    const key = ToolsUtil.createCacheKey('caseBackPath_VUE')
    return sessionStorage.removeItem(key)
  }

  static putMenus (menus: Menu[]): void {
    sessionStorage.setItem('SCHOLAR_MENUS_VUE_' + ToolsUtil.getOrgCode(), JSON.stringify(menus))
  }

  static getMenus (): Menu[] {
    const str = sessionStorage.getItem('SCHOLAR_MENUS_VUE_' + ToolsUtil.getOrgCode())
    if (str) {
      const menus: Menu[] = JSON.parse(str)
      return menus
    } else {
      return []
    }
  }

  static removeMenus () {
    sessionStorage.removeItem('SCHOLAR_MENUS_VUE_' + ToolsUtil.getOrgCode())
  }

  static putPacketInfoInner (packetInfo: PacketInfo): void {
    sessionStorage.setItem('SCHOLAR_PACKET_' + ToolsUtil.getOrgCode(), JSON.stringify(packetInfo))
  }

  static putPacketInfo (item: PacketInfo, preview?: boolean): void {
    const lessonCount = item.lessonCount ? item.lessonCount : 1
    const isSmart = item.isSmart ? item.isSmart : '0'
    const auditStatus = item.auditStatus ? item.auditStatus : '0'
    const {
      id, name, status, teachType, createrId, pcode, majorId, courseId,
      courseCode, code, majorLeaderId, knowledgeSubjectId, isCard, is99Train,
      isBet, isUsed, exerciseType, isHqTrain, isYyTrain, isKjlTrain, packetTags
    } = item
    this.putPacketInfoInner({
      id,
      name,
      status,
      teachType,
      createrId,
      professionId: majorId,
      code: courseCode || code,
      isSmart,
      auditStatus,
      lessonCount,
      courseId,
      isUsed,
      preview: preview ? '1' : '0',
      curProgress: 0,
      innerCurProgress: 0,
      pcode,
      majorLeaderId,
      knowledgeSubjectId,
      isCard,
      is99Train,
      isBet,
      exerciseType,
      isHqTrain,
      isYyTrain,
      isKjlTrain,
      packetTags
    })
  }

  static getPacketInfo () {
    const str = sessionStorage.getItem('SCHOLAR_PACKET_' + ToolsUtil.getOrgCode())
    if (str) {
      const packetInfo = JSON.parse(str)
      return packetInfo
    } else {
      return {}
    }
  }

  static putReadtree (value: string) {
    sessionStorage.setItem('SCHOLAR_READTREE_VUE_' + ToolsUtil.getOrgCode(), value)
  }

  static getReadtree () {
    return sessionStorage.getItem('SCHOLAR_READTREE_VUE_' + ToolsUtil.getOrgCode())
  }

  static removeReadtree () {
    sessionStorage.removeItem('SCHOLAR_READTREE_VUE_' + ToolsUtil.getOrgCode())
  }

  static putCasetree (value: string) {
    sessionStorage.setItem('SCHOLAR_CASETREE_VUE_' + ToolsUtil.getOrgCode(), value)
  }

  static getCasetree () {
    return sessionStorage.getItem('SCHOLAR_CASETREE_VUE_' + ToolsUtil.getOrgCode())
  }

  static removeCasetree () {
    sessionStorage.removeItem('SCHOLAR_CASETREE_VUE_' + ToolsUtil.getOrgCode())
  }

  static putPacketInfoItem (key: string | number, value: any) {
    const packetInfo = this.getPacketInfo()
    packetInfo[key] = value
    this.putPacketInfoInner(packetInfo)
  }

  static getPacketInfoItem (key: string | number) {
    const str = sessionStorage.getItem('SCHOLAR_PACKET_' + ToolsUtil.getOrgCode())
    if (str) {
      const packetInfo = JSON.parse(str)[key]
      return packetInfo || ''
    } else {
      return ''
    }
  }

  static removePacketInfo () {
    sessionStorage.removeItem('SCHOLAR_PACKET_' + ToolsUtil.getOrgCode())
  }

  static putTrainTree (code: string) {
    sessionStorage.setItem('SCHOLAR_TRAINTREE_VUE_' + ToolsUtil.getOrgCode(), code)
  }

  static getTrainTree () {
    return sessionStorage.getItem('SCHOLAR_TRAINTREE_VUE_' + ToolsUtil.getOrgCode())
  }

  static removeTrainTree () {
    sessionStorage.removeItem('SCHOLAR_TRAINTREE_VUE_' + ToolsUtil.getOrgCode())
  }

  static putSearch (key: string, CourseSearch: any): void {
    sessionStorage.setItem('SCHOLAR_VUE_' + key + ToolsUtil.getOrgCode(), JSON.stringify(CourseSearch))
  }

  static getSearch (key: string): any {
    const obj = sessionStorage.getItem('SCHOLAR_VUE_' + key + ToolsUtil.getOrgCode())
    if (obj) {
      const result = JSON.parse(obj)
      return result
    } else {
      return {}
    }
  }

  static clearSearch (key: string): void {
    sessionStorage.removeItem('SCHOLAR_VUE_' + key + ToolsUtil.getOrgCode())
  }

  static putSearchKey (key: string): void {
    sessionStorage.setItem('SCHOLAR_VUE_SEARCH_KEY' + ToolsUtil.getOrgCode(), JSON.stringify(Array.from(new Set([...this.getSearchKey(), key]))))
  }

  static getSearchKey () {
    const arr = sessionStorage.getItem('SCHOLAR_VUE_SEARCH_KEY' + ToolsUtil.getOrgCode())
    if (arr) {
      return JSON.parse(arr)
    } else {
      return []
    }
  }

  static clearSearchKey (key): void {
    sessionStorage.setItem('SCHOLAR_VUE_SEARCH_KEY' + ToolsUtil.getOrgCode(), JSON.stringify(this.getSearchKey().filter(item => item !== key)))
  }

  static clearSearchAll (): void {
    this.getSearchKey().forEach(item => {
      this.clearSearch(item)
    })
    sessionStorage.removeItem('SCHOLAR_VUE_SEARCH_KEY' + ToolsUtil.getOrgCode())
  }

  // 保存调用素材数据
  static putScpResourceMaterial (info: Json): void {
    sessionStorage.removeItem('SCHOLAR_ScpResourceMaterial_VUE_' + ToolsUtil.getOrgCode())
    if (info) {
      sessionStorage.setItem('SCHOLAR_ScpResourceMaterial_VUE_' + ToolsUtil.getOrgCode(), JSON.stringify(info))
    }
  }

  static getScpResourceMaterial (): any {
    const str = sessionStorage.getItem('SCHOLAR_ScpResourceMaterial_VUE_' + ToolsUtil.getOrgCode())
    let info: Json = {}
    if (str) {
      info = JSON.parse(str)
    }
    return info
  }

  static removeScpResourceMaterial (): void {
    sessionStorage.removeItem('SCHOLAR_ScpResourceMaterial_VUE_' + ToolsUtil.getOrgCode())
  }

  static clearChapterSelection () {
    sessionStorage.removeItem('SCHOLAR_currentChapterId_VUE' + ToolsUtil.getOrgCode())
    sessionStorage.removeItem('SCHOLAR_currentSession_VUE' + ToolsUtil.getOrgCode())
  }

  static getChapter () {
    return sessionStorage.getItem('SCHOLAR_currentChapterId_VUE' + ToolsUtil.getOrgCode())
  }

  static setChapter (val: string) {
    sessionStorage.setItem('SCHOLAR_currentChapterId_VUE' + ToolsUtil.getOrgCode(), val)
  }

  static getSelection () {
    const info = sessionStorage.getItem('SCHOLAR_currentSession_VUE' + ToolsUtil.getOrgCode())
    if (info) {
      return JSON.parse(info)
    } else {
      return {}
    }
  }

  static setSelection (val: any) {
    sessionStorage.setItem('SCHOLAR_currentSession_VUE' + ToolsUtil.getOrgCode(), JSON.stringify(val))
  }

  static putKnowledgeGraphTab (knowledgeGraphTab: string) {
    sessionStorage.setItem('SCHOLAR_knowledgeGraphTab_VUE_' + ToolsUtil.getOrgCode(), knowledgeGraphTab)
  }

  static getKnowledgeGraphTab () {
    return sessionStorage.getItem('SCHOLAR_knowledgeGraphTab_VUE_' + ToolsUtil.getOrgCode())
  }

  static removeKnowledgeGraphTab () {
    sessionStorage.removeItem('SCHOLAR_knowledgeGraphTab_VUE_' + ToolsUtil.getOrgCode())
  }

  static putCourseType (courseType: string) {
    sessionStorage.setItem('SCHOLAR_courseType_VUE_' + ToolsUtil.getOrgCode(), courseType)
  }

  static getCourseType () {
    return sessionStorage.getItem('SCHOLAR_courseType_VUE_' + ToolsUtil.getOrgCode())
  }

  static removeCourseType () {
    sessionStorage.removeItem('SCHOLAR_courseType_VUE_' + ToolsUtil.getOrgCode())
  }

  static putPkgType (type) {
    sessionStorage.setItem('SCHOLAR_PkgType_VUE_' + ToolsUtil.getOrgCode(), type)
  }

  static getPkgType () {
    return sessionStorage.getItem('SCHOLAR_PkgType_VUE_' + ToolsUtil.getOrgCode())
  }

  static removePkgType () {
    sessionStorage.removeItem('SCHOLAR_PkgType_VUE_' + ToolsUtil.getOrgCode())
  }

  static putCourseName (courseName: string) {
    sessionStorage.setItem('SCHOLAR_COURSE_NAME_VUE_' + ToolsUtil.getOrgCode(), courseName)
  }

  static getCourseName () {
    return sessionStorage.getItem('SCHOLAR_COURSE_NAME_VUE_' + ToolsUtil.getOrgCode())
  }

  static removeCourseName () {
    sessionStorage.removeItem('SCHOLAR_COURSE_NAME_VUE_' + ToolsUtil.getOrgCode())
  }

  static getSubmodule () {
    return sessionStorage.getItem('SCHOLAR_VUE_SUBMODULE' + ToolsUtil.getOrgCode() + this.getPacketInfo().id + LocalStorageUtil.getUserId())
  }

  static putSubmodule (submodule: number) {
    sessionStorage.setItem('SCHOLAR_VUE_SUBMODULE' + ToolsUtil.getOrgCode() + this.getPacketInfo().id + LocalStorageUtil.getUserId(), String(submodule))
  }

  static removeSubmodule () {
    sessionStorage.removeItem('SCHOLAR_VUE_SUBMODULE' + ToolsUtil.getOrgCode() + this.getPacketInfo().id + LocalStorageUtil.getUserId())
  }

  static clear () {
    SessionStorageUtil.removeCourseInfoItem()
    SessionStorageUtil.removeMenus()
    SessionStorageUtil.removeTrainTree()
    SessionStorageUtil.removeReadtree()
    SessionStorageUtil.removeCasetree()
    SessionStorageUtil.removePacketInfo()
    SessionStorageUtil.clearSearchAll()
    SessionStorageUtil.removeScpResourceMaterial()
    SessionStorageUtil.clearChapterSelection()
    SessionStorageUtil.removeKnowledgeGraphTab()
    SessionStorageUtil.removePkgType()
    SessionStorageUtil.removeCourseType()
    SessionStorageUtil.removeCourseName()
    SessionStorageUtil.removeSubmodule()
    SessionStorageUtil.removeCaseBackPath()
  }
}
