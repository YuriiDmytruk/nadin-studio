import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/services/admin'

export default async function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // If user is already logged in and is admin, redirect to admin page
    const admin = await isAdmin()

    if (admin) {
        redirect('/admin')
    }

    return <>{children}</>
}

