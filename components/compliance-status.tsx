"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, ArrowUpDown, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react"
import { AppDispatch, type RootState } from "@/lib/store"
import { fetchControlsAsync } from "@/lib/features/compliance/complianceSlice"
import { ControlDto } from "@/types"

export default function ComplianceStatus() {
  const { controls, loading, error } = useSelector((state: RootState) => state.compliance);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterClause, setFilterClause] = useState("all")
  const [sortBy, setSortBy] = useState("id")
  const [sortOrder, setSortOrder] = useState("asc")

  useEffect(() => {
  if (user?.companyId) {
    dispatch(fetchControlsAsync(user.companyId));
  }
  }, [user?.companyId, dispatch]);
  
  const processedControls = controls.map((control) => {
  const [idPart, ...titleParts] = control.title.split(" - ");
  const parsedId = idPart.trim();
  const parsedTitle = titleParts.join(" - ").trim();
  return {
    ...control,
    id: parsedId,
    title: parsedTitle || control.title, // fallback if no dash
  };
});

  const filteredControls = processedControls
    .filter(
      (control) =>
        control.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        control.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((control) => {
      if (filterClause === "all") return true
      return control.id.startsWith(filterClause)
    })
    .sort((a, b) => {
      if (sortBy === "id") {
        return sortOrder === "asc"
          ? a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" })
          : b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: "base" })
      }

      if (sortBy === "status") {
        const statusOrder = { implemented: 3, partially_implemented: 2, planned: 1, "not-applicable": 0 }
        const aValue = statusOrder[a.status as keyof typeof statusOrder] || 0
        const bValue = statusOrder[b.status as keyof typeof statusOrder] || 0
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
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
      case "implemented":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "partially_implemented":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "planned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "not-applicable":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "implemented":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "partially_implemented":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "planned":
        return <HelpCircle className="h-4 w-4 text-blue-500" />
      case "not-applicable":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // Calculate compliance statistics
  const totalControls = controls.filter((c) => c.status !== "not-applicable").length
  const implementedControls = controls.filter((c) => c.status === "implemented").length
  const partialControls = controls.filter((c) => c.status === "partially_implemented").length
  const plannedControls = controls.filter((c) => c.status === "planned").length
  const naControls = controls.filter((c) => c.status === "not-applicable").length

  const compliancePercentage =
    totalControls > 0 ? Math.round(((implementedControls + partialControls * 0.5) / totalControls) * 100) : 0

  // Group controls by clause
  const controlsByClause = processedControls.reduce((acc: Record<string, typeof processedControls>, control) => {
    const clauseParts = control.id.split(".");
    const clause = clauseParts.length >= 2 ? `${clauseParts[0]}.${clauseParts[1]}` : control.id;
    if (!acc[clause]) acc[clause] = [];
    acc[clause].push(control);
    return acc;
  }, {} as Record<string, typeof processedControls>);

  // Calculate compliance by clause
  const clauseCompliance = Object.entries(controlsByClause)
    .map(([clause, clauseControls]: [string, any]) => {
      const total = clauseControls.filter((c: any) => c.status !== "not-applicable").length
      const implemented = clauseControls.filter((c: any) => c.status === "implemented").length
      const partial = clauseControls.filter((c: any) => c.status === "partially_implemented").length

      return {
        clause,
        percentage: total > 0 ? Math.round(((implemented + partial * 0.5) / total) * 100) : 0,
        total,
        implemented,
        partial,
      }
    })
    .sort((a, b) => a.clause.localeCompare(b.clause, undefined, { numeric: true }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compliancePercentage}%</div>
            <Progress value={compliancePercentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {implementedControls} implemented, {partialControls} partially_implemented, {plannedControls} planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Implemented Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{implementedControls}</div>
            <Progress value={(implementedControls / totalControls) * 100} className="h-2 mt-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((implementedControls / totalControls) * 100)}% of applicable controls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Partial Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{partialControls}</div>
            <Progress value={(partialControls / totalControls) * 100} className="h-2 mt-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((partialControls / totalControls) * 100)}% of applicable controls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Planned Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{plannedControls}</div>
            <Progress value={(plannedControls / totalControls) * 100} className="h-2 mt-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((plannedControls / totalControls) * 100)}% of applicable controls
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance by Clause</CardTitle>
          <CardDescription>ISO 27001 Annex A controls implementation status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clauseCompliance.map((item) => (
              <Card key={item.clause}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{item.clause} Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.percentage}%</div>
                  <Progress value={item.percentage} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.implemented} implemented, {item.partial} partial of {item.total} controls
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Control Implementation Status</CardTitle>
          <CardDescription>Detailed status of ISO 27001 Annex A controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search controls..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterClause} onValueChange={setFilterClause}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by clause" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clauses</SelectItem>
                <SelectItem value="A.5">A.5 Organizational measures</SelectItem>
                <SelectItem value="A.6">A.6 Measures related to people</SelectItem>
                <SelectItem value="A.7">A.7 Physical measures</SelectItem>
                <SelectItem value="A.8">A.8 Technological measures</SelectItem>
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
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => {
                      setSortBy("id")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Control
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[300px]">
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => {
                      setSortBy("title")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Title
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
                <TableHead>Evidence</TableHead>
                <TableHead>Last Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredControls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No controls found matching your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredControls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell className="font-medium">{control.id}</TableCell>
                    <TableCell>{control.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(control.status)}
                        <Badge variant="outline" className={`ml-2 ${getStatusColor(control.status)}`}>
                          {control.status.charAt(0).toUpperCase() + control.status.slice(1).replace("-", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {control.evidence || "No evidence provided"}
                    </TableCell>
                    <TableCell>
                      {control.lastReview ? new Date(control.lastReview).toLocaleDateString() : "Not reviewed"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

