'use client'

import { Product } from '@/types/product'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { getColorStyle, getColorDisplayName } from '@/lib/utils/color-helpers'

interface ProductCardProps {
    product: Product
    onEdit: (product: Product) => void
    onDelete: (productId: number) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {

    const firstImage = product.imageURLs && product.imageURLs.length > 0 ? product.imageURLs[0] : null
    console.log(firstImage)

    return (
        <Card className="w-full bg-white/80 backdrop-blur-sm border-2 shadow-md">
            <div className="flex gap-6 p-6">
                {/* Image */}
                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 shadow-lg">
                    {firstImage ? (
                        <img
                            src={firstImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <span className="text-sm font-medium">No Image</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                                {product.name}
                            </h3>
                            <div className="inline-flex items-center gap-2">
                                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200 capitalize">
                                    {product.setType}
                                </span>
                            </div>
                        </div>
                        {product.price !== null && (
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ${product.price.toFixed(2)}
                            </div>
                        )}
                    </div>

                    {product.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    {product.colors && product.colors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-sm font-semibold text-slate-700">Colors:</span>
                            {product.colors.map((color, index) => {
                                const colorHex = getColorStyle(color)
                                const displayName = getColorDisplayName(color)
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                                            style={{ backgroundColor: colorHex }}
                                        />
                                        <span className="text-xs font-medium text-slate-700">{displayName}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className="mt-auto flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(product)}
                            className="flex-1 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 font-semibold transition-all"
                        >
                            <Pencil className="size-4" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(product.id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

