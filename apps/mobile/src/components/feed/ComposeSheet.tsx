import { useState } from 'react'
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useStore } from '@whisper/supabase'
import { TOPICS } from '@whisper/shared'
import type { Category } from '@whisper/shared'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ComposeSheet({ open, onClose }: Props) {
  const { addPost, user } = useStore()
  const [text, setText] = useState('')
  const [category, setCategory] = useState<Category>('sve')
  const [image, setImage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    })
    if (!result.canceled && result.assets[0]?.base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`)
    }
  }

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    await addPost(text.trim(), category, image)
    setText('')
    setCategory('sve')
    setImage(null)
    setSending(false)
    onClose()
  }

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelBtn}>Otkaži</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova priča</Text>
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Text style={styles.sendBtnText}>{sending ? '...' : 'Pošalji'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {!user && (
            <View style={styles.anonBanner}>
              <Text style={styles.anonText}>Postuješ anonimno</Text>
            </View>
          )}

          {/* Category selector */}
          <Text style={styles.label}>Kategorija</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {TOPICS.filter(t => t.id !== 'sve').map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.categoryBtn, category === t.id && styles.categoryBtnActive]}
                onPress={() => setCategory(t.id)}
              >
                <Text style={[styles.categoryBtnText, category === t.id && styles.categoryBtnTextActive]}>
                  {t.emoji} {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Text input */}
          <TextInput
            style={styles.textInput}
            placeholder="Podeli svoju priču..."
            placeholderTextColor="#8E8E93"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            autoFocus
          />
          <Text style={styles.charCount}>{text.length}/1000</Text>

          {/* Image picker */}
          <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
            <Text style={styles.imageBtnText}>{image ? '📷 Slika dodana ✓' : '📷 Dodaj sliku'}</Text>
          </TouchableOpacity>
          {image && (
            <TouchableOpacity onPress={() => setImage(null)}>
              <Text style={styles.removeImageBtn}>Ukloni sliku</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  cancelBtn: { color: '#8E8E93', fontSize: 16 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#EBEBF5' },
  sendBtn: { backgroundColor: '#FF9500', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 7 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  body: { padding: 16 },
  anonBanner: {
    backgroundColor: 'rgba(255,149,0,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.3)',
  },
  anonText: { color: '#FF9500', fontSize: 13, textAlign: 'center' },
  label: { color: '#8E8E93', fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  categories: { marginBottom: 20 },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    marginRight: 8,
  },
  categoryBtnActive: { backgroundColor: '#FF9500' },
  categoryBtnText: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },
  categoryBtnTextActive: { color: '#000' },
  textInput: {
    color: '#EBEBF5',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: { color: '#48484A', fontSize: 12, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  imageBtn: {
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  imageBtnText: { color: '#8E8E93', fontSize: 14 },
  removeImageBtn: { color: '#FF453A', fontSize: 13, textAlign: 'center', marginTop: 4 },
})
