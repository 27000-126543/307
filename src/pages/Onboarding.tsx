import { Building, Laptop, GraduationCap, Plus, CheckCircle, Clock, ListTodo } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import type { OnboardingTaskStatus, OnboardingTaskType } from '@/types'

const TYPE_ICON_MAP: Record<OnboardingTaskType, typeof Building> = {
  workstation: Building,
  it_equipment: Laptop,
  training: GraduationCap,
}

const TYPE_LABEL_MAP: Record<OnboardingTaskType, string> = {
  workstation: '工位准备',
  it_equipment: 'IT设备',
  training: '入职培训',
}

const COLUMNS: { status: OnboardingTaskStatus; title: string; icon: typeof Clock; headerBg: string }[] = [
  { status: 'pending', title: '待办', icon: ListTodo, headerBg: 'bg-amber-50 border-amber-200' },
  { status: 'in_progress', title: '进行中', icon: Clock, headerBg: 'bg-blue-50 border-blue-200' },
  { status: 'completed', title: '已完成', icon: CheckCircle, headerBg: 'bg-green-50 border-green-200' },
]

const NEXT_STATUS: Record<OnboardingTaskStatus, OnboardingTaskStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'completed',
}

export default function Onboarding() {
  const { onboardingTasks, offers, resumes, addOnboardingTask, updateOnboardingTask } = useRecruitStore()

  const pendingCount = onboardingTasks.filter((t) => t.status === 'pending').length
  const inProgressCount = onboardingTasks.filter((t) => t.status === 'in_progress').length
  const completedCount = onboardingTasks.filter((t) => t.status === 'completed').length

  const sentOffers = offers.filter((o) => o.status === 'sent')
  const offersWithTasks = new Set(onboardingTasks.map((t) => t.offerId))
  const eligibleOffers = sentOffers.filter((o) => !offersWithTasks.has(o.id))

  const handleGenerateTasks = (offerId: string) => {
    const offer = offers.find((o) => o.id === offerId)
    if (!offer) return
    const candidateName = resumes.find((r) => r.id === offer.resumeId)?.name || '未知候选人'

    const types: OnboardingTaskType[] = ['workstation', 'it_equipment', 'training']
    types.forEach((type, index) => {
      addOnboardingTask({
        id: `task_${Date.now()}_${index}`,
        offerId,
        candidateName,
        type,
        status: 'pending',
        assignee: type === 'workstation' ? '行政部' : type === 'it_equipment' ? 'IT部' : 'HR部',
        details: `为${candidateName}准备${TYPE_LABEL_MAP[type]}`,
      })
    })
  }

  const handleToggleStatus = (taskId: string, currentStatus: OnboardingTaskStatus) => {
    updateOnboardingTask(taskId, { status: NEXT_STATUS[currentStatus] })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">入职管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理新员工入职任务与进度</p>
        </div>
        {eligibleOffers.length > 0 && (
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Plus className="w-4 h-4" />
              生成入职任务
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-10 hidden group-hover:block">
              <div className="p-2">
                {eligibleOffers.map((offer) => {
                  const name = resumes.find((r) => r.id === offer.resumeId)?.name || '未知候选人'
                  return (
                    <button
                      key={offer.id}
                      onClick={() => handleGenerateTasks(offer.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <ListTodo className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500">待办</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">进行中</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">已完成</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const ColumnIcon = col.icon
          const tasks = onboardingTasks.filter((t) => t.status === col.status)

          return (
            <div key={col.status} className="flex flex-col">
              <div className={`rounded-t-xl px-4 py-3 border ${col.headerBg}`}>
                <div className="flex items-center gap-2">
                  <ColumnIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold text-gray-800">{col.title}</span>
                  <span className="text-xs text-gray-500 ml-auto">{tasks.length}</span>
                </div>
              </div>
              <div className="bg-white rounded-b-xl border border-t-0 border-gray-100 p-3 space-y-3 min-h-[200px]">
                {tasks.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
                    暂无任务
                  </div>
                )}
                {tasks.map((task) => {
                  const TypeIcon = TYPE_ICON_MAP[task.type]
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleStatus(task.id, task.status)}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-md ${
                          task.type === 'workstation' ? 'bg-orange-100 text-orange-600' :
                          task.type === 'it_equipment' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{task.candidateName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABEL_MAP[task.type]}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{task.assignee}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.details}</p>
                        </div>
                      </div>
                      {task.status !== 'completed' && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-[10px] text-blue-500">
                            点击推进至{task.status === 'pending' ? '进行中' : '已完成'}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
