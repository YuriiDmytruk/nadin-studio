import { createClient } from '@/lib/supabase/server'
import { AdminUser } from '@/types/admin-user'
import { isRefreshTokenError, clearAuthCookies } from '@/lib/supabase/auth-helpers'
import { redirect } from 'next/navigation'

/**
 * Check if the current user is an admin
 * Returns true if user is logged in AND exists in the admins table
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const supabase = await createClient()

        // First check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        // Handle refresh token error
        if (userError && isRefreshTokenError(userError)) {
            await clearAuthCookies()
            redirect('/login')
        }

        if (userError || !user) {
            return false
        }

        // Check if user exists in admins table
        const { data, error } = await supabase
            .from('admins')
            .select('userUID')
            .eq('userUID', user.id)
            .single()

        if (error || !data) {
            return false
        }

        return true
    } catch (error) {
        return false
    }
}

/**
 * Get admin user data
 * Returns AdminUser if the current user is an admin, null otherwise
 */
export async function getAdminUser(): Promise<AdminUser | null> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        // Handle refresh token error
        if (userError && isRefreshTokenError(userError)) {
            await clearAuthCookies()
            redirect('/login')
        }

        if (userError || !user) {
            return null
        }

        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('userUID', user.id)
            .single()

        if (error || !data) {
            return null
        }

        return {
            userUID: data.userUID,
            user,
        }
    } catch (error) {
        return null
    }
}

