'use client'

import { logout } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        const result = await logout()
        if (result.success) {
            router.push('/login')
            router.refresh()
        }
    }

    return (
        <Button onClick={handleLogout} variant="outline" className="mt-4">
            Logout
        </Button>
    )
}

