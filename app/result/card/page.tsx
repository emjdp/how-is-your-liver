import type { Metadata } from 'next'
import { StoryCardClient } from '@/components/story-card/StoryCardClient'

export const metadata: Metadata = {
  title: '스토리 카드 — 당신의 간은 안녕하십니까?',
}

export default async function CardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const d = params.d
  const date = typeof d === 'string' ? d : ''

  return <StoryCardClient date={date} />
}
