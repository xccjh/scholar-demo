
export interface OperationLogParams {
  page: number;
  limit: number;
  searchKey?: string;
  updateTimeStart?: string;
  updateTimeEnd?: string;
  courseId?: string;
}

export interface OperationLogDataType {
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
  exerciseType:'1' | '2'; // 可重做模式  不可重做模式;
  knowledgeSubjectId:string;
  teachType: '11' | '12' | '21' | '22';
  isSmart: '0' | '1';
  isSale: '0' | '1';
  isUsed: '0' | '1';
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
