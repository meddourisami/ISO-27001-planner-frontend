"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileText, X } from "lucide-react"
import { AppDispatch, RootState } from "@/lib/store"
import { useDispatch, useSelector } from "react-redux"
import { fetchNotificationsAsync, markAllReadAsync, markReadAsync } from "@/lib/features/notifications/notificationsSlice"

interface NotificationsPanelProps {
  onClose: () => void
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const notifications = useSelector((state: RootState) => state.notifications.items);
  const loading = useSelector((state: RootState) => state.notifications.loading);
  
  const [activeTab, setActiveTab] = useState<'all'|'alert'|'info'>('all');

  const handleMarkAll = () => {
    if (user?.companyId) dispatch(markAllReadAsync(user.companyId));
  };

  const handleMarkOne = (id: string) => dispatch(markReadAsync(id));

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    return notification.category === activeTab
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "audit":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "task":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "document":
        return <FileText className="h-5 w-5 text-purple-500" />
      case "compliance":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "training":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes} minutes ago`
      }
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Notifications</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "alert" | "info")}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="alert">Alerts</TabsTrigger>
            <TabsTrigger value="action">Actions</TabsTrigger>
            <TabsTrigger value="reminder">Reminders</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            <div className="max-h-[400px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications found</div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b flex items-start gap-3 hover:bg-accent/50 cursor-pointer ${notification.read ? "opacity-70" : ""}`}
                    onClick={() => !notification.read && handleMarkOne(notification.id)}
                  >
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>}
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-primary" onClick={handleMarkAll}>
                Mark all as read
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

