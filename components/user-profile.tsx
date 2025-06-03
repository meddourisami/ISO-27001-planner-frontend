"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { LogOut, Smartphone } from "lucide-react"
import MfaSetup from "@/components/mfa-setup"
import { updateProfile, changePassword, logout, disableMfa, getCurrentUserDetails, resendMfa, enableMfa } from "@/lib/auth"

interface UserProfileProps {
  user: {
    id: string
    fullName: string
    email: string
    role: string
    mfaEnabled: boolean
  }
  onProfileRefresh?: () => void
}

export default function UserProfile({ user, onProfileRefresh }: UserProfileProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("account")
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    fullName: user.fullName ?? "",
    email: user.email ?? "",
  })

  useEffect(() => {
    setProfileData({
      fullName: user.fullName,
      email: user.email
    });
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [mfaEnabled, setMfaEnabled] = useState<boolean>(user.mfaEnabled)

  useEffect(() => {
    setMfaEnabled(user.mfaEnabled)
  }, [user.mfaEnabled])

  /*useEffect(() => {
    const fetchUser = async () => {
      try {
        const latest = await getCurrentUserDetails()
        setCurrentUser(latest)
        setMfaEnabled(latest.mfaEnabled)
        setProfileData({ name: latest.name, email: latest.email })
      } catch {
        toast({ title: "Failed to load user", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])*/

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      await updateProfile(profileData)
      console.log(profileData,"changes made")
      toast({ title: "Profile Updated", description: "Changes saved." })
      const updatedUser = await getCurrentUserDetails();
      console.log(updatedUser, "updated user" )
      setProfileData({ fullName: updatedUser.fullName, email: updatedUser.email }); // Update state

      await onProfileRefresh?.();
    } catch (error) {
      toast({ title: "Update Failed", description: error?.response?.data?.message || error?.message || "Please try again.", variant: "destructive" })
      console.log(error?.response?.data?.message, error?.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      })
    } catch (error:any ){
      toast({
        title: "Change Failed",
        description: error?.response?.data?.message || error?.message || "Failed to change password. Please check your current password.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/login"
    } catch {
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMfaToggle = async (checked: boolean) => {
    if (checked && !mfaEnabled) {
      try {
        console.log(user.email, "the user email", user.id , "the user id" )
        await enableMfa(user.email)      
        await resendMfa(user.email)      
        setShowMfaSetup(true)
      } catch {
        toast({
          title: "Failed to start MFA",
          description: "Could not send verification code. Try again.",
          variant: "destructive",
        })
      }
    } else if (!checked && mfaEnabled) {
      try {
        await disableMfa(user.email)
        setMfaEnabled(false)
        toast({
          title: "MFA Disabled",
          description: "Two-factor authentication has been turned off.",
        })
      } catch {
        toast({
          title: "Disable Failed",
          description: "Unable to disable MFA. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleMfaSetupComplete = async () => {
    setShowMfaSetup(false)
    await onProfileRefresh?.()
    setMfaEnabled(true)
  }

  const handleMfaSetupCancel = async () => {
  try {
    await disableMfa(user.email) // Treat cancel as a disable
    setShowMfaSetup(false)
    setMfaEnabled(false)
  } catch {
    toast({
      title: "Cancel Failed",
      description: "Could not cancel MFA setup. Try again.",
      variant: "destructive",
    })
  }
}

  if (showMfaSetup) {
    return (
      <MfaSetup
        userId={user.email}
        onComplete={handleMfaSetupComplete}
        onCancel={handleMfaSetupCancel}
      />
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">User Profile</CardTitle>
        <CardDescription>Manage your account settings and security preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.fullName ?? ""}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email ?? ""}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user.role} disabled />
              <p className="text-xs text-muted-foreground mt-1">Contact your administrator to change your role.</p>
            </div>
            <Button onClick={handleProfileUpdate} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Change Password</h3>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={isLoading}>
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mfa">
                    {mfaEnabled ? "Two-Factor Authentication is enabled" : "Enable Two-Factor Authentication"}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch id="mfa" checked={mfaEnabled} onCheckedChange={handleMfaToggle} />
              </div>
              {mfaEnabled && (
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Two-factor authentication is active
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Session</h3>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}