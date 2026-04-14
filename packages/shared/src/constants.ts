import type { Category } from './types'

export const AVATAR_COLORS = [
  '#FF6B9D', '#5856D6', '#FF9500', '#34C759', '#007AFF',
  '#AF52DE', '#FF3B5C', '#30B0C7', '#FF2D92', '#4CD964',
]

export const CATEGORY_RGB: Record<Category, string> = {
  sve:     '255, 149, 0',
  ljubav:  '255, 69, 58',
  blamovi: '255, 159, 10',
  misli:   '191, 90, 242',
  random:  '50, 215, 75',
  posao:   '10, 132, 255',
  veze:    '255, 55, 95',
}

export const TOPICS: { id: Category; label: string; emoji: string }[] = [
  { id: 'sve',     label: 'Sve',     emoji: '✨' },
  { id: 'ljubav',  label: 'Ljubav',  emoji: '❤️' },
  { id: 'blamovi', label: 'Blamovi', emoji: '😳' },
  { id: 'misli',   label: 'Misli',   emoji: '💭' },
  { id: 'random',  label: 'Random',  emoji: '🎲' },
  { id: 'posao',   label: 'Posao',   emoji: '💼' },
  { id: 'veze',    label: 'Veze',    emoji: '💔' },
]

export const EMOJIS = ['❤️', '😢', '😮', '😂', '🔥']
