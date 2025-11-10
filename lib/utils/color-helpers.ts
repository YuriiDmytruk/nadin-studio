/**
 * Get hex color value from color name or hex string
 */
export function getColorStyle(color: string): string {
    // If color is already a hex value (starts with #), use it directly
    if (color.startsWith('#')) {
        return color.toUpperCase()
    }

    // Otherwise, try to map color names to hex values
    const colorMap: Record<string, string> = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#EF4444',
        'blue': '#3B82F6',
        'green': '#10B981',
        'yellow': '#F59E0B',
        'purple': '#8B5CF6',
        'pink': '#EC4899',
        'brown': '#92400E',
        'gray': '#6B7280',
        'navy': '#1E3A8A',
        'tan': '#D97706',
    }
    return colorMap[color.toLowerCase()] || color
}

/**
 * Get display name for color (friendly name or hex)
 */
export function getColorDisplayName(color: string): string {
    // If it's a hex value, try to get a friendly name
    if (color.startsWith('#')) {
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
        return colorNames[color.toUpperCase()] || color
    }
    return color
}

