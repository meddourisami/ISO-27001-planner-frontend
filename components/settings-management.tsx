"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building, Download, FileUp, Mail, Plus, Save, Settings, Trash2, Upload, UserCog, Users } from "lucide-react"

export default function SettingsManagement() {
  const [activeTab, setActiveTab] = useState("general")
  const [organizationName, setOrganizationName] = useState("Acme Corporation")
  const [ismsScope, setIsmsScope] = useState(
    "All information systems and processes supporting core business operations including customer data management, financial systems, and internal communications.",
  )
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [auditLogRetention, setAuditLogRetention] = useState("90")
  const [theme, setTheme] = useState("system")
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [restoreInProgress, setRestoreInProgress] = useState(false)

  // Mock users data
  const [users, setUsers] = useState([
    { id: "1", name: "John Smith", email: "john@example.com", role: "Administrator", status: "active" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", role: "Security Officer", status: "active" },
    { id: "3", name: "Michael Chen", email: "michael@example.com", role: "Auditor", status: "active" },
    { id: "4", name: "Lisa Wong", email: "lisa@example.com", role: "Risk Manager", status: "inactive" },
    { id: "5", name: "David Miller", email: "david@example.com", role: "Compliance Manager", status: "active" },
  ])

  // Mock roles data
  const [roles, setRoles] = useState([
    {
      id: "1",
      name: "Administrator",
      description: "Full system access",
      permissions: ["read", "write", "delete", "admin"],
    },
    { id: "2", name: "Security Officer", description: "Manages security controls", permissions: ["read", "write"] },
    { id: "3", name: "Auditor", description: "Conducts audits", permissions: ["read"] },
    { id: "4", name: "Risk Manager", description: "Manages risks", permissions: ["read", "write"] },
    { id: "5", name: "Compliance Manager", description: "Manages compliance", permissions: ["read", "write"] },
  ])

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    status: "active",
  })

  // New role form state
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const handleSaveGeneralSettings = () => {
    // In a real app, this would save to backend
    alert("General settings saved successfully")
  }

  const handleSaveNotificationSettings = () => {
    // In a real app, this would save to backend
    alert("Notification settings saved successfully")
  }

  const handleSaveSystemSettings = () => {
    // In a real app, this would save to backend
    alert("System settings saved successfully")
  }

  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.role) {
      alert("Please fill in all required fields")
      return
    }

    // Add new user
    setUsers([
      ...users,
      {
        id: (users.length + 1).toString(),
        ...newUser,
      },
    ])

    // Reset form and close dialog
    setNewUser({
      name: "",
      email: "",
      role: "",
      status: "active",
    })
    setUserDialogOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  const handleAddRole = () => {
    // Validate form
    if (!newRole.name || !newRole.description || newRole.permissions.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    // Add new role
    setRoles([
      ...roles,
      {
        id: (roles.length + 1).toString(),
        ...newRole,
      },
    ])

    // Reset form and close dialog
    setNewRole({
      name: "",
      description: "",
      permissions: [],
    })
    setRoleDialogOpen(false)
  }

  const handleDeleteRole = (roleId: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((role) => role.id !== roleId))
    }
  }

  const handleBackupSystem = () => {
    setBackupInProgress(true)

    // Simulate backup process
    setTimeout(() => {
      setBackupInProgress(false)
      alert("System backup completed successfully")
    }, 2000)
  }

  const handleRestoreSystem = () => {
    setRestoreInProgress(true)

    // Simulate restore process
    setTimeout(() => {
      setRestoreInProgress(false)
      alert("System restore completed successfully")
    }, 3000)
  }

  const togglePermission = (permission: string) => {
    if (newRole.permissions.includes(permission)) {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter((p) => p !== permission),
      })
    } else {
      setNewRole({
        ...newRole,
        permissions: [...newRole.permissions, permission],
      })
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Organization Settings
              </CardTitle>
              <CardDescription>Configure your organization details and ISMS scope</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isms-scope">ISMS Scope</Label>
                <Textarea id="isms-scope" value={ismsScope} onChange={(e) => setIsmsScope(e.target.value)} rows={5} />
                <p className="text-xs text-muted-foreground">
                  Define the scope of your Information Security Management System (ISMS)
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneralSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage users and their access to the system</CardDescription>
                </div>
                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Create a new user account and assign permissions</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Full Name</Label>
                        <Input
                          id="user-name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger id="user-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-status">Status</Label>
                        <Select
                          value={newUser.status}
                          onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                        >
                          <SelectTrigger id="user-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser}>Add User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <UserCog className="mr-2 h-5 w-5" />
                    Role Management
                  </CardTitle>
                  <CardDescription>Manage roles and permissions</CardDescription>
                </div>
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Role</DialogTitle>
                      <DialogDescription>Create a new role with specific permissions</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                          id="role-name"
                          value={newRole.name}
                          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role-description">Description</Label>
                        <Textarea
                          id="role-description"
                          value={newRole.description}
                          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="perm-read"
                              checked={newRole.permissions.includes("read")}
                              onChange={() => togglePermission("read")}
                              className="rounded"
                            />
                            <Label htmlFor="perm-read">Read</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="perm-write"
                              checked={newRole.permissions.includes("write")}
                              onChange={() => togglePermission("write")}
                              className="rounded"
                            />
                            <Label htmlFor="perm-write">Write</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="perm-delete"
                              checked={newRole.permissions.includes("delete")}
                              onChange={() => togglePermission("delete")}
                              className="rounded"
                            />
                            <Label htmlFor="perm-delete">Delete</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="perm-admin"
                              checked={newRole.permissions.includes("admin")}
                              onChange={() => togglePermission("admin")}
                              className="rounded"
                            />
                            <Label htmlFor="perm-admin">Admin</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddRole}>Add Role</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <Badge key={permission} variant="outline">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure email notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-risks" defaultChecked className="rounded" />
                    <Label htmlFor="notify-risks">Risk updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-audits" defaultChecked className="rounded" />
                    <Label htmlFor="notify-audits">Upcoming audits</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-tasks" defaultChecked className="rounded" />
                    <Label htmlFor="notify-tasks">Task assignments and deadlines</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-incidents" defaultChecked className="rounded" />
                    <Label htmlFor="notify-incidents">Security incidents</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-compliance" defaultChecked className="rounded" />
                    <Label htmlFor="notify-compliance">Compliance status changes</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Notification Frequency</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotificationSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system preferences and maintenance options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-log-retention">Audit Log Retention (days)</Label>
                <Input
                  id="audit-log-retention"
                  type="number"
                  value={auditLogRetention}
                  onChange={(e) => setAuditLogRetention(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of days to retain audit logs before automatic deletion
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Backup and Restore</h3>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleBackupSystem}
                    disabled={backupInProgress}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {backupInProgress ? "Backing up..." : "Backup System Data"}
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleRestoreSystem}
                    disabled={restoreInProgress}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {restoreInProgress ? "Restoring..." : "Restore from Backup"}
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileUp className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Danger Zone</h3>
                <div className="border border-destructive/20 rounded-md p-3">
                  <div className="flex flex-col space-y-2">
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Data
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This action cannot be undone. All data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSystemSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

