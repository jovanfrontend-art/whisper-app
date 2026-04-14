import { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useStore } from '@whisper/supabase'
import { formatCount } from '@whisper/shared'
import Avatar from '@/components/ui/Avatar'
import ReactionBar from '@/components/ui/ReactionBar'

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { getPostById, addComment, removeComment, toggleReaction, toggleCommentReaction, user } = useStore()
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  const post = id ? getPostById(id) : undefined

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Priča nije pronađena</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Nazad</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  async function handleSend() {
    if (!comment.trim() || sending) return
    setSending(true)
    await addComment(post!.id, comment.trim())
    setComment('')
    setSending(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E0F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
        <View style={{ width: 70 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={post.comments}
          keyExtractor={c => c.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListHeaderComponent={
            <View style={styles.postHeader}>
              {/* Post author */}
              <View style={styles.authorRow}>
                <Avatar username={post.avatar.initials} color={post.avatar.color} size={36} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.authorName}>{post.authorUsername ?? post.avatar.initials}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
              </View>

              {/* Post text */}
              {post.title && <Text style={styles.postTitle}>{post.title}</Text>}
              <Text style={styles.postText}>{post.text}</Text>

              {/* Reactions */}
              <ReactionBar
                reactions={post.reactions}
                userReactions={post.userReactions}
                onToggle={(emoji) => toggleReaction(post.id, emoji)}
              />

              <View style={styles.commentsSectionHeader}>
                <Text style={styles.commentsSectionTitle}>Komentari</Text>
                <Text style={styles.commentsCount}>{formatCount(post.commentCount)}</Text>
              </View>
            </View>
          }
          renderItem={({ item: c }) => (
            <View style={styles.comment}>
              <Avatar username={c.avatar.initials} color={c.avatar.color} size={28} />
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{c.username}</Text>
                  <Text style={styles.commentTime}>{c.time}</Text>
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
                <ReactionBar
                  reactions={c.reactions}
                  userReactions={c.userReactions}
                  onToggle={(emoji) => toggleCommentReaction(post.id, c.id, emoji)}
                  small
                />
              </View>
              {user && c.username === user.username && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeComment(post.id, c.id)}
                >
                  <Text style={styles.deleteBtnText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />

        {/* Comment input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.commentInput}
            placeholder="Napiši komentar..."
            placeholderTextColor="#8E8E93"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!comment.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!comment.trim() || sending}
          >
            <Text style={styles.sendBtnText}>Pošalji</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backBtn: {},
  backBtnText: { color: '#FF9500', fontSize: 15 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#EBEBF5' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: '#8E8E93', fontSize: 16, marginBottom: 16 },
  backLink: { color: '#FF9500', fontSize: 15 },
  postHeader: { padding: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorName: { color: '#EBEBF5', fontWeight: '600', fontSize: 14 },
  postTime: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  postTitle: { color: '#EBEBF5', fontWeight: '700', fontSize: 18, marginBottom: 8 },
  postText: { color: '#EBEBF5', fontSize: 16, lineHeight: 24, marginBottom: 16 },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  commentsSectionTitle: { color: '#EBEBF5', fontWeight: '600', fontSize: 16 },
  commentsCount: {
    backgroundColor: '#2C2C2E',
    color: '#8E8E93',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 13,
  },
  comment: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  commentBody: { flex: 1, marginLeft: 10 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentAuthor: { color: '#EBEBF5', fontWeight: '600', fontSize: 13 },
  commentTime: { color: '#8E8E93', fontSize: 12 },
  commentText: { color: '#EBEBF5', fontSize: 14, lineHeight: 20 },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  deleteBtnText: { color: '#FF453A', fontSize: 20, fontWeight: '300' },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    backgroundColor: '#0E0E0F',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    color: '#EBEBF5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
})
