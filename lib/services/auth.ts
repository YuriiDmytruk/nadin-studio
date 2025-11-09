import { createClient } from '@/lib/supabase/client'

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    error?: string
    user?: any
}

/**
 * Login service for authenticating users with Supabase
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        })

        if (error) {
            return {
                success: false,
                error: error.message,
            }
        }

        // Ensure session is properly set
        if (data.session) {
            // Wait a bit to ensure cookies are set
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        return {
            success: true,
            user: data.user,
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'An unexpected error occurred during login',
        }
    }
}

/**
 * Logout service for signing out users
 */
export async function logout(): Promise<AuthResponse> {
    try {
        const supabase = createClient()

        const { error } = await supabase.auth.signOut()

        if (error) {
            return {
                success: false,
                error: error.message,
            }
        }

        return {
            success: true,
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'An unexpected error occurred during logout',
        }
    }
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
    try {
        const supabase = createClient()

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
            return null
        }

        return user
    } catch (error) {
        return null
    }
}

