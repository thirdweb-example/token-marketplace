import React from "react"

const DefaultTokenIcon: React.FC<{ symbol: string }> = ({ symbol }) => {
  // Get the first character of the symbol for the fallback
  const firstChar = symbol.charAt(0).toUpperCase()

  // Generate a consistent color based on the symbol
  const getColorFromSymbol = (symbol: string) => {
    const colors = [
      "rgb(59, 130, 246)", // blue-500
      "rgb(16, 185, 129)", // green-500
      "rgb(239, 68, 68)", // red-500
      "rgb(249, 115, 22)", // orange-500
      "rgb(139, 92, 246)", // purple-500
      "rgb(236, 72, 153)", // pink-500
      "rgb(14, 165, 233)", // sky-500
      "rgb(168, 85, 247)", // violet-500
    ]

    // Simple hash function
    let hash = 0
    for (let i = 0; i < symbol.length; i++) {
      hash = (hash << 5) - hash + symbol.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }

    // Get a positive number and mod it by the length of colors
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const bgColor = getColorFromSymbol(symbol)

  return (
    <div
      className="w-full h-full flex items-center justify-center text-white font-bold"
      style={{ backgroundColor: bgColor }}
    >
      {firstChar}
    </div>
  )
}

export default DefaultTokenIcon; 