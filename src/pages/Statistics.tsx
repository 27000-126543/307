import { useState, useMemo } from 'react'
import { useRecruitStore } from '@/stores/recruitStore'
import { exportMonthlyReport } from '@/utils/export'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Download, TrendingUp, Users, CheckCircle, Building2 } from 'lucide-react'

const COLORS = ['#1E3A5F', '#D4A843', '#2D9B5A', '#D94452', '#E5A118', '#7C5CFC', '#4ECDC4']

const STATUS_LABELS: Record<string, string> = {
  pending: '待筛选',
  screened: '已筛选',
  recommended: '推荐中',
  confirmed: '已确认',
  rejected: '已驳回',
  interviewing: '面试中',
  offered: '已发Offer',
  hired: '已入职',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#E5A118',
  screened: '#1E3A5F',
  recommended: '#3B82F6',
  confirmed: '#2D9B5A',
  rejected: '#D94452',
  interviewing: '#7C5CFC',
  offered: '#A855F7',
  hired: '#4ECDC4',
}

type DateRange = 'month' | 'quarter' | 'year'

export default function Statistics() {
  const { resumes, jobs, interviews, offers, onboardingTasks } = useRecruitStore()
  const [selectedDept, setSelectedDept] = useState('全部部门')
  const [dateRange, setDateRange] = useState<DateRange>('month')

  const departments = useMemo(() => {
    const depts = new Set(jobs.map((j) => j.department))
    return ['全部部门', ...Array.from(depts)]
  }, [jobs])

  const getDateRange = useMemo(() => {
    const now = new Date()
    let start: Date
    let end: Date
    if (dateRange === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    } else if (dateRange === 'quarter') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
      start = new Date(now.getFullYear(), quarterStartMonth, 1)
      end = new Date(now.getFullYear(), quarterStartMonth + 3, 1)
    } else {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear() + 1, 0, 1)
    }
    return { start, end }
  }, [dateRange])

  const filteredResumes = useMemo(() => {
    let result = resumes
    if (selectedDept !== '全部部门') {
      const jobIds = new Set(jobs.filter((j) => j.department === selectedDept).map((j) => j.id))
      result = result.filter((r) => !r.matchedJobId || jobIds.has(r.matchedJobId))
    }
    const { start, end } = getDateRange
    result = result.filter((r) => {
      const d = new Date(r.createdAt)
      return d >= start && d < end
    })
    return result
  }, [resumes, jobs, selectedDept, getDateRange])

  const filteredInterviews = useMemo(() => {
    let result = interviews
    if (selectedDept !== '全部部门') {
      const jobIds = new Set(jobs.filter((j) => j.department === selectedDept).map((j) => j.id))
      result = result.filter((i) => jobIds.has(i.jobId))
    }
    const { start, end } = getDateRange
    result = result.filter((i) => {
      const d = new Date(i.scheduledAt)
      return d >= start && d < end
    })
    return result
  }, [interviews, jobs, selectedDept, getDateRange])

  const filteredOffers = useMemo(() => {
    let result = offers
    if (selectedDept !== '全部部门') {
      const jobIds = new Set(jobs.filter((j) => j.department === selectedDept).map((j) => j.id))
      result = result.filter((o) => jobIds.has(o.jobId))
    }
    const { start, end } = getDateRange
    result = result.filter((o) => {
      const d = new Date(o.createdAt)
      return d >= start && d < end
    })
    return result
  }, [offers, jobs, selectedDept, getDateRange])

  const stats = useMemo(() => {
    const totalResumes = filteredResumes.length
    const completedInterviews = filteredInterviews.filter((i) => i.status === 'completed')
    const passedInterviews = completedInterviews.filter(
      (i) => i.evaluation && (i.evaluation.recommendation === 'strongly_recommend' || i.evaluation.recommendation === 'recommend')
    )
    const interviewPassRate = completedInterviews.length > 0 ? Math.round((passedInterviews.length / completedInterviews.length) * 100) : 0
    const validOffers = filteredOffers.filter((o) => o.status !== 'rejected')
    const acceptedOffers = validOffers.filter((o) => o.status === 'accepted')
    const offerAcceptRate = validOffers.length > 0 ? Math.round((acceptedOffers.length / validOffers.length) * 100) : 0
    const sentOfferIds = new Set(filteredOffers.filter((o) => o.status === 'sent' || o.status === 'accepted').map((o) => o.id))
    const onboardedCount = onboardingTasks.filter(
      (t) => sentOfferIds.has(t.offerId) && t.type === 'workstation' && t.status === 'completed'
    ).length
    const totalSent = sentOfferIds.size
    const onboardRate = totalSent > 0 ? Math.round((onboardedCount / totalSent) * 100) : 0
    return { totalResumes, interviewPassRate, offerAcceptRate, onboardRate }
  }, [filteredResumes, filteredInterviews, filteredOffers, onboardingTasks])

  const deptBarData = useMemo(() => {
    const jobDeptMap = Object.fromEntries(jobs.map((j) => [j.id, j.department]))
    const deptCounts: Record<string, number> = {}
    for (const resume of filteredResumes) {
      const dept = resume.matchedJobId ? (jobDeptMap[resume.matchedJobId] || '未匹配') : '待分配'
      deptCounts[dept] = (deptCounts[dept] || 0) + 1
    }
    return Object.entries(deptCounts).map(([name, value]) => ({ name, value }))
  }, [filteredResumes, jobs])

  const pieData = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    for (const resume of filteredResumes) {
      const s = resume.status
      if (STATUS_LABELS[s]) {
        statusCounts[s] = (statusCounts[s] || 0) + 1
      }
    }
    return Object.entries(statusCounts).map(([key, value]) => ({
      name: STATUS_LABELS[key],
      value,
      color: STATUS_COLORS[key],
    }))
  }, [filteredResumes])

  const lineData = useMemo(() => {
    const now = new Date()
    const months: { key: string; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${d.getMonth() + 1}月`,
      })
    }
    const jobDeptMap = Object.fromEntries(jobs.map((j) => [j.id, j.department]))
    const filteredByRange = filteredInterviews.filter((i) => {
      const d = new Date(i.scheduledAt)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return months.some((m) => m.key === monthKey)
    })
    return months.map((m) => {
      const count = filteredByRange.filter((i) => {
        const d = new Date(i.scheduledAt)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m.key
      }).length
      return { name: m.label, 面试数: count }
    })
  }, [filteredInterviews, jobs])

  const jobPassRateData = useMemo(() => {
    const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j.title]))
    const jobInterviews: Record<string, { total: number; passed: number }> = {}
    for (const interview of filteredInterviews) {
      const title = jobMap[interview.jobId] || '未知岗位'
      if (!jobInterviews[interview.jobId]) {
        jobInterviews[interview.jobId] = { total: 0, passed: 0 }
      }
      if (interview.status === 'completed') {
        jobInterviews[interview.jobId].total++
        if (
          interview.evaluation &&
          (interview.evaluation.recommendation === 'strongly_recommend' || interview.evaluation.recommendation === 'recommend')
        ) {
          jobInterviews[interview.jobId].passed++
        }
      }
    }
    return Object.entries(jobInterviews)
      .filter(([, v]) => v.total > 0)
      .map(([jobId, v]) => ({
        name: jobMap[jobId] || '未知岗位',
        通过率: Math.round((v.passed / v.total) * 100),
      }))
  }, [filteredInterviews, jobs])

  const STAT_CARDS = [
    { label: '简历总量', value: stats.totalResumes, icon: Users, iconBg: 'bg-blue-100 text-blue-600', suffix: '' },
    { label: '面试通过率', value: stats.interviewPassRate, icon: TrendingUp, iconBg: 'bg-green-100 text-green-600', suffix: '%' },
    { label: 'Offer接受率', value: stats.offerAcceptRate, icon: CheckCircle, iconBg: 'bg-purple-100 text-purple-600', suffix: '%' },
    { label: '到岗率', value: stats.onboardRate, icon: Building2, iconBg: 'bg-amber-100 text-amber-600', suffix: '%' },
  ]

  const handleExport = () => {
    exportMonthlyReport(resumes, interviews, offers, jobs)
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">部门</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-field w-40"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">时间范围</label>
            <div className="flex gap-1">
              {([
                { key: 'month' as DateRange, label: '本月' },
                { key: 'quarter' as DateRange, label: '本季度' },
                { key: 'year' as DateRange, label: '本年' },
              ]).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setDateRange(item.key)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    dateRange === item.key
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}{card.suffix}
                </div>
                <div className="text-sm text-gray-500 mt-1">{card.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">简历处理量（按部门）</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="简历数" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">简历状态分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">月度面试趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="面试数"
                stroke="#1E3A5F"
                strokeWidth={2}
                dot={{ fill: '#1E3A5F', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">各岗位面试通过率</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobPassRateData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Bar dataKey="通过率" name="通过率" fill="#D4A843" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出月度报告
        </button>
      </div>
    </div>
  )
}
