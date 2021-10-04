import { bareService, formHeader, get, getHeader, originService, post, postBody, service } from '@/app/api'

export const PrepareCourseApi = {
  /**
   * 判断当前用户是否为该课程课程组成员
   * @param code
   */
  getApproveStatus (code) {
    return get('pkg/course/isCourseUser', { code })
  },
  /**
   * 获取课次列表
   */
  getLessonPackageTable (coursePacketId) {
    return get('pkg/courseTime/list', { coursePacketId })
  },
  /**
   * 章节导出
   */
  packetChapterExport (coursePacketId) {
    return originService.get('pkg/courseChapter/exportByExcel', {
      headers: {
        ...getHeader(),
        ...formHeader
      },
      params: { coursePacketId },
      responseType: 'blob'
    })
  },
  /**
   * 章节导入
   */
  excelImportChapter (params) {
    return postBody('pkg/courseChapter/importByExcel', params)
  },
  /**
   * 知识图谱导入章节
   * @param params
   */
  synchronizedKnowledge (params) {
    return get('pkg/courseChapter/importKnowledgeModuleUnit', params)
  },
  /**
   * 章节模板下载
   */
  chapterTemplateDown () {
    return service.get('pkg/courseChapter/downloadExcelTemp', {
      headers: {
        ...getHeader(),
        ...formHeader
      },
      responseType: 'blob'
    })
  },
  /**
   * 获取章
   * @param coursePacketId
   */
  getListCourseChapter (coursePacketId) {
    return post('pkg/courseChapter/getList', { coursePacketId })
  },
  /**
   * 获取节
   * @param courseChapterId
   */
  getListCourseSection (courseChapterId) {
    return post('pkg/courseSection/getList', { courseChapterId })
  },
  /**
   * 新增章
   * @param params
   */
  addChapter (params) {
    return postBody('pkg/courseChapter/save', params)
  },
  /**
   * 删除章
   * @param id
   */
  delChapter (id) {
    return post('pkg/courseChapter/del', { id })
  },
  /**
   * 删除节
   * @param id
   */
  delSection (id) {
    return post('pkg/courseSection/del', { id })
  },
  /**
   * 获取
   * @param courseSectionId
   * @param courseChapterId
   */
  getSectionFileList (courseSectionId: string, courseChapterId?: string) {
    return get('pkg/courseSectionResource/sectionResourceList', {
      courseChapterId,
      courseSectionId
    })
  },
  /**
   * 获取任务列表
   * @param params
   */
  getTaskFileList (courseSectionId) {
    return get('pkg/courseTask/getList', { courseSectionId })
  },
  /**
   * 导入视频模板下载
   */
  exportExcelVideo () {
    return service.get('pkg/courseSectionResource/downloadExcelTemp', {
      headers: {
        ...getHeader(),
        ...formHeader
      },
      responseType: 'blob'
    })
  },
  /**
   * 视频模板导入
   * @param params
   */
  importExcelVideo (params) {
    return postBody('pkg/courseSectionResource/importVideoByExcel', params)
  },
  /**
   * 修改节资料权限
   * @param params
   */
  modifySectionResource (params) {
    return post('pkg/courseSectionResource/save', params)
  },
  /**
   * 修改节r任务权限
   * @param params
   */
  modifySectionResourceTask (params) {
    return postBody('pkg/courseTask/save', params)
  },
  /**
   * 删除节资源
   * @param id
   */
  delSectionResourceTask (id) {
    return post('pkg/courseTask/del', { id })
  },
  /**
   * 删除节任务
   * @param id
   */
  delSectionResource (id) {
    return post('pkg/courseSectionResource/del', { id })
  },
  /**
   * 更新保存任务
   */
  saveOrUpdateTask (param) {
    return postBody('pkg/courseTask/batchSave', param)
  },
  /**
   * 更新保存资料
   * @param param
   */
  saveOrUpdate (param) {
    return postBody('pkg/courseSectionResource/batchSave', param)
  },
  /**
   * 获取WPS文件原始地址
   * @param fileUrl
   */
  getViewUrlWebPath (fileUrl: string) {
    return postBody('res/v1/viewByFileUrl', { fileUrl })
  },
  /**
   * 获取主讲义关联列表
   * @param courseChapterId
   * @param resourceId
   */
  getAssocateMainfileList (courseChapterId, resourceId) {
    return get('pkg/courseTask/getLink', { courseChapterId, resourceId })
  },
  /**
   * 删除主讲义关联
   * @param linkId
   */
  delBindBind (linkId) {
    return get('pkg/courseTaskLink/del', { id: linkId })
  },
  /**
   * 综合题的作业任务不能绑定到主讲义
   */
  checkTkDecidePaper (paperId) {
    return bareService.get(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/decidePaper?paperId=' + paperId)
  },
  /**
   * 主讲义页码关联任务
   */
  handoutPageNumberRelatedTasks (params) {
    return postBody('pkg/courseTaskLink/save', params)
  },
  /**
   * 任务本地上传批量保存
   * @param params
   */
  batchSaveCourseSectionTaskFile (params) {
    return postBody('pkg/courseTask/batchUpload', params)
  },
  /**
   * 资料本地上传批量保存
   * @param params
   */
  batchSaveCourseSectionFile (params) {
    return postBody('pkg/courseSectionResource/batchUpload', params)
  },
  /**
   * 根据resourceId获取账期ID
   * @param id resourceId
   */
  getAccountPeriodId (id: string) {
    return get('res/knowledgeCompanyAccount/get', { id })
  },
  /**
   * 获取实训地址
   * @param params
   */
  getPracticalDetail (params) {
    return get('third/internship/getFixedLink', params)
  },
  /**
   * 获取问卷测评列表
   * @param params
   */
  getEvaluateQuestionList (params) {
    return bareService.get(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/evaluateQuestionnaireList', { params })
  },
  /**
   * 新增考试作业问卷测评
   * @param params
   */
  saveJobExam (params) {
    return postBody('pkg/courseTask/saveJobExam', params)
  },
  /**
   * 获取子题库模块树
   * @param params
   */
  getSubQuestionBank (params) {
    return bareService.get(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/courseCode', { params })
  },
  /**
   * 新增题库作业考试
   */
  saveTkPaper (params) {
    return bareService.post(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/savePaper', null, { params })
  },
  /**
   * 题库默认设设置课程
   * @param params
   */
  saveTkDefaultCourse (params) {
    return bareService.post(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/saveDefaultCourse', null, { params })
  },
  /**
   * 获取调用列表
   * @param params
   */
  getCallList (params) {
    return bareService.get(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/list', { params })
  },
  /**
   * 获取考试设置
   * @param id
   */
  getExamination (id) {
    return get('pkg/coursePacketConfigExam/get', { id })
  },
  /**
   * 保存考试设置
   * @param params
   */
  examSetting (params) {
    return postBody('pkg/coursePacketConfigExam/saveOrUpdate', params)
  },
  /**
   * 获取指导讲师
   */
  getTeacher () {
    return get('pkg/Lecturer/queryList')
  },
  /**
   * 获取保利威视频时长
   */
  getVideoLength (params, userid) {
    return bareService.get(process.env.VUE_APP_polywayApi + 'v2/video/' + userid + '/info', { params })
  },
  /**
   * 生成课次
   * @param coursePacketId 课包id
   * @param lessonCount 课次
   * @param courseId 课程id
   */
  lessonPackage (coursePacketId, lessonCount, courseId) {
    const url = 'pkg/courseTime/batchGenerate'
    return post(url, { coursePacketId, lessonCount, courseId })
  },
  /**
   * 删除课次
   * @param id
   */
  delLessonPackage (id) {
    return get('pkg/courseTime/del', { id })
  },
  /**
   * 新增课次
   * @param params
   */
  newLessons (params) {
    return get('pkg/courseTime/save', params)
  },
  /**
   * 获取闯关列表
   * @param coursePacketId
   */
  getLevelList (coursePacketId) {
    return get('pkg/coursePacketCard/list', { coursePacketId, status: 1 })
  },
  /**
   * 课包信息更新
   * @param params
   */
  packageInfoUpdate (params) {
    return postBody('pkg/coursePacket/saveOrUpdate', params)
  },
  /**
   * 删除闯关
   * @param id
   */
  deleteLevel (id) {
    return post('pkg/coursePacketCard/del', { id })
  },
  /**
   * 删除奖励
   * @param id
   */
  deleteLevelData (id) {
    return post('pkg/coursePacketCardResource/del', { id })
  },
  /**
   * 互获取子模块下拉
   * @param params
   */
  getSubmodule (params) {
    return bareService.get(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/courseCode', { params })
  },
  /**
   * 根据子模块id获取试卷
   * @param params
   */
  getExamInfoByModuleId (params) {
    return bareService.post(process.env.VUE_APP_questionBankApi + 'system/qkcPaper/examInfoByModuleId', params)
  },
  /**
   * 关卡新增修改-id无值新增、有值修改
   * @param param
   */
  addCoursePacketCard (param) {
    return postBody('pkg/coursePacketCard/saveOrUpdate', param)
  },
  /**
   * 关卡资料-批量上传
   */
  levelInfoBatchUpload (param) {
    return postBody('pkg/coursePacketCardResource/batchUpload', param)
  },
  /**
   * 获取子模块绑定列表
   */
  getSubLibrary (param) {
    return get('pkg/coursePacketQuebank/list', param)
  },
  /**
   * 删除子题库
   * @param param
   */
  delSubLibrary (param) {
    return get('pkg/coursePacketQuebank/del', param)
  },
  /**
   * 新增子题库绑定
   * @param param
   */
  callSubLibrary (param) {
    return postBody('pkg/coursePacketQuebank/saveOrUpdate', param)
  },
  /**
   * 获取99实训公司列表
   * @param coursePacketId
   */
  getCompany (coursePacketId) {
    return get('pkg/coursePacket99Train/list', { coursePacketId, status: 1 })
  },
  /**
   * 99实训公司新增修改-id无值新增、有值修改
   * @param param
   */
  addCoursePacketCompany (param) {
    return postBody('pkg/coursePacket99Train/saveOrUpdate', param)
  },
  /**
   * 99实训公司删除
   * @param id
   */
  companyDel (id) {
    return get('pkg/coursePacket99Train/del', { id })
  },
  /**
   * 子题库排序
   * @param params
   */
  sortSubQuestionBank (params) {
    return postBody('pkg/coursePacketQuebank/batchSaveOrUpdate', params)
  },
  /**
   * 获取恒企实训列表
   * @param coursePacketId
   */
  getHqlist (coursePacketId) {
    return get('pkg/coursePacketHqTrain/list', { coursePacketId, status: 1 })
  },
  /**
   * 删除恒企实训
   */
  hqDel (id) {
    return get('pkg/coursePacketHqTrain/del', { id })
  },
  /**
   * 恒企实训新增修改-id无值新增、有值修改
   * @param param
   */
  addCoursePacketHq (param) {
    return postBody('pkg/coursePacketHqTrain/saveOrUpdate', param)
  },
  /**
   * 获取会计乐实训选项
   */
  getKjlOption () {
    return get('tsk/kjlTrain/getKjlAllTrainList')
  },
  /**
   * 获取实训回显
   */
  getKjlTrain (coursePacketId) {
    return get('pkg/coursePacketTrain/list', { coursePacketId, status: 1 })
  },
  /**
   * 新增会计乐实训
   * @param param
   */
  saveKjlTrain (param) {
    return postBody('pkg/coursePacketTrain/saveOrUpdate', param)
  },
  /**
   * 删除会计乐实训
   * @param id
   */
  delKjlTrain (id) {
    return get('pkg/coursePacketTrain/del', { id })
  },
  /**
   * 获取智适应课包信息
   * @param id
   * @param courseId
   */
  getLessonPackage (id, courseId) {
    return get('pkg/coursePacketConfig/get', { id, courseId })
  },
  /**
   * 获取知识点总数
   * @param param
   */
  getKnowledgeNum (param) {
    return get('res/knowledge-point/countKnowledgeNum', param)
  },
  /**
   * 获取章节绑定列表
   * @param param
   */
  getChapterBindList (param) {
    return get('pkg/course-section-unit/list', param)
  },
  /**
   * 更新课包信息
   * @param param
   */
  setLessonPackage (param) {
    return postBody('pkg/coursePacketConfig/saveOrUpdate', param)
  },
  /**
   * 获取章节绑定知识图谱
   * @param knowledgeSubjectId
   */
  getTreeModuleUnit (knowledgeSubjectId) {
    return get('res/knowledge-module/treeModuleUnit/' + knowledgeSubjectId)
  },
  /**
   * 获取章节绑定知识点
   * @param param
   */
  getChapterBindKnowledgePoints (param) {
    return postBody('pkg/course-section-unit/get', param)
  },
  /**
   * 批量章节绑定
   * @param param
   */
  bindKnowledgePointsBatch (param) {
    return postBody('pkg/course-section-unit/bindList', param)
  },
  /**
   * 解绑知识点
   * @param courseSectionId
   */
  unbindKnowledgePoints (courseSectionId) {
    return get('pkg/course-section-unit/unBind/' + courseSectionId)
  },
  /**
   * 获取主视频信息
   * @param id
   */
  getTotalInfo (id) {
    return get('pkg/coursePacket/getSectionNum', { id })
  },
  /**
   * 获取知识点信息
   */
  getTotalKnowledgePointsInfo (knowledgeSubjectId) {
    return get('res/knowledge-module/countWithLackOfVideo/' + knowledgeSubjectId)
  },
  /**
   * 课包审核
   */
  submitForApproval (params) {
    return get('pkg/coursePacket/approval', params)
  },
  /**
   * 课包章节缺少视频
   * @param id
   */
  chapterSelectionLack (id) {
    return get('pkg/coursePacket/getLackVideoChapterSectionTree', { id })
  },
  /**
   * 缺少讲解视频的知识点树
   * @param id
   */
  treeWithLackOfVideo (id) {
    return get('res/knowledge-module/treeWithLackOfVideo/' + id)
  }
}
