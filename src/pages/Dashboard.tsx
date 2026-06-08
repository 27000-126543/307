import { useState } from 'react'
import { useRecruitStore } from '@/stores/recruitStore'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  FileText,
  Calendar,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Plus,
  Clock,
  ArrowRight,
  X,
  Filter,
} from 'lucide-react'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-500',
}

const INTERVIEW_STATUS_MAP: Record<string, { label: string; className: string }> = {
  scheduled: { label: '待确认', className: 'bg-amber-100 text-amber-700' },
  confirmed: { label: '已确认', className: 'bg-green-100 text-green-700' },
  in_progress: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-600' },
}

const STAT_CARDS = [
  { key: 'openJobs', label: '在招岗位', icon: Briefcase, iconBg: 'bg-blue-100 text-blue-600', trendKey: 'jobTrend' },
  { key: 'pendingResumes', label: '待处理简历', icon: FileText, iconBg: 'bg-amber-100 text-amber-600', trendKey: 'resumeTrend' },
  { key: 'weekInterviews', label: '本周面试', icon: Calendar, iconBg: 'bg-green-100 text-green-600', trendKey: 'interviewTrend' },
  { key: 'monthOffers', label: '本月Offer', icon: FileCheck, iconBg: 'bg-purple-100 text-purple-600', trendKey: 'offerTrend' },
] as const

export default function Dashboard() {
  const navigate = useNavigate()
  const { jobs, resumes, interviews, offers, onboardingTasks, todos } = useRecruitStore()
  const [funnelStage, setFunnelStage] = useState<string | null>(null)

  const openJobs = jobs.filter((j) => j.status === 'open').length
  const pendingResumes = resumes.filter((r) => r.status === 'pending').length
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  const weekInterviews = interviews.filter((i) => {
    const d = new Date(i.scheduledAt)
    return d >= weekStart && d < weekEnd
  }).length
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthOffers = offers.filter((o) => {
    const d = new Date(o.createdAt)
    return d >= monthStart && d < monthEnd
  }).length

  const stats: Record<string, number> = {
    openJobs,
    pendingResumes,
    weekInterviews,
    monthOffers,
  }

  const trends: Record<string, number> = {
    jobTrend: 12,
    resumeTrend: -5,
    interviewTrend: 8,
    offerTrend: 15,
  }

  const upcomingInterviews = [...interviews]
    .filter((i) => i.status !== 'completed' && i.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5)

  const resumeMap = Object.fromEntries(resumes.map((r) => [r.id, r]))
  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j]))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]
          const trend = trends[card.trendKey]
          const isUp = trend >= 0
          return (
            <div key={card.key} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', card.iconBg)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={cn('flex items-center gap-1 text-sm', isUp ? 'text-green-600' : 'text-red-500')}>
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isUp ? '+' : ''}{trend}%</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{card.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">待办事项</h2>
            <span className="text-sm text-gray-400">{todos.length} 项</span>
          </div>
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  if (todo.type === 'screening') navigate(`/resume/${todo.targetId}`)
                  else if (todo.type === 'interview') navigate(`/interview/${todo.targetId}`)
                  else if (todo.type === 'offer') navigate(`/offer/${todo.targetId}`)
                  else navigate('/screening')
                }}
              >
                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', PRIORITY_COLORS[todo.priority])} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{todo.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{todo.createdAt}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            ))}
            {todos.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">暂无待办事项</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">近期面试日程</h2>
            <span className="text-sm text-gray-400">{upcomingInterviews.length} 场</span>
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => {
                const resume = resumeMap[interview.resumeId]
                const job = jobMap[interview.jobId]
                const date = new Date(interview.scheduledAt)
                const statusInfo = INTERVIEW_STATUS_MAP[interview.status]
                return (
                  <div key={interview.id} className="relative flex items-start gap-4 pl-6">
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 ring-2 ring-blue-200" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">
                          {date.getMonth() + 1}/{date.getDate()} {String(date.getHours()).padStart(2, '0')}:{String(date.getMinutes()).padStart(2, '0')}
                        </span>
                        {statusInfo && (
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusInfo.className)}>
                            {statusInfo.label}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {resume?.name ?? '未知候选人'} · {job?.title ?? '未知岗位'}
                      </div>
                    </div>
                    <Clock className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                )
              })}
              {upcomingInterviews.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-8">暂无面试安排</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">招聘漏斗看板</h2>
        </div>
        {(() => {
          const offerResumeIds = new Set(offers.map((o) => o.resumeId))
          const acceptedOfferResumeIds = new Set(offers.filter((o) => o.status === 'accepted').map((o) => o.resumeId))
          const hiredResumeIds = new Set(onboardingTasks.filter((t) => t.type === 'workstation' && t.status === 'completed').map((t) => {
            const offer = offers.find((o) => o.id === t.offerId)
            return offer?.resumeId
          }).filter(Boolean))
          const offeredStatusResumeIds = new Set(resumes.filter((r) => r.status === 'offered').map((r) => r.id))
          const hiredStatusResumeIds = new Set(resumes.filter((r) => r.status === 'hired').map((r) => r.id))

          const FUNNEL_STAGES = [
            { key: 'pending', label: '简历录入', getResumes: () => resumes.filter((r) => r.status === 'pending') },
            { key: 'screened', label: '初筛通过', getResumes: () => resumes.filter((r) => ['screened', 'recommended'].includes(r.status)) },
            { key: 'confirmed', label: '主管确认', getResumes: () => resumes.filter((r) => r.status === 'confirmed' || r.status === 'interviewing') },
            { key: 'interviewing', label: '面试', getResumes: () => resumes.filter((r) => interviews.some((i) => i.resumeId === r.id)) },
            { key: 'offered', label: 'Offer', getResumes: () => resumes.filter((r) => offerResumeIds.has(r.id) || offeredStatusResumeIds.has(r.id)) },
            { key: 'hired', label: '入职', getResumes: () => resumes.filter((r) => acceptedOfferResumeIds.has(r.id) || hiredResumeIds.has(r.id) || hiredStatusResumeIds.has(r.id)) },
          ]
          const stageData = FUNNEL_STAGES.map((stage) => {
            const stageResumes = stage.getResumes()
            return { ...stage, count: stageResumes.length, stageResumes }
          })
          const maxCount = Math.max(...stageData.map((s) => s.count), 1)
          return (
            <>
              <div className="flex items-end gap-3">
                {stageData.map((stage, idx) => {
                  const widthPercent = Math.max((stage.count / maxCount) * 100, 8)
                  const prevCount = idx > 0 ? stageData[idx - 1].count : stage.count
                  const convRate = idx > 0 && prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : null
                  return (
                    <div key={stage.key} className="flex-1 flex flex-col items-center">
                      <button
                        onClick={() => setFunnelStage(funnelStage === stage.key ? null : stage.key)}
                        className={cn(
                          'w-full flex flex-col items-center justify-end rounded-t-lg transition-all duration-200 cursor-pointer',
                          funnelStage === stage.key ? 'ring-2 ring-brand-400 ring-offset-2' : 'hover:ring-1 hover:ring-brand-200',
                        )}
                        style={{ height: `${Math.max(widthPercent, 20)}px`, minHeight: '40px' }}
                      >
                        <span className="text-base font-bold text-white drop-shadow">{stage.count}</span>
                      </button>
                      <div className={cn(
                        'w-full text-center py-2 rounded-b-lg text-xs font-medium',
                        idx === 0 ? 'bg-blue-500 text-white' :
                        idx === 1 ? 'bg-blue-400 text-white' :
                        idx === 2 ? 'bg-green-500 text-white' :
                        idx === 3 ? 'bg-purple-500 text-white' :
                        idx === 4 ? 'bg-amber-500 text-white' :
                        'bg-emerald-500 text-white',
                      )}>
                        {stage.label}
                      </div>
                      {convRate !== null && (
                        <div className="text-xs text-gray-400 mt-1">{convRate}%</div>
                      )}
                    </div>
                  )
                })}
              </div>
              {funnelStage && (() => {
                const stage = stageData.find((s) => s.key === funnelStage)
                if (!stage) return null
                const stageResumes = stage.stageResumes
                return (
                  <div className="mt-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {stage.label}（{stageResumes.length}人）
                      </h3>
                      <button onClick={() => setFunnelStage(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {stageResumes.length === 0 ? (
                      <div className="text-sm text-gray-400 text-center py-4">暂无候选人</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {stageResumes.map((r) => {
                          const job = r.matchedJobId ? jobs.find((j) => j.id === r.matchedJobId) : null
                          const relatedOffer = offers.find((o) => o.resumeId === r.id)
                          const targetPath = (stage.key === 'offered' || stage.key === 'hired') && relatedOffer
                            ? `/offer/${relatedOffer.id}`
                            : `/resume/${r.id}`
                          return (
                            <button
                              key={r.id}
                              onClick={() => navigate(targetPath)}
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-brand-200 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold shrink-0">
                                {r.name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">{r.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {r.education} · {r.experienceYears}年经验{job ? ` · ${job.title}` : ''}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          )
        })()}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/resumes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            录入简历
          </button>
          <button
            onClick={() => navigate('/screening')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建岗位
          </button>
          <button
            onClick={() => navigate('/interviews')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            安排面试
          </button>
        </div>
      </div>
    </div>
  )
}
