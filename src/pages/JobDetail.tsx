import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Users, GraduationCap } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import type { ResumeStatus } from '@/types'

const RESUME_STATUS_MAP: Record<ResumeStatus, { label: string; className: string }> = {
  pending: { label: '待筛选', className: 'bg-gray-100 text-gray-600' },
  screened: { label: '已筛选', className: 'bg-blue-100 text-blue-700' },
  recommended: { label: '推荐中', className: 'bg-purple-100 text-purple-700' },
  confirmed: { label: '已确认', className: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-700' },
  interviewing: { label: '面试中', className: 'bg-indigo-100 text-indigo-700' },
  offered: { label: '已发Offer', className: 'bg-teal-100 text-teal-700' },
  hired: { label: '已入职', className: 'bg-emerald-100 text-emerald-700' },
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { jobs, resumes, confirmResume, rejectResume } = useRecruitStore()
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const job = jobs.find(j => j.id === id)

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">岗位不存在</p>
      </div>
    )
  }

  const matchedResumes = resumes
    .filter(r => r.matchedJobId === job.id)
    .sort((a, b) => b.screeningScore - a.screeningScore)

  const handleReject = (resumeId: string) => {
    if (!rejectReason.trim()) return
    rejectResume(resumeId, rejectReason)
    setRejectId(null)
    setRejectReason('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              job.status === 'open' ? 'bg-green-100 text-green-700' :
              job.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {job.status === 'open' ? '招聘中' : job.status === 'paused' ? '已暂停' : '已关闭'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">招聘进度</p>
                <p className="text-sm font-medium text-gray-900">{job.filledCount}/{job.headcount} 人</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${job.headcount > 0 ? (job.filledCount / job.headcount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">学历要求</p>
                <p className="text-sm font-medium text-gray-900">{job.educationReq}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">最低经验</p>
              <p className="text-sm font-medium text-gray-900">{job.minExperience} 年</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">薪资范围</p>
              <p className="text-sm font-medium text-gray-900">
                {(job.salaryMin / 1000).toFixed(0)}K-{(job.salaryMax / 1000).toFixed(0)}K
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">必备技能</p>
            <div className="flex flex-wrap gap-1">
              {job.requiredSkills.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          匹配简历 ({matchedResumes.length})
        </h2>

        {matchedResumes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">
            暂无匹配简历
          </div>
        ) : (
          <div className="space-y-3">
            {matchedResumes.map(resume => {
              const status = RESUME_STATUS_MAP[resume.status]
              const matchedSkills = resume.skillTags.filter(s => job.requiredSkills.includes(s))
              return (
                <div key={resume.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{resume.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{resume.education}</span>
                        <span>{resume.experienceYears}年经验</span>
                        <span>期望: {(resume.expectedSalary / 1000).toFixed(0)}K</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">筛选评分</p>
                        <p className={`text-lg font-bold ${
                          resume.screeningScore >= 80 ? 'text-green-600' :
                          resume.screeningScore >= 60 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                          {resume.screeningScore}
                        </p>
                      </div>

                      {(resume.status === 'screened' || resume.status === 'recommended') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmResume(resume.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700"
                          >
                            <Check className="w-3 h-3" />
                            确认
                          </button>
                          <button
                            onClick={() => setRejectId(resume.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                            驳回
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {matchedSkills.map(s => (
                      <span key={s} className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 rounded">{s}</span>
                    ))}
                    {resume.skillTags.filter(s => !job.requiredSkills.includes(s)).map(s => (
                      <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">{s}</span>
                    ))}
                  </div>

                  {rejectId === resume.id && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <input
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="请输入驳回原因"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      <button
                        onClick={() => handleReject(resume.id)}
                        className="px-3 py-1.5 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        确认驳回
                      </button>
                      <button
                        onClick={() => { setRejectId(null); setRejectReason('') }}
                        className="px-3 py-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
