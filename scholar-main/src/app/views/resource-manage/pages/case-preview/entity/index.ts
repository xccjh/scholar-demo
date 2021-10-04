
export interface CaseMaterialsDataType {
  background:string;
  analysis:string;
  title:string;
  guide:string;
  caseAttch:{
    attachmentPath:string,
    isPic:boolean,
    isVideo:boolean,
    thumbnail:string,
    originAttachmentPath:string
  }[]
}

export interface CaseMaterialsItem {
  aattachmentExt: string
  attachmentName: string
  attachmentPath: string
  attachmentType: '12'
  coursewareCaseId: string
  createTime:number
  lastModifiedTime:number
  lastModifiedUserId: string
  createrId: string
  id: string
  isPic: boolean
  isVideo: boolean
  originAttachmentPath: string
  thumbnail: string
}
