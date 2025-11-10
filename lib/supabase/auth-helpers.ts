import { cookies } from 'next/headers'

/**
 * Clear all Supabase auth-related cookies
 */
export async function clearAuthCookies() {
    const cookieStore = await cookies()

    // List of common Supabase auth cookie names
    const authCookieNames = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
    ]

    // Get all cookies and find Supabase-related ones
    const allCookies = cookieStore.getAll()

    allCookies.forEach(cookie => {
        // Clear cookies that start with sb- or contain supabase
        if (
            cookie.name.startsWith('sb-') ||
            cookie.name.includes('supabase') ||
            authCookieNames.includes(cookie.name)
        ) {
            cookieStore.delete(cookie.name)
        }
    })
}

/**
 * Check if error is a refresh token error
 */
export function isRefreshTokenError(error: any): boolean {
    return (
        error?.code === 'refresh_token_not_found' ||
        error?.message?.includes('Refresh Token Not Found') ||
        (error?.status === 400 && error?.code?.includes('refresh_token'))
    )
}

