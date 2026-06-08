import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Check, X, RefreshCw, Star, Users } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import { calculateScreeningScore } from '@/utils/screening'

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreStroke(score: number) {
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#2563eb'
  if (score >= 40) return '#ea580c'
  return '#dc2626'
}

export default function Screening() {
  const [searchParams] = useSearchParams()
  const jobIdFromUrl = searchParams.get('jobId')
  const { jobs, resumes, confirmResume, rejectResume, screenResumes } = useRecruitStore()

  const [selectedJobId, setSelectedJobId] = useState(jobIdFromUrl || jobs[0]?.id || '')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const selectedJob = jobs.find(j => j.id === selectedJobId)
  const matchedResumes = resumes
    .filter(r => r.matchedJobId === selectedJobId)
    .sort((a, b) => b.screeningScore - a.screeningScore)

  const totalResumes = matchedResumes.length
  const avgScore = totalResumes > 0
    ? Math.round(matchedResumes.reduce((sum, r) => sum + r.screeningScore, 0) / totalResumes)
    : 0
  const passCount = matchedResumes.filter(r => r.screeningScore >= 60).length
  const passRate = totalResumes > 0 ? Math.round((passCount / totalResumes) * 100) : 0

  const handleReject = (resumeId: string) => {
    if (!rejectReason.trim()) return
    rejectResume(resumeId, rejectReason)
    setRejectId(null)
    setRejectReason('')
  }

  const handleRescreen = () => {
    screenResumes()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900">岗位列表</h2>
        </div>
        <div className="space-y-2">
          {jobs.map(job => (
            <div
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedJobId === job.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{job.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{job.department} · {job.filledCount}/{job.headcount}人</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {selectedJob ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{selectedJob.title} - 智能筛选</h1>
                <p className="text-sm text-gray-500 mt-1">{selectedJob.department}</p>
              </div>
              <button
                onClick={handleRescreen}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                重新筛选
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">匹配简历</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalResumes}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-500">平均评分</span>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">通过率</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{passRate}%</p>
              </div>
            </div>

            {matchedResumes.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                暂无匹配简历，点击"重新筛选"开始智能匹配
              </div>
            ) : (
              <div className="space-y-4">
                {matchedResumes.map(resume => {
                  const scoreColor = getScoreStroke(resume.screeningScore)
                  const offset = CIRCUMFERENCE - (resume.screeningScore / 100) * CIRCUMFERENCE
                  const screeningResult = calculateScreeningScore(resume, selectedJob)

                  return (
                    <div key={resume.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex gap-5">
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <svg width="80" height="80" className="-rotate-90">
                            <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth="6" />
                            <circle
                              cx="40" cy="40" r={RADIUS} fill="none"
                              stroke={scoreColor}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={CIRCUMFERENCE}
                              strokeDashoffset={offset}
                            />
                          </svg>
                          <p className={`text-lg font-bold -mt-12 ${getScoreColor(resume.screeningScore)}`}>
                            {resume.screeningScore}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-7">综合评分</p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{resume.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {resume.education} · {resume.experienceYears}年经验 · 期望{(resume.expectedSalary / 1000).toFixed(0)}K
                              </p>
                            </div>
                            {(resume.status === 'screened' || resume.status === 'recommended') && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => confirmResume(resume.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                  <Check className="w-3 h-3" />
                                  确认推荐
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

                          <div className="grid grid-cols-4 gap-3 mb-3">
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">学历匹配</p>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${resume.educationScore}%` }} />
                                </div>
                                <span className="text-xs text-gray-600 w-7 text-right">{resume.educationScore}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">经验匹配</p>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${resume.experienceScore}%` }} />
                                </div>
                                <span className="text-xs text-gray-600 w-7 text-right">{resume.experienceScore}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">技能匹配</p>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${resume.skillScore}%` }} />
                                </div>
                                <span className="text-xs text-gray-600 w-7 text-right">{resume.skillScore}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">薪资匹配</p>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${resume.salaryScore}%` }} />
                                </div>
                                <span className="text-xs text-gray-600 w-7 text-right">{resume.salaryScore}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] text-green-600 font-medium">匹配技能</span>
                              <div className="flex flex-wrap gap-1">
                                {screeningResult.matchedSkills.map(s => (
                                  <span key={s} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded">{s}</span>
                                ))}
                              </div>
                            </div>
                            {screeningResult.missingSkills.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-red-500 font-medium">缺失技能</span>
                                <div className="flex flex-wrap gap-1">
                                  {screeningResult.missingSkills.map(s => (
                                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            请选择一个岗位查看筛选结果
          </div>
        )}
      </div>
    </div>
  )
}
