import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check, X, Send, FileText, Eye } from 'lucide-react'
import { useRecruitStore } from '@/stores/recruitStore'
import type { Offer, OfferStatus } from '@/types'

const STATUS_MAP: Record<OfferStatus, { label: string; className: string }> = {
  pending: { label: '待审批', className: 'bg-amber-100 text-amber-700' },
  hr_approved: { label: 'HR已批', className: 'bg-blue-100 text-blue-700' },
  gm_approved: { label: '总经理已批', className: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-700' },
  sent: { label: '已发送', className: 'bg-green-100 text-green-700' },
  accepted: { label: '已接受', className: 'bg-emerald-100 text-emerald-700' },
  declined: { label: '已拒绝', className: 'bg-red-100 text-red-700' },
}

const APPROVAL_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: '待审批', className: 'bg-gray-100 text-gray-600' },
  approved: { label: '已通过', className: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-700' },
}

const emptyForm = { resumeId: '', jobId: '', salary: 0, startDate: '' }

export default function OfferList() {
  const navigate = useNavigate()
  const {
    offers, resumes, jobs,
    addOffer, addBackgroundCheck,
    approveOfferHR, rejectOfferHR,
    approveOfferGM, rejectOfferGM,
    sendOffer,
  } = useRecruitStore()

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [rejectTarget, setRejectTarget] = useState<{ id: string; level: 'hr' | 'gm' } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const confirmedResumes = resumes.filter((r) => r.status === 'confirmed')
  const openJobs = jobs.filter((j) => j.status === 'open')

  const handleCreate = () => {
    if (!form.resumeId || !form.jobId || !form.salary || !form.startDate) return
    const offerId = `offer_${Date.now()}`
    const offer: Offer = {
      id: offerId,
      resumeId: form.resumeId,
      jobId: form.jobId,
      salary: form.salary,
      startDate: form.startDate,
      status: 'pending',
      hrManagerApproval: 'pending',
      gmApproval: 'pending',
      createdAt: new Date().toISOString(),
    }
    addOffer(offer)
    addBackgroundCheck({
      id: `bc_${Date.now()}`,
      offerId,
      company: '诚信背调有限公司',
      status: 'pending',
    })
    setShowModal(false)
    setForm(emptyForm)
  }

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return
    if (rejectTarget.level === 'hr') {
      rejectOfferHR(rejectTarget.id, rejectReason)
    } else {
      rejectOfferGM(rejectTarget.id, rejectReason)
    }
    setRejectTarget(null)
    setRejectReason('')
  }

  const getResumeName = (resumeId: string) => resumes.find((r) => r.id === resumeId)?.name || '-'
  const getJobTitle = (jobId: string) => jobs.find((j) => j.id === jobId)?.title || '-'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">录用审批</h1>
          <p className="text-sm text-gray-500 mt-1">管理Offer审批与发送流程</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          生成Offer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">候选人</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">岗位</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Offer薪资</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">入职日期</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">HR审批</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">总经理审批</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const statusInfo = STATUS_MAP[offer.status]
              const hrInfo = APPROVAL_MAP[offer.hrManagerApproval]
              const gmInfo = APPROVAL_MAP[offer.gmApproval]

              return (
                <tr key={offer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{getResumeName(offer.resumeId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{getJobTitle(offer.jobId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">¥{offer.salary.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{offer.startDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${hrInfo.className}`}>
                      {hrInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${gmInfo.className}`}>
                      {gmInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/offer/${offer.id}`)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {offer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveOfferHR(offer.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            HR审批
                          </button>
                          <button
                            onClick={() => setRejectTarget({ id: offer.id, level: 'hr' })}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            驳回
                          </button>
                        </>
                      )}
                      {offer.status === 'hr_approved' && (
                        <>
                          <button
                            onClick={() => approveOfferGM(offer.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            总经理审批
                          </button>
                          <button
                            onClick={() => setRejectTarget({ id: offer.id, level: 'gm' })}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            驳回
                          </button>
                        </>
                      )}
                      {offer.status === 'gm_approved' && (
                        <button
                          onClick={() => sendOffer(offer.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          发送Offer
                        </button>
                      )}
                      {offer.status === 'sent' && (
                        <span className="text-xs text-gray-400">已发送</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {offers.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无Offer记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">生成Offer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">候选人</label>
                <select
                  value={form.resumeId}
                  onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">请选择候选人</option>
                  {confirmedResumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">岗位</label>
                <select
                  value={form.jobId}
                  onChange={(e) => setForm({ ...form, jobId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">请选择岗位</option>
                  {openJobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">薪资</label>
                <input
                  type="number"
                  value={form.salary || ''}
                  onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                  placeholder="请输入Offer薪资"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入职日期</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm) }}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.resumeId || !form.jobId || !form.salary || !form.startDate}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setRejectTarget(null); setRejectReason('') }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {rejectTarget.level === 'hr' ? 'HR驳回' : '总经理驳回'}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">驳回原因</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入驳回原因"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason('') }}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
