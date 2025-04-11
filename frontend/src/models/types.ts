export enum UserRole {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student'
}

export enum AssignmentType {
  MultipleChoice = 'MultipleChoice',
  Essay = 'Essay',
  File = 'File'
}

export enum QuestionType {
  MultipleChoice = 'MultipleChoice',
  TrueFalse = 'TrueFalse',
  ShortAnswer = 'ShortAnswer',
  Essay = 'Essay'
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Class {
  id: number;
  name: string;
  description?: string;
  classCode: string;
  teacherId: number;
  teacher: User;
  googleClassroomId?: string;
  googleClassroomLink?: string;
  createdAt: Date;
  isActive: boolean;
  students?: ClassStudent[];
  lessons?: Lesson[];
  assignments?: Assignment[];
}

export interface ClassStudent {
  classId: number;
  class: Class;
  studentId: number;
  student: User;
  joinedAt: Date;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  classId: number;
  class: Class;
  dueDate: Date;
  type: AssignmentType;
  content?: string;
  attachmentUrl?: string;
  createdAt: Date;
  isActive: boolean;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  assignment: Assignment;
  studentId: number;
  student: User;
  content?: string;
  fileUrl?: string;
  attachmentUrl?: string;
  score?: number;
  feedback?: string;
  submissionStartTime?: Date;
  submissionEndTime?: Date;
  submittedAt: Date;
  gradedAt?: Date;
  createdAt: Date;
}

export interface Discussion {
  id: number;
  title: string;
  content: string;
  classId: number;
  class: Class;
  creatorId: number;
  creator: User;
  createdAt: Date;
  updatedAt?: Date;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  discussionId: number;
  discussion: Discussion;
  userId: number;
  user: User;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  classId: number;
  class: Class;
  scheduledTime: Date;
  meetingLink?: string;
  materialUrl?: string;
  createdAt: Date;
  isCompleted: boolean;
  attendances?: Attendance[];
  resources?: Resource[];
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  url: string;
  classId: number;
  class: Class;
  lessonId?: number;
  lesson?: Lesson;
  createdAt: Date;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  userId: number;
  user: User;
  relatedId?: number;
  isRead: boolean;
  createdAt: Date;
}

export interface Attendance {
  id: number;
  lessonId: number;
  lesson: Lesson;
  studentId: number;
  student: User;
  isPresent: boolean;
  note?: string;
  recordedAt: Date;
  createdAt: Date;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  classId: number;
  class: Class;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalPoints: number;
  isActive: boolean;
  createdAt: Date;
  questions?: Question[];
  submissions?: ExamSubmission[];
}

export interface Question {
  id: number;
  examId: number;
  exam: Exam;
  content: string;
  type: QuestionType;
  points: number;
  options?: QuestionOption[];
  answers?: QuestionAnswer[];
}

export interface QuestionOption {
  id: number;
  questionId: number;
  question: Question;
  content: string;
  isCorrect: boolean;
}

export interface QuestionAnswer {
  id: number;
  questionId: number;
  question: Question;
  submissionId: number;
  submission: ExamSubmission;
  answer: string;
  points?: number;
  feedback?: string;
}

export interface ExamSubmission {
  id: number;
  examId: number;
  exam: Exam;
  studentId: number;
  student: User;
  submissionStartTime?: Date;
  submissionEndTime?: Date;
  createdAt: Date;
  totalPoints?: number;
  feedback?: string;
  answers?: QuestionAnswer[];
} 