import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Resume, Job, Interview, Interviewer, MeetingRoom, Offer, BackgroundCheck, OnboardingTask, ApprovalRecord, TodoItem, RecommendationLevel } from '@/types'
import { mockResumes, mockJobs, mockInterviews, mockInterviewers, mockMeetingRooms, mockOffers, mockBackgroundChecks, mockOnboardingTasks, mockApprovalRecords, mockTodos } from '@/data/mockData'

interface RecruitStore {
  resumes: Resume[]
  jobs: Job[]
  interviews: Interview[]
  interviewers: Interviewer[]
  meetingRooms: MeetingRoom[]
  offers: Offer[]
  backgroundChecks: BackgroundCheck[]
  onboardingTasks: OnboardingTask[]
  approvalRecords: ApprovalRecord[]
  todos: TodoItem[]

  addResume: (resume: Resume) => void
  updateResume: (id: string, data: Partial<Resume>) => void
  screenResumes: () => void
  confirmResume: (id: string) => void
  rejectResume: (id: string, reason: string) => void

  addJob: (job: Job) => void
  updateJob: (id: string, data: Partial<Job>) => void

  addInterview: (interview: Interview) => void
  updateInterview: (id: string, data: Partial<Interview>) => void
  addEvaluation: (interviewId: string, evaluation: { score: number; comment: string; recommendation: string; evaluatorId: string }) => void
  requestAdjustment: (interviewId: string, reason: string) => void
  approveAdjustment: (interviewId: string) => void
  rejectAdjustment: (interviewId: string) => void

  addOffer: (offer: Offer) => void
  updateOffer: (id: string, data: Partial<Offer>) => void
  approveOfferHR: (id: string) => void
  rejectOfferHR: (id: string, reason: string) => void
  approveOfferGM: (id: string) => void
  rejectOfferGM: (id: string, reason: string) => void
  sendOffer: (id: string) => void
  acceptOffer: (id: string) => void
  declineOffer: (id: string, reason: string) => void
  negotiateOffer: (id: string, note: string) => void

  addBackgroundCheck: (check: BackgroundCheck) => void
  updateBackgroundCheck: (id: string, data: Partial<BackgroundCheck>) => void

  addOnboardingTask: (task: OnboardingTask) => void
  updateOnboardingTask: (id: string, data: Partial<OnboardingTask>) => void

  addApprovalRecord: (record: ApprovalRecord) => void
  removeTodo: (id: string) => void
}

export const useRecruitStore = create<RecruitStore>()(
  persist(
    (set) => ({
      resumes: [...mockResumes],
      jobs: [...mockJobs],
      interviews: [...mockInterviews],
      interviewers: [...mockInterviewers],
      meetingRooms: [...mockMeetingRooms],
      offers: [...mockOffers],
      backgroundChecks: [...mockBackgroundChecks],
      onboardingTasks: [...mockOnboardingTasks],
      approvalRecords: [...mockApprovalRecords],
      todos: [...mockTodos],

      addResume: (resume) => set((s) => ({ resumes: [...s.resumes, resume] })),
      updateResume: (id, data) => set((s) => ({
        resumes: s.resumes.map((r) => (r.id === id ? { ...r, ...data } : r)),
      })),
      screenResumes: () => set((s) => {
        const EDUCATION_LEVELS: Record<string, number> = { '高中': 1, '大专': 2, '本科': 3, '硕士': 4, '博士': 5 }
        const updated = s.resumes.map((resume) => {
          if (resume.status !== 'pending' || resume.screeningScore > 0) return resume
          let bestJob: Job | null = null
          let bestScore = 0
          let bestBreakdown = { educationScore: 0, experienceScore: 0, skillScore: 0, salaryScore: 0 }
          for (const job of s.jobs) {
            if (job.status !== 'open') continue
            const eduLevel = EDUCATION_LEVELS[resume.education] || 0
            const reqLevel = EDUCATION_LEVELS[job.educationReq] || 0
            const educationScore = eduLevel >= reqLevel ? 100 : Math.max(0, (eduLevel / reqLevel) * 100)
            const experienceScore = resume.experienceYears >= job.minExperience ? 100 : Math.max(0, (resume.experienceYears / job.minExperience) * 100)
            const matchedSkills = resume.skillTags.filter((sk) => job.requiredSkills.includes(sk))
            const skillScore = job.requiredSkills.length > 0 ? (matchedSkills.length / job.requiredSkills.length) * 100 : 50
            let salaryScore = 100
            if (resume.expectedSalary > job.salaryMax) {
              salaryScore = Math.max(0, 100 - ((resume.expectedSalary - job.salaryMax) / job.salaryMax) * 100)
            } else if (resume.expectedSalary < job.salaryMin) {
              salaryScore = 80
            }
            const total = educationScore * 0.25 + experienceScore * 0.25 + skillScore * 0.3 + salaryScore * 0.2
            if (total > bestScore) {
              bestScore = total
              bestJob = job
              bestBreakdown = { educationScore: Math.round(educationScore), experienceScore: Math.round(experienceScore), skillScore: Math.round(skillScore), salaryScore: Math.round(salaryScore) }
            }
          }
          if (bestJob && bestScore >= 60) {
            return { ...resume, screeningScore: Math.round(bestScore), ...bestBreakdown, matchedJobId: bestJob.id, status: 'screened' as const }
          }
          return { ...resume, screeningScore: Math.round(bestScore), ...bestBreakdown, status: 'screened' as const }
        })
        return { resumes: updated }
      }),
      confirmResume: (id) => set((s) => ({
        resumes: s.resumes.map((r) => (r.id === id ? { ...r, status: 'confirmed' as const } : r)),
        todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'screening')),
      })),
      rejectResume: (id, reason) => set((s) => ({
        resumes: s.resumes.map((r) => (r.id === id ? { ...r, status: 'rejected' as const, rejectedReason: reason } : r)),
        todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'screening')),
      })),

      addJob: (job) => set((s) => ({ jobs: [...s.jobs, job] })),
      updateJob: (id, data) => set((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...data } : j)),
      })),

      addInterview: (interview) => set((s) => ({ interviews: [...s.interviews, interview] })),
      updateInterview: (id, data) => set((s) => ({
        interviews: s.interviews.map((i) => (i.id === id ? { ...i, ...data } : i)),
      })),
      addEvaluation: (interviewId, evaluation) => set((s) => ({
        interviews: s.interviews.map((i) =>
          i.id === interviewId
            ? { ...i, status: 'completed' as const, evaluation: { ...evaluation, recommendation: evaluation.recommendation as RecommendationLevel, evaluatedAt: new Date().toISOString() } }
            : i
        ),
      })),
      requestAdjustment: (interviewId, reason) => set((s) => ({
        interviews: s.interviews.map((i) =>
          i.id === interviewId ? { ...i, status: 'adjustment_requested' as const, adjustmentReason: reason } : i
        ),
      })),
      approveAdjustment: (interviewId) => set((s) => ({
        interviews: s.interviews.map((i) =>
          i.id === interviewId ? { ...i, status: 'scheduled' as const, adjustmentReason: undefined } : i
        ),
      })),
      rejectAdjustment: (interviewId) => set((s) => ({
        interviews: s.interviews.map((i) =>
          i.id === interviewId ? { ...i, status: 'confirmed' as const } : i
        ),
      })),

      addOffer: (offer) => set((s) => ({ offers: [...s.offers, offer] })),
      updateOffer: (id, data) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, ...data } : o)),
      })),
      approveOfferHR: (id) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, hrManagerApproval: 'approved' as const, status: 'hr_approved' as const } : o)),
        approvalRecords: [...s.approvalRecords, { id: `ar_${Date.now()}`, targetId: id, targetType: 'offer' as const, approverId: 'hr_mgr', approverName: 'HR经理-孙丽华', action: 'approved' as const, createdAt: new Date().toISOString() }],
        todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'offer')),
      })),
      rejectOfferHR: (id, reason) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, hrManagerApproval: 'rejected' as const, status: 'rejected' as const, rejectionReason: reason } : o)),
        approvalRecords: [...s.approvalRecords, { id: `ar_${Date.now()}`, targetId: id, targetType: 'offer' as const, approverId: 'hr_mgr', approverName: 'HR经理-孙丽华', action: 'rejected' as const, reason, createdAt: new Date().toISOString() }],
        todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'offer')),
      })),
      approveOfferGM: (id) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, gmApproval: 'approved' as const, status: 'gm_approved' as const } : o)),
        approvalRecords: [...s.approvalRecords, { id: `ar_${Date.now()}`, targetId: id, targetType: 'offer' as const, approverId: 'gm', approverName: '总经理-周志远', action: 'approved' as const, createdAt: new Date().toISOString() }],
        todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'offer')),
      })),
      rejectOfferGM: (id, reason) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, gmApproval: 'rejected' as const, status: 'rejected' as const, rejectionReason: reason } : o)),
        approvalRecords: [...s.approvalRecords, { id: `ar_${Date.now()}`, targetId: id, targetType: 'offer' as const, approverId: 'gm', approverName: '总经理-周志远', action: 'rejected' as const, reason, createdAt: new Date().toISOString() }],
        todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'offer')),
      })),
      sendOffer: (id) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, status: 'sent' as const } : o)),
      })),
      acceptOffer: (id) => set((s) => {
        const offer = s.offers.find((o) => o.id === id)
        if (!offer) return {}
        const resume = s.resumes.find((r) => r.id === offer.resumeId)
        const existingTasks = s.onboardingTasks.filter((t) => t.offerId === id)
        if (existingTasks.length > 0) {
          return {
            offers: s.offers.map((o) => (o.id === id ? { ...o, status: 'accepted' as const } : o)),
            resumes: resume ? s.resumes.map((r) => (r.id === resume.id ? { ...r, status: 'hired' as const } : r)) : s.resumes,
            todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'offer')),
          }
        }
        return {
          offers: s.offers.map((o) => (o.id === id ? { ...o, status: 'accepted' as const } : o)),
          resumes: resume ? s.resumes.map((r) => (r.id === resume.id ? { ...r, status: 'hired' as const } : r)) : s.resumes,
          onboardingTasks: [
            ...s.onboardingTasks,
            { id: `ot_${Date.now()}_ws`, offerId: id, candidateName: resume?.name || '', type: 'workstation' as const, status: 'pending' as const, assignee: '行政部-李莉', details: '待分配' },
            { id: `ot_${Date.now()}_it`, offerId: id, candidateName: resume?.name || '', type: 'it_equipment' as const, status: 'pending' as const, assignee: 'IT部-张强', details: '待领用' },
            { id: `ot_${Date.now()}_tr`, offerId: id, candidateName: resume?.name || '', type: 'training' as const, status: 'pending' as const, assignee: 'HR-王芳', details: '待安排' },
          ],
          todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'offer')),
        }
      }),
      declineOffer: (id, reason) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, status: 'declined' as const, rejectionReason: reason } : o)),
        todos: s.todos.filter((t) => !(t.targetId === id && t.type === 'offer')),
      })),
      negotiateOffer: (id, note) => set((s) => ({
        offers: s.offers.map((o) => (o.id === id ? { ...o, status: 'negotiating' as const, candidateNote: note } : o)),
      })),

      addBackgroundCheck: (check) => set((s) => ({ backgroundChecks: [...s.backgroundChecks, check] })),
      updateBackgroundCheck: (id, data) => set((s) => ({
        backgroundChecks: s.backgroundChecks.map((b) => (b.id === id ? { ...b, ...data } : b)),
      })),

      addOnboardingTask: (task) => set((s) => ({ onboardingTasks: [...s.onboardingTasks, task] })),
      updateOnboardingTask: (id, data) => set((s) => ({
        onboardingTasks: s.onboardingTasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
      })),

      addApprovalRecord: (record) => set((s) => ({
        approvalRecords: [...s.approvalRecords, record],
      })),
      removeTodo: (id) => set((s) => ({
        todos: s.todos.filter((t) => t.id !== id),
      })),
    }),
    { name: 'recruit-store' }
  )
)
