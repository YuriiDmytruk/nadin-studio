'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SetType } from '@/types/product'
import { ProductFilters } from '@/lib/services/products'
import { Search, X, Filter, Sparkles } from 'lucide-react'
import { getColorStyle, getColorDisplayName } from '@/lib/utils/color-helpers'

interface PublicFiltersSidebarProps {
    onFiltersChange: (filters: ProductFilters) => void
    priceRange: { min: number | null; max: number | null }
    uniqueColors: string[]
}

export default function PublicFiltersSidebar({
    onFiltersChange,
    priceRange,
    uniqueColors,
}: PublicFiltersSidebarProps) {
    const [search, setSearch] = useState('')
    const [selectedTypes, setSelectedTypes] = useState<SetType[]>([])
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [minPrice, setMinPrice] = useState<string>('')
    const [maxPrice, setMaxPrice] = useState<string>('')

    const allTypes: SetType[] = ['western', 'jumping', 'dressage', 'other']

    const filters = useMemo(() => {
        const result: ProductFilters = {}
        if (search.trim()) result.search = search.trim()
        if (selectedTypes.length > 0) result.setTypes = selectedTypes
        if (selectedColors.length > 0) result.colors = selectedColors
        if (minPrice) result.minPrice = parseFloat(minPrice)
        if (maxPrice) result.maxPrice = parseFloat(maxPrice)
        return result
    }, [search, selectedTypes, selectedColors, minPrice, maxPrice])

    const prevFiltersRef = useRef<string | null>(null)
    const onFiltersChangeRef = useRef(onFiltersChange)
    const isInitialMount = useRef(true)

    useEffect(() => {
        onFiltersChangeRef.current = onFiltersChange
    }, [onFiltersChange])

    useEffect(() => {
        const filtersString = JSON.stringify(filters)

        if (isInitialMount.current) {
            isInitialMount.current = false
            prevFiltersRef.current = filtersString
            return
        }

        if (filtersString !== prevFiltersRef.current) {
            prevFiltersRef.current = filtersString
            onFiltersChangeRef.current(filters)
        }
    }, [filters])

    const toggleType = (type: SetType) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    const toggleColor = (color: string) => {
        setSelectedColors(prev =>
            prev.includes(color)
                ? prev.filter(c => c !== color)
                : [...prev, color]
        )
    }

    const clearFilters = () => {
        setSearch('')
        setSelectedTypes([])
        setSelectedColors([])
        setMinPrice('')
        setMaxPrice('')
    }

    const hasActiveFilters = search || selectedTypes.length > 0 || selectedColors.length > 0 || minPrice || maxPrice

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                <Filter className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Filters
                </h2>
                {hasActiveFilters && (
                    <span className="ml-auto px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                        Active
                    </span>
                )}
            </div>

            {/* Search */}
            <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                </Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        id="search"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-10 h-10 border-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Set Type */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Set Type</Label>
                <div className="flex flex-col gap-2">
                    {allTypes.map((type) => {
                        const isSelected = selectedTypes.includes(type)
                        return (
                            <Button
                                key={type}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleType(type)}
                                className={`w-full justify-start transition-all duration-200 ${isSelected
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg'
                                        : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 border-2'
                                    }`}
                            >
                                {isSelected && <Sparkles className="h-3 w-3 mr-2" />}
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Button>
                        )
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Price Range</Label>
                <div className="space-y-2">
                    <Input
                        type="number"
                        placeholder={priceRange.min?.toString() || 'Min'}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-10 border-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                    />
                    <Input
                        type="number"
                        placeholder={priceRange.max?.toString() || 'Max'}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-10 border-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                    />
                </div>
            </div>

            {/* Colors */}
            {uniqueColors.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Colors</Label>
                    <div className="flex flex-col gap-2">
                        {uniqueColors.map((color) => {
                            const isSelected = selectedColors.includes(color)
                            const colorHex = getColorStyle(color)
                            const displayName = getColorDisplayName(color)
                            return (
                                <button
                                    key={color}
                                    onClick={() => toggleColor(color)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
                                        transition-all duration-200 border-2 text-left
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md border-transparent'
                                            : 'bg-white hover:bg-purple-50 border-slate-200 hover:border-purple-300 text-slate-700'
                                        }
                                    `}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0"
                                        style={{ backgroundColor: colorHex }}
                                    />
                                    <span className="flex-1">{displayName}</span>
                                    {isSelected && <Sparkles className="h-3 w-3 shrink-0" />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full h-10 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all"
                >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                </Button>
            )}
        </div>
    )
}

