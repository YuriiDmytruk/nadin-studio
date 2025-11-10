'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/types/product'
import { Card } from '@/components/ui/card'
import { getColorStyle, getColorDisplayName } from '@/lib/utils/color-helpers'

interface PublicProductCardProps {
    product: Product
}

export default function PublicProductCard({ product }: PublicProductCardProps) {
    const router = useRouter()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const images = product.imageURLs || []
    const currentImage = images.length > 0 ? images[currentImageIndex] : null
    const hasMultipleImages = images.length > 1

    const handleMouseEnter = () => {
        if (hasMultipleImages) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }
    }

    const handleClick = () => {
        router.push(`/products/${product.id}`)
    }

    return (
        <Card
            className="group cursor-pointer overflow-hidden bg-white border-2 border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
            onClick={handleClick}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {currentImage ? (
                    <img
                        src={currentImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onMouseEnter={handleMouseEnter}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <span className="text-sm font-medium">No Image</span>
                    </div>
                )}

                {/* Image Indicator Dots */}
                {hasMultipleImages && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                                    ? 'w-6 bg-white'
                                    : 'w-1.5 bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Price Badge */}
                {product.price !== null && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg">
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title and Type */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {product.name}
                    </h3>
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200 capitalize">
                        {product.setType}
                    </span>
                </div>

                {/* Description */}
                {product.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-slate-500">Colors:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {product.colors.slice(0, 4).map((color, index) => {
                                const colorHex = getColorStyle(color)
                                return (
                                    <div
                                        key={index}
                                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
                                        style={{ backgroundColor: colorHex }}
                                        title={getColorDisplayName(color)}
                                    />
                                )
                            })}
                            {product.colors.length > 4 && (
                                <span className="text-xs text-slate-500 font-medium">
                                    +{product.colors.length - 4}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    )
}

