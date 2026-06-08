export type EducationLevel = '高中' | '大专' | '本科' | '硕士' | '博士'

export type ResumeStatus = 'pending' | 'screened' | 'recommended' | 'confirmed' | 'rejected' | 'interviewing' | 'offered' | 'hired'

export type JobStatus = 'open' | 'closed' | 'paused'

export type InterviewStatus = 'scheduled' | 'confirmed' | 'adjustment_requested' | 'in_progress' | 'completed' | 'cancelled'

export type InterviewPriority = 'urgent' | 'high' | 'normal' | 'low'

export type RecommendationLevel = 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend'

export type OfferStatus = 'pending' | 'hr_approved' | 'gm_approved' | 'rejected' | 'sent' | 'accepted' | 'declined' | 'negotiating'

export type ApprovalAction = 'approved' | 'rejected'

export type BackgroundCheckStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type OnboardingTaskType = 'workstation' | 'it_equipment' | 'training'

export type OnboardingTaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Resume {
  id: string
  name: string
  phone: string
  email: string
  education: EducationLevel
  experienceYears: number
  skillTags: string[]
  expectedSalary: number
  status: ResumeStatus
  screeningScore: number
  educationScore: number
  experienceScore: number
  skillScore: number
  salaryScore: number
  matchedJobId?: string
  createdAt: string
  rejectedReason?: string
}

export interface Job {
  id: string
  title: string
  department: string
  headcount: number
  filledCount: number
  educationReq: EducationLevel
  minExperience: number
  requiredSkills: string[]
  salaryMin: number
  salaryMax: number
  status: JobStatus
  createdAt: string
}

export interface Interview {
  id: string
  resumeId: string
  jobId: string
  interviewerId: string
  roomId: string
  scheduledAt: string
  duration: number
  status: InterviewStatus
  priority: InterviewPriority
  evaluation?: InterviewEvaluation
  adjustmentReason?: string
}

export interface InterviewEvaluation {
  score: number
  comment: string
  recommendation: RecommendationLevel
  evaluatorId: string
  evaluatedAt: string
}

export interface Interviewer {
  id: string
  name: string
  department: string
  title: string
  availableSlots: string[]
}

export interface MeetingRoom {
  id: string
  name: string
  capacity: number
  location: string
  availableSlots: string[]
}

export interface Offer {
  id: string
  resumeId: string
  jobId: string
  salary: number
  startDate: string
  status: OfferStatus
  hrManagerApproval: 'pending' | 'approved' | 'rejected'
  gmApproval: 'pending' | 'approved' | 'rejected'
  createdAt: string
  rejectionReason?: string
  candidateNote?: string
}

export interface BackgroundCheck {
  id: string
  offerId: string
  company: string
  status: BackgroundCheckStatus
  result?: string
  completedAt?: string
}

export interface OnboardingTask {
  id: string
  offerId: string
  candidateName: string
  type: OnboardingTaskType
  status: OnboardingTaskStatus
  assignee: string
  details: string
}

export interface ApprovalRecord {
  id: string
  targetId: string
  targetType: 'resume' | 'interview_adjustment' | 'offer' | 'ranking'
  approverId: string
  approverName: string
  action: ApprovalAction
  reason?: string
  createdAt: string
}

export interface ScreeningResult {
  resumeId: string
  jobId: string
  totalScore: number
  educationScore: number
  experienceScore: number
  skillScore: number
  salaryScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

export interface DashboardStats {
  openJobs: number
  pendingResumes: number
  weekInterviews: number
  monthOffers: number
  resumeTrend: number
  interviewTrend: number
  offerTrend: number
}

export interface TodoItem {
  id: string
  title: string
  type: 'approval' | 'interview' | 'screening' | 'offer'
  priority: 'urgent' | 'high' | 'normal'
  targetId: string
  createdAt: string
}
