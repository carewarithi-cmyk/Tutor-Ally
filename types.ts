
export enum BehaviorType {
  DEFIANCE = 'Defiance',
  DISENGAGEMENT = 'Disengagement',
  DISTRACTION = 'Distraction',
  FRUSTRATION = 'Frustration',
  IMPULSIVITY = 'Impulsivity'
}

export interface BehaviorLogEntry {
  id: string;
  timestamp: Date;
  studentName: string;
  behaviorType: BehaviorType;
  description: string;
  intensity: number; // 1-5
}

export interface Strategy {
  id: string;
  title: string;
  description: string;
  category: BehaviorType;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
