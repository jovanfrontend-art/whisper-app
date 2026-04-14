import { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, TextInput, Alert, ScrollView,
} from 'react-native'
import { useStore } from '@whisper/supabase'
import Avatar from '@/components/ui/Avatar'

export default function ProfileScreen() {
  const { user, login, signup, logout, updateProfile } = useStore()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editing, setEditing] = useState(false)

  async function handleAuth() {
    if (!email || !password) return
    setLoading(true)
    if (tab === 'login') {
      const ok = await login(email, password)
      if (!ok) Alert.alert('Greška', 'Pogrešan email ili lozinka.')
    } else {
      if (!username) { Alert.alert('Greška', 'Unesite korisničko ime.'); setLoading(false); return }
      const ok = await signup(email, username, password)
      if (!ok) Alert.alert('Greška', 'Registracija nije uspela.')
    }
    setLoading(false)
  }

  async function handleSaveProfile() {
    if (!editUsername.trim()) return
    await updateProfile(editUsername.trim())
    setEditing(false)
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0E0E0F" />
        <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>WhisperX</Text>
          <Text style={styles.subtitle}>Prijavi se da pratiš svoje priče</Text>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
              onPress={() => setTab('login')}
            >
              <Text style={[styles.tabBtnText, tab === 'login' && styles.tabBtnTextActive]}>Prijava</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'signup' && styles.tabBtnActive]}
              onPress={() => setTab('signup')}
            >
              <Text style={[styles.tabBtnText, tab === 'signup' && styles.tabBtnTextActive]}>Registracija</Text>
            </TouchableOpacity>
          </View>

          {tab === 'signup' && (
            <TextInput
              style={styles.input}
              placeholder="Korisničko ime"
              placeholderTextColor="#8E8E93"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Lozinka"
            placeholderTextColor="#8E8E93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={loading}>
            <Text style={styles.submitBtnText}>{loading ? 'Čekaj...' : (tab === 'login' ? 'Prijavi se' : 'Registruj se')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E0F" />
      <ScrollView contentContainerStyle={styles.profileContainer}>
        <Avatar username={user.username} color={user.color} size={72} avatarUrl={user.avatarUrl} />
        <Text style={styles.profileName}>{user.username}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>

        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Novo korisničko ime"
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Sačuvaj</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => { setEditUsername(user.username); setEditing(true) }}
          >
            <Text style={styles.editBtnText}>Uredi profil</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Odjavi se</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E0F' },
  authContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 32, fontWeight: '800', color: '#FF9500', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#8E8E93', marginBottom: 32, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    width: '100%',
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#FF9500' },
  tabBtnText: { color: '#8E8E93', fontWeight: '500' },
  tabBtnTextActive: { color: '#000' },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#EBEBF5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    width: '100%',
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  submitBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  profileContainer: { flexGrow: 1, alignItems: 'center', padding: 24 },
  profileName: { fontSize: 22, fontWeight: '700', color: '#EBEBF5', marginTop: 16 },
  profileEmail: { fontSize: 14, color: '#8E8E93', marginTop: 4, marginBottom: 24 },
  editBtn: {
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 12,
  },
  editBtnText: { color: '#FF9500', fontWeight: '600' },
  editRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 12 },
  saveBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveBtnText: { color: '#000', fontWeight: '700' },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#FF453A',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  logoutBtnText: { color: '#FF453A', fontWeight: '600' },
})
