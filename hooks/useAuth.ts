'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type UserRole = 'customer' | 'staff' | 'admin' | null

export function useAuth(requiredRole?: 'staff' | 'admin') {
  const router = useRouter()

  const [supabase] = useState(() => createClient())
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)

      // ตรวจสอบ Session
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error('Auth Error:', authError)
        router.replace('/login')
        return
      }

      if (!user) {
        router.replace('/login')
        return
      }

      // โหลด Role
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Role Error:', error)
        router.replace('/login')
        return
      }

      const userRole = (data?.role ?? 'customer') as UserRole

      setRole(userRole)

      // ตรวจสอบสิทธิ์
      if (requiredRole === 'admin' && userRole !== 'admin') {
        router.replace('/pos')
        return
      }

      if (requiredRole === 'staff' && userRole === 'customer') {
        router.replace('/')
        return
      }
    } catch (err) {
      console.error('useAuth Error:', err)
      router.replace('/login')
    } finally {
      setLoading(false)
    }
  }, [requiredRole, router, supabase])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      await checkAuth()

      if (!mounted) return
    }

    init()

    return () => {
      mounted = false
    }
  }, [checkAuth])

  return {
    role,
    loading,
    refresh: checkAuth,
  }
}