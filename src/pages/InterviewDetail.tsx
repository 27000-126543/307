import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Users, Check, X, MessageSquare, Star } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import type { InterviewStatus, RecommendationLevel } from '@/types'

const TIMELINE_STEPS: { status: InterviewStatus; label: string }[] = [
  { status: 'scheduled', label: '已排期' },
  { status: 'confirmed', label: '已确认' },
  { status: 'in_progress', label: '面试中' },
  { status: 'completed', label: '已完成' },
]

const STATUS_ORDER: Record<InterviewStatus, number> = {
  scheduled: 0,
  confirmed: 1,
  adjustment_requested: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
}

const STATUS_BADGE: Record<InterviewStatus, { label: string; className: string }> = {
  scheduled: { label: '已排期', className: 'bg-blue-100 text-blue-700' },
  confirmed: { label: '已确认', className: 'bg-green-100 text-green-700' },
  adjustment_requested: { label: '调整申请中', className: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: '面试中', className: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: '已取消', className: 'bg-red-100 text-red-600' },
}

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  urgent: { label: '紧急', className: 'bg-red-100 text-red-700' },
  high: { label: '高', className: 'bg-orange-100 text-orange-700' },
  normal: { label: '普通', className: 'bg-blue-100 text-blue-700' },
  low: { label: '低', className: 'bg-gray-100 text-gray-600' },
}

const RECOMMENDATION_OPTIONS: { value: RecommendationLevel; label: string }[] = [
  { value: 'strongly_recommend', label: '强烈推荐' },
  { value: 'recommend', label: '推荐' },
  { value: 'neutral', label: '一般' },
  { value: 'not_recommend', label: '不推荐' },
]

const RECOMMENDATION_LABEL: Record<RecommendationLevel, string> = {
  strongly_recommend: '强烈推荐',
  recommend: '推荐',
  neutral: '一般',
  not_recommend: '不推荐',
}

export default function InterviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    interviews, resumes, jobs, interviewers, meetingRooms,
    updateInterview, requestAdjustment, approveAdjustment, rejectAdjustment, addEvaluation,
  } = useRecruitStore()

  const [showAdjustInput, setShowAdjustInput] = useState(false)
  const [adjustReason, setAdjustReason] = useState('')
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [evalScore, setEvalScore] = useState(7)
  const [evalComment, setEvalComment] = useState('')
  const [evalRecommendation, setEvalRecommendation] = useState<RecommendationLevel>('recommend')

  const interview = interviews.find((i) => i.id === id)

  if (!interview) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
        <div className="text-center text-gray-400 py-20">未找到该面试记录</div>
      </div>
    )
  }

  const resume = resumes.find((r) => r.id === interview.resumeId)
  const job = jobs.find((j) => j.id === interview.jobId)
  const interviewer = interviewers.find((i) => i.id === interview.interviewerId)
  const room = meetingRooms.find((r) => r.id === interview.roomId)

  const statusBadge = STATUS_BADGE[interview.status]
  const priorityBadge = PRIORITY_BADGE[interview.priority]

  const formatTime = (scheduledAt: string) => {
    const d = new Date(scheduledAt)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const currentStep = STATUS_ORDER[interview.status]

  const handleRequestAdjust = () => {
    if (!adjustReason.trim()) return
    requestAdjustment(interview.id, adjustReason)
    setShowAdjustInput(false)
    setAdjustReason('')
  }

  const handleComplete = () => {
    setShowEvaluation(true)
  }

  const handleSubmitEvaluation = () => {
    addEvaluation(interview.id, {
      score: evalScore,
      comment: evalComment,
      recommendation: evalRecommendation,
      evaluatorId: interview.interviewerId,
    })
    setShowEvaluation(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">面试详情</h1>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${priorityBadge.className}`}>
                {priorityBadge.label}
              </span>
              <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">候选人：</span>
              <span className="text-gray-900 font-medium">{resume?.name ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">岗位：</span>
              <span className="text-gray-900">{job?.title ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">面试官：</span>
              <span className="text-gray-900">{interviewer?.name ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">会议室：</span>
              <span className="text-gray-900">{room?.name ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">时间：</span>
              <span className="text-gray-900">{formatTime(interview.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">时长：</span>
              <span className="text-gray-900">{interview.duration}分钟</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">状态流转</h2>
          <div className="flex items-center">
            {TIMELINE_STEPS.map((step, idx) => {
              const stepIndex = STATUS_ORDER[step.status]
              const isActive = currentStep >= stepIndex
              const isCurrent = interview.status === step.status || (interview.status === 'adjustment_requested' && step.status === 'confirmed')
              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive
                          ? isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isActive && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 -mx-2 ${isActive && currentStep > stepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
          {interview.status === 'adjustment_requested' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              当前状态：调整申请中 {interview.adjustmentReason && `（原因：${interview.adjustmentReason}）`}
            </div>
          )}
        </div>

        {(interview.status === 'confirmed' || interview.status === 'scheduled') && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">操作</h2>
            {!showAdjustInput ? (
              <div className="flex gap-3">
                <button
                  onClick={() => updateInterview(interview.id, { status: 'confirmed' })}
                  className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  确认参加
                </button>
                <button
                  onClick={() => setShowAdjustInput(true)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  申请调整
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">调整原因</label>
                  <textarea
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="请输入调整原因..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRequestAdjust}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    提交申请
                  </button>
                  <button
                    onClick={() => { setShowAdjustInput(false); setAdjustReason('') }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {interview.status === 'adjustment_requested' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">审批调整申请</h2>
            {interview.adjustmentReason && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                调整原因：{interview.adjustmentReason}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => approveAdjustment(interview.id)}
                className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                批准调整
              </button>
              <button
                onClick={() => rejectAdjustment(interview.id)}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                驳回调整
              </button>
            </div>
          </div>
        )}

        {interview.status === 'in_progress' && !showEvaluation && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">面试进行中</h2>
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              完成面试
            </button>
          </div>
        )}

        {showEvaluation && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">面试评价</h2>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                评分：{evalScore}/10
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={evalScore}
                onChange={(e) => setEvalScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">评价内容</label>
              <textarea
                value={evalComment}
                onChange={(e) => setEvalComment(e.target.value)}
                placeholder="请输入面试评价..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">推荐程度</label>
              <select
                value={evalRecommendation}
                onChange={(e) => setEvalRecommendation(e.target.value as RecommendationLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RECOMMENDATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitEvaluation}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                提交评价
              </button>
              <button
                onClick={() => setShowEvaluation(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {interview.status === 'completed' && interview.evaluation && !showEvaluation && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              面试评价
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">评分</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900">{interview.evaluation.score}</span>
                  <span className="text-sm text-gray-400">/10</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">推荐程度</span>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                    interview.evaluation.recommendation === 'strongly_recommend' ? 'bg-green-100 text-green-700' :
                    interview.evaluation.recommendation === 'recommend' ? 'bg-blue-100 text-blue-700' :
                    interview.evaluation.recommendation === 'neutral' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {RECOMMENDATION_LABEL[interview.evaluation.recommendation]}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">评价内容</span>
              <p className="mt-1 text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                {interview.evaluation.comment || '暂无评价内容'}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              评价时间：{interview.evaluation.evaluatedAt ? new Date(interview.evaluation.evaluatedAt).toLocaleString('zh-CN') : '-'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
