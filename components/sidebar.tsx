"use client"

import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  Settings,
  Shield,
  AlertTriangle,
  Users,
  Calendar,
  Menu,
  X,
  Database,
  UserCircle,
  GraduationCap,
  FileBarChart,
  Bot,
  AlertOctagon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useMobile()
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard", href: "/" },
    { icon: AlertTriangle, label: "Risk Assessment", href: "/risks" },
    { icon: Database, label: "Assets", href: "/assets" },
    { icon: AlertOctagon, label: "Non Conformities", href: "/nonconformities" },
    { icon: Bot, label: "AI Assistant", href: "/ai-assistant" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: Calendar, label: "Audits", href: "/audits" },
    { icon: ClipboardCheck, label: "Tasks", href: "/tasks" },
    { icon: GraduationCap, label: "Training", href: "/training" },
    { icon: Shield, label: "Compliance", href: "/compliance" },
    { icon: FileBarChart, label: "Reports", href: "/reports" },
    { icon: UserCircle, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const mainItems = sidebarItems.filter(item => item.label !== "Settings");
  const settingsItem = sidebarItems.find(item => item.label === "Settings");

  const sidebarWidth = collapsed ? "w-16" : "w-64"

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <div
              className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Image src="/LOGO.png" alt="ISMS Planner" width={60} height={60} className="rounded-lg" />
                  <h2 className="text-lg font-bold">ISMS Planner</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={`h-screen border-r shrink-0 ${sidebarWidth} transition-all duration-300 p-4`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Image src="/LOGO.png" alt="ISMS planner" width={60} height={60} className="rounded-lg" />
          {!collapsed && <h2 className="text-lg font-bold">ISMS Planner</h2>}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex flex-col h-full">
        {/* Top Section */}
        <div className="space-y-1.5">
          {mainItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
        
        {/* Bottom Section (Fixed Settings) */}
        {settingsItem && (
          <div className="border-t border-border pt-4 mt-6">
            <Link
              href={settingsItem.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <settingsItem.icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
              {!collapsed && <span>{settingsItem.label}</span>}
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}

