
export interface FormState {
  id: string,
  name: string,
  leaderId: string,
  finalApproverId: string, //  终审人
  majorType: string, // 学科类型
  productLineId: string, // 产品线
  majorTypeName?: string
  managerId?:string
}

export interface ProfessionalListParams {
  page: number;
  limit: number;
  orgCode: string;
  searchKey?: string;
  startTime?: string;
  endTime?: string;
  filterKey: 'MANAGER';
}

export interface ProfessionListDataType {
  id: string;
  key: string;
  code: string;
  name: string;
  productLineName: string;
  productLineId: string;
  majorTypeName: string;
  majorType: string;
  leaderName: string;
  leaderId: string;
  finalApproverName: string;
  finalApproverId: string;
}
