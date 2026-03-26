'use client'
import { useRef, useState } from 'react'
import EmojiPicker from './EmojiPicker'
import { formatCount } from '@/lib/store'

interface Props {
  reactions: Record<string, number>
  userReactions: string[]
  onToggle: (emoji: string) => void
  size?: 'sm' | 'md'
}

export default function ReactionBar({ reactions, userReactions, onToggle, size = 'md' }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  const pills = Object.entries(reactions).filter(([, c]) => c > 0)

  return (
    <div className={`reactions-bar${size === 'sm' ? ' sm' : ''}`}>
      {pills.map(([emoji, count]) => (
        <button
          key={emoji}
          className={`reaction-pill${size === 'sm' ? ' sm' : ''}${userReactions.includes(emoji) ? ' reacted' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggle(emoji) }}
        >
          {emoji} <span>{formatCount(count)}</span>
        </button>
      ))}
      <button
        ref={addBtnRef}
        className={`add-reaction-btn${size === 'sm' ? ' sm' : ''}`}
        onClick={(e) => { e.stopPropagation(); setPickerOpen(v => !v) }}
        title="Dodaj reakciju"
      >
        <svg viewBox="0 0 24 24">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      </button>
      <EmojiPicker
        open={pickerOpen}
        anchorRef={addBtnRef}
        onPick={onToggle}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  )
}
