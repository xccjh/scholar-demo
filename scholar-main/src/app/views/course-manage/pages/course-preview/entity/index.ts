export interface CommonVideoItem {
  attachmentPath: string;
  attachmentName:string;
  id: string;
  seq: number;
}

export interface FormState {
  code: string
  id: string
  content: string
  keyLevel: 1 | 2 | 3
  isSprint: boolean
  isStable: boolean
  isFinal: boolean
  opsType: 0 | 1 | 2
  explanationVideo: Partial<CommonVideoItem>[]
  learningMaterials: Partial<CommonVideoItem>[]
  isDone: boolean
}

export type FormStateKnowledge = FormState
