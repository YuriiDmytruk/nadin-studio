import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/services/admin'
import { createClient } from '@/lib/supabase/server'
import { isRefreshTokenError, clearAuthCookies } from '@/lib/supabase/auth-helpers'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        // Handle refresh token error
        if (error && isRefreshTokenError(error)) {
            await clearAuthCookies()
            redirect('/login')
        }

        const isAuthenticated = !!user
        const admin = await isAdmin()

        // If user is not logged in or not an admin, redirect to login
        if (!isAuthenticated || !admin) {
            redirect('/login')
        }

        return <>{children}</>
    } catch (error: any) {
        // Handle refresh token error in catch block
        if (isRefreshTokenError(error)) {
            await clearAuthCookies()
            redirect('/login')
        }
        // Re-throw other errors
        throw error
    }
}

