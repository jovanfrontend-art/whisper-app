interface AvatarProps {
  initials: string
  color: string
  avatarImage?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ initials, color, avatarImage, size = 'md' }: AvatarProps) {
  const cls = size === 'sm' ? 'avatar sm' : size === 'lg' ? 'avatar lg' : 'avatar'
  const style: React.CSSProperties = {
    backgroundColor: color,
    backgroundImage: avatarImage ? `url(${avatarImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
  return (
    <div className={cls} style={style}>
      {!avatarImage && initials}
    </div>
  )
}
