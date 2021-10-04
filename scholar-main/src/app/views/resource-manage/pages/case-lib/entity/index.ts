
export interface CaseMaterialsDataType {
  lastModifiedTime:number;
  useTime:number;
  id:string;
  authorName:string;
  createrName:string;
  learningGoalCode:'1' | '2' | '3'| '4'| '5'| '6';
  pointName:string;
  type: '104';
  title:string;
  sourceType:'1'|'2'
  category:100|200;
  fileType:string;
  isCall:boolean;
  taskId:string;
  taskType:string;
  supportType:boolean;
}

export interface CaseMaterialsParams {
  condition:string;
  coursewareType:('104')[];
  learningGoalCode:('1' | '2' | '3'| '4'| '5'| '6')[];
  page:number;
  limit:number;
  category:100|200;
  knowledgeSubjectId:string;
  knowledgeModuleId:string;
  knowledgeUnitId:string;
  knowledgePointId:string;
  sort?:'useTime|asc' | 'useTime|desc'
}
