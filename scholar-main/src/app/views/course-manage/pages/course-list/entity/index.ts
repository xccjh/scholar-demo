
export interface FormState {
  id: string,
  name: string,
  leaderId: string, // 负责人
  courseProviderId: string, // 服务商
  majorIdList: string[],
  eduLevel: string | string[],
  courseType: string
  gbCode: string
  majorId: string // 学科
  createrName:string;
}
export interface CourseListParams {
  page: number;
  limit: number;
  searchKey?: string;
  startTime?: string;
  startBillDate?: string;
  endBillDate?: string;
  endTime?: string;
  auditStatus?: string;
  queryFilterType?: string;
  filterKey: 'MANAGER';
}

export interface CourseListDataType {
  id: string;
  key:string;
  code: string;
  name: string;
  gbCode: string;
  courseTypeName: string;
  majorNames: string;
  majorName: string;
  seq: number;
  leaderName: string;
  lastModifiedTime: number;
  statusName: string;
  auditStatusName: string;
  leaderId: string;
  auditStatus: string;
  status: string;
  eduLevel: string | string[];
  courseType:string;
  courseProviderId:string;
  eduLevelIdList:string[];
  majorIdList:string[];
  majorId:string;
  areaIdList: string[];
  knowledgeSubjectId: string;
  billDate: string;
  auditDate: string;
  createrName: string;
  zksdLeaderIds: string;
  majorLeaderId: string;
  upButtonArr: {
    method: string,
    title: string,
    show: string
  }[];
}

export interface DisciplinDataParams {
  page: number;
  limit: number;
  orgCode: string;
  searchKey?: string;
  startTime?: string;
  endTime?: string;
  filterKey: 'MANAGER';
}
