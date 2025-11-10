'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchProductById } from '../../admin/actions/products'
import { Product } from '@/types/product'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getColorStyle, getColorDisplayName } from '@/lib/utils/color-helpers'

export default function ProductDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const productId = parseInt(params.id as string)

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productData = await fetchProductById(productId)
                if (productData) {
                    setProduct(productData)
                } else {
                    setError('Product not found')
                }
            } catch (err) {
                setError('Failed to load product')
                console.error('Error loading product:', err)
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            loadProduct()
        }
    }, [productId])

    const images = product?.imageURLs || []
    const currentImage = images.length > 0 ? images[currentImageIndex] : null

    const nextImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }
    }

    const prevImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                    <p className="text-lg font-semibold text-slate-600">Loading product...</p>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <Card className="p-8 max-w-md w-full text-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
                    <p className="text-slate-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
                    <Button onClick={() => router.push('/products')} className="w-full">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
            <div className="max-w-7xl mx-auto p-6">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => router.push('/products')}
                    className="mb-6 border-2 border-slate-300 hover:bg-slate-50"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <Card className="overflow-hidden border-2 shadow-lg">
                        <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
                            {currentImage ? (
                                <>
                                    <img
                                        src={currentImage}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />

                                    {/* Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeft className="h-6 w-6 text-slate-700" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
                                                aria-label="Next image"
                                            >
                                                <ChevronRight className="h-6 w-6 text-slate-700" />
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {currentImageIndex + 1} / {images.length}
                                            </span>
                                        </div>
                                    )}

                                    {/* Thumbnail Dots */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 mb-12">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`h-2 rounded-full transition-all ${index === currentImageIndex
                                                            ? 'w-8 bg-white'
                                                            : 'w-2 bg-white/50 hover:bg-white/75'
                                                        }`}
                                                    aria-label={`Go to image ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                    <span className="text-lg font-medium">No Image Available</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                            <div className="p-4 border-t bg-white">
                                <div className="flex gap-2 overflow-x-auto">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                                                    ? 'border-purple-500 ring-2 ring-purple-200'
                                                    : 'border-slate-200 hover:border-purple-300'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <Card className="p-6 border-2 shadow-lg">
                            <div className="space-y-4">
                                {/* Title and Type */}
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                        {product.name}
                                    </h1>
                                    <span className="inline-block px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200 capitalize">
                                        {product.setType}
                                    </span>
                                </div>

                                {/* Price */}
                                {product.price !== null && (
                                    <div className="pt-2">
                                        <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            ${product.price.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <Separator />

                                {/* Description */}
                                {product.description && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 mb-2">Description</h2>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Colors */}
                                {product.colors && product.colors.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 mb-3">Available Colors</h2>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors.map((color, index) => {
                                                const colorHex = getColorStyle(color)
                                                const displayName = getColorDisplayName(color)
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border-2 border-slate-200 hover:border-purple-300 transition-colors"
                                                    >
                                                        <div
                                                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
                                                            style={{ backgroundColor: colorHex }}
                                                        />
                                                        <span className="text-sm font-medium text-slate-700">{displayName}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

