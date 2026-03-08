'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Bell, LogOut, User, ShirtIcon, Heart, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Avatar } from '@/components/ui/Avatar'

export function Header() {
  const { user, profile, loading } = useAuth()
  const { unreadCount } = useNotifications(user?.id)
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-amber-700">
          <ShirtIcon className="h-6 w-6" aria-hidden="true" />
          <span className="hidden font-bold sm:inline">社交ダンス衣装レンタル</span>
          <span className="font-bold sm:hidden">ダンス衣装</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-amber-700">
            衣装を探す
          </Link>
          {user && (
            <Link href="/costumes/new" className="text-sm font-medium text-gray-700 hover:text-amber-700">
              出品する
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              {/* Notification bell */}
              <Link
                href="/notifications"
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label={`通知${unreadCount > 0 ? `（${unreadCount}件未読）` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="rounded-full"
                  aria-expanded={userMenuOpen}
                  aria-label="ユーザーメニュー"
                >
                  <Avatar
                    src={profile?.avatar_url ?? user.user_metadata.avatar_url}
                    name={profile?.name ?? user.user_metadata.full_name ?? user.email}
                    size="sm"
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                      <div className="border-b border-gray-100 px-4 py-2">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {profile?.name ?? user.user_metadata.full_name ?? user.email}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>
                      <nav className="py-1">
                        <Link
                          href="/profile/edit"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="h-4 w-4" /> プロフィール
                        </Link>
                        <Link
                          href="/mypage/costumes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ShirtIcon className="h-4 w-4" /> 出品した衣装
                        </Link>
                        <Link
                          href="/rentals"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ClipboardList className="h-4 w-4" /> 取引一覧
                        </Link>
                        <Link
                          href="/mypage/favorites"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Heart className="h-4 w-4" /> お気に入り
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> ログアウト
                        </button>
                      </nav>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-amber-700"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                新規登録
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="メニュー"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              衣装を探す
            </Link>
            {user ? (
              <>
                <Link
                  href="/costumes/new"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  出品する
                </Link>
                <Link
                  href="/rentals"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  取引一覧
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  メッセージ
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
