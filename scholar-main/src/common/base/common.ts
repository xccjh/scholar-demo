import { AxiosResponse, AxiosStatic } from 'axios'
import { Shared } from '@/common/services/qiankun-share'
import { App } from 'vue'

export interface AnyJson {
  [key: string]: any;
}

export interface win extends Window {
  __platform__: string;
  __POWERED_BY_QIANKUN__: boolean;
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__: string;
  __webpack_public_path__: string;
  $theme: AnyJson;
}

export interface AntdEvent {
  domEvent: MouseEvent,
  item: AnyJson,
  key: '0' | '1',
  keyPath: ('0' | '1')[]
}

export interface FormState {
  userName: string;
  password: string;
  remember: ('1' | undefined)[]
}

export declare interface Json extends Object {
  [key: string]: any;
}

export declare interface ServerPaginationStandard {
  currentPage: number;
  showCount: number;
  totalResult: number;
  totalPage?: number;
}

export declare interface HttpResponseDataStandard {
  state: number; // 为1才是成功
  data: Json | [Json] | string | any; // 没有值 data: ''
  mess: string; // 返回的消息
  page?: ServerPaginationStandard;
}

export interface SeqIdStandard {
  id?: string;
  seq?: number;
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

export declare interface WjCallItem {
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

export declare interface PacketInfoOrigin {
  id: string; // 课包id
  name: string; // 课包名称
  teachType: string; // 课包类型
  createrId: string;
  professionId: string; // 专业id
  majorId: string; // 专业id
  code: string; // 课程编码
  courseCode: string; // 课程编码
  isSmart: string; // '0' | '1'
  isUsed: '0' | '1' | '2'; // '0' | '1' | '2' // 启用
  preview: any; // '0' | '1'
  isCard: string | boolean; // '0' | '1'// 开启闯关
  is99Train: string | boolean; // '0' | '1' //  开启99实训
  isYyTrain: string | boolean; // '0' | '1' //  开启用友实训
  isKjlTrain: string | boolean; // '0' | '1' //  开启会计乐实训
  isHqTrain: string | boolean; // '0' | '1' //  开启恒企实训
  isBet: string | boolean; // '0' | '1' //  开启押题宝
  status: string; // '0' | '1'
  auditStatus: string; // '0' | '1' | '2' | '3' | '99';
  lessonCount: number; // 课次
  courseId: string;
  curProgress: number; // 当前进度
  innerCurProgress: number; // 当前进度
  pcode: string; // 课包编码
  majorLeaderId: string; // 专业负责人id
  knowledgeSubjectId: string; // 知识点id
  exerciseType: '1' | '2'; // 可重做模式,
  packetTags: string;// 课包标签
}

export type PacketInfo = Partial<PacketInfoOrigin>;
export type TYPE = 'info' | 'warning' | 'success' | 'error' | 'confirm' | 'create';

export declare interface ConfirmableDescription {
  title: string;
  content: string;
  type: TYPE;
  replaceXxxField?: string;
  condition?: () => boolean;
  conditionField?: string | number;
  conditionResult?: string | number;
  conditionTitleReplace?: string;
  conditionContentReplace?: string;
}

export type FUNC_R<F, T> = (F, NzModalRef) => T;

export declare interface LoadingControl {
  loading: boolean;
}

export type OptsKey = 'key';
export type OptsItem = Record<OptsKey, string>;

export declare interface ChildrenContainItem extends OptsItem {
  children: OptsItem[];
}

export declare interface PackInfoItem {
  name?: string;
  teachType?: '11' | '12' | '21' | '22';
  id?: string;
  selectdCourse?: string;
  courseSubjectTypeId?: string;
  courseId?: string;
  status?: string;
  opts?: ChildrenContainItem[];
  nickName?: string;
}

export declare interface CourseItem {
  courseId: string;
  id: string;
  name: string;
  code: string;
  majorId: string;
}

export declare interface HttpRseponseTransformCell {
  [key: string]: Json;
}

export declare interface HttpOptions {
  headers?: Json;
  isJsonEncode?: boolean;
  isUrlEncode?: boolean;
  isAutoShowMessage?: boolean;
  isWithCredentials?: boolean;
  isCommonHttpHeader?: boolean;
  isStudyHttpHeader?: boolean;
  isBody?: boolean;
}

export declare interface Handout {
  attachmentName: string;
  attachmentPath: string;
  aattachmentExt: string;
  isMainFile: boolean | '0' | '1';
  isDownloadType: boolean;
  downloadType: '0' | '1'; // 0 :不可以 1 可以
  createTime: number;
  seq: number;
  title: string;
  type: '101' | '102' | '103' | '104';
  resourceId: string;
  paperId: string;
  sourceType: '1' | '2';
  authorName: string;
  authorUnit: string;
  courseSectionId: string;
  courseChapterId: string;
  courseId: string;
  coursePacketId: string;
  learningGoalCode: string;
  id: string;
  name: string;
  taskForm: string;
  quebankId: string;
  gradeType: '1' | '2'; // 1:学生自评 ; 2:老师批改
  isGrade: '' | '0' | '1'; // 0 :不评分| 1 需评分
  taskType: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
  // 任务类型：阅读任务(0)、案例任务(1)、作业任务(2)、实训任务(3)、考试任务(4)、实战任务(5)、问卷(6)、测评(7)
}

export type HandoutItem = Partial<Handout>;

export declare interface Teacher {
  value: string;
  id: string;
  name: string;
}

export enum UserAction {
  ADD,
  EDIT,
  DEL,
  QUERY,
  SUPPERADD
}

export declare interface AtrFormValid {
  type: 'required' | 'email' | 'telphone' | 'maxlength' | 'minlength' | 'pattern';
  errorLabel: string;
  maxlength?: number;
  minlength?: number;
  patternValue?: string;
}

export declare interface CusDict {
  label: string;
  value: string;
}

export declare interface ImageOpts {
  limit?: number;
  uploadDir: string;
  removeAction?: string;
  imageList?: any[];
  key?: string;

}

export interface Sorter {
  order?: 'ascend' | 'descend',
  columnKey: string
}

export declare interface CusNotification {
  type: string; // 表示类型，事务
  data?: any;

  [key: string]: string;
}

export declare interface Pagination {
  currentPage: number;
  totalPage?: number;
  totalResult?: number;
  pageSize?: number;
}

export interface CommonStructure {
  status: number;
  message: string;
}

export interface CommonData<T> extends CommonStructure {
  data: T[];
}

export interface CommonDataObj<T> extends CommonStructure {
  data: T;
}

export interface CommonDataOptObj<T> extends CommonStructure {
  data?: T;
}

export interface CommonPagination<T> extends CommonData<T> {
  page: { totalPage: number, totalResult: number, currentPage: number };
}

export interface LogStructure {
  code: number;
  msg: string;
}

export interface CommonDataLogObj<T> extends LogStructure {
  data: T;
}

export interface MaterialPagination<T> {
  current: number;// 当前页
  orders: {
    asc: boolean,
    column: string
  },
  records: T[];
  size: number; // 每页数
  total: number;// 总页数
}

export interface PolicyDirectDataType {
  accessKeyId: string;
  dir: string;
  host: string;
  policy: string;
  signature: string;
}

export interface PolicyMultDataType {
  accessKeyId: string;
  accessKeySecret: string;
  host: string;
  bucket: string;
  endpoint: string;
  expiration: string;
  dir: string;
  requestId: string;
  securitytoken: string;
}

export type PolicyData = AxiosResponse<CommonDataObj<PolicyDirectDataType | PolicyMultDataType>>
export type PolicyDirectData = AxiosResponse<CommonDataObj<PolicyDirectDataType>>
export type PolicyMultData = AxiosResponse<CommonDataObj<PolicyMultDataType>>

export interface CommonStatisticsPagination<T> extends CommonStructure {
  data: {
    list: {
      data: T[],
      totalSize: number
    },
    total: {
      totalHardNum: number;
      totalMiddleNum: number;
      totalEasyNum: number;
      totalMoreHardNum: number;
      totalMoreEasyNum: number;
      totalQuestionNum: number;
      totalKnowledgePointNum: number;
    }
  };
}

export interface CommonOption {
  id: string;
  name: string;
}

export interface PreviewFileOption {
  container: string; // 微应用挂在容器id,如#microApp1
  sharedKey: string;// 多实例区分微应share数据
  microKey: string;// 多实例区分微应用
  title: string; // 标题
  polywayId: string,
  attachmentPath: '',
  share: '0' | '1',
  furl: string,
  native: '0' | '1',
  ow365: '0' | '1',
  viewerId: string,
  orgCode: string,
  showTimer: '0' | '1',
  filePreviewCallBack: () => void
}

export interface CourseServiceProviderType {
  id: string;
  typeName: string;
}

export declare interface TableAction {
  name: string;
  code: string;
  data?: any;
  datas?: any[];
  numberOfChecked?: number;
  type?: 'rows' | 'row';
  operator?: string; // 显示操作符
}

export declare interface Dict {
  id: string;
  typeName: string;

}

export declare interface DictGroup {
  groupCode: string;
  dicts: Dict[];
}

export declare interface AtrFormDetail {
  label: string;
  type: 'text' | 'image' | 'select' | 'date' | 'number' | 'telphone' | 'password' | 'checkbox' | 'editor' | 'textarea' | 'dateTime';
  key: string;
  isHidden?: boolean;
  defaultValue?: any;
  value?: any; // 编辑下原始数值
  dictCode?: string; // select 模式下配置
  span?: number; // 显示宽度
  validators?: AtrFormValid[]; // 验证条件
  isRequired?: boolean; // 隐性条件 无需填写
  placeholder?: string;
  imageOpts?: ImageOpts;
  editContent?: string;
  height?: number; // editor有效
  disable?: boolean;
  lspan?: number;
  cspan?: number;
  rows?: number; // textarea 显示行数

}

export declare interface AtrFormOpt {
  type: 'add' | 'edit';
  layout?: 'full' | '1l2c' | '1l1c';
  items: AtrFormDetail[]; // 表单项目
}

export declare interface AtrQueryHeader {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'datepicker' | 'selectCus' | 'dateRange';
  key: string;
  isShow?: boolean;
  placeholder?: string;
  span?: number;
  dictCode?: string; // 字典编码
  dictList?: CusDict[];
}

export declare interface Table {
  name: string; // 表头名称
  key?: string; // 实际数据字段
  sortKey?: string; // 是否排序
  sortable?: boolean;
  type: 'text' | 'link' | 'action' | 'image' | 'date' | 'dateTime'; // 类型： 文字、链接、操作
  isShow?: boolean;
  width?: string; // 150px
  actions?: TableAction[];
}

export declare interface AtrQueyrOpt {
  actions?: TableAction[];
  isIndex?: boolean; // 是否显示序号
  isShowCheckbox?: boolean;
  showNum?: number;
  url: string;
  sort?: string;
  headers: AtrQueryHeader[];
  tables: Table[];
  isAutoQuery?: boolean; // true时候默认触发查询
}
