import { Json } from '@/common/base'

export interface FormState {
  courseMemberUserIdList: string[],
  coverPath: string,
  introduction: string,
  id: string,
  exercisesAuditUserIdList: string[]
}

export interface FileItem {
  uid: string;
  name: string;
  status?: number;
  response: Json;
  url?: string;
  type?: string;
  size?: number;
  originFileObj?: File;
  xhr?:Json;
  thumbUrl?:string;
  percent?:number;
  id?: string;
  resourceId?:string;
}

export interface FileInfo {
  file: FileItem;
  fileList: FileItem[];
}

export interface MemberItem {
  nickName:string;
  telphone:string;
  id:string;
  isSelected:boolean;
}

export interface MemerDataType {
  initPage:boolean;

  roleArrBak: MemberItem[];
  roleArr: MemberItem[];
  roleInitArr: MemberItem[];
  roleArrRevert: MemberItem[];
  roleArrBakRevert: MemberItem[];

  nodesBak:Json[];
  nodesInit:Json[];
  nodes: Json[];
  nodesRevert: Json[];
  nodesBakRevert: Json[];

}
