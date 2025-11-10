'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Product } from '@/types/product'
import { ProductFilters } from '@/lib/services/products'
import { fetchProducts, fetchPriceRange, fetchUniqueColors, deleteProductAction } from '../actions/products'
import ProductCard from './product-card'
import ProductFiltersComponent from './product-filters'
import { Card } from '@/components/ui/card'

interface ProductListProps {
    onEdit?: (productId: number) => void
}

export default function ProductList({ onEdit }: ProductListProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<ProductFilters>({})
    const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })
    const [uniqueColors, setUniqueColors] = useState<string[]>([])

    const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
        setFilters(newFilters)
    }, [])

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [productsData, priceRangeData, colorsData] = await Promise.all([
                    fetchProducts(),
                    fetchPriceRange(),
                    fetchUniqueColors(),
                ])
                setProducts(productsData)
                setPriceRange(priceRangeData)
                setUniqueColors(colorsData)
            } catch (error) {
                console.error('Error loading initial data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [])

    const prevFiltersRef = useRef<string | null>(null)

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true)
            try {
                const productsData = await fetchProducts(filters)
                setProducts(productsData)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }

        const filtersString = JSON.stringify(filters)

        // Only load if filters actually changed
        if (filtersString !== prevFiltersRef.current) {
            prevFiltersRef.current = filtersString
            loadProducts()
        }
    }, [filters])

    const handleEdit = (product: Product) => {
        if (onEdit) {
            onEdit(product.id)
        }
    }

    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product? This will also delete all associated images and cannot be undone.')) {
            return
        }

        setLoading(true)
        try {
            const result = await deleteProductAction(productId)
            if (result.success) {
                // Remove the product from the local state
                setProducts(prev => prev.filter(p => p.id !== productId))
                // Reload price range and colors in case they changed
                const [priceRangeData, colorsData] = await Promise.all([
                    fetchPriceRange(),
                    fetchUniqueColors(),
                ])
                setPriceRange(priceRangeData)
                setUniqueColors(colorsData)
            } else {
                alert(result.error || 'Failed to delete product')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('An error occurred while deleting the product')
        } finally {
            setLoading(false)
        }
    }

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                    <p className="text-lg font-semibold text-slate-600">Loading products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ProductFiltersComponent
                onFiltersChange={handleFiltersChange}
                priceRange={priceRange}
                uniqueColors={uniqueColors}
            />

            <div className="space-y-4">
                {products.length === 0 ? (
                    <Card className="p-12 bg-white/80 backdrop-blur-sm border-2">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <span className="text-3xl">🔍</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                                <p className="text-slate-600">Try adjusting your filters to see more results</p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-600">
                                Found <span className="text-purple-600 font-bold">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
                            </p>
                        </div>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

