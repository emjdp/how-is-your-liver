import type { Metadata } from 'next'
import { WeeklyClient } from '@/components/result/WeeklyClient'

export const metadata: Metadata = {
  title: '최근 7일 리포트 — 당신의 간은 안녕하십니까?',
}

export default function WeeklyPage() {
  return <WeeklyClient />
}
