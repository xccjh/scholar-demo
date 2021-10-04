import { Json } from '@/common/base'

export interface CurrentLearnSetSection {
  courseChapterId: string
  courseId: string
  coursePacketId: string
  fileNum: number
  id: string
  index: number
  isLeaf: boolean
  key: string
  name: string
  pptNum: number
  selectable: boolean
  seq: number
  status: string
  studyLength: number
  taskNum: number
  title: string
  videoNum: number
}

export interface SectionDataType {
  id: string
  orgCode: string
  resourceId: string
  seq: number
  status: string
  title: string
  createrId: string
  courseChapterId: string
  courseId: string
  coursePacketId: string
  courseSectionId: string
  isMainFile: '0' | '1' | boolean // 主讲义
  lastModifiedTime: number
  lastModifiedUserId: string
  createTime: number
  videoLength: number,
  category: string
  attachmentName: string
  name: string
  attachmentPath: string
  aattachmentExt: string
  sourceType: '1' | '2'
  isDownloadType: boolean
  isSummary: '0' | '1' | boolean // 总结视频
  downloadType: '0' | '1' | '2' // 0 :不可以 1 可以
  type: '101' | '102' | '103' | '104'; // '101' | '102' | '103' | '104';
  [index: string]: any
}

export interface TaskDataType {
  id: string
  resourceId: string
  name: string
  seq: number
  attachmentName: string
  attachmentPath: string
  courseChapterId: string
  courseId: string
  coursePacketId: string
  courseSectionId: string
  createTime: number
  downloadType: '0' | '1' // 默认不可下载(0)、仅老师可下载(1)、老师和学生都可下载(2)
  isDownloadType: boolean // 是否可下载
  isNeed: '0' | '1' | boolean // 必选
  gradeType: '1' | '2' // 1:学生自评 | 2:老师批改
  isGrade: '' | '0' | '1' // 0 :不评分 | 1 需评分
  needTeacherProc: '0' | '1' // //0:学生自评 | 1:老师批改
  type: '101' | '102' | '103' | '104'; // '101' | '102' | '103' | '104';
  sourceType: '2' | '1' | '3'// 2: 保利威 | 1: 阿里云
  status: '1' | '0' // 标准 草稿
  isSummary: '0' | '1' | boolean // 总结视频
  taskType: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'; // 任务类型：阅读任务(0)、案例任务(1)、作业任务(2)、实训任务(3)、考试任务(4)、实战任务(5)、问卷(6)、测评(7)
  [index: string]: any
}

export interface AssocateItem {
  isBindAssoicate: boolean
  courseChapterId: string
  courseId: string
  coursePacketId: string
  courseSectionId: string
  downloadType: '0' | '1' | '2'// 默认不可下载(0)、仅老师可下载(1)、老师和学生都可下载(2)
  gradeType: '1' | '2' // 1:学生自评 | 2:老师批改
  id: string
  isNeed: '0' | '1' | boolean // 必选
  name: string
  needTeacherProc: '0' | '1' // //0:学生自评 | 1:老师批改
  sectionName: string
  sectionSeq: number
  seq: number
  pageNum?: number;
  status: '1' | '0' // 标准 草稿
  [index: string]: any
}

export interface WjCallItem {
  majorId: string;
  name: string;
  evaluateId: '1' | '2'; // '1': '总部测评' '2': '校区测评';
  majorName: string;
  questionNumber: number;
  status: 1 | 2 | 3 | 4; // 1:'未发布';   2: '已发布';   3: '已过期';   4: '未完成';
  paperUuid: string;
  id: string;
  paperId: string;

}

export declare interface CallItem {
  name: string;
  sublibraryModuleIdList: Json[];
  id: string;
  paperUuid: string;
  year: string; // 试卷年份
  number: number; // 题量
  score: number;
  paperId: string;
  groupWay: 1 | 2 | 3 | 4; // 1: '选题组卷/录题组卷' 2: '题型难度 '3: '知识点难度抽题组卷' 4: 题型难度随机组卷
  type: 1 | 2 | 3 | 4; // 1: '真题';2: '模拟';3: '原创';4: '测试卷';
}

export declare interface SubQuestionBank {
  id: string; // seeai这边的id
  quebankName: string; // 子模块名称
  quebankId: number; // 子模块id
  busType: '2' | '1'; // 专用区分
}

export declare interface IdMap {
  [key: number]: 'EXAM' | 'PRACTICE"';
}

export declare interface SubModule {
  id: number;
  name: string;
}

export declare interface LevelItem {
  seq: number;
  examId: string;
  id: string;
  quebankId: string;
  passScore: number;
}

export declare interface CompanyItem {
  seq: number;
  courseId: string;
  coursePacketId: string;
  filePath: string;
  id: string;
  name: string;
  fileName: string;
  permission: '业务中心' | '数字大脑' | '财务中心';
  termType: 0 | 1 | 2 | 3; // 有效期：默认半年(0)、1年(1)、2年(2)、3年(3)
}

export declare interface HqItem {
  seq: number;
  courseId: string;
  coursePacketId: string;
  id: string;
  name: string;
  accountHqId: string;
  status?: '0' | '1';
}

export declare interface LessonsItem {
  index: number;
  seq: number;
  name: string;
  id: string;
  courseId: string;
  coursePacketId: string;
}

export type LessonsItemOption = Partial<LessonsItem>;
