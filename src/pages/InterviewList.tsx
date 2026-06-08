import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, List, Filter, Zap, Clock, MapPin, Users, Play, Check, AlertCircle, Eye, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
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

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function getMonday(d: Date): Date {
  const date = new Date(d)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  date.setHours(0, 0, 0, 0)
  return date
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function InterviewList() {
  const navigate = useNavigate()
  const { interviews, resumes, jobs, interviewers, meetingRooms, addInterview, updateInterview } = useRecruitStore()

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week')
  const [calendarBaseDate, setCalendarBaseDate] = useState(() => new Date())
  const [priorityFilter, setPriorityFilter] = useState<InterviewPriority | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>('all')
  const [scheduling, setScheduling] = useState(false)
  const [scheduleResult, setScheduleResult] = useState<{ scheduled: number; failures: Array<{ resumeName: string; reason: string }> } | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({ resumeId: '', interviewerId: '', roomId: '', scheduledAt: '', duration: 60, priority: 'normal' as InterviewPriority })
  const [newFormError, setNewFormError] = useState('')
  const [editInterviewId, setEditInterviewId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ interviewerId: '', roomId: '', scheduledAt: '', duration: 60 })
  const [editFormError, setEditFormError] = useState('')

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
    const days: Date[] = []
    if (calendarView === 'week') {
      const monday = getMonday(calendarBaseDate)
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        days.push(d)
      }
    } else {
      const year = calendarBaseDate.getFullYear()
      const month = calendarBaseDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startMonday = getMonday(firstDay)
      const endSunday = new Date(startMonday)
      endSunday.setDate(startMonday.getDate() + 41)
      const d = new Date(startMonday)
      while (d <= endSunday) {
        days.push(new Date(d))
        d.setDate(d.getDate() + 1)
      }
    }
    return days
  }, [calendarBaseDate, calendarView])

  const calendarInterviews = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const day of calendarDays) {
      const key = dateKey(day)
      map[key] = filtered.filter((i) => {
        const d = new Date(i.scheduledAt)
        return isSameDay(d, day)
      })
    }
    return map
  }, [filtered, calendarDays])

  const calendarLabel = useMemo(() => {
    if (calendarView === 'week') {
      const monday = getMonday(calendarBaseDate)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return `${monday.getFullYear()}年${monday.getMonth() + 1}月${monday.getDate()}日 - ${sunday.getMonth() + 1}月${sunday.getDate()}日`
    }
    return `${calendarBaseDate.getFullYear()}年${calendarBaseDate.getMonth() + 1}月`
  }, [calendarBaseDate, calendarView])

  const navigateCalendar = (direction: number) => {
    const d = new Date(calendarBaseDate)
    if (calendarView === 'week') {
      d.setDate(d.getDate() + direction * 7)
    } else {
      d.setMonth(d.getMonth() + direction)
    }
    setCalendarBaseDate(d)
  }

  const jumpToDate = (targetDate: Date) => {
    setCalendarBaseDate(targetDate)
  }

  const isToday = (d: Date) => isSameDay(d, new Date())

  const isCurrentMonth = (d: Date) => d.getMonth() === calendarBaseDate.getMonth()

  const openEditForm = (interview: typeof interviews[0]) => {
    const dt = new Date(interview.scheduledAt)
    const localStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
    setEditForm({ interviewerId: interview.interviewerId, roomId: interview.roomId, scheduledAt: localStr, duration: interview.duration })
    setEditInterviewId(interview.id)
    setEditFormError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">面试管理</h1>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowNewForm(true); setNewForm({ resumeId: '', interviewerId: '', roomId: '', scheduledAt: '', duration: 60, priority: 'normal' }); setNewFormError('') }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建面试
            </button>
            <button
              onClick={handleAutoSchedule}
              disabled={scheduling}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {scheduling ? '排期中...' : '自动排期'}
            </button>
          </div>
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

        {showNewForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewForm(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">新建面试</h2>
                <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">候选人</label>
                  <select
                    value={newForm.resumeId}
                    onChange={(e) => setNewForm({ ...newForm, resumeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">请选择候选人</option>
                    {resumes.filter((r) => r.status === 'confirmed' || r.status === 'interviewing' || r.status === 'screened' || r.status === 'recommended').map((r) => (
                      <option key={r.id} value={r.id}>{r.name}{r.matchedJobId ? ` · ${jobs.find((j) => j.id === r.matchedJobId)?.title || ''}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">面试官</label>
                  <select
                    value={newForm.interviewerId}
                    onChange={(e) => setNewForm({ ...newForm, interviewerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">请选择面试官</option>
                    {interviewers.map((iv) => (
                      <option key={iv.id} value={iv.id}>{iv.name} · {iv.department} {iv.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">会议室</label>
                  <select
                    value={newForm.roomId}
                    onChange={(e) => setNewForm({ ...newForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">请选择会议室</option>
                    {meetingRooms.map((mr) => (
                      <option key={mr.id} value={mr.id}>{mr.name} · {mr.location}（{mr.capacity}人）</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">面试时间</label>
                    <input
                      type="datetime-local"
                      value={newForm.scheduledAt}
                      onChange={(e) => setNewForm({ ...newForm, scheduledAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">时长（分钟）</label>
                    <select
                      value={newForm.duration}
                      onChange={(e) => setNewForm({ ...newForm, duration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value={30}>30分钟</option>
                      <option value={60}>60分钟</option>
                      <option value={90}>90分钟</option>
                      <option value={120}>120分钟</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                  <div className="flex gap-2">
                    {(['urgent', 'high', 'normal', 'low'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewForm({ ...newForm, priority: p })}
                        className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                          newForm.priority === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {PRIORITY_BADGE[p].label}
                      </button>
                    ))}
                  </div>
                </div>
                {newFormError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm text-red-700">{newFormError}</span>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (!newForm.resumeId || !newForm.interviewerId || !newForm.roomId || !newForm.scheduledAt) {
                        setNewFormError('请填写完整面试信息')
                        return
                      }
                      const selectedResume = resumes.find((r) => r.id === newForm.resumeId)
                      if (!selectedResume?.matchedJobId) {
                        setNewFormError('该候选人尚未匹配岗位，无法安排面试')
                        return
                      }
                      const scheduledAt = newForm.scheduledAt
                      const conflicts = checkConflicts(
                        { interviewerId: newForm.interviewerId, roomId: newForm.roomId, scheduledAt, duration: newForm.duration },
                        interviews
                      )
                      const conflictMsgs: string[] = []
                      if (conflicts.interviewerConflict) conflictMsgs.push('面试官时间冲突')
                      if (conflicts.roomConflict) conflictMsgs.push('会议室时间冲突')
                      if (conflictMsgs.length > 0) {
                        setNewFormError(`无法保存：${conflictMsgs.join('、')}，请调整面试官、会议室或时间`)
                        return
                      }
                      const newInterview = {
                        id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        resumeId: newForm.resumeId,
                        jobId: selectedResume.matchedJobId,
                        interviewerId: newForm.interviewerId,
                        roomId: newForm.roomId,
                        scheduledAt,
                        duration: newForm.duration,
                        status: 'scheduled' as const,
                        priority: newForm.priority,
                      }
                      addInterview(newInterview)
                      setShowNewForm(false)
                      setNewForm({ resumeId: '', interviewerId: '', roomId: '', scheduledAt: '', duration: 60, priority: 'normal' })
                      setNewFormError('')
                      const newDate = new Date(scheduledAt)
                      jumpToDate(newDate)
                      if (viewMode !== 'calendar') setViewMode('calendar')
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editInterviewId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditInterviewId(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">改期 / 调整</h2>
                <button onClick={() => setEditInterviewId(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">面试官</label>
                  <select
                    value={editForm.interviewerId}
                    onChange={(e) => setEditForm({ ...editForm, interviewerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {interviewers.map((iv) => (
                      <option key={iv.id} value={iv.id}>{iv.name} · {iv.department} {iv.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">会议室</label>
                  <select
                    value={editForm.roomId}
                    onChange={(e) => setEditForm({ ...editForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {meetingRooms.map((mr) => (
                      <option key={mr.id} value={mr.id}>{mr.name} · {mr.location}（{mr.capacity}人）</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">面试时间</label>
                    <input
                      type="datetime-local"
                      value={editForm.scheduledAt}
                      onChange={(e) => setEditForm({ ...editForm, scheduledAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">时长（分钟）</label>
                    <select
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value={30}>30分钟</option>
                      <option value={60}>60分钟</option>
                      <option value={90}>90分钟</option>
                      <option value={120}>120分钟</option>
                    </select>
                  </div>
                </div>
                {editFormError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm text-red-700">{editFormError}</span>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditInterviewId(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (!editForm.interviewerId || !editForm.roomId || !editForm.scheduledAt) {
                        setEditFormError('请填写完整信息')
                        return
                      }
                      const conflicts = checkConflicts(
                        { id: editInterviewId!, interviewerId: editForm.interviewerId, roomId: editForm.roomId, scheduledAt: editForm.scheduledAt, duration: editForm.duration },
                        interviews
                      )
                      const conflictMsgs: string[] = []
                      if (conflicts.interviewerConflict) conflictMsgs.push('面试官时间冲突')
                      if (conflicts.roomConflict) conflictMsgs.push('会议室时间冲突')
                      if (conflictMsgs.length > 0) {
                        setEditFormError(`无法保存：${conflictMsgs.join('、')}，请调整面试官、会议室或时间`)
                        return
                      }
                      updateInterview(editInterviewId!, {
                        interviewerId: editForm.interviewerId,
                        roomId: editForm.roomId,
                        scheduledAt: editForm.scheduledAt,
                        duration: editForm.duration,
                      })
                      setEditInterviewId(null)
                      jumpToDate(new Date(editForm.scheduledAt))
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
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
                          <div className="flex items-center gap-1">
                            {actionBtn && (
                              <button
                                onClick={() => handleAction(interview)}
                                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${actionBtn.className}`}
                              >
                                {actionBtn.icon}
                                {actionBtn.label}
                              </button>
                            )}
                            {interview.status !== 'completed' && interview.status !== 'cancelled' && (
                              <button
                                onClick={() => openEditForm(interview)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title="改期/调整"
                              >
                                改期
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateCalendar(-1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-800 min-w-[200px] text-center">{calendarLabel}</span>
                <button
                  onClick={() => navigateCalendar(1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCalendarBaseDate(new Date())}
                  className="ml-2 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  今天
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    calendarView === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  周
                </button>
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    calendarView === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  月
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {calendarView === 'week' ? (
                <>
                  <div className="grid grid-cols-7 border-b border-gray-100">
                    {DAY_LABELS.map((label, idx) => {
                      const day = calendarDays[idx]
                      return (
                        <div
                          key={idx}
                          className={`text-center py-3 text-sm font-medium ${isToday(day) ? 'bg-blue-50 text-blue-700' : 'text-gray-500 bg-gray-50'}`}
                        >
                          <div>{label}</div>
                          <div className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>{day.getDate()}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid grid-cols-7 min-h-[400px]">
                    {calendarDays.map((day, idx) => {
                      const key = dateKey(day)
                      const dayInterviews = calendarInterviews[key] || []
                      return (
                        <div
                          key={idx}
                          className={`border-r border-gray-100 p-2 last:border-r-0 ${isToday(day) ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="space-y-1.5">
                            {dayInterviews.map((interview) => (
                              <div
                                key={interview.id}
                                onClick={() => openEditForm(interview)}
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
                </>
              ) : (
                <>
                  <div className="grid grid-cols-7 border-b border-gray-100">
                    {DAY_LABELS.map((label) => (
                      <div key={label} className="text-center py-2 text-xs font-medium text-gray-500 bg-gray-50">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const key = dateKey(day)
                      const dayInterviews = calendarInterviews[key] || []
                      const inMonth = isCurrentMonth(day)
                      return (
                        <div
                          key={idx}
                          className={`border-r border-b border-gray-50 p-1 min-h-[80px] ${!inMonth ? 'bg-gray-50/50' : ''} ${isToday(day) ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`text-xs mb-1 ${isToday(day) ? 'text-blue-600 font-bold' : inMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {dayInterviews.slice(0, 3).map((interview) => (
                              <div
                                key={interview.id}
                                onClick={() => openEditForm(interview)}
                                className={`rounded px-1 py-0.5 text-[10px] cursor-pointer hover:shadow-sm transition-shadow truncate ${CALENDAR_COLORS[interview.priority]}`}
                              >
                                {getResumeName(interview.resumeId)} {formatTime(interview.scheduledAt).split(' ')[1]}
                              </div>
                            ))}
                            {dayInterviews.length > 3 && (
                              <div className="text-[10px] text-gray-400 pl-1">+{dayInterviews.length - 3}场</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
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
