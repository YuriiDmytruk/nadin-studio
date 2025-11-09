import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/services/admin'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAuthenticated = !!user
    const admin = await isAdmin()

    // If user is not logged in or not an admin, redirect to login
    if (!isAuthenticated || !admin) {
        redirect('/login')
    }

    return <>{children}</>
}

