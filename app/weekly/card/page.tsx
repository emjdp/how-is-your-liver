import type { Metadata } from 'next'
import { WeeklyCardClient } from '@/components/story-card/WeeklyCardClient'

export const metadata: Metadata = {
  title: '주간 스토리 카드 — 당신의 간은 안녕하십니까?',
}

export default function WeeklyCardPage() {
  return <WeeklyCardClient />
}
