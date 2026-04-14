import { useState, useEffect, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Post, Comment, Category, DailyHighlight, User } from '@whisper/shared'
import { getSessionId, AVATAR_COLORS, formatTime } from '@whisper/shared'
import { fetchAllPosts, addPost as addPostQuery } from '../queries/posts'
import { addComment as addCommentQuery, removeComment as removeCommentQuery } from '../queries/comments'
import {
  insertPostReaction, deletePostReaction,
  insertCommentReaction, deleteCommentReaction,
} from '../queries/reactions'
import { insertNotification } from '../queries/notifications'
import { uploadImage } from '../queries/storage'
import { getDailyHighlight as getDailyHighlightQuery } from '../queries/highlights'
import { subscribeToPostReactions, subscribeToComments } from '../realtime/posts'

export function usePosts(client: SupabaseClient, user: User | null, reloadKey: number) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const fetched = await fetchAllPosts(client, user?.id ?? null)
        setPosts(fetched)
      } catch (e) {
        console.error('Posts error:', e)
      }
      setLoading(false)
    }
    load()

    const sessionId = getSessionId()
    const userId = user?.id ?? null

    const reactionsChannel = subscribeToPostReactions(
      client, userId, sessionId,
      (postId, reactionCounts, userReactions) => {
        setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, reactions: reactionCounts, userReactions }))
      }
    )

    const commentsChannel = subscribeToComments(
      client, userId,
      (postId, newComment) => {
        setPosts(prev => prev.map(p => p.id !== postId ? p : {
          ...p,
          comments: [...p.comments, newComment],
          commentCount: p.commentCount + 1,
        }))
      },
      (postId, commentId) => {
        setPosts(prev => prev.map(p => p.id !== postId ? p : {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId),
          commentCount: Math.max(0, p.commentCount - 1),
        }))
      }
    )

    return () => {
      client.removeChannel(reactionsChannel)
      client.removeChannel(commentsChannel)
    }
  }, [client, user, reloadKey])

  const getPostById = useCallback((id: string) => posts.find(p => p.id === id), [posts])

  const getPostsByCategory = useCallback((cat: Category): Post[] => {
    const regular = posts.filter(p => !p.isAdmin)
    if (!cat || cat === 'sve') return regular
    return regular.filter(p => p.category.toLowerCase() === cat.toLowerCase())
  }, [posts])

  const getPostAuthor = useCallback((post: Post) => {
    const isMe = !!(user && post.userId && post.userId === user.id)
    const name = isMe ? (user!.username || 'Ti') : (post.authorUsername || 'Korisnik')
    const color = isMe ? user!.color : post.avatar.color
    const avatarUrl = isMe ? user!.avatarUrl : (post.avatar.avatarUrl ?? null)
    const initials = name[0].toUpperCase()
    return { name, color, avatarUrl, initials, isMe }
  }, [user])

  const getDailyHighlight = useCallback(async (cat: Category): Promise<DailyHighlight | null> => {
    return getDailyHighlightQuery(client, cat, user?.id ?? null)
  }, [client, user])

  const toggleReaction = useCallback(async (postId: string, emoji: string) => {
    const sessionId = getSessionId()
    const userId = user?.id ?? null

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const already = p.userReactions.includes(emoji)
      return {
        ...p,
        reactions: { ...p.reactions, [emoji]: Math.max(0, (p.reactions[emoji] || 0) + (already ? -1 : 1)) },
        userReactions: already ? p.userReactions.filter(e => e !== emoji) : [...p.userReactions, emoji],
      }
    }))

    const post = posts.find(p => p.id === postId)
    if (!post) return
    const already = post.userReactions.includes(emoji)

    if (already) {
      await deletePostReaction(client, postId, emoji, userId, sessionId)
    } else {
      await insertPostReaction(client, postId, emoji, userId, userId ? null : sessionId)
      if (userId && post.userId && post.userId !== userId) {
        await insertNotification(client, {
          user_id: post.userId,
          post_id: postId,
          type: 'reaction',
          commenter_username: user?.username ?? 'Korisnik',
          post_text: post.text.slice(0, 60),
        })
      }
    }
  }, [client, posts, user])

  const toggleCommentReaction = useCallback(async (postId: string, commentId: string, emoji: string) => {
    const sessionId = getSessionId()
    const userId = user?.id ?? null

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return {
        ...p,
        comments: p.comments.map(c => {
          if (c.id !== commentId) return c
          const already = c.userReactions.includes(emoji)
          return {
            ...c,
            reactions: { ...c.reactions, [emoji]: Math.max(0, (c.reactions[emoji] || 0) + (already ? -1 : 1)) },
            userReactions: already ? c.userReactions.filter(e => e !== emoji) : [...c.userReactions, emoji],
          }
        }),
      }
    }))

    const comment = posts.find(p => p.id === postId)?.comments.find(c => c.id === commentId)
    if (!comment) return
    const already = comment.userReactions.includes(emoji)

    if (already) {
      await deleteCommentReaction(client, commentId, emoji, userId, sessionId)
    } else {
      await insertCommentReaction(client, commentId, emoji, userId, userId ? null : sessionId)
    }
  }, [client, posts, user])

  const addComment = useCallback(async (postId: string, text: string, image?: string | null) => {
    const userId = user?.id ?? null
    let imageUrl: string | null = null
    if (image) {
      imageUrl = await uploadImage(client, 'comments', image)
    }

    const newComment = await addCommentQuery(client, postId, userId, text, imageUrl)

    const post = posts.find(p => p.id === postId)
    if (post) {
      await client.from('posts').update({ comment_count: post.commentCount + 1 }).eq('id', postId)
      if (post.userId && post.userId !== userId) {
        await insertNotification(client, {
          user_id: post.userId,
          post_id: postId,
          comment_id: newComment.id,
          type: 'comment',
          commenter_username: user?.username ?? 'Korisnik',
          post_text: post.text.slice(0, 60),
        })
      }
    }

    const isAdmin = user?.isAdmin ?? false
    const username = isAdmin ? 'Whisper' : (user?.username ?? 'Korisnik')
    const initials = username[0].toUpperCase()
    const color = isAdmin ? '#FF9500' : (user?.color ?? AVATAR_COLORS[0])
    const mapped: Comment = {
      id: newComment.id,
      avatar: { initials, color },
      username, isAdmin,
      text: newComment.text,
      image: newComment.image_url,
      time: 'upravo',
      reactions: {}, userReactions: [], isNew: true,
    }

    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      comments: [...p.comments, mapped],
      commentCount: p.commentCount + 1,
    }))
  }, [client, user, posts])

  const removeComment = useCallback(async (postId: string, commentId: string) => {
    await removeCommentQuery(client, commentId)
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      comments: p.comments.filter(c => c.id !== commentId),
      commentCount: Math.max(0, p.commentCount - 1),
    }))
    const post = posts.find(p => p.id === postId)
    if (post) {
      await client.from('posts').update({ comment_count: Math.max(0, post.commentCount - 1) }).eq('id', postId)
    }
  }, [client, posts])

  const addPost = useCallback(async (text: string, category: string, image?: string | null): Promise<void> => {
    const userId = user?.id ?? null
    let imageUrl: string | null = null
    if (image) {
      imageUrl = await uploadImage(client, 'posts', image)
    }
    const newPost = await addPostQuery(client, userId, text, category, imageUrl)
    setPosts(prev => [newPost, ...prev])
  }, [client, user])

  return {
    posts, loading,
    getPostById, getPostsByCategory, getPostAuthor, getDailyHighlight,
    toggleReaction, toggleCommentReaction,
    addComment, removeComment, addPost,
  }
}
