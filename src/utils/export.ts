import * as XLSX from 'xlsx'
import type { Resume, Interview, Offer, Job } from '@/types'

export function exportMonthlyReport(
  resumes: Resume[],
  interviews: Interview[],
  offers: Offer[],
  jobs: Job[]
) {
  const wb = XLSX.utils.book_new()

  const resumeData = resumes.map((r) => ({
    '姓名': r.name,
    '学历': r.education,
    '工作经验(年)': r.experienceYears,
    '技能标签': r.skillTags.join(', '),
    '期望薪资': r.expectedSalary,
    '状态': getStatusLabel(r.status),
    '初筛评分': r.screeningScore,
    '提交日期': r.createdAt,
  }))
  const ws1 = XLSX.utils.json_to_sheet(resumeData)
  XLSX.utils.book_append_sheet(wb, ws1, '简历数据')

  const interviewData = interviews.map((i) => {
    const resume = resumes.find((r) => r.id === i.resumeId)
    const job = jobs.find((j) => j.id === i.jobId)
    return {
      '候选人': resume?.name || '-',
      '岗位': job?.title || '-',
      '面试时间': i.scheduledAt,
      '时长(分钟)': i.duration,
      '状态': getInterviewStatusLabel(i.status),
      '优先级': getPriorityLabel(i.priority),
      '评分': i.evaluation?.score || '-',
      '推荐等级': i.evaluation?.recommendation || '-',
    }
  })
  const ws2 = XLSX.utils.json_to_sheet(interviewData)
  XLSX.utils.book_append_sheet(wb, ws2, '面试数据')

  const offerData = offers.map((o) => {
    const resume = resumes.find((r) => r.id === o.resumeId)
    const job = jobs.find((j) => j.id === o.jobId)
    return {
      '候选人': resume?.name || '-',
      '岗位': job?.title || '-',
      'Offer薪资': o.salary,
      '入职日期': o.startDate,
      '状态': getOfferStatusLabel(o.status),
      'HR审批': o.hrManagerApproval === 'approved' ? '通过' : o.hrManagerApproval === 'rejected' ? '驳回' : '待审批',
      '总经理审批': o.gmApproval === 'approved' ? '通过' : o.gmApproval === 'rejected' ? '驳回' : '待审批',
    }
  })
  const ws3 = XLSX.utils.json_to_sheet(offerData)
  XLSX.utils.book_append_sheet(wb, ws3, 'Offer数据')

  const deptStats = new Map<string, { total: number; screened: number; interviewed: number; offered: number; hired: number }>()
  for (const job of jobs) {
    const existing = deptStats.get(job.department) || { total: 0, screened: 0, interviewed: 0, offered: 0, hired: 0 }
    existing.total += job.headcount
    existing.screened += resumes.filter((r) => r.matchedJobId === job.id && r.screeningScore > 0).length
    existing.interviewed += interviews.filter((i) => i.jobId === job.id).length
    existing.offered += offers.filter((o) => o.jobId === job.id).length
    existing.hired += offers.filter((o) => o.jobId === job.id && o.status === 'sent').length
    deptStats.set(job.department, existing)
  }
  const statsData = Array.from(deptStats.entries()).map(([dept, stats]) => ({
    '部门': dept,
    '招聘人数': stats.total,
    '已筛选简历': stats.screened,
    '面试数': stats.interviewed,
    'Offer数': stats.offered,
    '已入职': stats.hired,
    '面试通过率': stats.interviewed > 0 ? `${Math.round((stats.offered / stats.interviewed) * 100)}%` : '-',
    'Offer接受率': stats.offered > 0 ? `${Math.round((stats.hired / stats.offered) * 100)}%` : '-',
  }))
  const ws4 = XLSX.utils.json_to_sheet(statsData)
  XLSX.utils.book_append_sheet(wb, ws4, '部门统计')

  XLSX.writeFile(wb, `月度招聘分析报告_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待筛选',
    screened: '已筛选',
    recommended: '已推荐',
    confirmed: '已确认',
    rejected: '已驳回',
    interviewing: '面试中',
    offered: '已发Offer',
    hired: '已入职',
  }
  return map[status] || status
}

function getInterviewStatusLabel(status: string): string {
  const map: Record<string, string> = {
    scheduled: '已排期',
    confirmed: '已确认',
    adjustment_requested: '调整申请中',
    in_progress: '面试中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    normal: '普通',
    low: '低',
  }
  return map[priority] || priority
}

function getOfferStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待审批',
    hr_approved: 'HR已批',
    gm_approved: '总经理已批',
    rejected: '已驳回',
    sent: '已发送',
    accepted: '已接受',
    declined: '已拒绝',
  }
  return map[status] || status
}
