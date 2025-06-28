"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { login, resendMfa, verifyMfa } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Lock, User, KeyRound, Smartphone, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/store"
import { fetchCurrentUser, loginAsync, resendMfaCode, verifyMfaAsync } from "@/lib/features/auth/authSlice"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const { mfaRequired, mfaEmail, user, status } = useSelector((state: RootState) => state.auth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showMfa, setShowMfa] = useState(false)
  const [mfaCode, setMfaCode] = useState("")
  const [resendTimeout, setResendTimeout] = useState(0)
  const [localMfaEmail, setLocalMfaEmail] = useState<string>("")

  const startResendTimer = useCallback(() => {
    setResendTimeout(30) // 30 seconds cooldown before resending code
  }, [])

  useEffect(() => {
    if (user) router.push("/")
  }, [user, router])
  


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await dispatch(loginAsync({ email, password })).unwrap();

      if (result.mfaRequired) {
        setShowMfa(true);                // Show MFA UI
        setLocalMfaEmail(result.email);
        toast({ title: "MFA Required", description: "Check your email." });
        startResendTimer();
      } else {
        const user = await dispatch(fetchCurrentUser()).unwrap();
        toast({ title: "Login Successful", description: "Welcome!" });
        
        if (user.role === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      toast({ title: "Login Failed", description: err, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await dispatch(verifyMfaAsync({ email: localMfaEmail, code: mfaCode })).unwrap();
    await dispatch(fetchCurrentUser());
    toast({ title: "Login Successful", description: "Welcome!" });
    router.push("/");
  } catch (err: any) {
    toast({ title: "MFA Failed", description: err, variant: "destructive" });
  } finally {
    setIsLoading(false);
  }
};


  const handleResendCode = async () => {
    if (resendTimeout > 0 || !localMfaEmail) return;
    try {
      await dispatch(resendMfaCode(localMfaEmail)).unwrap();
      toast({
        title: "Code Resent",
        description: "A new MFA code has been sent.",
      })
      startResendTimer()
    } catch {
      toast({
        title: "Resend Failed",
        description: "Unable to resend MFA code.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (resendTimeout <= 0) return

    const timerId = setInterval(() => {
      setResendTimeout((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timerId)
  }, [resendTimeout])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4">
        {!showMfa ? (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <Image src="/LOGO.png" alt="ISMS Planner" width={120} height={120} priority className="rounded-lg" />
              </div>
              <CardTitle className="text-2xl text-center">ISMS Planner</CardTitle>
              <CardDescription className="text-center">
                Contact us in ProtectedConsulting.com or email us in ProtectedConsulting@gmail.com to set up your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          autoComplete="current-password"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          tabIndex={-1}
                        >
                          
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-center">
                Enter the verification code sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMfaVerify} className="space-y-4" noValidate>
                <Label htmlFor="mfa-code">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mfa-code"
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-10 text-center tracking-widest"
                    maxLength={6}
                    required
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || mfaCode.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleResendCode}
                  disabled={isLoading || resendTimeout > 0}
                >
                  {resendTimeout > 0 ? `Resend in ${resendTimeout}s` : "Resend Code"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}