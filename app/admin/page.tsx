'use client'

import { logout } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-4xl font-bold">ADMIN</div>
      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>
    </div>
  )
}
