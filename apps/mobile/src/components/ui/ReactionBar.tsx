import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native'
import { formatCount } from '@whisper/shared'
import { EMOJIS } from '@whisper/shared'

interface ReactionBarProps {
  reactions: Record<string, number>
  userReactions: string[]
  onToggle: (emoji: string) => void
  small?: boolean
}

export default function ReactionBar({ reactions, userReactions, onToggle, small }: ReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const reactionEntries = Object.entries(reactions).filter(([, count]) => count > 0)

  return (
    <View style={styles.container}>
      {reactionEntries.map(([emoji, count]) => (
        <TouchableOpacity
          key={emoji}
          style={[styles.pill, userReactions.includes(emoji) && styles.pillActive, small && styles.pillSmall]}
          onPress={() => onToggle(emoji)}
        >
          <Text style={small ? styles.emojiSmall : styles.emoji}>{emoji}</Text>
          <Text style={[styles.count, small && styles.countSmall]}>{formatCount(count)}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.addBtn, small && styles.addBtnSmall]}
        onPress={() => setPickerOpen(true)}
      >
        <Text style={small ? styles.emojiSmall : styles.emoji}>🙂</Text>
      </TouchableOpacity>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.picker}>
            {EMOJIS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={styles.pickerItem}
                onPress={() => { onToggle(emoji); setPickerOpen(false) }}
              >
                <Text style={styles.pickerEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: { borderColor: '#FF9500', backgroundColor: 'rgba(255,149,0,0.12)' },
  pillSmall: { paddingHorizontal: 7, paddingVertical: 3 },
  emoji: { fontSize: 15 },
  emojiSmall: { fontSize: 12 },
  count: { color: '#EBEBF5', fontSize: 13, fontWeight: '500' },
  countSmall: { fontSize: 11 },
  addBtn: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  addBtnSmall: { paddingHorizontal: 7, paddingVertical: 3 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  pickerItem: { padding: 8 },
  pickerEmoji: { fontSize: 28 },
})
