import type { Interview, Interviewer, MeetingRoom } from '@/types'
import { addHours, format, parseISO } from 'date-fns'

interface ScheduleSlot {
  interviewerId: string
  roomId: string
  startTime: string
  endTime: string
}

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
}

export function autoScheduleInterviews(
  pendingResumes: Array<{ resumeId: string; jobId: string; priority: string }>,
  interviewers: Interviewer[],
  meetingRooms: MeetingRoom[],
  existingInterviews: Interview[]
): Array<Interview & { isNew: true }> {
  const sorted = [...pendingResumes].sort(
    (a, b) => (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0)
  )

  const scheduledSlots: ScheduleSlot[] = existingInterviews.map((i) => ({
    interviewerId: i.interviewerId,
    roomId: i.roomId,
    startTime: i.scheduledAt,
    endTime: format(addHours(parseISO(i.scheduledAt), i.duration / 60), "yyyy-MM-dd'T'HH:mm"),
  }))

  const results: Array<Interview & { isNew: true }> = []

  for (const pending of sorted) {
    const deptInterviewers = interviewers
    const slot = findAvailableSlot(deptInterviewers, meetingRooms, scheduledSlots)
    if (slot) {
      const newInterview: Interview & { isNew: true } = {
        id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        resumeId: pending.resumeId,
        jobId: pending.jobId,
        interviewerId: slot.interviewerId,
        roomId: slot.roomId,
        scheduledAt: slot.startTime,
        duration: 60,
        status: 'scheduled',
        priority: pending.priority as Interview['priority'],
        isNew: true,
      }
      results.push(newInterview)
      scheduledSlots.push({
        interviewerId: slot.interviewerId,
        roomId: slot.roomId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })
    }
  }

  return results
}

function findAvailableSlot(
  interviewers: Interviewer[],
  rooms: MeetingRoom[],
  scheduledSlots: ScheduleSlot[]
): ScheduleSlot | null {
  for (const interviewer of interviewers) {
    for (const slot of interviewer.availableSlots) {
      const endTime = format(addHours(parseISO(slot), 1), "yyyy-MM-dd'T'HH:mm")
      const interviewerBusy = scheduledSlots.some(
        (s) =>
          s.interviewerId === interviewer.id &&
          s.startTime < endTime &&
          s.endTime > slot
      )
      if (interviewerBusy) continue

      for (const room of rooms) {
        const roomAvailable = room.availableSlots.some((rs) => rs === slot)
        if (!roomAvailable) continue

        const roomBusy = scheduledSlots.some(
          (s) =>
            s.roomId === room.id &&
            s.startTime < endTime &&
            s.endTime > slot
        )
        if (roomBusy) continue

        return {
          interviewerId: interviewer.id,
          roomId: room.id,
          startTime: slot,
          endTime,
        }
      }
    }
  }
  return null
}
