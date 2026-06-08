import type { Resume, Job, ScreeningResult } from '@/types'

const EDUCATION_LEVELS: Record<string, number> = {
  '高中': 1,
  '大专': 2,
  '本科': 3,
  '硕士': 4,
  '博士': 5,
}

export function calculateScreeningScore(resume: Resume, job: Job): ScreeningResult {
  const eduLevel = EDUCATION_LEVELS[resume.education] || 0
  const reqLevel = EDUCATION_LEVELS[job.educationReq] || 0

  const educationScore = eduLevel >= reqLevel ? 100 : Math.max(0, Math.round((eduLevel / reqLevel) * 100))

  const experienceScore = resume.experienceYears >= job.minExperience
    ? 100
    : Math.max(0, Math.round((resume.experienceYears / job.minExperience) * 100))

  const matchedSkills = resume.skillTags.filter((sk) => job.requiredSkills.includes(sk))
  const missingSkills = job.requiredSkills.filter((sk) => !resume.skillTags.includes(sk))
  const skillScore = job.requiredSkills.length > 0
    ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100)
    : 50

  let salaryScore = 100
  if (resume.expectedSalary > job.salaryMax) {
    salaryScore = Math.max(0, Math.round(100 - ((resume.expectedSalary - job.salaryMax) / job.salaryMax) * 100))
  } else if (resume.expectedSalary < job.salaryMin) {
    salaryScore = 80
  }

  const totalScore = Math.round(
    educationScore * 0.25 +
    experienceScore * 0.25 +
    skillScore * 0.3 +
    salaryScore * 0.2
  )

  return {
    resumeId: resume.id,
    jobId: job.id,
    totalScore,
    educationScore,
    experienceScore,
    skillScore,
    salaryScore,
    matchedSkills,
    missingSkills,
  }
}

export function findBestJobMatch(resume: Resume, jobs: Job[]): ScreeningResult | null {
  let bestResult: ScreeningResult | null = null
  for (const job of jobs) {
    if (job.status !== 'open') continue
    const result = calculateScreeningScore(resume, job)
    if (!bestResult || result.totalScore > bestResult.totalScore) {
      bestResult = result
    }
  }
  return bestResult
}

export function screenAllResumes(resumes: Resume[], jobs: Job[]): Map<string, ScreeningResult> {
  const results = new Map<string, ScreeningResult>()
  for (const resume of resumes) {
    if (resume.status !== 'pending' && resume.screeningScore > 0) continue
    const best = findBestJobMatch(resume, jobs)
    if (best) {
      results.set(resume.id, best)
    }
  }
  return results
}
