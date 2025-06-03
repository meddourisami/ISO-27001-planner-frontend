"use client"

import { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RootState } from "@/lib/store"

export default function RiskMatrix() {
  const risks = useSelector((state: RootState) => state.risks.items)
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("matrix")

  // Filter risks based on status
  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => (filterStatus === "all" ? true : risk.status === filterStatus))
  }, [risks, filterStatus])

  // Create matrix data
  const matrixData = useMemo(() => {
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
  }, [filteredRisks])

  // Calculate risk counts by severity
  const riskCounts = useMemo(() => {
    return {
      critical: filteredRisks.filter((risk) => risk.severity === "critical").length,
      high: filteredRisks.filter((risk) => risk.severity === "high").length,
      medium: filteredRisks.filter((risk) => risk.severity === "medium").length,
      low: filteredRisks.filter((risk) => risk.severity === "low").length,
      total: filteredRisks.length,
    }
  }, [filteredRisks])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 hover:bg-red-600"
      case "high":
        return "bg-orange-500 hover:bg-orange-600"
      case "medium":
        return "bg-amber-500 hover:bg-amber-600"
      case "low":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
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

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
          <TabsTrigger value="summary">Risk Summary</TabsTrigger>
        </TabsList>

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
                            {cell.severity.charAt(0).toUpperCase() + cell.severity.slice(1)}
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
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Risk Treatment by Severity</CardTitle>
              <CardDescription>Treatment status broken down by risk severity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["critical", "high", "medium", "low"].map((severity) => {
                  const severityRisks = filteredRisks.filter((risk) => risk.severity === severity)
                  const totalSeverity = severityRisks.length

                  if (totalSeverity === 0) return null

                  const statusCounts = {
                    open: severityRisks.filter((risk) => risk.status === "open").length,
                    inProgress: severityRisks.filter((risk) => risk.status === "in-progress").length,
                    mitigated: severityRisks.filter((risk) => risk.status === "mitigated").length,
                    accepted: severityRisks.filter((risk) => risk.status === "accepted").length,
                  }

                  return (
                    <div key={severity} className="space-y-2">
                      <h3 className="font-medium capitalize">
                        {severity} Risks ({totalSeverity})
                      </h3>
                      <div className="flex h-4 rounded-md overflow-hidden">
                        {statusCounts.open > 0 && (
                          <div
                            className="bg-red-500"
                            style={{ width: `${(statusCounts.open / totalSeverity) * 100}%` }}
                            title={`Open: ${statusCounts.open}`}
                          ></div>
                        )}
                        {statusCounts.inProgress > 0 && (
                          <div
                            className="bg-amber-500"
                            style={{ width: `${(statusCounts.inProgress / totalSeverity) * 100}%` }}
                            title={`In Progress: ${statusCounts.inProgress}`}
                          ></div>
                        )}
                        {statusCounts.mitigated > 0 && (
                          <div
                            className="bg-green-500"
                            style={{ width: `${(statusCounts.mitigated / totalSeverity) * 100}%` }}
                            title={`Mitigated: ${statusCounts.mitigated}`}
                          ></div>
                        )}
                        {statusCounts.accepted > 0 && (
                          <div
                            className="bg-blue-500"
                            style={{ width: `${(statusCounts.accepted / totalSeverity) * 100}%` }}
                            title={`Accepted: ${statusCounts.accepted}`}
                          ></div>
                        )}
                      </div>
                      <div className="flex text-xs space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm"></div>
                          <span>Open: {statusCounts.open}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-amber-500 mr-1 rounded-sm"></div>
                          <span>In Progress: {statusCounts.inProgress}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></div>
                          <span>Mitigated: {statusCounts.mitigated}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 mr-1 rounded-sm"></div>
                          <span>Accepted: {statusCounts.accepted}</span>
                        </div>
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

