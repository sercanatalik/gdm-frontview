'use client'
import { useState } from "react"
import { useRouter } from "next/navigation" // Add this import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import Image from "next/image"
import hsbcLogo from "@/public/hsbc.svg"

export default function Login() {
  localStorage.clear()
  const router = useRouter() // Add this line
  const [showPassword, setShowPassword] = useState(false)
  const [userid, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("") // Add this line

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("") // Clear any previous errors
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, password }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Login failed. Please check your credentials and try again.")
        return
      }
      
      // Use router.push for navigation after successful login
      router.push('/financing/dashboard')
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    }
  }

  const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "")
    setUserId(value)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-xs space-y-4">
        <div className="flex items-center justify-center mb-6">
          <Image
            src={hsbcLogo}
            alt="GDM Frontview Logo"
            width={50}
            height={50}
            className="mr-3"
          />
          <div>
            <h1 className="text-1xl font-bold text-black ">GDM Frontview</h1>
            <p className="text-xs text-gray-600 font-mono">intuitive frontend solution</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-md">
          {error && ( // Add this block
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          {/* User ID input */}
          <Input
            id="userId"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="User ID"
            value={userid}
            onChange={handleUserIdChange}
            required
          />

          {/* Password input */}
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
