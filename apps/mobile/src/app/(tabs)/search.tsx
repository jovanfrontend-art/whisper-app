import { useState } from 'react'
import {
  View, Text, TextInput, FlatList, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native'
import { useStore } from '@whisper/supabase'
import type { Post } from '@whisper/shared'
import PostCard from '@/components/feed/PostCard'

export default function SearchScreen() {
  const { posts } = useStore()
  const [query, setQuery] = useState('')

  const results: Post[] = query.trim().length < 2
    ? []
    : posts.filter(p =>
        !p.isAdmin &&
        (p.text.toLowerCase().includes(query.toLowerCase()) ||
         p.category.toLowerCase().includes(query.toLowerCase()))
      )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E0F" />

      <View style={styles.header}>
        <Text style={styles.title}>Pretraga</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Pretraži priče..."
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {query.trim().length >= 2 ? (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nema rezultata za "{query}"</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Pretraži priče</Text>
          <Text style={styles.emptyText}>Unesi najmanje 2 karaktera</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0F' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#EBEBF5' },
  searchBar: { padding: 16 },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#EBEBF5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#EBEBF5', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
})
