interface TipBoxProps {
  type?: 'tip' | 'warning' | 'info'
  children: React.ReactNode
}

const config = {
  tip: {
    icon: '💡',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
  },
  warning: {
    icon: '⚠️',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
  },
  info: {
    icon: 'ℹ️',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
  },
}

export function TipBox({ type = 'tip', children }: TipBoxProps) {
  const { icon, bg, border, text } = config[type]
  return (
    <div className={`mb-5 rounded-xl border ${border} ${bg} px-5 py-4`}>
      <div className={`flex gap-3 text-sm ${text}`}>
        <span className="shrink-0 text-base leading-snug">{icon}</span>
        <div className="[&_a]:underline [&_p]:mt-0 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-4">
          {children}
        </div>
      </div>
    </div>
  )
}
