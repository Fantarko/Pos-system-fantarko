'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type UserRole = 'customer' | 'staff' | 'admin' | null

export function useAuth(requiredRole?: 'staff' | 'admin') {
  const supabase = createClient()
  const router = useRouter()
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = data?.role ?? 'customer'
    setRole(userRole)

    // เช็ค required role
    if (requiredRole === 'admin' && userRole !== 'admin') {
      router.push('/pos')
      return
    }

    if (requiredRole === 'staff' && userRole === 'customer') {
      router.push('/')
      return
    }

    setLoading(false)
  }

  return { role, loading }
}