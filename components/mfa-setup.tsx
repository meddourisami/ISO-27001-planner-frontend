"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { resendMfa, enableMfa, verifyMfaSetup } from "@/lib/auth"

interface MfaSetupProps {
  userId: string
  onComplete: () => void
  onCancel: () => void
}

export default function MfaSetup({ userId, onComplete, onCancel }: MfaSetupProps) {
  const { toast } = useToast()
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    toast({
      title: "Verification Code Sent",
      description: "Check your email for the code.",
    })
    setResendCooldown(60)
    startCooldown()
  }, [])

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "The verification code must be 6 digits.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await verifyMfaSetup(userId, verificationCode)
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      })
      onComplete()
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error?.response?.data?.message || error?.message || "Incorrect verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await resendMfa(userId)
      toast({
        title: "Verification Code Resent",
        description: "A new code has been sent to your email.",
      })
      setResendCooldown(60)
      startCooldown()
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: "Could not resend code. Try again later.",
        variant: "destructive",
      })
    }
  }

  const startCooldown = () => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Enable Two-Factor Authentication</h2>
        <p className="text-muted-foreground">A one-time code was sent to your email.</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="code">Verification Code</Label>
        <Input
          id="code"
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          className="tracking-widest text-center"
          required
        />
        <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6} className="w-full">
          {isLoading ? "Verifying..." : "Verify & Enable MFA"}
        </Button>
        <Button variant="outline" onClick={handleResend} disabled={resendCooldown > 0} className="w-full">
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  )
}