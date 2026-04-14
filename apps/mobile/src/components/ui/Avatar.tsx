import { View, Text, Image, StyleSheet } from 'react-native'

interface AvatarProps {
  username: string
  color: string
  size?: number
  avatarUrl?: string | null
}

export default function Avatar({ username, color, size = 36, avatarUrl }: AvatarProps) {
  const initials = username ? username[0].toUpperCase() : '?'
  const fontSize = Math.floor(size * 0.42)

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    )
  }

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
})
