import { User } from '@supabase/supabase-js'

export interface AdminUser {
    userUID: string
    user: User
}

export interface AdminRecord {
    userUID: string
}

