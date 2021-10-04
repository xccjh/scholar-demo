
export interface FormState {
  id: string,
  name: string,
  polywayID: string
  videoName: string
  introduction: string
  avatar: string
  courseIds: string[]
}
export interface TeacherListParams {
  page: number;
  limit: number;
  sort: string;
  name: string;
  courseIds: string;
}

export interface TeacherListDataType {
  avatar: string;
  id: string;
  name: string;
  course:{
    courseName:string;
  }
  introduction:string;
  videoId:string;
  videoName:string;
 seq:number
}
