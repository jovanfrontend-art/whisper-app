'use client'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

interface Props {
  value: string
  onChange: (lang: string) => void
  label?: string
}

export default function LanguagePicker({ value, onChange, label }: Props) {
  return (
    <div className="lang-picker-wrap">
      {label && <label className="profile-label">{label}</label>}
      <select
        className="lang-picker-select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {SUPPORTED_LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  )
}
