'use client'

import { Textarea } from '@/components/ui/Textarea'
import {
  COSTUME_REVIEW_SIZE_FIT_OPTIONS,
  COSTUME_REVIEW_PHOTO_MATCH_OPTIONS,
  COSTUME_REVIEW_CONDITION_OPTIONS,
  COSTUME_REVIEW_SCENE_OPTIONS,
} from '@/lib/constants'

export type CostumeReviewData = {
  size_fit: string | null
  photo_match: string | null
  condition: string | null
  recommended_scene: string[]
  comment: string
}

interface CostumeReviewSectionProps {
  value: CostumeReviewData
  onChange: (data: CostumeReviewData) => void
  hasError?: boolean
}

function ToggleGroup({
  label,
  options,
  selected,
  onSelect,
  hasError,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string | null
  onSelect: (value: string) => void
  hasError?: boolean
}) {
  return (
    <div>
      <p className={`mb-2 text-sm font-medium ${hasError && !selected ? 'text-red-600' : 'text-gray-700'}`}>
        {label} *
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === opt.value
                ? 'border-amber-600 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hasError && !selected && (
        <p className="mt-1 text-xs text-red-500">選択してください</p>
      )}
    </div>
  )
}

export function CostumeReviewSection({ value, onChange, hasError }: CostumeReviewSectionProps) {
  function update(patch: Partial<CostumeReviewData>) {
    onChange({ ...value, ...patch })
  }

  function toggleScene(scene: string) {
    const scenes = value.recommended_scene.includes(scene)
      ? value.recommended_scene.filter((s) => s !== scene)
      : [...value.recommended_scene, scene]
    update({ recommended_scene: scenes })
  }

  return (
    <div className="flex flex-col gap-5">
      <ToggleGroup
        label="サイズ感"
        options={[...COSTUME_REVIEW_SIZE_FIT_OPTIONS]}
        selected={value.size_fit}
        onSelect={(v) => update({ size_fit: v })}
        hasError={hasError}
      />

      <ToggleGroup
        label="写真との一致度"
        options={[...COSTUME_REVIEW_PHOTO_MATCH_OPTIONS]}
        selected={value.photo_match}
        onSelect={(v) => update({ photo_match: v })}
        hasError={hasError}
      />

      <ToggleGroup
        label="コンディション"
        options={[...COSTUME_REVIEW_CONDITION_OPTIONS]}
        selected={value.condition}
        onSelect={(v) => update({ condition: v })}
        hasError={hasError}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">おすすめシーン（任意）</p>
        <div className="flex flex-wrap gap-2">
          {COSTUME_REVIEW_SCENE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={value.recommended_scene.includes(opt.value)}
                onChange={() => toggleScene(opt.value)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Textarea
        label="コメント（任意）"
        rows={3}
        maxLength={500}
        placeholder="衣装の感想をお書きください"
        value={value.comment}
        onChange={(e) => update({ comment: e.target.value })}
      />
    </div>
  )
}
