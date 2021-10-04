
export interface FormState {
  id: string,
  name: string,
  teachType: '11' | '12' | '21' | '22';
  selectedCourse:string;
  courseSubjectTypeId:string;
  exerciseType:'1' | '2'; // 可重做模式  不可重做模式
  courseId?:string;
  majorId?:string;
  courseCode?:string;
}
export interface PacketInfoListParams {
  page: number;
  limit: number;
  searchKey?: string;
  updateTimeStart?: string;
  updateTimeEnd?: string;
  courseId?: string;
}

export interface PacketInfoListDataType {
  id: string;
  key:string;
  pcode: string;
  name: string;
  createrName: string;
  updateName: string;
  nickName: string;
  majorLeaderId:string;
  leaderId: string;
  createrId: string;
  courseTeamIds:string;
  majorCode:string;
  majorId:string;
  courseId: string;
  courseCode: string;
  courseSubjectTypeId: string;
  courseSeriesName: string;
  exerciseType?:'1' | '2'; // 可重做模式  不可重做模式;
  knowledgeSubjectId:string;
  teachType: '11' | '12' | '21' | '22';
  isSmart: '0' | '1';
  isSale: '0' | '1' | '2';
  isUsed: '0' | '1' | '2';
  isBet:'0' | '1';
  isCard:'0' | '1';
  is99Train:'0' | '1';
  lastModifiedTime: number;
  createTime: number;
  auditStatus: '0' | '1' | '2' | '3';
  status: '0' | '1' | '2' | '3';
  statusName: string;
  auditStatusName: string;
  orgCode:string;
  packetVer:number;
  courseSeriesId:string;
  upButtonArr: {
    method: string,
    title: string | string[],
    show: string
  }[];
  dropButtonArr: {
    method: string,
    title: string | string[],
    show: string
  }[];
}
export interface CourseTreeItemDetail {
  auditDate: number
  billDate: number
  lastModifiedTime: number
  createTime: number
  auditStatus: '0'| '1' | '2' | '3' | '4'
  code: string
  id: string
  courseProviderId: string
  createrId: string
  knowledgeSubjectId: string
  lastModifiedUserId: string
  leaderId: string
  majorId: string
  name: string
  orgCode: string
  status: '0'| '1' | '2' | '3' | '4'
}

export interface CourseTreeItem {
  code: string
  courseList: CourseTreeItemDetail[]
  createTime: number
  lastModifiedTime: number
  createrId: string
  finalApproverId: string
  lastModifiedUserId: string
  leaderId: string
  id: string
  majorType: string
  name: string
  orgCode: string
  productLineId: string
  status: '0'| '1' | '2' | '3' | '4'
}
