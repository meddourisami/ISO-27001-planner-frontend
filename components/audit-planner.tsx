"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Filter, ArrowUpDown, Calendar, CheckCircle2, XCircle } from "lucide-react"
import type { AppDispatch, RootState } from "@/lib/store"
import { addAuditAsync, deleteAuditAsync, fetchAuditsAsync, updateAuditAsync } from "@/lib/features/audits/auditsSlice"
import { useAuthTokenRefresh } from "@/hooks/useAuthTokenRefresh"
import { useToast } from "@/hooks/use-toast"
import { AuditDto } from "@/types"

export default function AuditPlanner() {
  const audits = useSelector((state: RootState) => state.audits.items)
  const loading = useSelector((s: RootState) => s.audits.loading);
  const dispatch = useDispatch<AppDispatch>()

  const { toast } = useToast()

  const user = useSelector((state: RootState) => state.auth.user)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("asc")

  const [newAudit, setNewAudit] = useState({
    id: "",
    title: "",
    description: "",
    type: "internal",
    scope: "",
    date: "",
    endDate: "",
    status: "planned",
    auditor: "",
    findings: "",
    nonConformities: 0,
    observations: 0,
    recommendations: 0,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user?.companyId) {
      dispatch(fetchAuditsAsync(user.companyId));
    }
  }, [user?.companyId, dispatch]);

  const handleAddAudit = async () => {
    if (!user?.companyId) {
      toast({
        title: 'Missing Company ID',
        description: '...',
        variant: 'destructive',
      })
      return
    }

    const dto: AuditDto = {
      ...newAudit,
      auditor: user.email,
      companyId: user.companyId,
      id: isEditing ? newAudit.id : undefined
    };

    try {
      if (isEditing) {
        await dispatch(updateAuditAsync(dto)).unwrap();
        toast({
          title: "Audit Updated",
          description: "Audit details have been successfully updated.",
        });
      } else {
        await dispatch(addAuditAsync(dto)).unwrap();
        toast({
          title: "Audit Added",
          description: "New audit has been successfully created.",
        });
      }
      resetForm();
      setDialogOpen(false);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: typeof e === "string" ? e : e?.message ?? "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };


  const resetForm = () => {
    setNewAudit({
      id: "",
      title: "",
      description: "",
      type: "internal",
      scope: "",
      date: "",
      endDate: "",
      status: "planned",
      auditor: "",
      findings: "",
      nonConformities: 0,
      observations: 0,
      recommendations: 0,
    })
    setIsEditing(false)
  }

  const handleEdit = (audit: any) => {
    setNewAudit(audit)
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this audit?")) return;

      await dispatch(deleteAuditAsync(id)).unwrap();
      toast({
        title: "Audit Deleted",
        description: "The audit has been removed.",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: typeof e === "string" ? e : e?.message ?? "Failed to delete audit.",
        variant: "destructive",
      });
    }
  };

  const filteredAudits = audits
    .filter(
      (audit) =>
        audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((audit) => (filterType === "all" ? true : audit.type === filterType))
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "in-progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Planner</CardTitle>
              <CardDescription>Plan and track internal and external audits</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Audit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader className="sticky top-0 bg-white z-10">
                  <DialogTitle>{isEditing ? "Edit Audit" : "Schedule New Audit"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Update the audit details below" : "Fill in the details to schedule a new audit"}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto px-2 py-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Audit Title</Label>
                      <Input
                        id="title"
                        value={newAudit.title}
                        onChange={(e) => setNewAudit({ ...newAudit, title: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newAudit.description}
                        onChange={(e) => setNewAudit({ ...newAudit, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Audit Type</Label>
                      <Select
                        value={newAudit.type}
                        onValueChange={(value) => setNewAudit({ ...newAudit, type: value })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                          <SelectItem value="surveillance">Surveillance</SelectItem>
                          <SelectItem value="certification">Certification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newAudit.status}
                        onValueChange={(value) => setNewAudit({ ...newAudit, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Start Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAudit.date}
                        onChange={(e) => setNewAudit({ ...newAudit, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newAudit.endDate}
                        onChange={(e) => setNewAudit({ ...newAudit, endDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="auditor">Auditor</Label>
                      <Input
                        id="auditor"
                        value={newAudit.auditor}
                        onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="scope">Audit Scope</Label>
                      <Textarea
                        id="scope"
                        value={newAudit.scope}
                        onChange={(e) => setNewAudit({ ...newAudit, scope: e.target.value })}
                        placeholder="Define the scope of the audit"
                      />
                    </div>
                    {newAudit.status === "completed" && (
                      <>
                        <div className="col-span-2">
                          <Label htmlFor="findings">Findings</Label>
                          <Textarea
                            id="findings"
                            value={newAudit.findings}
                            onChange={(e) => setNewAudit({ ...newAudit, findings: e.target.value })}
                            placeholder="Document audit findings"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nonConformities">Non-Conformities</Label>
                          <Input
                            id="nonConformities"
                            type="number"
                            value={newAudit.nonConformities.toString()}
                            onChange={(e) =>
                              setNewAudit({ ...newAudit, nonConformities: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="observations">Observations</Label>
                          <Input
                            id="observations"
                            type="number"
                            value={newAudit.observations.toString()}
                            onChange={(e) =>
                              setNewAudit({ ...newAudit, observations: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="recommendations">Recommendations</Label>
                          <Input
                            id="recommendations"
                            type="number"
                            value={newAudit.recommendations.toString()}
                            onChange={(e) =>
                              setNewAudit({ ...newAudit, recommendations: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddAudit}>{isEditing ? "Update Audit" : "Schedule Audit"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audits..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="surveillance">Surveillance</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => {
                      setSortBy("title")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Audit
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => {
                      setSortBy("type")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => {
                      setSortBy("date")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => {
                      setSortBy("status")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => {
                      setSortBy("auditor")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Auditor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No audits found. Schedule a new audit to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {audit.title}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{audit.type}</TableCell>
                    <TableCell>{new Date(audit.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(audit.status)}>
                        {audit.status.charAt(0).toUpperCase() + audit.status.slice(1).replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(audit)}>
                          Edit
                        </Button>
                        {audit.status === "completed" ? (
                          <Button variant="ghost" size="icon">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon">
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAudits.length} of {audits.length} audits
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

