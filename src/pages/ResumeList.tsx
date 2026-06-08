import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Eye, Star, X } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import { SKILL_OPTIONS } from '@/data/mockData'
import type { Resume, ResumeStatus } from '@/types'

const STATUS_OPTIONS: { label: string; value: ResumeStatus | '' }[] = [
  { label: '全部状态', value: '' },
  { label: '待筛选', value: 'pending' },
  { label: '已筛选', value: 'screened' },
  { label: '已推荐', value: 'recommended' },
  { label: '已确认', value: 'confirmed' },
  { label: '已驳回', value: 'rejected' },
  { label: '面试中', value: 'interviewing' },
  { label: '已发Offer', value: 'offered' },
  { label: '已入职', value: 'hired' },
]

const STATUS_LABEL_MAP: Record<ResumeStatus, string> = {
  pending: '待筛选',
  screened: '已筛选',
  recommended: '已推荐',
  confirmed: '已确认',
  rejected: '已驳回',
  interviewing: '面试中',
  offered: '已发Offer',
  hired: '已入职',
}

const STATUS_BADGE_CLASS: Record<ResumeStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  screened: 'bg-blue-100 text-blue-700',
  recommended: 'bg-indigo-100 text-indigo-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  interviewing: 'bg-amber-100 text-amber-700',
  offered: 'bg-teal-100 text-teal-700',
  hired: 'bg-emerald-100 text-emerald-700',
}

const EDUCATION_OPTIONS = ['高中', '大专', '本科', '硕士', '博士'] as const

interface FormData {
  name: string
  phone: string
  email: string
  education: string
  experienceYears: number
  skillTags: string[]
  expectedSalary: number
}

const emptyForm: FormData = {
  name: '',
  phone: '',
  email: '',
  education: '本科',
  experienceYears: 0,
  skillTags: [],
  expectedSalary: 0,
}

export default function ResumeList() {
  const navigate = useNavigate()
  const { resumes, addResume, screenResumes } = useRecruitStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ResumeStatus | ''>('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false)

  const filtered = resumes.filter((r) => {
    const matchSearch = !search || r.name.includes(search) || r.skillTags.some((s) => s.includes(search))
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const newResume: Resume = {
      id: `r_${Date.now()}`,
      name: form.name,
      phone: form.phone,
      email: form.email,
      education: form.education as Resume['education'],
      experienceYears: form.experienceYears,
      skillTags: form.skillTags,
      expectedSalary: form.expectedSalary,
      status: 'pending',
      screeningScore: 0,
      educationScore: 0,
      experienceScore: 0,
      skillScore: 0,
      salaryScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    addResume(newResume)
    setForm(emptyForm)
    setShowModal(false)
  }

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skillTags: prev.skillTags.includes(skill)
        ? prev.skillTags.filter((s) => s !== skill)
        : [...prev.skillTags, skill],
    }))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">简历管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => screenResumes()}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Star className="w-4 h-4" />
            一键初筛
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            录入简历
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名或技能..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ResumeStatus | '')}
            className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">姓名</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">学历</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">工作经验</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">技能标签</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">期望薪资</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">初筛评分</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((resume) => (
              <tr key={resume.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{resume.name}</td>
                <td className="px-4 py-3">{resume.education}</td>
                <td className="px-4 py-3">{resume.experienceYears}年</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {resume.skillTags.map((tag) => (
                      <span key={tag} className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{resume.expectedSalary.toLocaleString()}元</td>
                <td className="px-4 py-3">
                  {resume.screeningScore > 0 ? (
                    <span className={
                      resume.screeningScore >= 80 ? 'text-green-600 font-semibold' :
                      resume.screeningScore >= 60 ? 'text-amber-600 font-semibold' :
                      'text-red-600 font-semibold'
                    }>
                      {resume.screeningScore}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_BADGE_CLASS[resume.status]}`}>
                    {STATUS_LABEL_MAP[resume.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/resume/${resume.id}`)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      查看详情
                    </button>
                    {resume.status === 'pending' && (
                      <button
                        onClick={() => screenResumes()}
                        className="flex items-center gap-1 text-amber-600 hover:text-amber-800"
                      >
                        <Star className="w-3.5 h-3.5" />
                        初筛评分
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">录入简历</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学历</label>
                  <select
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EDUCATION_OPTIONS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工作经验(年)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">技能标签</label>
                <div className="relative">
                  <div
                    onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                    className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg cursor-pointer flex flex-wrap gap-1"
                  >
                    {form.skillTags.length > 0 ? (
                      form.skillTags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); toggleSkill(tag) }}
                          />
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">选择技能...</span>
                    )}
                  </div>
                  {skillDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                      {SKILL_OPTIONS.map((skill) => (
                        <label key={skill} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.skillTags.includes(skill)}
                            onChange={() => toggleSkill(skill)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{skill}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期望薪资(元/月)</label>
                <input
                  type="number"
                  min={0}
                  value={form.expectedSalary}
                  onChange={(e) => setForm({ ...form, expectedSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
