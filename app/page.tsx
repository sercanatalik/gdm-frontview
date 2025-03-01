"use client"
import { ModeToggle } from "@/components/mode-toggle"

import Image from "next/image" // Add this import
import { useTheme } from "next-themes" // Add this import at the top of the file
import hsbcLogo from "@/public/hsbc.svg"
import hsbcDarkLogo from "@/public/hsbc-dark.svg" // Add this import
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const { theme } = useTheme() // Add this line

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/financing/dashboard")
    }, 1000) // Redirect after 1 seconds

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="flex justify-between items-center py-4 px-4 w-full">
        <div className="flex items-center"></div>
        <ModeToggle />
      </header>
      <main className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <Image
              src={theme === "dark" ? hsbcDarkLogo : hsbcLogo}
              alt="GDM Frontview Logo"
              width={125}
              height={125}
              className="mr-4"
            />
            <div className="flex flex-col items-start">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                GDM Frontview
              </h1>
              <p className="text-sm text-left font-[family-name:var(--font-geist-mono)] ">
                intuitive frontend solution
              </p>
            </div>
          </div>
          <div className="loading-spinner"></div>
          <p className="mt-4">Loading financing dashboard...</p>
        </div>
      </main>
      <style jsx>{`
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s ease infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

