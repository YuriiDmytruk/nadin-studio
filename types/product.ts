export interface Product {
    id: number
    created_at: string
    name: string
    description: string | null
    price: number | null
    setType: SetType
    colors: string[] | null
    imageURLs: string[] | null
}

export type SetType = 'western' | 'jumping' | 'dressage' | 'other'

