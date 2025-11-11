'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SetType } from '@/types/product'
import { createProductAction, uploadImageAction } from '../actions/products'
import { X, Upload, Plus, Package, Sparkles, Image as ImageIcon, DollarSign, Type, Palette, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AddProduct() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [setType, setSetType] = useState<SetType | ''>('')
    const [colors, setColors] = useState<string[]>([]) // Store hex colors like "#FF5733"
    const [selectedColorHex, setSelectedColorHex] = useState('#3B82F6') // Default blue
    const [images, setImages] = useState<File[]>([])
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

    const allTypes: SetType[] = ['western', 'jumping', 'dressage', 'other']

    const addColor = () => {
        const hexColor = selectedColorHex.toUpperCase()
        // Validate hex color format
        if (/^#[0-9A-F]{6}$/i.test(hexColor) && !colors.includes(hexColor)) {
            setColors([...colors, hexColor])
            // Reset to default color for next pick
            setSelectedColorHex('#3B82F6')
        }
    }

    const removeColor = (colorToRemove: string) => {
        setColors(colors.filter(c => c !== colorToRemove))
    }

    // Get color name or hex value for display
    const getColorDisplayName = (hex: string) => {
        // Try to match common color names
        const colorNames: Record<string, string> = {
            '#000000': 'Black',
            '#FFFFFF': 'White',
            '#FF0000': 'Red',
            '#00FF00': 'Green',
            '#0000FF': 'Blue',
            '#FFFF00': 'Yellow',
            '#FF00FF': 'Magenta',
            '#00FFFF': 'Cyan',
            '#FFA500': 'Orange',
            '#800080': 'Purple',
            '#FFC0CB': 'Pink',
            '#A52A2A': 'Brown',
            '#808080': 'Gray',
            '#000080': 'Navy',
            '#D2B48C': 'Tan',
        }
        return colorNames[hex.toUpperCase()] || hex
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
        const MAX_TOTAL_SIZE = 100 * 1024 * 1024 // 100MB total

        // Validate individual file sizes
        const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE)
        if (oversizedFiles.length > 0) {
            setError(`Some files exceed the 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`)
            return
        }

        // Calculate total size
        const currentTotalSize = images.reduce((sum, img) => sum + img.size, 0)
        const newFilesTotalSize = files.reduce((sum, file) => sum + file.size, 0)
        const totalSize = currentTotalSize + newFilesTotalSize

        if (totalSize > MAX_TOTAL_SIZE) {
            setError(`Total file size exceeds 100MB limit. Current: ${(currentTotalSize / (1024 * 1024)).toFixed(2)}MB, Adding: ${(newFilesTotalSize / (1024 * 1024)).toFixed(2)}MB`)
            return
        }

        setImages([...images, ...files])
        setError('') // Clear any previous errors
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
        setUploadedImageUrls(uploadedImageUrls.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Validate all required fields
            if (!name.trim()) {
                setError('Name is required')
                setLoading(false)
                return
            }
            if (!description.trim()) {
                setError('Description is required')
                setLoading(false)
                return
            }
            if (!price || parseFloat(price) <= 0) {
                setError('Valid price is required')
                setLoading(false)
                return
            }
            if (!setType) {
                setError('Set type is required')
                setLoading(false)
                return
            }
            if (colors.length === 0) {
                setError('At least one color is required')
                setLoading(false)
                return
            }
            if (images.length === 0) {
                setError('At least one image is required')
                setLoading(false)
                return
            }

            // Upload all images
            const imageUrls: string[] = []
            for (const image of images) {
                const formData = new FormData()
                formData.append('file', image)
                const result = await uploadImageAction(formData)
                if (result.success && result.url) {
                    imageUrls.push(result.url)
                } else {
                    setError(result.error || 'Failed to upload image')
                    setLoading(false)
                    return
                }
            }

            // Create product
            const product = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                setType: setType as SetType,
                colors: colors,
                imageURLs: imageUrls,
            }

            const result = await createProductAction(product)

            if (result) {
                // Reset form
                setName('')
                setDescription('')
                setPrice('')
                setSetType('')
                setColors([])
                setImages([])
                setUploadedImageUrls([])

                // Refresh the page or redirect
                router.refresh()
                setError('')
                alert('Product created successfully!')
            } else {
                setError('Failed to create product')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Helper to validate hex color
    const isValidHex = (hex: string) => {
        return /^#[0-9A-F]{6}$/i.test(hex)
    }

    const isFormValid = name.trim() && description.trim() && price && parseFloat(price) > 0 && setType && colors.length > 0 && images.length > 0

    return (
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-purple-100!">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Add New Product
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">Fill in the details to create a new product</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200! flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900">Error</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Product Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product Name *
                    </Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter product name"
                        className="h-11 border-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Description *
                    </Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter product description"
                        rows={5}
                        className="border-2 focus:border-purple-500 focus:ring-purple-200 transition-all resize-none"
                        required
                    />
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price *
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className="h-11 pl-8 border-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Set Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Set Type *</Label>
                    <div className="flex flex-wrap gap-2">
                        {allTypes.map((type) => {
                            const isSelected = setType === type
                            return (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={isSelected ? 'default' : 'outline'}
                                    onClick={() => setSetType(type)}
                                    className={`
                                        transition-all duration-200 font-medium
                                        ${isSelected
                                            ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                                            : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 border-2'
                                        }
                                    `}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Button>
                            )
                        })}
                    </div>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Colors *
                    </Label>
                    <div className="space-y-3">
                        <div className="flex gap-3 items-end">
                            {/* Color Picker */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-xs text-slate-600">Pick Color</Label>
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={selectedColorHex}
                                        onChange={(e) => setSelectedColorHex(e.target.value)}
                                        className="h-12 w-20 cursor-pointer radius-full shadow-sm hover:shadow-md transition-all"
                                    />
                                </div>
                            </div>

                            {/* Hex Input */}
                            <div className="flex-1 flex flex-col gap-2">
                                <Label className="text-xs text-slate-600">Hex Color</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">#</span>
                                    <Input
                                        value={selectedColorHex.replace('#', '')}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
                                            if (value.length === 0) {
                                                setSelectedColorHex('#000000')
                                            } else {
                                                // Allow partial input while typing, pad to 6 digits
                                                const paddedValue = value.padEnd(6, '0')
                                                setSelectedColorHex('#' + paddedValue)
                                            }
                                        }}
                                        placeholder="FF5733"
                                        className="h-12 pl-8 pr-3 font-mono border-2 focus:border-purple-500 focus:ring-purple-200 transition-all"
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            {/* Add Button */}
                            <Button
                                type="button"
                                onClick={addColor}
                                disabled={!isValidHex(selectedColorHex) || colors.includes(selectedColorHex.toUpperCase())}
                                variant="outline"
                                className="h-12 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="size-4" />
                                Add
                            </Button>
                        </div>

                        {/* Selected Colors Display */}
                        {colors.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-600">
                                    Selected Colors ({colors.length})
                                </p>
                                <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-linear-to-br from-purple-50 to-pink-50 border border-purple-100!">
                                    {colors.map((colorHex, index) => {
                                        const displayName = getColorDisplayName(colorHex)
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-purple-200! shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full shadow-sm ring-1 ring-slate-200"
                                                    style={{ backgroundColor: colorHex }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900">{displayName}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeColor(colorHex)}
                                                    className="ml-1 p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Images *
                    </Label>
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="mb-2 text-sm font-semibold text-slate-700">
                                        <span className="text-purple-600">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">Max 10MB per image. Multiple images allowed.</p>
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-linear-to-br from-purple-100 to-pink-100 border border-purple-200! shadow-md hover:shadow-xl transition-all">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                            >
                                                <X className="size-4" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-xs text-white font-medium truncate">
                                                    {image.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t border-purple-100">
                    <Button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Create Product
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setName('')
                            setDescription('')
                            setPrice('')
                            setSetType('')
                            setColors([])
                            setImages([])
                            setUploadedImageUrls([])
                            setError('')
                        }}
                        className="h-12 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </form>
        </Card>
    )
}
