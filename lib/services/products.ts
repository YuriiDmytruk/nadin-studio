import { createClient } from '@/lib/supabase/server'
import { Product, SetType } from '@/types/product'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const BUCKET_NAME = 'images'

export interface ProductFilters {
    search?: string
    setTypes?: SetType[]
    colors?: string[]
    minPrice?: number
    maxPrice?: number
}

export async function getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
        const supabase = await createClient()

        let query = supabase
            .from('products')
            .select('*')

        if (filters?.search && filters.search.trim() !== '') {
            query = query.ilike('name', `%${filters.search.trim()}%`)
        }

        if (filters?.setTypes && filters.setTypes.length > 0) {
            const allTypes: SetType[] = ['western', 'jumping', 'dressage', 'other']
            const hasAllTypes = allTypes.every(type => filters.setTypes!.includes(type))

            if (!hasAllTypes) {
                query = query.in('setType', filters.setTypes)
            }
        }

        if (filters?.minPrice !== undefined && filters.minPrice !== null) {
            query = query.gte('price', filters.minPrice)
        }

        if (filters?.maxPrice !== undefined && filters.maxPrice !== null) {
            query = query.lte('price', filters.maxPrice)
        }

        query = query.order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) {
            console.error('Error fetching products:', error)
            return []
        }

        let products = (data || []).map(transformProduct)

        if (filters?.colors && filters.colors.length > 0) {
            const normalizedFilterColors = filters.colors.map(c => c.toLowerCase().trim())
            products = products.filter(product => {
                if (!product.colors || product.colors.length === 0) {
                    return false
                }
                return product.colors.some(productColor =>
                    normalizedFilterColors.includes(productColor.toLowerCase().trim())
                )
            })
        }

        return products
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}

export interface PriceRange {
    min: number | null
    max: number | null
}

export async function getPriceRange(): Promise<PriceRange> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('products')
            .select('price')

        if (error) {
            console.error('Error fetching price range:', error)
            return { min: null, max: null }
        }

        if (!data || data.length === 0) {
            return { min: null, max: null }
        }

        const prices = data
            .map(item => item.price)
            .filter((price): price is number => price !== null && price !== undefined)

        if (prices.length === 0) {
            return { min: null, max: null }
        }

        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
        }
    } catch (error) {
        console.error('Error fetching price range:', error)
        return { min: null, max: null }
    }
}

export async function getUniqueColors(): Promise<string[]> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('products')
            .select('colors')

        if (error) {
            console.error('Error fetching colors:', error)
            return []
        }

        if (!data || data.length === 0) {
            return []
        }

        const allColors = new Set<string>()

        data.forEach(item => {
            const colors = normalizeArrayField(item.colors)
            if (colors && colors.length > 0) {
                colors.forEach(color => {
                    const trimmedColor = color.trim()
                    if (trimmedColor) {
                        allColors.add(trimmedColor.toLowerCase())
                    }
                })
            }
        })

        return Array.from(allColors).sort()
    } catch (error) {
        console.error('Error fetching unique colors:', error)
        return []
    }
}

export async function getProductById(id: number): Promise<Product | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return null
        }

        return transformProduct(data)
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

export async function createProduct(
    product: Omit<Product, 'id' | 'created_at'>
): Promise<Product | null> {
    try {
        const supabase = await createClient()

        const productData = {
            name: product.name,
            description: product.description,
            price: product.price,
            setType: product.setType,
            colors: product.colors || null,
            imageURLs: product.imageURLs || null,
        }

        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()

        if (error || !data) {
            console.error('Error creating product:', error)
            return null
        }

        return transformProduct(data)
    } catch (error) {
        console.error('Error creating product:', error)
        return null
    }
}

export async function updateProduct(
    id: number,
    updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product | null> {
    try {
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {}

        if (updates.name !== undefined) updateData.name = updates.name
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.price !== undefined) updateData.price = updates.price
        if (updates.setType !== undefined) updateData.setType = updates.setType
        if (updates.colors !== undefined) {
            updateData.colors = updates.colors || null
        }
        if (updates.imageURLs !== undefined) {
            updateData.imageURLs = updates.imageURLs || null
        }

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error || !data) {
            console.error('Error updating product:', error)
            return null
        }

        return transformProduct(data)
    } catch (error) {
        console.error('Error updating product:', error)
        return null
    }
}

/**
 * Extract file path from Supabase storage public URL
 * URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[file-path]
 * Returns the file path relative to the bucket (e.g., "filename.jpg")
 */
function extractFilePathFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url)
        // Extract path after /public/
        const publicIndex = urlObj.pathname.indexOf('/public/')
        if (publicIndex === -1) {
            return null
        }
        // Get everything after /public/
        const pathAfterPublic = urlObj.pathname.substring(publicIndex + '/public/'.length)
        // Split by '/' to separate bucket name from file path
        const segments = pathAfterPublic.split('/')
        if (segments.length < 2) {
            // If no segments after bucket, return null
            return null
        }
        // Remove bucket name (first segment) and return the rest
        // This handles nested paths like "images/subfolder/file.jpg"
        return segments.slice(1).join('/')
    } catch (error) {
        console.error('Error extracting file path from URL:', error)
        return null
    }
}

/**
 * Delete images from Supabase storage
 */
async function deleteImagesFromStorage(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) {
        return
    }

    const supabase = await createClient()
    const filePaths: string[] = []

    // Extract file paths from URLs
    for (const url of imageUrls) {
        const filePath = extractFilePathFromUrl(url)
        if (filePath) {
            filePaths.push(filePath)
        }
    }

    if (filePaths.length === 0) {
        return
    }

    // Delete all files from storage
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths)

    if (error) {
        console.error('Error deleting images from storage:', error)
        // Don't throw - we still want to delete the product even if image deletion fails
    }
}

export async function deleteProduct(id: number): Promise<boolean> {
    try {
        const supabase = await createClient()

        // First, get the product to retrieve image URLs
        const product = await getProductById(id)
        if (!product) {
            console.error('Product not found:', id)
            return false
        }

        // Delete images from storage if they exist
        if (product.imageURLs && product.imageURLs.length > 0) {
            await deleteImagesFromStorage(product.imageURLs)
        }

        // Delete the product from database
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting product:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error deleting product:', error)
        return false
    }
}

function transformProduct(data: Record<string, unknown>): Product {
    return {
        id: data.id as number,
        created_at: data.created_at as string,
        name: data.name as string,
        description: data.description as string | null,
        price: data.price as number | null,
        setType: data.setType as Product['setType'],
        colors: normalizeArrayField(data.colors),
        imageURLs: normalizeArrayField(data.imageURLs),
    }
}

function normalizeArrayField(value: unknown): string[] | null {
    if (value === null || value === undefined) {
        return null
    }

    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string')
    }

    return null
}

export interface UploadImageResult {
    success: boolean
    url?: string
    error?: string
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param fileName - Optional custom file name. If not provided, generates a unique name
 * @returns Upload result with URL if successful
 */
export async function uploadImage(
    file: File,
    fileName?: string
): Promise<UploadImageResult> {
    try {
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            }
        }

        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                error: 'File must be an image',
            }
        }

        const supabase = await createClient()

        const fileExt = file.name.split('.').pop()
        const finalFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(finalFileName, fileBuffer, {
                contentType: file.type,
                upsert: false,
            })

        if (error) {
            console.error('Error uploading image:', error)
            return {
                success: false,
                error: error.message || 'Failed to upload image',
            }
        }

        // Get public URL - ensure the path is correct
        const filePath = data.path
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath)

        if (!urlData?.publicUrl) {
            console.error('Failed to generate public URL for:', filePath)
            return {
                success: false,
                error: 'Failed to generate public URL',
            }
        }

        return {
            success: true,
            url: urlData.publicUrl,
        }
    } catch (error) {
        console.error('Error uploading image:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload image',
        }
    }
}

