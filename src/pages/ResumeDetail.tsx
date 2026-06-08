import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Briefcase, FileText, UserCheck, MessageSquare, ClipboardList, Clock } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'

const STATUS_LABEL_MAP: Record<string, string> = {
  pending: '待筛选',
  screened: '已筛选',
  recommended: '已推荐',
  confirmed: '已确认',
  rejected: '已驳回',
  interviewing: '面试中',
  offered: '已发Offer',
  hired: '已入职',
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  screened: 'bg-blue-100 text-blue-700',
  recommended: 'bg-indigo-100 text-indigo-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  interviewing: 'bg-amber-100 text-amber-700',
  offered: 'bg-teal-100 text-teal-700',
  hired: 'bg-emerald-100 text-emerald-700',
}

const SCORE_DIMENSIONS = [
  { key: 'educationScore' as const, label: '学历匹配' },
  { key: 'experienceScore' as const, label: '经验匹配' },
  { key: 'skillScore' as const, label: '技能匹配' },
  { key: 'salaryScore' as const, label: '薪资匹配' },
]

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getTextColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

interface TimelineNode {
  key: string
  label: string
  icon: React.ReactNode
  done: boolean
  time?: string
  detail?: string
  linkTo?: string
}

export default function ResumeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { resumes, jobs, interviews, offers, onboardingTasks, interviewers, confirmResume, rejectResume } = useRecruitStore()
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const resume = resumes.find((r) => r.id === id)

  if (!resume) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
        <div className="text-center text-gray-400 py-20">未找到该简历</div>
      </div>
    )
  }

  const matchedJob = resume.matchedJobId ? jobs.find((j) => j.id === resume.matchedJobId) : null
  const relatedInterviews = interviews.filter((i) => i.resumeId === resume.id)
  const relatedOffers = offers.filter((o) => o.resumeId === resume.id)
  const relatedOnboardingTasks = onboardingTasks.filter((t) => {
    const offer = relatedOffers.find((o) => o.id === t.offerId)
    return !!offer
  })

  const handleReject = () => {
    if (!rejectReason.trim()) return
    rejectResume(resume.id, rejectReason)
    setShowRejectInput(false)
    setRejectReason('')
  }

  const showConfirmRecommend = resume.status === 'pending' || resume.status === 'screened'
  const showSupervisorConfirm = resume.status === 'recommended'

  const timeline: TimelineNode[] = useMemo(() => {
    const nodes: TimelineNode[] = []
    nodes.push({
      key: 'entry',
      label: '简历录入',
      icon: <FileText className="w-4 h-4" />,
      done: true,
      time: resume.createdAt,
      detail: `${resume.name} · ${resume.education} · ${resume.experienceYears}年经验`,
    })
    const hasScreening = resume.screeningScore > 0
    nodes.push({
      key: 'screening',
      label: '初筛评分',
      icon: <Clock className="w-4 h-4" />,
      done: hasScreening || ['screened', 'recommended', 'confirmed', 'interviewing', 'offered', 'hired'].includes(resume.status),
      detail: hasScreening ? `综合评分 ${resume.screeningScore} 分${matchedJob ? ` · 匹配岗位：${matchedJob.title}` : ''}` : undefined,
    })
    const isRecommended = ['recommended', 'confirmed', 'interviewing', 'offered', 'hired'].includes(resume.status)
    nodes.push({
      key: 'recommend',
      label: '推荐给主管',
      icon: <UserCheck className="w-4 h-4" />,
      done: isRecommended,
      detail: isRecommended ? '已推荐至招聘主管' : undefined,
    })
    const isConfirmed = ['confirmed', 'interviewing', 'offered', 'hired'].includes(resume.status)
    nodes.push({
      key: 'confirm',
      label: '主管确认',
      icon: <Check className="w-4 h-4" />,
      done: isConfirmed,
      detail: isConfirmed ? '主管已确认通过' : undefined,
    })
    if (relatedInterviews.length > 0) {
      const firstInterview = relatedInterviews[0]
      const interviewerName = interviewers.find((iv) => iv.id === firstInterview.interviewerId)?.name || ''
      nodes.push({
        key: 'interview',
        label: '面试安排',
        icon: <Briefcase className="w-4 h-4" />,
        done: true,
        time: new Date(firstInterview.scheduledAt).toLocaleString('zh-CN'),
        detail: `面试官：${interviewerName} · ${firstInterview.duration}分钟`,
        linkTo: `/interview/${firstInterview.id}`,
      })
    } else if (isConfirmed) {
      nodes.push({
        key: 'interview',
        label: '面试安排',
        icon: <Briefcase className="w-4 h-4" />,
        done: false,
        detail: '待安排面试',
      })
    }
    const completedInterview = relatedInterviews.find((i) => i.status === 'completed' && i.evaluation)
    if (completedInterview?.evaluation) {
      nodes.push({
        key: 'evaluation',
        label: '面试评价',
        icon: <MessageSquare className="w-4 h-4" />,
        done: true,
        time: completedInterview.evaluation.evaluatedAt ? new Date(completedInterview.evaluation.evaluatedAt).toLocaleString('zh-CN') : undefined,
        detail: `评分：${completedInterview.evaluation.score} · ${completedInterview.evaluation.comment}`,
        linkTo: `/interview/${completedInterview.id}`,
      })
    }
    const mainOffer = relatedOffers[0]
    if (mainOffer) {
      const approvalSteps: string[] = []
      if (mainOffer.hrManagerApproval === 'approved') approvalSteps.push('HR已批')
      if (mainOffer.gmApproval === 'approved') approvalSteps.push('总经理已批')
      if (mainOffer.status === 'sent' || mainOffer.status === 'accepted' || mainOffer.status === 'declined' || mainOffer.status === 'negotiating') approvalSteps.push('已发送')
      nodes.push({
        key: 'offer',
        label: 'Offer审批',
        icon: <FileText className="w-4 h-4" />,
        done: mainOffer.status !== 'pending',
        time: new Date(mainOffer.createdAt).toLocaleString('zh-CN'),
        detail: approvalSteps.length > 0 ? approvalSteps.join(' → ') : '审批中',
        linkTo: `/offer/${mainOffer.id}`,
      })
      if (['sent', 'accepted', 'declined', 'negotiating'].includes(mainOffer.status)) {
        const feedbackLabel = mainOffer.status === 'accepted' ? '候选人已接受' : mainOffer.status === 'declined' ? '候选人已拒绝' : mainOffer.status === 'negotiating' ? '协商中' : '等待候选人反馈'
        nodes.push({
          key: 'feedback',
          label: '候选人反馈',
          icon: <MessageSquare className="w-4 h-4" />,
          done: mainOffer.status !== 'sent',
          detail: feedbackLabel + (mainOffer.rejectionReason ? ` · 原因：${mainOffer.rejectionReason}` : '') + (mainOffer.candidateNote ? ` · 备注：${mainOffer.candidateNote}` : ''),
          linkTo: `/offer/${mainOffer.id}`,
        })
      }
    } else if (resume.status === 'offered') {
      nodes.push({
        key: 'offer',
        label: 'Offer',
        icon: <FileText className="w-4 h-4" />,
        done: true,
        detail: '已发Offer（暂无审批记录）',
      })
    }
    if (relatedOnboardingTasks.length > 0) {
      const completedTasks = relatedOnboardingTasks.filter((t) => t.status === 'completed')
      nodes.push({
        key: 'onboarding',
        label: '入职准备',
        icon: <ClipboardList className="w-4 h-4" />,
        done: completedTasks.length === relatedOnboardingTasks.length,
        detail: `已完成 ${completedTasks.length}/${relatedOnboardingTasks.length} 项任务`,
      })
    } else if (resume.status === 'hired') {
      nodes.push({
        key: 'onboarding',
        label: '入职',
        icon: <ClipboardList className="w-4 h-4" />,
        done: true,
        detail: '已入职',
      })
    }
    if (resume.status === 'rejected') {
      nodes.push({
        key: 'rejected',
        label: '已驳回',
        icon: <X className="w-4 h-4" />,
        done: true,
        detail: resume.rejectedReason || '未填写原因',
      })
    }
    return nodes
  }, [resume, relatedInterviews, relatedOffers, relatedOnboardingTasks, matchedJob])

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{resume.name}</h1>
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${STATUS_BADGE_CLASS[resume.status]}`}>
            {STATUS_LABEL_MAP[resume.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">手机：</span>{resume.phone}</div>
          <div><span className="text-gray-500">邮箱：</span>{resume.email}</div>
          <div><span className="text-gray-500">学历：</span>{resume.education}</div>
          <div><span className="text-gray-500">工作经验：</span>{resume.experienceYears}年</div>
          <div><span className="text-gray-500">期望薪资：</span>{resume.expectedSalary.toLocaleString()}元/月</div>
          <div><span className="text-gray-500">录入日期：</span>{resume.createdAt}</div>
        </div>

        <div>
          <span className="text-gray-500 text-sm">技能标签：</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {resume.skillTags.map((tag) => (
              <span key={tag} className="inline-block px-2.5 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {resume.rejectedReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            驳回原因：{resume.rejectedReason}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-500" />
          招聘进度
        </h2>
        <div className="relative">
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gray-200" />
          <div className="space-y-6">
            {timeline.map((node, idx) => (
              <div key={node.key} className="relative flex items-start gap-4 pl-1">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 z-10 ${
                  node.done
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {node.done ? <Check className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${node.done ? 'text-gray-900' : 'text-gray-500'}`}>{node.label}</span>
                    {node.time && <span className="text-xs text-gray-400">{node.time}</span>}
                    {idx > 0 && node.done && timeline[idx - 1].done && (
                      <span className="text-xs text-green-500">✓</span>
                    )}
                  </div>
                  {node.detail && (
                    <button
                      onClick={() => node.linkTo ? navigate(node.linkTo) : undefined}
                      className={`text-xs mt-1 block ${node.linkTo ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-gray-500'}`}
                    >
                      {node.detail}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {resume.screeningScore > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">初筛评分详情</h2>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-gray-500 text-sm">综合评分：</span>
            <span className={`text-2xl font-bold ${getTextColor(resume.screeningScore)}`}>
              {resume.screeningScore}
            </span>
          </div>

          <div className="space-y-3">
            {SCORE_DIMENSIONS.map((dim) => (
              <div key={dim.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{dim.label}</span>
                  <span className={`font-medium ${getTextColor(resume[dim.key])}`}>
                    {resume[dim.key]}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(resume[dim.key])}`}
                    style={{ width: `${Math.min(resume[dim.key], 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matchedJob && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            匹配岗位
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><span className="text-gray-500">岗位名称：</span>{matchedJob.title}</div>
            <div><span className="text-gray-500">所属部门：</span>{matchedJob.department}</div>
            <div><span className="text-gray-500">学历要求：</span>{matchedJob.educationReq}</div>
            <div><span className="text-gray-500">经验要求：</span>{matchedJob.minExperience}年</div>
            <div><span className="text-gray-500">薪资范围：</span>{matchedJob.salaryMin.toLocaleString()}-{matchedJob.salaryMax.toLocaleString()}元</div>
            <div>
              <span className="text-gray-500">必备技能：</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {matchedJob.requiredSkills.map((s) => (
                  <span key={s} className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    resume.skillTags.includes(s) ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(showConfirmRecommend || showSupervisorConfirm) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">操作</h2>
          {!showRejectInput ? (
            <div className="flex gap-3">
              {showConfirmRecommend && (
                <button
                  onClick={() => confirmResume(resume.id)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  确认推荐
                </button>
              )}
              {showSupervisorConfirm && (
                <button
                  onClick={() => confirmResume(resume.id)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  主管确认
                </button>
              )}
              <button
                onClick={() => setShowRejectInput(true)}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                驳回
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">驳回原因</label>
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入驳回原因..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认驳回
                </button>
                <button
                  onClick={() => { setShowRejectInput(false); setRejectReason('') }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
