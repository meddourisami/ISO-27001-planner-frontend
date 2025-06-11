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
import { Plus, Search, Filter, ArrowUpDown, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import type { AppDispatch, RootState } from "@/lib/store"
import {fetchRisks, updateRiskAsync, addRiskAsync, deleteRiskAsync } from "@/lib/features/risks/risksSlice"
import { RiskDto } from "@/types"
import { useAppSelector } from "@/lib/hooks"
import { useToast } from "@/hooks/use-toast"


export default function RiskAssessment() {
  const { items: risks, loading } = useSelector((state: RootState) => state.risks);
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("severity")
  const [sortOrder, setSortOrder] = useState("desc")
  const [activeTab, setActiveTab] = useState("list")

  const [newRisk, setNewRisk] = useState({
    id: "",
    title: "",
    description: "",
    asset: "",
    threat: "",
    vulnerability: "",
    likelihood: "low",
    impact: "low",
    severity: "low",
    status: "open",
    owner: "",
    treatment: "",
    controls: "",
    dueDate: "",
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user?.companyId) {
      dispatch(fetchRisks(user.companyId))
      console.log(risks)
    }
  }, [dispatch, user?.companyId])

  const handleAddRisk = async () => {
  try {
    if (!user?.companyId) {
      toast({
        title: "Missing Company ID",
        description: "User is not associated with a company.",
        variant: "destructive",
      });
      return;
    }

    const { id, asset, owner, ...rest } = newRisk;

    const payload: Omit<RiskDto, "id"> = {
      ...rest,
      assetId: asset, // renamed
      ownerEmail: user.email, // renamed
      companyId: user.companyId, // ensure it's a number
      dueDate: newRisk.dueDate || new Date().toISOString(), // fallback or format
    };

    console.log("Creating Risk Payload:", payload);

    if (isEditing) {
      await dispatch(updateRiskAsync({ ...newRisk, companyId: user.companyId })).unwrap();
      toast({ title: "Risk Updated", description: "Risk details updated successfully." });
    } else {
      await dispatch(addRiskAsync(payload)).unwrap();
      toast({ title: "Risk Added", description: "New risk created successfully." });
    }

    resetForm();
    setDialogOpen(false);
  } catch (error: any) {
    console.error("Failed to add/update risk", error);

    toast({
      title: "Error",
      description: error?.response?.data?.message || error?.message || "Unexpected error occurred.",
      variant: "destructive",
    });
  }
};

  const handleDelete = (id: string) => dispatch(deleteRiskAsync(id));

  const resetForm = () => {
    setNewRisk({
      id: "",
      title: "",
      description: "",
      asset: "",
      threat: "",
      vulnerability: "",
      likelihood: "low",
      impact: "low",
      severity: "low",
      status: "open",
      owner: "",
      treatment: "",
      controls: "",
      dueDate: "",
      companyId: "",
    })
    setIsEditing(false)
  }

  const handleEdit = (risk: any) => {
    setNewRisk(risk)
    setIsEditing(true)
    setDialogOpen(true)
  }

  const calculateSeverity = (likelihood: string, impact: string): string => {
    if (likelihood === "critical" && impact === "critical") return "critical";
    if (likelihood === "critical" || impact === "critical" || (likelihood === "high" && impact === "high")) return "high";
    if (likelihood === "low" && impact === "low") return "low";
    return "medium";
  };

  const filteredRisks = risks
    .filter(
      (risk) =>
        risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.threat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.vulnerability.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((risk) => (filterStatus === "all" ? true : risk.status === filterStatus))
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = new Date(a.dueDate).getTime()
        const dateB = new Date(b.dueDate).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      if (sortBy === "severity") {
        const severityA = severityOrder[a.severity as keyof typeof severityOrder] || 0
        const severityB = severityOrder[b.severity as keyof typeof severityOrder] || 0
        return sortOrder === "asc" ? severityA - severityB : severityB - severityA
      }

      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  // Calculate risk counts by severity
  const riskCounts = {
    critical: filteredRisks.filter((risk) => risk.severity === "critical").length,
    high: filteredRisks.filter((risk) => risk.severity === "high").length,
    medium: filteredRisks.filter((risk) => risk.severity === "medium").length,
    low: filteredRisks.filter((risk) => risk.severity === "low").length,
    total: filteredRisks.length,
  }

  // Create matrix data
  const matrixData = (() => {
    const likelihoodLevels = ["critical", "high", "medium", "low"]
    const impactLevels = ["critical", "high", "medium", "low"]

    // Initialize matrix with empty cells
    const matrix = likelihoodLevels.map((likelihood) => {
      return impactLevels.map((impact) => {
        // Determine severity based on likelihood and impact
        let severity
        if (likelihood === "critical" && impact === "critical") {
          severity = "critical"
        } else if (likelihood === "critical" || impact === "critical" || (likelihood === "high" && impact === "high")) {
          severity = "high"
        } else if (likelihood === "low" && impact === "low") {
          severity = "low"
        } else {
          severity = "medium"
        }

        return {
          likelihood,
          impact,
          severity,
          risks: [],
        }
      })
    })

    // Populate matrix with risks
    filteredRisks.forEach((risk) => {
      const likelihoodIndex = likelihoodLevels.indexOf(risk.likelihood)
      const impactIndex = impactLevels.indexOf(risk.impact)

      if (likelihoodIndex !== -1 && impactIndex !== -1) {
        matrix[likelihoodIndex][impactIndex].risks.push(risk)
      }
    })

    return {
      matrix,
      likelihoodLevels,
      impactLevels,
    }
  })()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "in-progress":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "mitigated":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "accepted":
        return <XCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100"
      case "high":
        return "bg-orange-100"
      case "medium":
        return "bg-amber-100"
      case "low":
        return "bg-green-100"
      default:
        return "bg-blue-100"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "in-progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "mitigated":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "accepted":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const capitalize = (str?: string | null): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="list">Risk List</TabsTrigger>
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Identify, assess, and manage information security risks</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Risk
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                    <DialogHeader className="sticky top-0 bg-white z-10">
                      <DialogTitle>{isEditing ? "Edit Risk" : "Add New Risk"}</DialogTitle>
                      <DialogDescription>
                        {isEditing ? "Update the risk details below" : "Fill in the details to add a new risk"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-2 py-4">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="title">Risk Title</Label>
                          <Input
                            id="title"
                            value={newRisk.title ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newRisk.description ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="asset">Asset</Label>
                          <Input
                            id="asset"
                            value={newRisk.asset ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, asset: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="threat">Threat</Label>
                          <Input
                            id="threat"
                            value={newRisk.threat ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, threat: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="vulnerability">Vulnerability</Label>
                          <Input
                            id="vulnerability"
                            value={newRisk.vulnerability ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, vulnerability: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="likelihood">Likelihood</Label>
                          <Select
                            value={newRisk.likelihood ?? "low"}
                            onValueChange={(value) =>
                              setNewRisk(prev => ({
                                ...prev,
                                likelihood: value,
                                severity: calculateSeverity(value, prev.impact),
                              }))
                            }
                          >
                            <SelectTrigger id="likelihood">
                              <SelectValue placeholder="Select likelihood" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="impact">Impact</Label>
                          <Select
                            value={newRisk.impact ?? "low"}
                            onValueChange={(value) =>
                              setNewRisk(prev => ({
                                ...prev,
                                impact: value,
                                severity: calculateSeverity(prev.likelihood, value),
                              }))
                            }
                          >
                            <SelectTrigger id="impact">
                              <SelectValue placeholder="Select impact" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Severity</Label>
                          <div
                            className={`mt-1 px-3 py-2 border rounded text-sm font-medium ${getSeverityColor(
                              newRisk.severity
                            )}`}
                          >
                            {newRisk.severity.charAt(0).toUpperCase() + newRisk.severity.slice(1)}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newRisk.status ?? "open"}
                            onValueChange={(value) => setNewRisk({ ...newRisk, status: value })}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="mitigated">Mitigated</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="owner">Owner</Label>
                          <Input
                            id="owner"
                            value={newRisk.owner ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="treatment">Treatment</Label>
                          <Textarea
                            id="treatment"
                            value={newRisk.treatment ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, treatment: e.target.value })}
                            placeholder="Recommended treatment for the risk"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="controls">Controls</Label>
                          <Textarea
                            id="controls"
                            value={newRisk.controls ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, controls: e.target.value })}
                            placeholder="Existing or planned controls to mitigate the risk"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newRisk.dueDate ?? ""}
                            onChange={(e) => setNewRisk({ ...newRisk, dueDate: e.target.value })}
                          />
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
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddRisk}>{isEditing ? "Update Risk" : "Add Risk"}</Button>
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
                    placeholder="Search risks..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
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
                    <TableHead className="w-[200px]">
                      <Button
                        variant="ghost"
                        className="p-0 font-medium"
                        onClick={() => {
                          setSortBy("title")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Risk
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 font-medium"
                        onClick={() => {
                          setSortBy("asset")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Asset
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No risks found. Add a new risk to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRisks.map((risk) => (
                      <TableRow key={risk.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {getStatusIcon(risk.status)}
                            <span className="ml-2">{risk.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{risk.asset}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(risk.severity)}>
                            {capitalize(risk.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(risk.status)}>
                            {capitalize(risk.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{risk.owner}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(risk)}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this risk?")) {
                                  dispatch(deleteRisk(risk.id))
                                }
                              }}
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
                Showing {filteredRisks.length} of {risks.length} risks
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Matrix</CardTitle>
                  <CardDescription>Visualize risks by likelihood and impact</CardDescription>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Matrix Header */}
                  <div className="flex">
                    <div className="w-[120px] p-2 font-medium text-center">
                      Likelihood ↓<br />
                      Impact →
                    </div>
                    {matrixData.impactLevels.map((impact, index) => (
                      <div key={index} className="flex-1 p-2 font-medium text-center capitalize">
                        {impact}
                      </div>
                    ))}
                  </div>

                  {/* Matrix Rows */}
                  {matrixData.matrix.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      <div className="w-[120px] p-2 font-medium text-center capitalize flex items-center justify-center">
                        {matrixData.likelihoodLevels[rowIndex]}
                      </div>
                      {row.map((cell, cellIndex) => (
                        <div
                          key={cellIndex}
                          className={`flex-1 p-2 border ${getSeverityBgColor(cell.severity)} min-h-[100px] flex flex-col`}
                        >
                          <div className="text-xs font-medium mb-1 text-center">
                            {capitalize(cell.severity)}
                            {cell.risks.length > 0 && ` (${cell.risks.length})`}
                          </div>
                          <div className="flex-1 overflow-y-auto text-xs">
                            {cell.risks.map((risk) => (
                              <div
                                key={risk.id}
                                className="mb-1 p-1 bg-white bg-opacity-60 rounded text-xs cursor-pointer hover:bg-opacity-80"
                                title={risk.description}
                              >
                                {risk.title.length > 30 ? risk.title.substring(0, 30) + "..." : risk.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 mr-1"></div>
                  <span className="text-xs">Critical</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-100 mr-1"></div>
                  <span className="text-xs">High</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-amber-100 mr-1"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 mr-1"></div>
                  <span className="text-xs">Low</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{riskCounts.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{riskCounts.critical}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {riskCounts.total > 0 ? Math.round((riskCounts.critical / riskCounts.total) * 100) : 0}% of total
                  risks
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{riskCounts.high}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {riskCounts.total > 0 ? Math.round((riskCounts.high / riskCounts.total) * 100) : 0}% of total risks
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Medium Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{riskCounts.medium}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {riskCounts.total > 0 ? Math.round((riskCounts.medium / riskCounts.total) * 100) : 0}% of total risks
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Low Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{riskCounts.low}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {riskCounts.total > 0 ? Math.round((riskCounts.low / riskCounts.total) * 100) : 0}% of total risks
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Treatment Summary</CardTitle>
              <CardDescription>Status of risk treatment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["open", "in-progress", "mitigated", "accepted"].map((status) => {
                  const count = filteredRisks.filter((risk) => risk.status === status).length
                  const percentage = riskCounts.total > 0 ? Math.round((count / riskCounts.total) * 100) : 0

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{status.replace("-", " ")}</span>
                        <span className="text-sm">
                          {count} risks ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            status === "open"
                              ? "bg-red-500"
                              : status === "in-progress"
                                ? "bg-amber-500"
                                : status === "mitigated"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

