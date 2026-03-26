export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'upravo sad'
  if (diffMin < 60) return `pre ${diffMin}m`
  if (diffHour < 24) return `pre ${diffHour}h`
  if (diffDay < 7) return `pre ${diffDay}d`

  return date.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'short' })
}
