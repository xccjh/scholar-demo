
export interface ReadMaterialsFormState {
  id:string;
  title:string;
  learningGoalCode:'' | '1' |'2'|'3'|'4'|'5'|'6';
  uploadFileArr:{
    attachmentPath:string
    attachmentName:string
    title:string
    uid?:string
  }[];
  authorName:string;
  watermarkText:string;
  isWatermark:'0' | '1'
}
