import { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'
import { useStore } from '@whisper/supabase'

export default function Toast() {
  const { toastMsg } = useStore()
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (toastMsg) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2600),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start()
    }
  }, [toastMsg, opacity])

  if (!toastMsg) return null

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{toastMsg}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
    zIndex: 9999,
  },
  text: { color: '#EBEBF5', fontSize: 14, fontWeight: '500', textAlign: 'center' },
})
