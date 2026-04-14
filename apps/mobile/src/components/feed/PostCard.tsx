import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useStore } from '@whisper/supabase'
import type { Post } from '@whisper/shared'
import { formatCount } from '@whisper/shared'
import Avatar from '@/components/ui/Avatar'
import ReactionBar from '@/components/ui/ReactionBar'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const { toggleReaction } = useStore()

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/thread/${post.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Avatar username={post.avatar.initials} color={post.avatar.color} size={32} />
        <View style={styles.headerText}>
          <Text style={styles.author}>{post.authorUsername ?? post.avatar.initials}</Text>
          <Text style={styles.time}>{post.time}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: `rgba(${getCategoryRgb(post.category)}, 0.18)` }]}>
          <Text style={[styles.categoryText, { color: `rgb(${getCategoryRgb(post.category)})` }]}>
            {post.category}
          </Text>
        </View>
      </View>

      {post.title && <Text style={styles.title}>{post.title}</Text>}
      <Text style={styles.text} numberOfLines={4}>{post.text}</Text>

      <View style={styles.footer}>
        <ReactionBar
          reactions={post.reactions}
          userReactions={post.userReactions}
          onToggle={(emoji) => toggleReaction(post.id, emoji)}
          small
        />
        <View style={styles.commentChip}>
          <Text style={styles.commentIcon}>💬</Text>
          <Text style={styles.commentCount}>{formatCount(post.commentCount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function getCategoryRgb(cat: string): string {
  const map: Record<string, string> = {
    sve:     '255, 149, 0',
    ljubav:  '255, 69, 58',
    blamovi: '255, 159, 10',
    misli:   '191, 90, 242',
    random:  '50, 215, 75',
    posao:   '10, 132, 255',
    veze:    '255, 55, 95',
  }
  return map[cat] ?? '255, 149, 0'
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerText: { flex: 1, marginLeft: 10 },
  author: { color: '#EBEBF5', fontWeight: '600', fontSize: 13 },
  time: { color: '#8E8E93', fontSize: 12, marginTop: 1 },
  categoryBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  categoryText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  title: { color: '#EBEBF5', fontWeight: '700', fontSize: 16, marginBottom: 6 },
  text: { color: '#EBEBF5', fontSize: 15, lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  commentChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentIcon: { fontSize: 14 },
  commentCount: { color: '#8E8E93', fontSize: 13 },
})
