'use server'

import { getAllProducts, getPriceRange, getUniqueColors, createProduct, uploadImage, deleteProduct, updateProduct, getProductById, ProductFilters } from '@/lib/services/products'
import { Product } from '@/types/product'

export async function fetchProducts(filters?: ProductFilters): Promise<Product[]> {
    return await getAllProducts(filters)
}

export async function fetchPriceRange() {
    return await getPriceRange()
}

export async function fetchUniqueColors() {
    return await getUniqueColors()
}

export async function createProductAction(product: Omit<Product, 'id' | 'created_at'>) {
    return await createProduct(product)
}

export async function uploadImageAction(formData: FormData) {
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string | null
    if (!file) {
        return { success: false, error: 'No file provided' }
    }
    return await uploadImage(file, fileName || undefined)
}

export async function deleteProductAction(productId: number): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await deleteProduct(productId)
        if (result) {
            return { success: true }
        } else {
            return { success: false, error: 'Failed to delete product' }
        }
    } catch (error) {
        console.error('Error deleting product:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred while deleting the product'
        }
    }
}

export async function updateProductAction(
    productId: number,
    updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product | null> {
    return await updateProduct(productId, updates)
}

export async function fetchProductById(productId: number): Promise<Product | null> {
    return await getProductById(productId)
}

