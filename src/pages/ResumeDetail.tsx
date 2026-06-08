import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Briefcase } from 'lucide-react'
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

export default function ResumeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { resumes, jobs, confirmResume, rejectResume } = useRecruitStore()
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

  const handleReject = () => {
    if (!rejectReason.trim()) return
    rejectResume(resume.id, rejectReason)
    setShowRejectInput(false)
    setRejectReason('')
  }

  const showConfirmRecommend = resume.status === 'pending' || resume.status === 'screened'
  const showSupervisorConfirm = resume.status === 'recommended'

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
