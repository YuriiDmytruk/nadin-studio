import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user is an admin
 * Returns true if user is logged in AND exists in the admins table
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const supabase = await createClient()

        // First check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()

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
 */
export async function getAdminUser() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

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

        return { ...data, user }
    } catch (error) {
        return null
    }
}

