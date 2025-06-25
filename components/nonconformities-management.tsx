"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Filter, ArrowUpDown, AlertTriangle, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { AppDispatch, type RootState } from "@/lib/store"
import {
  fetchNonConformitiesAsync,
  updateNonConformityAsync,
  addNonConformityAsync,
  deleteNonConformityAsync,
} from "@/lib/features/nonconformities/nonconformitiesSlice"
import { useToast } from "@/hooks/use-toast"
import { NonConformityDto } from "@/types"

export default function NonConformitiesManagement() {
  const { items: nonconformities, loading, error } = useSelector((state: RootState) => state.nonconformities)
  const controls = useSelector((state: RootState) => state.compliance.controls)
  const risks = useSelector((state: RootState) => state.risks.items)
  const user = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch<AppDispatch>()

  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [sortBy, setSortBy] = useState("dateIdentified")
  const [sortOrder, setSortOrder] = useState("desc")
  const [activeTab, setActiveTab] = useState("list")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedNonConformity, setSelectedNonConformity] = useState<string | null>(null)

  const [newNonConformity, setNewNonConformity] = useState({
    title: "",
    description: "",
    source: "Internal Audit",
    sourceReference: "",
    dateIdentified: new Date().toISOString().split("T")[0],
    severity: "major",
    status: "open",
    owner: "",
    dueDate: "",
    relatedControls: [] as string[],
    relatedRisks: [] as string[],
    correctiveActions: "",
    evidence: "",
    verificationStatus: "pending",
    verificationDate: "",
    verifiedBy: "",
    comments: "",
  })

  useEffect(() => {
    if (user?.companyId) {
      dispatch(fetchNonConformitiesAsync(user.companyId))
        .unwrap()
        .catch((e: any) =>
          toast({ title: 'Error loading', description: e.message, variant: 'destructive' })
        )
    }
  }, [user, dispatch])

  // Filter nonconformities based on search, status, and severity
  const filteredNonConformities = nonconformities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceReference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" ? true : item.status === filterStatus
    const matchesSeverity = filterSeverity === "all" ? true : item.severity === filterSeverity

    return matchesSearch && matchesStatus && matchesSeverity
  })

  // Sort nonconformities
  const sortedNonConformities = [...filteredNonConformities].sort((a, b) => {
    if (sortBy === "dateIdentified" || sortBy === "dueDate") {
      const dateA = new Date(a[sortBy]).getTime()
      const dateB = new Date(b[sortBy]).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    }

    const aValue = a[sortBy as keyof typeof a]
    const bValue = b[sortBy as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  // Calculate statistics
  const statistics = {
    total: nonconformities.length,
    open: nonconformities.filter((item) => item.status === "open").length,
    inProgress: nonconformities.filter((item) => item.status === "in-progress").length,
    closed: nonconformities.filter((item) => item.status === "closed").length,
    critical: nonconformities.filter((item) => item.severity === "critical").length,
    major: nonconformities.filter((item) => item.severity === "major").length,
    minor: nonconformities.filter((item) => item.severity === "minor").length,
    overdue: nonconformities.filter(
      (item) =>
        (item.status === "open" || item.status === "in-progress") &&
        new Date(item.dueDate) < new Date() &&
        item.dueDate !== "",
    ).length,
  }

  // Calculate completion rate
  const completionRate = Math.round((statistics.closed / Math.max(statistics.total, 1)) * 100)

  // Group by source
  const sourceGroups = nonconformities.reduce((acc: Record<string, number>, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1
    return acc
  }, {})

  // Group by control
  const controlGroups = nonconformities.reduce((acc: Record<string, number>, item) => {
    item.relatedControls.forEach((control) => {
      acc[control] = (acc[control] || 0) + 1
    })
    return acc
  }, {})

  // Get top controls with nonconformities
  const topControls = Object.entries(controlGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const resetForm = () => {
    setNewNonConformity({
      title: "",
      description: "",
      source: "Internal Audit",
      sourceReference: "",
      dateIdentified: new Date().toISOString().split("T")[0],
      severity: "major",
      status: "open",
      owner: "",
      dueDate: "",
      relatedControls: [],
      relatedRisks: [],
      correctiveActions: "",
      evidence: "",
      verificationStatus: "pending",
      verificationDate: "",
      verifiedBy: "",
      comments: "",
    })
  }

  const handleAddNonConformity = async () => {
    if (!user?.companyId) {
      return toast({ title: 'No company', description: 'No company to assign', variant: 'destructive' })
    }
    const dto: NonConformityDto = {
      ...newNonConformity,
      id: isEditing ? selectedNonConformity! : undefined,
      companyId: user.companyId,
    }
    try {
      if (isEditing) {
        await dispatch(updateNonConformityAsync(dto)).unwrap()
        toast({ title: 'Updated', description: 'Non‑conformity updated' })
      } else {
        await dispatch(addNonConformityAsync(dto)).unwrap()
        toast({ title: 'Added', description: 'Non‑conformity added' })
      }
      setDialogOpen(false)
      setIsEditing(false)
      setSelectedNonConformity(null)
      setNewNonConformity(newNonConformity)
    } catch (e: any) {
      toast({ title: 'Save error', description: e.message, variant: 'destructive' })
    }
  }

  const handleEditNonConformity = (id: string) => {
  const item = nonconformities.find((i) => i.id === id);
  if (item) {
    setNewNonConformity({
      title: item.title,
      description: item.description,
      source: item.source,
      sourceReference: item.sourceReference,
      dateIdentified: item.dateIdentified,
      severity: item.severity,
      status: item.status,
      owner: item.owner,
      dueDate: item.dueDate,
      relatedControls: item.relatedControls ?? [],
      relatedRisks: item.relatedRisks ?? [],
      correctiveActions: item.correctiveActions,
      evidence: item.evidence,
      verificationStatus: item.verificationStatus,
      verificationDate: item.verificationDate ?? '',
      verifiedBy: item.verifiedBy ?? '',
      comments: item.comments ?? '',
    });
    setSelectedNonConformity(id);
    setIsEditing(true);
    setDialogOpen(true);
  }
};


  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this non‑conformity?')) return
    try {
      await dispatch(deleteNonConformityAsync(id)).unwrap()
      toast({ title: 'Deleted' })
    } catch (e: any) {
      toast({ title: 'Delete error', description: e.message, variant: 'destructive' })
    }
  }

  const handleControlChange = (controlId: string, checked: boolean) => {
    if (checked) {
      setNewNonConformity({
        ...newNonConformity,
        relatedControls: [...newNonConformity.relatedControls, controlId],
      })
    } else {
      setNewNonConformity({
        ...newNonConformity,
        relatedControls: newNonConformity.relatedControls.filter((id) => id !== controlId),
      })
    }
  }

  const handleRiskChange = (riskId: string, checked: boolean) => {
    if (checked) {
      setNewNonConformity({
        ...newNonConformity,
        relatedRisks: [...newNonConformity.relatedRisks, riskId],
      })
    } else {
      setNewNonConformity({
        ...newNonConformity,
        relatedRisks: newNonConformity.relatedRisks.filter((id) => id !== riskId),
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "major":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "minor":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "closed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "verified":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "closed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const isOverdue = (item: any) => {
    return (
      (item.status === "open" || item.status === "in-progress") &&
      new Date(item.dueDate) < new Date() &&
      item.dueDate !== ""
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="list">Non-Conformities List</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Non-Conformities Management</CardTitle>
                  <CardDescription>
                    Track and manage non-conformities identified during audits and assessments
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Non-Conformity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? "Edit Non-Conformity" : "Add New Non-Conformity"}</DialogTitle>
                      <DialogDescription>
                        {isEditing
                          ? "Update the non-conformity details below"
                          : "Fill in the details to add a new non-conformity"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newNonConformity.title}
                            onChange={(e) => setNewNonConformity({ ...newNonConformity, title: e.target.value })}
                            placeholder="Brief title of the non-conformity"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newNonConformity.description}
                            onChange={(e) => setNewNonConformity({ ...newNonConformity, description: e.target.value })}
                            placeholder="Detailed description of the non-conformity"
                          />
                        </div>
                        <div>
                          <Label htmlFor="source">Source</Label>
                          <Select
                            value={newNonConformity.source}
                            onValueChange={(value) => setNewNonConformity({ ...newNonConformity, source: value })}
                          >
                            <SelectTrigger id="source">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Internal Audit">Internal Audit</SelectItem>
                              <SelectItem value="External Audit">External Audit</SelectItem>
                              <SelectItem value="Management Review">Management Review</SelectItem>
                              <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                              <SelectItem value="Incident">Incident</SelectItem>
                              <SelectItem value="Customer Complaint">Customer Complaint</SelectItem>
                              <SelectItem value="Employee Report">Employee Report</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sourceReference">Source Reference</Label>
                          <Input
                            id="sourceReference"
                            value={newNonConformity.sourceReference}
                            onChange={(e) =>
                              setNewNonConformity({ ...newNonConformity, sourceReference: e.target.value })
                            }
                            placeholder="Audit ID, report number, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateIdentified">Date Identified</Label>
                          <Input
                            id="dateIdentified"
                            type="date"
                            value={newNonConformity.dateIdentified}
                            onChange={(e) =>
                              setNewNonConformity({ ...newNonConformity, dateIdentified: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="severity">Severity</Label>
                          <Select
                            value={newNonConformity.severity}
                            onValueChange={(value) => setNewNonConformity({ ...newNonConformity, severity: value })}
                          >
                            <SelectTrigger id="severity">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="major">Major</SelectItem>
                              <SelectItem value="minor">Minor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newNonConformity.status}
                            onValueChange={(value) => setNewNonConformity({ ...newNonConformity, status: value })}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="owner">Owner</Label>
                          <Input
                            id="owner"
                            value={newNonConformity.owner}
                            onChange={(e) => setNewNonConformity({ ...newNonConformity, owner: e.target.value })}
                            placeholder="Person responsible for remediation"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newNonConformity.dueDate}
                            onChange={(e) => setNewNonConformity({ ...newNonConformity, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="correctiveActions">Corrective Actions</Label>
                          <Textarea
                            id="correctiveActions"
                            value={newNonConformity.correctiveActions}
                            onChange={(e) =>
                              setNewNonConformity({ ...newNonConformity, correctiveActions: e.target.value })
                            }
                            placeholder="Actions to be taken to address the non-conformity"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="evidence">Evidence of Implementation</Label>
                          <Textarea
                            id="evidence"
                            value={newNonConformity.evidence}
                            onChange={(e) => setNewNonConformity({ ...newNonConformity, evidence: e.target.value })}
                            placeholder="Evidence of corrective actions implementation"
                          />
                        </div>
                        <div>
                          <Label htmlFor="verificationStatus">Verification Status</Label>
                          <Select
                            value={newNonConformity.verificationStatus}
                            onValueChange={(value) =>
                              setNewNonConformity({ ...newNonConformity, verificationStatus: value })
                            }
                          >
                            <SelectTrigger id="verificationStatus">
                              <SelectValue placeholder="Select verification status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newNonConformity.verificationStatus !== "pending" && (
                          <>
                            <div>
                              <Label htmlFor="verificationDate">Verification Date</Label>
                              <Input
                                id="verificationDate"
                                type="date"
                                value={newNonConformity.verificationDate}
                                onChange={(e) =>
                                  setNewNonConformity({ ...newNonConformity, verificationDate: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="verifiedBy">Verified By</Label>
                              <Input
                                id="verifiedBy"
                                value={newNonConformity.verifiedBy}
                                onChange={(e) =>
                                  setNewNonConformity({ ...newNonConformity, verifiedBy: e.target.value })
                                }
                                placeholder="Person who verified the implementation"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="comments">Verification Comments</Label>
                              <Textarea
                                id="comments"
                                value={newNonConformity.comments}
                                onChange={(e) => setNewNonConformity({ ...newNonConformity, comments: e.target.value })}
                                placeholder="Comments on verification results"
                              />
                            </div>
                          </>
                        )}
                        <div className="col-span-2">
                          <Label>Related Controls</Label>
                          <div className="border rounded-md p-3 mt-1 max-h-[150px] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                              {controls.slice(0, 93).map((control) => (
                                <div key={control.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`control-${control.id}`}
                                    checked={newNonConformity.relatedControls.includes(control.id)}
                                    onCheckedChange={(checked) => handleControlChange(control.id, checked as boolean)}
                                  />
                                  <Label htmlFor={`control-${control.id}`} className="text-sm">
                                    {control.title.substring(0, 30)}
                                    {control.title.length > 30 ? "..." : ""}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Label>Related Risks</Label>
                          <div className="border rounded-md p-3 mt-1 max-h-[150px] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                              {risks.slice(0, 20).map((risk) => (
                                <div key={risk.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`risk-${risk.id}`}
                                    checked={newNonConformity.relatedRisks.includes(risk.id)}
                                    onCheckedChange={(checked) => handleRiskChange(risk.id, checked as boolean)}
                                  />
                                  <Label htmlFor={`risk-${risk.id}`} className="text-sm">
                                    {risk.title.substring(0, 40)}
                                    {risk.title.length > 40 ? "..." : ""}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false)
                          resetForm()
                          setIsEditing(false)
                          setSelectedNonConformity(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddNonConformity}>
                        {isEditing ? "Update Non-Conformity" : "Add Non-Conformity"}
                      </Button>
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
                    placeholder="Search non-conformities..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[160px]">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
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
                        Non-Conformity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 font-medium"
                        onClick={() => {
                          setSortBy("source")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Source
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 font-medium"
                        onClick={() => {
                          setSortBy("severity")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Severity
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
                          setSortBy("owner")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Owner
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 font-medium"
                        onClick={() => {
                          setSortBy("dueDate")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Due Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNonConformities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No non-conformities found. Add a new non-conformity to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedNonConformities.map((item) => (
                      <TableRow key={item.id} className={isOverdue(item) ? "bg-red-50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {getStatusIcon(item.status)}
                            <span className="ml-2">{item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{item.source}</span>
                            <span className="text-xs text-muted-foreground">{item.sourceReference}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(item.severity)}>
                            {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.owner}</TableCell>
                        <TableCell>
                          {item.dueDate ? (
                            <div className="flex items-center">
                              <span className={isOverdue(item) ? "text-red-600 font-medium" : ""}>
                                {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                              {isOverdue(item) && <AlertTriangle className="ml-1 h-4 w-4 text-red-500" />}
                            </div>
                          ) : (
                            "Not set"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditNonConformity(item.id)}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
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
                Showing {sortedNonConformities.length} of {nonconformities.length} non-conformities
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Non-Conformities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {completionRate}% closed ({statistics.closed} of {statistics.total})
                </div>
                <Progress value={completionRate} className="h-2 mt-1" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Non-Conformities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{statistics.open}</div>
                <div className="text-xs text-muted-foreground mt-2">{statistics.overdue} overdue</div>
                <div className="flex items-center space-x-1 mt-1">
                  <div
                    className="h-2 bg-red-500 rounded-l-full"
                    style={{
                      width: `${(statistics.critical / Math.max(statistics.total, 1)) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="h-2 bg-orange-500"
                    style={{
                      width: `${(statistics.major / Math.max(statistics.total, 1)) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="h-2 bg-yellow-500 rounded-r-full"
                    style={{
                      width: `${(statistics.minor / Math.max(statistics.total, 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{statistics.inProgress}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {Math.round((statistics.inProgress / Math.max(statistics.total, 1)) * 100)}% of total
                </div>
                <Progress
                  value={(statistics.inProgress / Math.max(statistics.total, 1)) * 100}
                  className="h-2 mt-1 bg-muted"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Closed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statistics.closed}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {Math.round((statistics.closed / Math.max(statistics.total, 1)) * 100)}% of total
                </div>
                <Progress
                  value={(statistics.closed / Math.max(statistics.total, 1)) * 100}
                  className="h-2 mt-1 bg-muted"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Non-Conformities by Source</CardTitle>
                <CardDescription>Distribution of non-conformities by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(sourceGroups).map(([source, count]) => (
                    <div key={source} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{source}</span>
                        <span className="text-sm">
                          {count} ({Math.round((count / statistics.total) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${(count / statistics.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Controls with Non-Conformities</CardTitle>
                <CardDescription>Controls with the most non-conformities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topControls.map(([controlId, count]) => {
                    const control = controls.find((c) => c.id === controlId)
                    return (
                      <div key={controlId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {control ? control.title.substring(0, 30) + "..." : "Unknown Control"}
                          </span>
                          <span className="text-sm">{count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(controlGroups))) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Non-Conformities by Severity and Status</CardTitle>
              <CardDescription>Overview of non-conformities by severity and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    Critical
                  </h3>
                  <div className="flex h-4 rounded-md overflow-hidden">
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "critical" && item.status === "open")
                            .length /
                            Math.max(statistics.critical, 1)) *
                          100
                        }%`,
                      }}
                      title="Open"
                    ></div>
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (nonconformities.filter(
                            (item) => item.severity === "critical" && item.status === "in-progress",
                          ).length /
                            Math.max(statistics.critical, 1)) *
                          100
                        }%`,
                      }}
                      title="In Progress"
                    ></div>
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "critical" && item.status === "closed")
                            .length /
                            Math.max(statistics.critical, 1)) *
                          100
                        }%`,
                      }}
                      title="Closed"
                    ></div>
                  </div>
                  <div className="flex text-xs space-x-4 mt-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm"></div>
                      <span>
                        Open:{" "}
                        {
                          nonconformities.filter((item) => item.severity === "critical" && item.status === "open")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 mr-1 rounded-sm"></div>
                      <span>
                        In Progress:{" "}
                        {
                          nonconformities.filter(
                            (item) => item.severity === "critical" && item.status === "in-progress",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></div>
                      <span>
                        Closed:{" "}
                        {
                          nonconformities.filter((item) => item.severity === "critical" && item.status === "closed")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                    Major
                  </h3>
                  <div className="flex h-4 rounded-md overflow-hidden">
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "major" && item.status === "open")
                            .length /
                            Math.max(statistics.major, 1)) *
                          100
                        }%`,
                      }}
                      title="Open"
                    ></div>
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "major" && item.status === "in-progress")
                            .length /
                            Math.max(statistics.major, 1)) *
                          100
                        }%`,
                      }}
                      title="In Progress"
                    ></div>
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "major" && item.status === "closed")
                            .length /
                            Math.max(statistics.major, 1)) *
                          100
                        }%`,
                      }}
                      title="Closed"
                    ></div>
                  </div>
                  <div className="flex text-xs space-x-4 mt-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm"></div>
                      <span>
                        Open:{" "}
                        {nonconformities.filter((item) => item.severity === "major" && item.status === "open").length}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 mr-1 rounded-sm"></div>
                      <span>
                        In Progress:{" "}
                        {
                          nonconformities.filter((item) => item.severity === "major" && item.status === "in-progress")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></div>
                      <span>
                        Closed:{" "}
                        {nonconformities.filter((item) => item.severity === "major" && item.status === "closed").length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                    Minor
                  </h3>
                  <div className="flex h-4 rounded-md overflow-hidden">
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "minor" && item.status === "open")
                            .length /
                            Math.max(statistics.minor, 1)) *
                          100
                        }%`,
                      }}
                      title="Open"
                    ></div>
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "minor" && item.status === "in-progress")
                            .length /
                            Math.max(statistics.minor, 1)) *
                          100
                        }%`,
                      }}
                      title="In Progress"
                    ></div>
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${
                          (nonconformities.filter((item) => item.severity === "minor" && item.status === "closed")
                            .length /
                            Math.max(statistics.minor, 1)) *
                          100
                        }%`,
                      }}
                      title="Closed"
                    ></div>
                  </div>
                  <div className="flex text-xs space-x-4 mt-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm"></div>
                      <span>
                        Open:{" "}
                        {nonconformities.filter((item) => item.severity === "minor" && item.status === "open").length}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 mr-1 rounded-sm"></div>
                      <span>
                        In Progress:{" "}
                        {
                          nonconformities.filter((item) => item.severity === "minor" && item.status === "in-progress")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></div>
                      <span>
                        Closed:{" "}
                        {nonconformities.filter((item) => item.severity === "minor" && item.status === "closed").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

