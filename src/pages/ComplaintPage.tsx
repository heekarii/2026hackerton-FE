import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import '@/App.css'

import { apiRequest } from '@/shared/api/client'

const categories = [
  '시설',
  '수업 환경',
  '식당',
  '도서관',
  '행정 서비스',
  '기타',
] as const

type Category = (typeof categories)[number]

type FormState = {
  title: string
  category: Category
  occurrenceAt: string
  complaint: string
  improvement: string
  isAnonymous: boolean
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

type ImagePreview = {
  id: string
  name: string
  size: string
  url: string
}

const initialForm: FormState = {
  title: '',
  category: '시설',
  occurrenceAt: '',
  complaint: '',
  improvement: '',
  isAnonymous: true,
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)}KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

export function ComplaintPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [images, setImages] = useState<ImagePreview[]>([])
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [message, setMessage] = useState('')

  const isReadyToSubmit = useMemo(
    () =>
      form.title.trim().length > 0 &&
      form.occurrenceAt.length > 0 &&
      form.complaint.trim().length >= 10 &&
      form.improvement.trim().length >= 5,
    [form],
  )

  const updateForm = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const nextImages = files.slice(0, 4).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: formatFileSize(file.size),
      url: URL.createObjectURL(file),
    }))

    setImages(nextImages)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isReadyToSubmit) {
      setStatus('error')
      setMessage('필수 항목을 채운 뒤 다시 제출해 주세요.')
      return
    }

    setStatus('submitting')
    setMessage('AI 분석을 위해 민원 내용을 전송하고 있어요.')

    const payload = {
      title: form.title.trim(),
      category: form.category,
      occurred_at: new Date(form.occurrenceAt).toISOString(),
      complaint_content: form.complaint.trim(),
      desired_improvement: form.improvement.trim(),
      is_anonymous: form.isAnonymous,
      image_names: images.map((image) => image.name),
    }

    try {
      await apiRequest('/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      setStatus('success')
      setMessage('민원이 등록됐어요. AI가 분류, 요약, 유사 민원을 분석합니다.')
    } catch {
      setStatus('error')
      setMessage(
        '민원 등록 요청에 실패했어요. 잠시 후 다시 시도해 주세요.',
      )
    }
  }

  return (
    <main className="app-shell">
      <section className="app-header">
        <div>
          <p className="eyebrow">AI Campus Voice</p>
          <h1>캠퍼스 민원 등록</h1>
          <p className="header-copy">
            불편사항과 개선희망사항을 분리해 남기면 AI가 민원을 자동 분류하고
            핵심 이슈와 유사 민원을 분석합니다.
          </p>
        </div>
      </section>

      <form className="complaint-layout" onSubmit={handleSubmit}>
        <section className="form-panel">
          <div className="section-heading">
            <p>민원 정보</p>
            <h2>언제 어떤 문제가 있었나요?</h2>
          </div>

          <label className="field field-full">
            <span>제목</span>
            <input
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
              placeholder="예: 중앙도서관 3층 냉방이 너무 약해요"
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>카테고리</span>
              <select
                value={form.category}
                onChange={(event) =>
                  updateForm('category', event.target.value as Category)
                }
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>발생 시간</span>
              <input
                type="datetime-local"
                value={form.occurrenceAt}
                onChange={(event) =>
                  updateForm('occurrenceAt', event.target.value)
                }
              />
            </label>
          </div>

          <label className="field field-full">
            <span>민원사항</span>
            <textarea
              value={form.complaint}
              onChange={(event) => updateForm('complaint', event.target.value)}
              placeholder="현재 겪은 불편사항, 반복 여부, 영향받은 상황을 적어주세요."
              rows={6}
            />
          </label>

          <label className="field field-full">
            <span>개선희망사항</span>
            <textarea
              value={form.improvement}
              onChange={(event) => updateForm('improvement', event.target.value)}
              placeholder="어떤 방식으로 개선되면 좋을지 구체적으로 적어주세요."
              rows={5}
            />
          </label>
        </section>

        <aside className="submit-panel">
          <div className="section-heading">
            <p>첨부 및 등록 설정</p>
            <h2>분석에 도움이 되는 자료를 더해주세요.</h2>
          </div>

          <label className="upload-box">
            <input
              accept="image/*"
              multiple
              type="file"
              onChange={handleImageChange}
            />
            <strong>사진 첨부</strong>
            <span>최대 4장까지 선택</span>
          </label>

          {images.length > 0 && (
            <div className="image-list">
              {images.map((image) => (
                <figure key={image.id}>
                  <img src={image.url} alt="" />
                  <figcaption>
                    <strong>{image.name}</strong>
                    <span>{image.size}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          <div className="toggle-list">
            <label className="toggle-row">
              <span>
                <strong>익명 등록</strong>
                <small>학생 정보 없이 민원을 제출합니다.</small>
              </span>
              <input
                checked={form.isAnonymous}
                type="checkbox"
                onChange={(event) =>
                  updateForm('isAnonymous', event.target.checked)
                }
              />
            </label>
          </div>

          {message && (
            <p className={`submit-message submit-message-${status}`}>
              {message}
            </p>
          )}

          <button
            className="submit-button"
            disabled={status === 'submitting'}
            type="submit"
          >
            {status === 'submitting' ? '등록 중...' : '민원 등록하기'}
          </button>
        </aside>
      </form>
    </main>
  )
}
