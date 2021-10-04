import { LocationQueryValue } from 'vue-router'

export interface StatisticsListParams {
  page: number;
  limit: number;
  searchKey: string;
  courseCode:string | LocationQueryValue[] | null;
  questionNum:string
}

export interface StatisticsListDataType{
  knowledgePointCode: string;
  knowledgePointName: string;
  questionNum: number;
  moreEasyNum: number;
  easyNum: number;
  middleNum: number;
  hardNum: number;
  moreHardNum: number;
  fileType1: string;
  key:string;
}
