
export interface CourseDropItem {
  code:string;
  name:string;
  id:string;
}

export type MaterialsType = '101'| '102'| '103'
export type SourceType = '1'|'2'
export type LearningGoalCode = '1' | '2' | '3'| '4'| '5'| '6'

export interface ReadMaterialsDataType {
  lastModifiedTime:number;
  useTime:number;
  id:string;
  authorName:string;
  createrName:string;
  learningGoalCode:LearningGoalCode;
  pointName:string;
  type:MaterialsType;
  title:string;
  sourceType:SourceType
  category:100|200;
  fileType:string;
  isCall:boolean;
  taskId:string;
  taskType:string;
  supportType:boolean;
}

export interface ReadMaterialsParams {
  condition:string;
  coursewareType:('101' | '102' | '103')[];
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
