import type { Metadata } from 'next'
import { ResultClient } from '@/components/result/ResultClient'

export const metadata: Metadata = {
  title: '간 상태 리포트 — 당신의 간은 안녕하십니까?',
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const d = params.d
  const date = typeof d === 'string' ? d : ''

  return <ResultClient date={date} />
}
