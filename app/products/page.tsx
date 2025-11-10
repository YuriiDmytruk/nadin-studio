'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Product } from '@/types/product'
import { ProductFilters } from '@/lib/services/products'
import { fetchProducts, fetchPriceRange, fetchUniqueColors } from '../admin/actions/products'
import PublicProductCard from './components/public-product-card'
import PublicFiltersSidebar from './components/public-filters-sidebar'
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export default function ProductsPage() {
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

        if (filtersString !== prevFiltersRef.current) {
            prevFiltersRef.current = filtersString
            loadProducts()
        }
    }, [filters])

    return (
        <SidebarProvider>
            <Sidebar className="border-r">
                <SidebarContent className="p-6">
                    <PublicFiltersSidebar
                        onFiltersChange={handleFiltersChange}
                        priceRange={priceRange}
                        uniqueColors={uniqueColors}
                    />
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 bg-white">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Our Products
                        </h1>
                        {!loading && (
                            <p className="text-sm text-slate-600">
                                {products.length} {products.length === 1 ? 'product' : 'products'} found
                            </p>
                        )}
                    </div>
                </header>
                <main className="flex-1 p-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 min-h-[calc(100vh-4rem)]">
                    {loading && products.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-4">
                                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                                <p className="text-lg font-semibold text-slate-600">Loading products...</p>
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto">
                                    <span className="text-3xl">🔍</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                                    <p className="text-slate-600">Try adjusting your filters to see more results</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <PublicProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

