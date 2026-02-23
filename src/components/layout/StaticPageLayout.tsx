interface StaticPageLayoutProps {
  title: string
  children: React.ReactNode
}

export function StaticPageLayout({ title, children }: StaticPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>
      <div className="prose prose-gray max-w-none text-gray-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-gray-900 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </div>
  )
}
