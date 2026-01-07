"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { OnboardingTour, type TourStep } from "./onboarding-tour"

interface OnboardingContextType {
  startTour: () => void
  completeOnboarding: () => void
  hasCompletedOnboarding: boolean
  isTourActive: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_STORAGE_KEY = "marketpilot_onboarding_completed"

// Default tour steps
const defaultTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to MarketPilot AI! 🎉",
    description: "Let's take a quick tour to help you get started. We'll show you the key features and how to use them.",
    position: "center",
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description: "This is your command center. Here you'll see all your scheduled posts, active campaigns, and analytics at a glance.",
    target: "[data-tour='dashboard']",
    position: "bottom",
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Use these quick action cards to create posts, start campaigns, or repurpose content. Click any card to get started!",
    target: "[data-tour='quick-actions']",
    position: "bottom",
  },
  {
    id: "create-post",
    title: "Create Your First Post",
    description: "Click 'Create New Post' to schedule content for your social media platforms. You can use AI to generate or optimize your content!",
    target: "[data-tour='create-post']",
    position: "top",
  },
  {
    id: "scheduler",
    title: "Schedule Posts",
    description: "Navigate to the Scheduler to manage all your posts. You can bulk edit, export, and organize your content here.",
    target: "[data-tour='scheduler-link']",
    position: "right",
  },
  {
    id: "analytics",
    title: "Track Performance",
    description: "Check your Analytics to see how your posts are performing. Get insights and optimize your strategy.",
    target: "[data-tour='analytics-link']",
    position: "right",
  },
  {
    id: "complete",
    title: "You're All Set! 🚀",
    description: "You're ready to start creating amazing content! Need help? Click the help icon in the top right corner anytime.",
    position: "center",
  },
]

interface OnboardingProviderProps {
  children: ReactNode
  customSteps?: TourStep[]
}

export function OnboardingProvider({ children, customSteps }: OnboardingProviderProps) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const [isTourActive, setIsTourActive] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    setHasCompletedOnboarding(completed === "true")
  }, [])

  const startTour = () => {
    setIsTourActive(true)
  }

  const completeOnboarding = () => {
    setIsTourActive(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
  }

  const skipTour = () => {
    setIsTourActive(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
  }

  const steps = customSteps || defaultTourSteps

  return (
    <OnboardingContext.Provider
      value={{
        startTour,
        completeOnboarding,
        hasCompletedOnboarding,
        isTourActive,
      }}
    >
      {children}
      {isTourActive && (
        <OnboardingTour
          steps={steps}
          onComplete={completeOnboarding}
          onSkip={skipTour}
        />
      )}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}


