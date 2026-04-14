import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useStore } from '@whisper/supabase'
import type { Category, DailyHighlight } from '@whisper/shared'
import { CATEGORY_RGB, formatCount } from '@whisper/shared'
import ReactionBar from '@/components/ui/ReactionBar'

interface Props {
  category: Category
}

export default function DailyHighlightCard({ category }: Props) {
  const { getDailyHighlight, toggleReaction } = useStore()
  const [highlight, setHighlight] = useState<DailyHighlight | null>(null)

  useEffect(() => {
    getDailyHighlight(category).then(setHighlight)
  }, [category])

  if (!highlight) return null

  const rgb = CATEGORY_RGB[category] ?? CATEGORY_RGB.sve

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: `rgba(${rgb}, 0.4)`, backgroundColor: `rgba(${rgb}, 0.08)` }]}
      onPress={() => router.push(`/thread/${highlight.postId}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.badge, { backgroundColor: `rgba(${rgb}, 0.2)` }]}>
        <Text style={[styles.badgeText, { color: `rgb(${rgb})` }]}>✨ Tema dana</Text>
      </View>
      <Text style={styles.title}>{highlight.title}</Text>
      {highlight.subtitle ? <Text style={styles.subtitle}>{highlight.subtitle}</Text> : null}
      <View style={styles.footer}>
        <ReactionBar
          reactions={highlight.reactions}
          userReactions={highlight.userReactions}
          onToggle={(emoji) => toggleReaction(highlight.postId, emoji)}
          small
        />
        <Text style={styles.comments}>💬 {formatCount(highlight.commentCount)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  title: { color: '#EBEBF5', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#8E8E93', fontSize: 14, marginBottom: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  comments: { color: '#8E8E93', fontSize: 13 },
})
