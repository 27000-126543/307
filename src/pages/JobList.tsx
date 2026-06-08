import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, MapPin, Users, DollarSign } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import { DEPARTMENTS, SKILL_OPTIONS, EDUCATION_LEVELS } from '@/data/mockData'
import type { EducationLevel, JobStatus } from '@/types'

const STATUS_MAP: Record<JobStatus, { label: string; className: string }> = {
  open: { label: '招聘中', className: 'bg-green-100 text-green-700' },
  closed: { label: '已关闭', className: 'bg-gray-100 text-gray-600' },
  paused: { label: '已暂停', className: 'bg-yellow-100 text-yellow-700' },
}

export default function JobList() {
  const navigate = useNavigate()
  const { jobs, addJob } = useRecruitStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    department: DEPARTMENTS[0],
    headcount: 1,
    educationReq: '本科' as EducationLevel,
    minExperience: 1,
    requiredSkills: [] as string[],
    salaryMin: 10000,
    salaryMax: 20000,
  })

  const handleSubmit = () => {
    if (!form.title.trim()) return
    addJob({
      id: `job_${Date.now()}`,
      title: form.title,
      department: form.department,
      headcount: form.headcount,
      filledCount: 0,
      educationReq: form.educationReq,
      minExperience: form.minExperience,
      requiredSkills: form.requiredSkills,
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    })
    setShowModal(false)
    setForm({
      title: '',
      department: DEPARTMENTS[0],
      headcount: 1,
      educationReq: '本科',
      minExperience: 1,
      requiredSkills: [],
      salaryMin: 10000,
      salaryMax: 20000,
    })
  }

  const toggleSkill = (skill: string) => {
    setForm(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">岗位管理</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建岗位
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {jobs.map(job => {
            const status = STATUS_MAP[job.status]
            return (
              <div
                key={job.id}
                onClick={() => navigate(`/screening?jobId=${job.id}`)}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{job.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{job.department}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{job.filledCount}/{job.headcount} 人</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${job.headcount > 0 ? (job.filledCount / job.headcount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {(job.salaryMin / 1000).toFixed(0)}K-{(job.salaryMax / 1000).toFixed(0)}K
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 4).map(skill => (
                    <span key={skill} className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">
                      +{job.requiredSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">新建岗位</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">岗位名称</label>
                <input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入岗位名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
                <select
                  value={form.department}
                  onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">招聘人数</label>
                <input
                  type="number"
                  min={1}
                  value={form.headcount}
                  onChange={e => setForm(prev => ({ ...prev, headcount: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学历要求</label>
                <select
                  value={form.educationReq}
                  onChange={e => setForm(prev => ({ ...prev, educationReq: e.target.value as EducationLevel }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EDUCATION_LEVELS.map(el => (
                    <option key={el.value} value={el.value}>{el.value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最低工作经验（年）</label>
                <input
                  type="number"
                  min={0}
                  value={form.minExperience}
                  onChange={e => setForm(prev => ({ ...prev, minExperience: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">必备技能</label>
                <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto">
                  {SKILL_OPTIONS.map(skill => (
                    <label key={skill} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.requiredSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
                {form.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.requiredSkills.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">薪资范围（元/月）</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={e => setForm(prev => ({ ...prev, salaryMin: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={e => setForm(prev => ({ ...prev, salaryMax: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
