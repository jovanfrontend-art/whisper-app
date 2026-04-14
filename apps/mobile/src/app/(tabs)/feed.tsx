import { useState } from 'react'
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native'
import { useStore } from '@whisper/supabase'
import { TOPICS } from '@whisper/shared'
import type { Category } from '@whisper/shared'
import PostCard from '@/components/feed/PostCard'
import DailyHighlightCard from '@/components/feed/DailyHighlightCard'
import ComposeSheet from '@/components/feed/ComposeSheet'
import AuthSheet from '@/components/auth/AuthSheet'
import Toast from '@/components/ui/Toast'

export default function FeedScreen() {
  const { getPostsByCategory, activeCategory, setActiveCategory } = useStore()
  const [composeOpen, setComposeOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const posts = getPostsByCategory(activeCategory)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E0F" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>WhisperX</Text>
        <TouchableOpacity style={styles.composeBtn} onPress={() => setComposeOpen(true)}>
          <Text style={styles.composeBtnText}>+ Priča</Text>
        </TouchableOpacity>
      </View>

      {/* Topic tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TOPICS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeCategory === item.id && styles.tabActive]}
              onPress={() => setActiveCategory(item.id as Category)}
            >
              <Text style={[styles.tabText, activeCategory === item.id && styles.tabTextActive]}>
                {item.emoji} {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        />
      </View>

      {/* Posts list */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={<DailyHighlightCard category={activeCategory} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌐</Text>
            <Text style={styles.emptyTitle}>Nema priča ovde</Text>
            <Text style={styles.emptyText}>Budi prvi koji će podeliti priču!</Text>
          </View>
        }
      />

      <ComposeSheet open={composeOpen} onClose={() => setComposeOpen(false)} />
      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
      <Toast />
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
  logo: { fontSize: 20, fontWeight: '700', color: '#FF9500' },
  composeBtn: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  composeBtnText: { color: '#000', fontWeight: '600', fontSize: 14 },
  tabsContainer: { paddingVertical: 10 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
  },
  tabActive: { backgroundColor: '#FF9500' },
  tabText: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#000' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#EBEBF5', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
})
