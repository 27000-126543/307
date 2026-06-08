import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, List, Filter, Zap, Clock, MapPin, Users, Play, Check, AlertCircle, Eye } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import { autoScheduleInterviews, checkConflicts } from '@/utils/scheduler'
import type { InterviewPriority, InterviewStatus } from '@/types'

const PRIORITY_OPTIONS: { value: InterviewPriority | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'urgent', label: '紧急' },
  { value: 'high', label: '高' },
  { value: 'normal', label: '普通' },
  { value: 'low', label: '低' },
]

const STATUS_OPTIONS: { value: InterviewStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'scheduled', label: '已排期' },
  { value: 'confirmed', label: '已确认' },
  { value: 'adjustment_requested', label: '调整申请中' },
  { value: 'in_progress', label: '面试中' },
  { value: 'completed', label: '已完成' },
]

const PRIORITY_BADGE: Record<InterviewPriority, { label: string; className: string }> = {
  urgent: { label: '紧急', className: 'bg-red-100 text-red-700' },
  high: { label: '高', className: 'bg-orange-100 text-orange-700' },
  normal: { label: '普通', className: 'bg-blue-100 text-blue-700' },
  low: { label: '低', className: 'bg-gray-100 text-gray-600' },
}

const STATUS_BADGE: Record<InterviewStatus, { label: string; className: string }> = {
  scheduled: { label: '已排期', className: 'bg-blue-100 text-blue-700' },
  confirmed: { label: '已确认', className: 'bg-green-100 text-green-700' },
  adjustment_requested: { label: '调整申请中', className: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: '面试中', className: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: '已取消', className: 'bg-red-100 text-red-600' },
}

const CALENDAR_COLORS: Record<InterviewPriority, string> = {
  urgent: 'bg-red-200 border-red-400',
  high: 'bg-orange-200 border-orange-400',
  normal: 'bg-blue-200 border-blue-400',
  low: 'bg-gray-200 border-gray-400',
}

export default function InterviewList() {
  const navigate = useNavigate()
  const { interviews, resumes, jobs, interviewers, meetingRooms, addInterview, updateInterview } = useRecruitStore()

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [priorityFilter, setPriorityFilter] = useState<InterviewPriority | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>('all')
  const [scheduling, setScheduling] = useState(false)
  const [scheduleResult, setScheduleResult] = useState<{ scheduled: number; failures: Array<{ resumeName: string; reason: string }> } | null>(null)

  const filtered = useMemo(() => {
    return interviews.filter((i) => {
      if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      return true
    })
  }, [interviews, priorityFilter, statusFilter])

  const getResumeName = (resumeId: string) => resumes.find((r) => r.id === resumeId)?.name ?? '-'
  const getJobTitle = (jobId: string) => jobs.find((j) => j.id === jobId)?.title ?? '-'
  const getInterviewerName = (interviewerId: string) => interviewers.find((i) => i.id === interviewerId)?.name ?? '-'
  const getRoomName = (roomId: string) => meetingRooms.find((r) => r.id === roomId)?.name ?? '-'

  const formatTime = (scheduledAt: string) => {
    const d = new Date(scheduledAt)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const handleAutoSchedule = () => {
    setScheduling(true)
    setScheduleResult(null)
    const pendingResumes = resumes
      .filter((r) => r.status === 'confirmed' && !interviews.some((i) => i.resumeId === r.id))
      .map((r) => ({
        resumeId: r.id,
        jobId: r.matchedJobId ?? '',
        priority: 'normal' as const,
      }))

    if (pendingResumes.length === 0) {
      setScheduling(false)
      setScheduleResult({ scheduled: 0, failures: [] })
      return
    }

    const result = autoScheduleInterviews(pendingResumes, interviewers, meetingRooms, interviews)
    for (const item of result.scheduled) {
      const { isNew, ...interviewData } = item
      addInterview(interviewData)
    }
    const failureNames = result.failures.map((f) => ({
      resumeName: getResumeName(f.resumeId),
      reason: f.reason,
    }))
    setScheduleResult({ scheduled: result.scheduled.length, failures: failureNames })
    setScheduling(false)
  }

  const handleAction = (interview: typeof interviews[0]) => {
    switch (interview.status) {
      case 'confirmed':
        updateInterview(interview.id, { status: 'in_progress' })
        break
      case 'scheduled':
        updateInterview(interview.id, { status: 'confirmed' })
        break
      case 'adjustment_requested':
        navigate(`/interview/${interview.id}`)
        break
      case 'completed':
        navigate(`/interview/${interview.id}`)
        break
    }
  }

  const getActionButton = (interview: typeof interviews[0]) => {
    switch (interview.status) {
      case 'confirmed':
        return { label: '开始面试', icon: <Play className="w-3.5 h-3.5" />, className: 'bg-purple-600 hover:bg-purple-700 text-white' }
      case 'scheduled':
        return { label: '确认', icon: <Check className="w-3.5 h-3.5" />, className: 'bg-green-600 hover:bg-green-700 text-white' }
      case 'adjustment_requested':
        return { label: '审批', icon: <AlertCircle className="w-3.5 h-3.5" />, className: 'bg-yellow-500 hover:bg-yellow-600 text-white' }
      case 'completed':
        return { label: '查看评价', icon: <Eye className="w-3.5 h-3.5" />, className: 'bg-gray-600 hover:bg-gray-700 text-white' }
      default:
        return null
    }
  }

  const calendarDays = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      days.push(d)
    }
    return days
  }, [])

  const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  const calendarInterviews = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const day of calendarDays) {
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
      map[key] = filtered.filter((i) => {
        const d = new Date(i.scheduledAt)
        return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate()
      })
    }
    return map
  }, [filtered, calendarDays])

  const isToday = (d: Date) => {
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">面试管理</h1>
          <button
            onClick={handleAutoSchedule}
            disabled={scheduling}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {scheduling ? '排期中...' : '自动排期'}
          </button>
        </div>

        {scheduleResult && (
          <div className={`rounded-xl p-4 mb-6 border ${scheduleResult.failures.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {scheduleResult.failures.length > 0 ? (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                ) : (
                  <Check className="w-4 h-4 text-green-600" />
                )}
                <span className="text-sm font-medium">
                  成功安排 {scheduleResult.scheduled} 场面试
                  {scheduleResult.failures.length > 0 && `，${scheduleResult.failures.length} 场因冲突无法安排`}
                </span>
              </div>
              <button onClick={() => setScheduleResult(null)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            {scheduleResult.failures.length > 0 && (
              <div className="mt-2 space-y-1">
                {scheduleResult.failures.map((f, idx) => (
                  <div key={idx} className="text-xs text-amber-700">
                    {f.resumeName}：{f.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">优先级：</span>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriorityFilter(opt.value)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      priorityFilter === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">状态：</span>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                列表
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  viewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                日历
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">候选人</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">岗位</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">面试官</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">会议室</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">时间</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">时长</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">优先级</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">状态</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      暂无面试安排
                    </td>
                  </tr>
                ) : (
                  filtered.map((interview) => {
                    const priorityBadge = PRIORITY_BADGE[interview.priority]
                    const statusBadge = STATUS_BADGE[interview.status]
                    const actionBtn = getActionButton(interview)
                    const conflicts = checkConflicts(interview, interviews)
                    const hasConflict = conflicts.interviewerConflict || conflicts.roomConflict
                    return (
                      <tr key={interview.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${hasConflict ? 'bg-red-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{getResumeName(interview.resumeId)}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{getJobTitle(interview.jobId)}</td>
                        <td className="px-4 py-3 text-gray-600">{getInterviewerName(interview.interviewerId)}</td>
                        <td className="px-4 py-3 text-gray-600">{getRoomName(interview.roomId)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatTime(interview.scheduledAt)}</td>
                        <td className="px-4 py-3 text-gray-600">{interview.duration}分钟</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${priorityBadge.className}`}>
                            {priorityBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                          {hasConflict && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-red-500" title={conflicts.interviewerConflict ? '面试官时间冲突' : '会议室时间冲突'}>
                              <AlertCircle className="w-3 h-3" />
                              冲突
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {actionBtn && (
                            <button
                              onClick={() => handleAction(interview)}
                              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${actionBtn.className}`}
                            >
                              {actionBtn.icon}
                              {actionBtn.label}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`text-center py-3 text-sm font-medium ${
                    isToday(day) ? 'bg-blue-50 text-blue-700' : 'text-gray-500 bg-gray-50'
                  }`}
                >
                  <div>{dayLabels[idx]}</div>
                  <div className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-h-[400px]">
              {calendarDays.map((day, idx) => {
                const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
                const dayInterviews = calendarInterviews[key] || []
                return (
                  <div
                    key={idx}
                    className={`border-r border-gray-100 p-2 last:border-r-0 ${
                      isToday(day) ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="space-y-1.5">
                      {dayInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          onClick={() => navigate(`/interview/${interview.id}`)}
                          className={`rounded-md border-l-3 px-2 py-1.5 cursor-pointer hover:shadow-sm transition-shadow ${CALENDAR_COLORS[interview.priority]}`}
                          style={{ borderLeftWidth: '3px' }}
                        >
                          <div className="text-xs font-medium text-gray-800 truncate">
                            {getResumeName(interview.resumeId)}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(interview.scheduledAt).split(' ')[1]}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <MapPin className="w-2.5 h-2.5" />
                            {getRoomName(interview.roomId)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            共 {filtered.length} 场面试
          </div>
        </div>
      </div>
    </div>
  )
}
