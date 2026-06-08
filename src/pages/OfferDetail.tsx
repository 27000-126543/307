import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Clock, Shield, FileText, Mail, ClipboardList } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: '待审批', className: 'bg-amber-100 text-amber-700' },
  hr_approved: { label: 'HR已批', className: 'bg-blue-100 text-blue-700' },
  gm_approved: { label: '总经理已批', className: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-700' },
  sent: { label: '已发送', className: 'bg-green-100 text-green-700' },
  accepted: { label: '已接受', className: 'bg-emerald-100 text-emerald-700' },
  declined: { label: '已拒绝', className: 'bg-red-100 text-red-700' },
}

const BC_STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: '待背调', className: 'bg-gray-100 text-gray-600' },
  in_progress: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
  failed: { label: '未通过', className: 'bg-red-100 text-red-700' },
}

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { offers, resumes, jobs, approvalRecords, backgroundChecks, onboardingTasks, acceptOffer, declineOffer, approveOfferHR, rejectOfferHR, approveOfferGM, rejectOfferGM } = useRecruitStore()
  const [showDeclineInput, setShowDeclineInput] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const offer = offers.find((o) => o.id === id)

  if (!offer) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
        <div className="text-center text-gray-400 py-20">未找到该Offer</div>
      </div>
    )
  }

  const resume = resumes.find((r) => r.id === offer.resumeId)
  const job = jobs.find((j) => j.id === offer.jobId)
  const offerRecords = approvalRecords.filter((r) => r.targetId === offer.id && r.targetType === 'offer')
  const hrRecord = offerRecords.find((r) => r.approverId === 'hr_mgr')
  const gmRecord = offerRecords.find((r) => r.approverId === 'gm')
  const backgroundCheck = backgroundChecks.find((b) => b.offerId === offer.id)
  const relatedTasks = onboardingTasks.filter((t) => t.offerId === offer.id)

  const steps = [
    {
      title: 'HR经理审批',
      approver: 'HR经理-孙丽华',
      status: offer.hrManagerApproval,
      record: hrRecord,
    },
    {
      title: '总经理审批',
      approver: '总经理-周志远',
      status: offer.gmApproval,
      record: gmRecord,
    },
    {
      title: '发送录用通知',
      approver: '',
      status: offer.status === 'sent' || offer.status === 'accepted' ? 'approved' : offer.status === 'declined' ? 'rejected' : 'pending',
      record: null,
    },
  ]

  const getStepIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  const getStepStatusLabel = (status: string) => {
    if (status === 'approved') return '已通过'
    if (status === 'rejected') return '已驳回'
    return '待审批'
  }

  const statusInfo = STATUS_MAP[offer.status] || STATUS_MAP.pending

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Offer详情</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">候选人</p>
                <p className="text-sm font-medium text-gray-900">{resume?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">岗位</p>
                <p className="text-sm font-medium text-gray-900">{job?.title || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Offer薪资</p>
                <p className="text-sm font-medium text-gray-900">¥{offer.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">入职日期</p>
                <p className="text-sm font-medium text-gray-900">{offer.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">创建时间</p>
                <p className="text-sm font-medium text-gray-900">{new Date(offer.createdAt).toLocaleString('zh-CN')}</p>
              </div>
              {offer.rejectionReason && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">驳回原因</p>
                  <p className="text-sm font-medium text-red-600">{offer.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-6">审批流程</h3>
            <div className="space-y-0">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200">
                      {getStepIcon(step.status)}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-12 ${step.status === 'approved' ? 'bg-green-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    {step.approver && (
                      <p className="text-xs text-gray-500 mt-0.5">{step.approver}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs font-medium ${
                        step.status === 'approved' ? 'text-green-600' :
                        step.status === 'rejected' ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {getStepStatusLabel(step.status)}
                      </span>
                      {step.record && (
                        <span className="text-xs text-gray-400">
                          {new Date(step.record.createdAt).toLocaleString('zh-CN')}
                        </span>
                      )}
                    </div>
                    {step.record?.reason && (
                      <p className="text-xs text-red-500 mt-1">原因: {step.record.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {(offer.status === 'pending' || offer.status === 'hr_approved') && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {offer.status === 'pending' ? 'HR经理审批操作' : '总经理审批操作'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (offer.status === 'pending') approveOfferHR(offer.id)
                      else approveOfferGM(offer.id)
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    通过
                  </button>
                  <button
                    onClick={() => { setShowRejectInput(true); setRejectReason('') }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回
                  </button>
                </div>
                {showRejectInput && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="请输入驳回原因..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (rejectReason.trim()) {
                            if (offer.status === 'pending') rejectOfferHR(offer.id, rejectReason.trim())
                            else rejectOfferGM(offer.id, rejectReason.trim())
                            setShowRejectInput(false)
                            setRejectReason('')
                          }
                        }}
                        disabled={!rejectReason.trim()}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        确认驳回
                      </button>
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectReason('') }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {resume && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">候选人信息</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">姓名</p>
                  <p className="text-sm text-gray-900">{resume.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">学历</p>
                  <p className="text-sm text-gray-900">{resume.education}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">工作年限</p>
                  <p className="text-sm text-gray-900">{resume.experienceYears}年</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">期望薪资</p>
                  <p className="text-sm text-gray-900">¥{resume.expectedSalary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">技能标签</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resume.skillTags.map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {backgroundCheck && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">背景调查</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">调查公司</p>
                  <p className="text-sm text-gray-900">{backgroundCheck.company}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">状态</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${BC_STATUS_MAP[backgroundCheck.status]?.className || 'bg-gray-100 text-gray-600'}`}>
                    {BC_STATUS_MAP[backgroundCheck.status]?.label || backgroundCheck.status}
                  </span>
                </div>
                {backgroundCheck.result && (
                  <div>
                    <p className="text-xs text-gray-500">结果</p>
                    <p className="text-sm text-gray-900">{backgroundCheck.result}</p>
                  </div>
                )}
                {backgroundCheck.completedAt && (
                  <div>
                    <p className="text-xs text-gray-500">完成时间</p>
                    <p className="text-sm text-gray-900">{new Date(backgroundCheck.completedAt).toLocaleString('zh-CN')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(offer.status === 'sent' || offer.status === 'accepted') && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-green-600" />
                <h3 className="text-base font-bold text-gray-900">录用通知</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">发送状态</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                    {offer.status === 'accepted' ? '候选人已接受' : '已发送，等待候选人反馈'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Offer薪资</p>
                  <p className="text-sm text-gray-900">¥{offer.salary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">入职日期</p>
                  <p className="text-sm text-gray-900">{offer.startDate}</p>
                </div>
              </div>
              {offer.status === 'sent' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">候选人反馈</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptOffer(offer.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      接受Offer
                    </button>
                    <button
                      onClick={() => setShowDeclineInput(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      拒绝Offer
                    </button>
                  </div>
                  {showDeclineInput && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="请输入拒绝原因..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (declineReason.trim()) {
                              declineOffer(offer.id, declineReason.trim())
                              setShowDeclineInput(false)
                              setDeclineReason('')
                            }
                          }}
                          disabled={!declineReason.trim()}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          确认拒绝
                        </button>
                        <button
                          onClick={() => { setShowDeclineInput(false); setDeclineReason('') }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {offer.status === 'declined' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-4 h-4 text-red-600" />
                <h3 className="text-base font-bold text-gray-900">候选人已拒绝</h3>
              </div>
              <div className="space-y-3">
                {offer.rejectionReason && (
                  <div>
                    <p className="text-xs text-gray-500">拒绝原因</p>
                    <p className="text-sm text-red-600">{offer.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {relatedTasks.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">入职任务</h3>
              </div>
              <div className="space-y-3">
                {relatedTasks.map((task) => {
                  const typeLabel = task.type === 'workstation' ? '工位分配' : task.type === 'it_equipment' ? 'IT设备领用' : '入职培训'
                  const statusLabel = task.status === 'completed' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待办'
                  const statusCls = task.status === 'completed' ? 'bg-green-100 text-green-700' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  return (
                    <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{typeLabel}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{task.assignee} · {task.details}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>{statusLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
