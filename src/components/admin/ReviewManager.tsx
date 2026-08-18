'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Trash2, Loader2, Star, MessageSquare, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Review } from '@/types'

interface ReviewManagerProps {
  open: boolean
  isAdmin: boolean
  authHeaders?: Record<string, string>
  onReviewsUpdate?: () => void
}

export function ReviewManager({ open, isAdmin, authHeaders, onReviewsUpdate }: ReviewManagerProps) {
  const { toast } = useToast()

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [creatingReview, setCreatingReview] = useState(false)
  const [editReviewName, setEditReviewName] = useState('')
  const [editReviewRating, setEditReviewRating] = useState(5)
  const [editReviewComment, setEditReviewComment] = useState('')
  const [savingReview, setSavingReview] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const res = await fetch('/api/reviews?all=true', {
        headers: authHeaders,
      })
      const data = await res.json()
      if (res.status === 401) {
        toast({ title: 'Сессия истекла', description: 'Войдите в админ-панель заново', variant: 'destructive' })
        return
      }
      if (Array.isArray(data)) {
        setReviews(data.slice(0, 5)) // Max 5 reviews
      }
    } catch {
      // Failed to fetch reviews
    } finally {
      setLoadingReviews(false)
    }
  }

  // Load reviews when tab becomes visible
  useEffect(() => {
    if (open && isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAdmin])

  const startEditingReview = (review: Review) => {
    setCreatingReview(false)
    setEditingReviewId(review.id)
    setEditReviewName(review.guestName)
    setEditReviewRating(review.rating)
    setEditReviewComment(review.comment)
  }

  const startCreatingReview = () => {
    setEditingReviewId(null)
    setCreatingReview(true)
    setEditReviewName('')
    setEditReviewRating(5)
    setEditReviewComment('')
  }

  const cancelEditingReview = () => {
    setEditingReviewId(null)
    setCreatingReview(false)
    setEditReviewName('')
    setEditReviewRating(5)
    setEditReviewComment('')
  }

  const saveReview = async () => {
    if (!editingReviewId) return
    setSavingReview(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify({
          id: editingReviewId,
          guestName: editReviewName,
          rating: editReviewRating,
          comment: editReviewComment,
          isApproved: true,
        }),
      })

      if (res.ok) {
        await fetchReviews()
        onReviewsUpdate?.()
        cancelEditingReview()
        toast({
          title: 'Сохранено',
          description: 'Отзыв успешно обновлен',
        })
      } else {
        const error = await res.json()
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось сохранить',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Ошибка при сохранении',
        variant: 'destructive',
      })
    } finally {
      setSavingReview(false)
    }
  }

  const createReview = async () => {
    setSavingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders ?? {}) },
        body: JSON.stringify({
          guestName: editReviewName,
          rating: editReviewRating,
          comment: editReviewComment,
          isApproved: true,
        }),
      })

      if (res.ok) {
        await fetchReviews()
        onReviewsUpdate?.()
        cancelEditingReview()
        toast({
          title: 'Добавлено',
          description: 'Новый отзыв создан',
        })
      } else {
        const error = await res.json()
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось создать отзыв',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Ошибка при добавлении',
        variant: 'destructive',
      })
    } finally {
      setSavingReview(false)
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Удалить этот отзыв?')) return

    try {
      const res = await fetch(`/api/reviews?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      if (res.ok) {
        await fetchReviews()
        onReviewsUpdate?.()
        toast({
          title: 'Удалено',
          description: 'Отзыв удален',
        })
      }
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Ошибка при удалении',
        variant: 'destructive',
      })
    }
  }

  const renderReviewForm = () => (
    <CardContent className="p-4 space-y-4">
      {/* Guest Name */}
      <div>
        <Label htmlFor="review-name">Имя гостя</Label>
        <Input
          id="review-name"
          value={editReviewName}
          onChange={(e) => setEditReviewName(e.target.value)}
        />
      </div>

      {/* Rating */}
      <div>
        <Label htmlFor="review-rating">Оценка</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setEditReviewRating(star)}
              className="p-1"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= editReviewRating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {editReviewRating}/5
          </span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="review-comment">Текст отзыва</Label>
        <Textarea
          id="review-comment"
          value={editReviewComment}
          onChange={(e) => setEditReviewComment(e.target.value)}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={creatingReview ? createReview : saveReview}
          className="bg-primary hover:bg-primary/90"
          disabled={savingReview}
        >
          {savingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {creatingReview ? 'Добавить' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={cancelEditingReview} disabled={savingReview}>
          Отмена
        </Button>
      </div>
    </CardContent>
  )

  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Максимум 5 отзывов для отображения на сайте
        </p>
        <Button
          onClick={startCreatingReview}
          disabled={loadingReviews || reviews.length >= 5 || creatingReview || editingReviewId !== null}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить отзыв
        </Button>
      </div>

      {creatingReview && (
        <Card className="overflow-hidden border-primary/50">
          {renderReviewForm()}
        </Card>
      )}

      {loadingReviews ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              {editingReviewId === review.id ? (
                renderReviewForm()
              ) : (
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.guestName}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditingReview(review)}
                        disabled={creatingReview}
                      >
                        Изменить
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {reviews.length === 0 && !creatingReview && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Нет отзывов</p>
              <p className="text-sm">Нажмите "Добавить отзыв" чтобы создать</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}