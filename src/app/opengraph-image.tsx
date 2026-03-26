import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '社交ダンス衣装レンタル'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fffbeb',
        gap: 32,
      }}
    >
      {/* Shirt Icon (Lucide Shirt SVG) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="160"
        height="160"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#b45309"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
      </svg>

      {/* Service Name */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#b45309',
          letterSpacing: '-0.02em',
        }}
      >
        社交ダンス衣装レンタル
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 32,
          color: '#92400e',
          letterSpacing: '0.05em',
        }}
      >
        社交ダンスの衣装を、もっと気軽にレンタル
      </div>
    </div>,
    { ...size },
  )
}
