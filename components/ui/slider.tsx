"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  max?: number
  min?: number
  step?: number
  onValueChange?: (value: number[]) => void
  className?: string
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, defaultValue, max = 100, min = 0, step = 1, onValueChange, disabled, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || [0])
    const currentValue = value !== undefined ? value : internalValue
    
    const handleChange = (index: number, newValue: number) => {
      const clampedValue = Math.max(min, Math.min(max, newValue))
      const newValues = [...currentValue]
      newValues[index] = clampedValue
      
      // Ensure values don't cross each other for range sliders
      if (newValues.length === 2) {
        if (index === 0 && newValues[0] > newValues[1]) {
          newValues[0] = newValues[1]
        }
        if (index === 1 && newValues[1] < newValues[0]) {
          newValues[1] = newValues[0]
        }
      }
      
      if (value === undefined) {
        setInternalValue(newValues)
      }
      onValueChange?.(newValues)
    }
    
    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

    // For range slider (2 values)
    if (currentValue.length === 2) {
      const leftPercent = getPercentage(currentValue[0])
      const rightPercent = getPercentage(currentValue[1])
      
      return (
        <div
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
          )}
          {...props}
        >
          <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <div 
              className="absolute h-full bg-primary"
              style={{ 
                left: `${leftPercent}%`, 
                width: `${rightPercent - leftPercent}%` 
              }}
            />
          </div>
          {currentValue.map((val, index) => (
            <input
              key={index}
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => handleChange(index, Number(e.target.value))}
              disabled={disabled}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer"
              style={{ zIndex: index === 0 ? 1 : 2 }}
            />
          ))}
        </div>
      )
    }

    // For single value slider
    const percentage = getPercentage(currentValue[0])
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div 
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={(e) => handleChange(0, Number(e.target.value))}
          disabled={disabled}
          className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }

