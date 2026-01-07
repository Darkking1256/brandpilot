"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle } from "lucide-react"
import { cn } from "@/utils/cn"

export interface TourStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for element to highlight
  position?: "top" | "bottom" | "left" | "right" | "center"
}

interface OnboardingTourProps {
  steps: TourStep[]
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentStepData = steps[currentStep]

  useEffect(() => {
    if (currentStepData?.target) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.querySelector(currentStepData.target!)
        if (element) {
          // Scroll element into view
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          
          // Get bounding rect after scroll
          setTimeout(() => {
            const rect = element.getBoundingClientRect()
            setTargetRect(rect)
            
            // Add highlight class
            element.classList.add("tour-highlight")
          }, 300)
          
          return () => {
            element.classList.remove("tour-highlight")
          }
        } else {
          setTargetRect(null)
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        // Clean up any previous highlight
        const prevElement = document.querySelector(".tour-highlight")
        if (prevElement) {
          prevElement.classList.remove("tour-highlight")
        }
      }
    } else {
      setTargetRect(null)
    }
  }, [currentStep, currentStepData])

  const handleNext = () => {
    // Remove highlight from current element
    const currentElement = document.querySelector(".tour-highlight")
    if (currentElement) {
      currentElement.classList.remove("tour-highlight")
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    // Remove highlight from current element
    const currentElement = document.querySelector(".tour-highlight")
    if (currentElement) {
      currentElement.classList.remove("tour-highlight")
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    // Remove highlight
    const currentElement = document.querySelector(".tour-highlight")
    if (currentElement) {
      currentElement.classList.remove("tour-highlight")
    }
    onSkip()
  }

  if (!currentStepData) return null

  // Calculate card position based on target element
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect || !currentStepData.target) {
      // Center the card
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }

    const position = currentStepData.position || "bottom"
    const padding = 20

    switch (position) {
      case "top":
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
        }
      case "bottom":
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: "translateX(-50%)",
        }
      case "left":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          right: `${window.innerWidth - targetRect.left + padding}px`,
          transform: "translateY(-50%)",
        }
      case "right":
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: "translateY(-50%)",
        }
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }
    }
  }

  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <>
      {/* Dark overlay with cutout for target element */}
      <div className="fixed inset-0 z-[9998]">
        {/* Full overlay */}
        <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />
        
        {/* Spotlight on target element */}
        {targetRect && (
          <div
            className="absolute bg-transparent transition-all duration-300 ease-out rounded-lg"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
              border: "3px solid rgb(59, 130, 246)",
            }}
          />
        )}
      </div>

      {/* Tooltip Card */}
      <div
        ref={cardRef}
        className="fixed z-[10000] pointer-events-auto transition-all duration-300"
        style={{
          maxWidth: "400px",
          width: "90vw",
          ...getCardStyle(),
        }}
      >
        <Card className="shadow-2xl border-2 border-blue-500 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  {isLastStep ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">Welcome Tour</CardTitle>
                  <CardDescription className="text-xs">
                    Step {currentStep + 1} of {steps.length}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    index <= currentStep ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="min-h-[60px]">
              <h3 className="font-semibold text-lg mb-2">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={cn(isFirstStep && "opacity-0 pointer-events-none")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSkip}>
                  Skip Tour
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {isLastStep ? "Get Started" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9999 !important;
          animation: tour-pulse 2s ease-in-out infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </>
  )
}
