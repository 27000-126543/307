import type { Resume, Job, Interview, Interviewer, MeetingRoom, Offer, BackgroundCheck, OnboardingTask, ApprovalRecord, TodoItem } from '@/types'

export const EDUCATION_LEVELS: Array<{ value: string; level: number }> = [
  { value: '高中', level: 1 },
  { value: '大专', level: 2 },
  { value: '本科', level: 3 },
  { value: '硕士', level: 4 },
  { value: '博士', level: 5 },
]

export const SKILL_OPTIONS = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js',
  'Go', 'C++', 'C#', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'Linux', '微服务', '分布式系统',
  '机器学习', '深度学习', 'NLP', '数据分析', '产品设计', 'UI/UX设计',
  '项目管理', 'Agile', 'Scrum', 'DevOps', '信息安全', '网络工程',
]

export const DEPARTMENTS = ['技术部', '产品部', '设计部', '市场部', '销售部', '人力资源部', '财务部', '运营部']

export const mockInterviewers: Interviewer[] = [
  { id: 'iv1', name: '张建国', department: '技术部', title: '技术总监', availableSlots: ['2026-06-09T09:00', '2026-06-09T14:00', '2026-06-10T10:00', '2026-06-11T09:00', '2026-06-12T14:00'] },
  { id: 'iv2', name: '李晓芳', department: '技术部', title: '高级架构师', availableSlots: ['2026-06-09T10:00', '2026-06-10T09:00', '2026-06-10T14:00', '2026-06-11T10:00', '2026-06-12T09:00'] },
  { id: 'iv3', name: '王大明', department: '产品部', title: '产品总监', availableSlots: ['2026-06-09T09:00', '2026-06-09T15:00', '2026-06-10T11:00', '2026-06-11T14:00', '2026-06-12T10:00'] },
  { id: 'iv4', name: '陈思远', department: '设计部', title: '设计主管', availableSlots: ['2026-06-09T14:00', '2026-06-10T09:00', '2026-06-11T09:00', '2026-06-11T15:00', '2026-06-12T11:00'] },
  { id: 'iv5', name: '赵敏', department: '市场部', title: '市场总监', availableSlots: ['2026-06-09T10:00', '2026-06-10T14:00', '2026-06-11T10:00', '2026-06-12T09:00', '2026-06-12T15:00'] },
  { id: 'iv6', name: '刘志强', department: '技术部', title: '前端负责人', availableSlots: ['2026-06-09T11:00', '2026-06-10T09:00', '2026-06-11T09:00', '2026-06-12T10:00'] },
]

export const mockMeetingRooms: MeetingRoom[] = [
  { id: 'mr1', name: '星辰厅', capacity: 4, location: 'A栋3楼', availableSlots: ['2026-06-09T09:00', '2026-06-09T10:00', '2026-06-09T14:00', '2026-06-09T15:00', '2026-06-10T09:00', '2026-06-10T10:00', '2026-06-10T14:00', '2026-06-11T09:00', '2026-06-11T10:00', '2026-06-12T09:00', '2026-06-12T14:00'] },
  { id: 'mr2', name: '月光厅', capacity: 6, location: 'A栋5楼', availableSlots: ['2026-06-09T09:00', '2026-06-09T11:00', '2026-06-09T14:00', '2026-06-09T16:00', '2026-06-10T09:00', '2026-06-10T11:00', '2026-06-10T15:00', '2026-06-11T09:00', '2026-06-11T14:00', '2026-06-12T09:00', '2026-06-12T11:00'] },
  { id: 'mr3', name: '阳光厅', capacity: 8, location: 'B栋2楼', availableSlots: ['2026-06-09T10:00', '2026-06-09T14:00', '2026-06-09T15:00', '2026-06-10T09:00', '2026-06-10T10:00', '2026-06-10T14:00', '2026-06-10T15:00', '2026-06-11T09:00', '2026-06-11T10:00', '2026-06-11T14:00', '2026-06-12T10:00', '2026-06-12T14:00'] },
  { id: 'mr4', name: '云海厅', capacity: 4, location: 'B栋6楼', availableSlots: ['2026-06-09T09:00', '2026-06-09T10:00', '2026-06-09T15:00', '2026-06-10T09:00', '2026-06-10T11:00', '2026-06-10T14:00', '2026-06-11T10:00', '2026-06-11T14:00', '2026-06-11T15:00', '2026-06-12T09:00', '2026-06-12T10:00'] },
]

export const mockJobs: Job[] = [
  { id: 'job1', title: '高级Java开发工程师', department: '技术部', headcount: 3, filledCount: 1, educationReq: '本科', minExperience: 5, requiredSkills: ['Java', '微服务', '分布式系统', 'Docker', 'Kubernetes'], salaryMin: 25000, salaryMax: 40000, status: 'open', createdAt: '2026-05-15' },
  { id: 'job2', title: '前端开发工程师', department: '技术部', headcount: 2, filledCount: 0, educationReq: '本科', minExperience: 3, requiredSkills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Git'], salaryMin: 18000, salaryMax: 30000, status: 'open', createdAt: '2026-05-20' },
  { id: 'job3', title: '产品经理', department: '产品部', headcount: 1, filledCount: 0, educationReq: '本科', minExperience: 3, requiredSkills: ['产品设计', '项目管理', '数据分析', 'Agile'], salaryMin: 20000, salaryMax: 35000, status: 'open', createdAt: '2026-05-18' },
  { id: 'job4', title: 'UI设计师', department: '设计部', headcount: 2, filledCount: 0, educationReq: '本科', minExperience: 2, requiredSkills: ['UI/UX设计', '产品设计'], salaryMin: 15000, salaryMax: 25000, status: 'open', createdAt: '2026-05-25' },
  { id: 'job5', title: '数据分析师', department: '技术部', headcount: 1, filledCount: 0, educationReq: '硕士', minExperience: 2, requiredSkills: ['Python', 'SQL', '数据分析', '机器学习'], salaryMin: 20000, salaryMax: 35000, status: 'open', createdAt: '2026-06-01' },
  { id: 'job6', title: '市场经理', department: '市场部', headcount: 1, filledCount: 0, educationReq: '本科', minExperience: 5, requiredSkills: ['项目管理', '数据分析'], salaryMin: 22000, salaryMax: 38000, status: 'open', createdAt: '2026-05-28' },
  { id: 'job7', title: 'DevOps工程师', department: '技术部', headcount: 1, filledCount: 0, educationReq: '本科', minExperience: 3, requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'], salaryMin: 22000, salaryMax: 38000, status: 'open', createdAt: '2026-06-03' },
  { id: 'job8', title: '算法工程师', department: '技术部', headcount: 2, filledCount: 0, educationReq: '硕士', minExperience: 2, requiredSkills: ['Python', '深度学习', '机器学习', 'NLP'], salaryMin: 30000, salaryMax: 50000, status: 'open', createdAt: '2026-06-05' },
]

export const mockResumes: Resume[] = [
  { id: 'r1', name: '刘伟', phone: '13800001001', email: 'liuwei@email.com', education: '硕士', experienceYears: 6, skillTags: ['Java', '微服务', 'Docker', 'Kubernetes', '分布式系统'], expectedSalary: 35000, status: 'recommended', screeningScore: 92, educationScore: 100, experienceScore: 100, skillScore: 100, salaryScore: 67, matchedJobId: 'job1', createdAt: '2026-06-01' },
  { id: 'r2', name: '陈雪', phone: '13800001002', email: 'chenxue@email.com', education: '本科', experienceYears: 4, skillTags: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Git'], expectedSalary: 25000, status: 'confirmed', screeningScore: 95, educationScore: 100, experienceScore: 100, skillScore: 100, salaryScore: 83, matchedJobId: 'job2', createdAt: '2026-06-01' },
  { id: 'r3', name: '王磊', phone: '13800001003', email: 'wanglei@email.com', education: '本科', experienceYears: 4, skillTags: ['产品设计', '项目管理', '数据分析'], expectedSalary: 30000, status: 'screened', screeningScore: 78, educationScore: 100, experienceScore: 100, skillScore: 75, salaryScore: 33, matchedJobId: 'job3', createdAt: '2026-06-02' },
  { id: 'r4', name: '张丽', phone: '13800001004', email: 'zhangli@email.com', education: '本科', experienceYears: 3, skillTags: ['UI/UX设计', '产品设计', 'React'], expectedSalary: 22000, status: 'recommended', screeningScore: 88, educationScore: 100, experienceScore: 100, skillScore: 100, salaryScore: 50, matchedJobId: 'job4', createdAt: '2026-06-02' },
  { id: 'r5', name: '李强', phone: '13800001005', email: 'liqiang@email.com', education: '硕士', experienceYears: 3, skillTags: ['Python', 'SQL', '数据分析', '机器学习'], expectedSalary: 32000, status: 'interviewing', screeningScore: 85, educationScore: 100, experienceScore: 100, skillScore: 100, salaryScore: 40, matchedJobId: 'job5', createdAt: '2026-06-03' },
  { id: 'r6', name: '赵雪梅', phone: '13800001006', email: 'zhaoxuemei@email.com', education: '本科', experienceYears: 7, skillTags: ['项目管理', '数据分析', 'Agile', 'Scrum'], expectedSalary: 35000, status: 'recommended', screeningScore: 72, educationScore: 100, experienceScore: 100, skillScore: 50, salaryScore: 33, matchedJobId: 'job6', createdAt: '2026-06-03' },
  { id: 'r7', name: '孙浩然', phone: '13800001007', email: 'sunhaoran@email.com', education: '本科', experienceYears: 4, skillTags: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'], expectedSalary: 30000, status: 'pending', screeningScore: 0, educationScore: 0, experienceScore: 0, skillScore: 0, salaryScore: 0, createdAt: '2026-06-04' },
  { id: 'r8', name: '周敏', phone: '13800001008', email: 'zhoumin@email.com', education: '硕士', experienceYears: 3, skillTags: ['Python', '深度学习', '机器学习', 'NLP'], expectedSalary: 40000, status: 'pending', screeningScore: 0, educationScore: 0, experienceScore: 0, skillScore: 0, salaryScore: 0, createdAt: '2026-06-04' },
  { id: 'r9', name: '吴涛', phone: '13800001009', email: 'wutao@email.com', education: '博士', experienceYears: 2, skillTags: ['Python', '深度学习', '机器学习', 'NLP', '数据分析'], expectedSalary: 45000, status: 'pending', screeningScore: 0, educationScore: 0, experienceScore: 0, skillScore: 0, salaryScore: 0, createdAt: '2026-06-05' },
  { id: 'r10', name: '黄晓燕', phone: '13800001010', email: 'huangxy@email.com', education: '本科', experienceYears: 2, skillTags: ['UI/UX设计'], expectedSalary: 18000, status: 'pending', screeningScore: 0, educationScore: 0, experienceScore: 0, skillScore: 0, salaryScore: 0, createdAt: '2026-06-05' },
  { id: 'r11', name: '马俊杰', phone: '13800001011', email: 'majunjie@email.com', education: '本科', experienceYears: 6, skillTags: ['Java', '微服务', '分布式系统', 'Redis', 'MongoDB'], expectedSalary: 38000, status: 'pending', screeningScore: 0, educationScore: 0, experienceScore: 0, skillScore: 0, salaryScore: 0, createdAt: '2026-06-06' },
  { id: 'r12', name: '林小红', phone: '13800001012', email: 'linxh@email.com', education: '大专', experienceYears: 3, skillTags: ['JavaScript', 'Vue', 'Git'], expectedSalary: 15000, status: 'rejected', screeningScore: 45, educationScore: 33, experienceScore: 100, skillScore: 0, salaryScore: 50, rejectedReason: '学历不符合岗位要求', createdAt: '2026-06-06' },
]

export const mockInterviews: Interview[] = [
  { id: 'it1', resumeId: 'r5', jobId: 'job5', interviewerId: 'iv1', roomId: 'mr1', scheduledAt: '2026-06-09T10:00', duration: 60, status: 'confirmed', priority: 'high' },
  { id: 'it2', resumeId: 'r2', jobId: 'job2', interviewerId: 'iv6', roomId: 'mr2', scheduledAt: '2026-06-09T14:00', duration: 60, status: 'confirmed', priority: 'normal' },
  { id: 'it3', resumeId: 'r1', jobId: 'job1', interviewerId: 'iv2', roomId: 'mr3', scheduledAt: '2026-06-10T09:00', duration: 90, status: 'scheduled', priority: 'high' },
  { id: 'it4', resumeId: 'r4', jobId: 'job4', interviewerId: 'iv4', roomId: 'mr1', scheduledAt: '2026-06-10T14:00', duration: 60, status: 'scheduled', priority: 'normal' },
  { id: 'it5', resumeId: 'r3', jobId: 'job3', interviewerId: 'iv3', roomId: 'mr4', scheduledAt: '2026-06-11T10:00', duration: 60, status: 'scheduled', priority: 'low' },
]

export const mockOffers: Offer[] = [
  { id: 'of1', resumeId: 'r5', jobId: 'job5', salary: 33000, startDate: '2026-07-01', status: 'hr_approved', hrManagerApproval: 'approved', gmApproval: 'pending', createdAt: '2026-06-05' },
  { id: 'of2', resumeId: 'r2', jobId: 'job2', salary: 26000, startDate: '2026-07-15', status: 'sent', hrManagerApproval: 'approved', gmApproval: 'approved', createdAt: '2026-06-03' },
]

export const mockBackgroundChecks: BackgroundCheck[] = [
  { id: 'bc1', offerId: 'of2', company: '诚信背调有限公司', status: 'completed', result: '通过', completedAt: '2026-06-05' },
  { id: 'bc2', offerId: 'of1', company: '诚信背调有限公司', status: 'in_progress' },
]

export const mockOnboardingTasks: OnboardingTask[] = [
  { id: 'ot1', offerId: 'of2', candidateName: '陈雪', type: 'workstation', status: 'completed', assignee: '行政部-李莉', details: 'A栋4楼402工位' },
  { id: 'ot2', offerId: 'of2', candidateName: '陈雪', type: 'it_equipment', status: 'completed', assignee: 'IT部-张强', details: '笔记本电脑+显示器+键鼠套装' },
  { id: 'ot3', offerId: 'of2', candidateName: '陈雪', type: 'training', status: 'in_progress', assignee: 'HR-王芳', details: '新人入职培训(6/15-6/17)' },
  { id: 'ot4', offerId: 'of1', candidateName: '李强', type: 'workstation', status: 'pending', assignee: '行政部-李莉', details: '待分配' },
  { id: 'ot5', offerId: 'of1', candidateName: '李强', type: 'it_equipment', status: 'pending', assignee: 'IT部-张强', details: '待领用' },
  { id: 'ot6', offerId: 'of1', candidateName: '李强', type: 'training', status: 'pending', assignee: 'HR-王芳', details: '待安排' },
]

export const mockApprovalRecords: ApprovalRecord[] = [
  { id: 'ar1', targetId: 'r2', targetType: 'resume', approverId: 'mgr1', approverName: '技术部主管-何明', action: 'approved', createdAt: '2026-06-02T10:30:00' },
  { id: 'ar2', targetId: 'r5', targetType: 'resume', approverId: 'mgr2', approverName: '技术部主管-何明', action: 'approved', createdAt: '2026-06-03T14:20:00' },
  { id: 'ar3', targetId: 'r12', targetType: 'resume', approverId: 'mgr1', approverName: '技术部主管-何明', action: 'rejected', reason: '学历不符合岗位要求', createdAt: '2026-06-06T16:45:00' },
  { id: 'ar4', targetId: 'of2', targetType: 'offer', approverId: 'hr_mgr', approverName: 'HR经理-孙丽华', action: 'approved', createdAt: '2026-06-03T11:00:00' },
  { id: 'ar5', targetId: 'of2', targetType: 'offer', approverId: 'gm', approverName: '总经理-周志远', action: 'approved', createdAt: '2026-06-03T15:30:00' },
  { id: 'ar6', targetId: 'of1', targetType: 'offer', approverId: 'hr_mgr', approverName: 'HR经理-孙丽华', action: 'approved', createdAt: '2026-06-05T09:15:00' },
]

export const mockTodos: TodoItem[] = [
  { id: 't1', title: '刘伟-高级Java开发工程师 初筛推荐待确认', type: 'screening', priority: 'high', targetId: 'r1', createdAt: '2026-06-06' },
  { id: 't2', title: '张丽-UI设计师 初筛推荐待确认', type: 'screening', priority: 'normal', targetId: 'r4', createdAt: '2026-06-06' },
  { id: 't3', title: '李强-Offer待总经理审批', type: 'offer', priority: 'high', targetId: 'of1', createdAt: '2026-06-05' },
  { id: 't4', title: '赵雪梅-市场经理 初筛推荐待确认', type: 'screening', priority: 'normal', targetId: 'r6', createdAt: '2026-06-05' },
  { id: 't5', title: '3份新简历待初筛', type: 'screening', priority: 'urgent', targetId: 'r7', createdAt: '2026-06-04' },
  { id: 't6', title: '明日上午10:00 李强-数据分析师面试', type: 'interview', priority: 'high', targetId: 'it1', createdAt: '2026-06-08' },
]
