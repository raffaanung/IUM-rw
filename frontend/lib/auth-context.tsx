"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "./types"

const API_URL = "http://localhost:8001/api"
const STORAGE_KEY = "siwarga_session"
const TOKEN_KEY = "siwarga_token"
const FIXED_RW = "08"

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null
  
  // Jika body adalah FormData, biarkan browser menentukan Content-Type (untuk upload file)
  const isFormData = options.body instanceof FormData
  
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }

  return response
}

interface AuthContextValue {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fungsi helper untuk normalisasi role
  const normalizeRole = (role: string | undefined, username?: string): Role => {
    const r = role?.toLowerCase()
    if (r === "rw" || r === "super-admin") return "super-admin"
    if (r === "rt" || r === "admin") return "admin"
    
    // Fallback berdasarkan username jika role kosong (bug database)
    if (username === "superadmin") return "super-admin"
    if (username?.startsWith("admin")) return "admin"
    
    return "warga"
  }

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedUser = JSON.parse(stored)
        
        // Pastikan role ternormalisasi
        parsedUser.role = normalizeRole(parsedUser.role, parsedUser.username)
        parsedUser.rw = FIXED_RW
        setUser(parsedUser)
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ username, password }),
        mode: "cors",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, message: data.message || "Login gagal" }
      }

      const loggedInUser: User = {
        id: String(data.user.id),
        username: data.user.username,
        nama: data.user.name,
        role: normalizeRole(data.user.role, data.user.username),
        rt: data.user.rt ?? undefined,
        rw: FIXED_RW,
        nik: data.user.nik,
      }

      sessionStorage.setItem(TOKEN_KEY, data.token)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
      setUser(loggedInUser)

      const target =
        loggedInUser.role === "super-admin"
          ? "/super-admin/dashboard"
          : loggedInUser.role === "admin"
            ? "/admin/dashboard"
            : "/warga/dashboard"

      router.push(target)
      return { success: true }

    } catch {
      return { success: false, message: "Tidak dapat terhubung ke server" }
    }
  }

  const logout = async () => {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY)
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        })
      }
    } catch {
      // ignore
    }
    setUser(null)
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}
