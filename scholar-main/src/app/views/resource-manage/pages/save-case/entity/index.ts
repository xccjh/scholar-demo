
export interface CaseMaterialsFormState {
  id:string;
  title:string;
  learningGoalCode:'' | '1' |'2'|'3'|'4'|'5'|'6';
  caseAttanmentArr:{
    attachmentPath:string
    attachmentName:string
    uid?:string
    aattachmentExt:string;
    attachmentType:12
  }[];
  authorName:string;
  analysis:string;
  background:string;
  guide:string;
}
