"use client"

import { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ClipboardCheck, FileText, Shield, AlertTriangle, Users, Calendar, Bell } from "lucide-react"
import type { RootState } from "@/lib/store"

import Sidebar from "@/components/sidebar"
import RiskAssessment from "@/components/risk-assessment"
import DocumentManagement from "@/components/document-management"
import AuditPlanner from "@/components/audit-planner"
import TaskManager from "@/components/task-manager"
import ComplianceStatus from "@/components/compliance-status"
import AssetsManagement from "@/components/assets-management"
import NotificationsPanel from "@/components/notifications-panel"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showNotifications, setShowNotifications] = useState(false)

  // Get data from Redux store
  const risks = useSelector((state: RootState) => state.risks.items)
  const tasks = useSelector((state: RootState) => state.tasks.items)
  const documents = useSelector((state: RootState) => state.documents.items)
  const audits = useSelector((state: RootState) => state.audits.items)
  const compliance = useSelector((state: RootState) => state.compliance.controls)
  const training = useSelector((state: RootState) => state.training)

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    // Risk metrics
    const openRisks = risks.filter(
      (risk) =>
        risk.status.toLowerCase() === "open" ||
        risk.status.toLowerCase() === "in-progress"
    );
    
    const criticalRisks = openRisks.filter(
      (risk) => risk.severity.toLowerCase() === "critical"
    ).length;
    
    const highRisks = openRisks.filter(
      (risk) => risk.severity.toLowerCase() === "high"
    ).length;
    
    const mediumRisks = openRisks.filter(
      (risk) => risk.severity.toLowerCase() === "medium"
    ).length;
    
    const lowRisks = openRisks.filter(
      (risk) => risk.severity.toLowerCase() === "low"
    ).length;

    // Task metrics
    const pendingTasks = tasks.filter((task) => task.status !== "done")
    const completedTasksCount = tasks.filter((task) => task.status === "done").length
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0

    // Document metrics
    const approvedDocs = documents.filter((doc) => doc.status === "approved").length
    const docApprovalRate = documents.length > 0 ? Math.round((approvedDocs / documents.length) * 100) : 0

    // Compliance metrics
    const implementedControls = compliance.filter((control) => control.status === "implemented").length
    const partialControls = compliance.filter((control) => control.status === "partial").length
    const applicableControls = compliance.filter((control) => control.status !== "not-applicable").length
    const complianceRate =
      applicableControls > 0
        ? Math.round(((implementedControls + partialControls * 0.5) / applicableControls) * 100)
        : 0

    // Training metrics
    const totalEmployees = training.employees.length
    const totalTrainings = training.items.length
    const completedTrainings = training.employees.reduce((total, employee) => {
      return total + employee.completedTrainings.length
    }, 0)
    const trainingCompletionRate =
      totalEmployees > 0 && totalTrainings > 0
        ? Math.round((completedTrainings / (totalEmployees * totalTrainings)) * 100)
        : 0

    // Next audit
    const upcomingAudits = audits
      .filter((audit) => audit.status === "planned")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const nextAudit = upcomingAudits.length > 0 ? upcomingAudits[0] : null
    const daysToNextAudit = nextAudit
      ? Math.ceil((new Date(nextAudit.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null

    // Implementation progress by clause
    const processedControls = compliance.map((control) => {
      const [idPart, ...titleParts] = control.title.split(" - ");
      const parsedId = idPart.trim();
      const parsedTitle = titleParts.join(" - ").trim();
      return {
        ...control,
        id: parsedId,
        title: parsedTitle || control.title, // fallback if no dash
      };
    });

    const controlsByClause = processedControls.reduce((acc: Record<string, typeof processedControls>, control) => {
      const clause = control.id.split(".")[0];
      if (!acc[clause]) acc[clause] = [];
      acc[clause].push(control);
      return acc;
    }, {} as Record<string, typeof processedControls>);

  // Calculate compliance by clause
  const clauseCompliance = Object.entries(controlsByClause)
    .map(([clause, clauseControls]: [string, any]) => {
      const total = clauseControls.filter((c: any) => c.status !== "not-applicable").length
      const implemented = clauseControls.filter((c: any) => c.status === "implemented").length
      const partial = clauseControls.filter((c: any) => c.status === "partial").length

      return {
        clause,
        percentage: total > 0 ? Math.round(((implemented + partial * 0.5) / total) * 100) : 0,
        total,
        implemented,
        partial,
      }
    })
    .sort((a, b) => a.clause.localeCompare(b.clause, undefined, { numeric: true }))

    // Recent activities (simulated)
    const recentActivities = [
      { title: "Risk Assessment Updated", time: "2 hours ago", user: "John Doe" },
      { title: "Information Security Policy Approved", time: "Yesterday", user: "Sarah Chen" },
      { title: "New Vulnerability Identified", time: "2 days ago", user: "Mike Johnson" },
      { title: "Audit Finding Resolved", time: "3 days ago", user: "Emily Wilson" },
      { title: "Employee Training Completed", time: "1 week ago", user: "Team" },
    ]

    return {
      openRisks: openRisks.length,
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      pendingTasks: pendingTasks.length,
      taskCompletionRate,
      docApprovalRate,
      approvedDocs,
      totalDocs: documents.length,
      complianceRate,
      implementedControls,
      partialControls,
      applicableControls,
      trainingCompletionRate,
      completedTrainings,
      totalTrainingAssignments: totalEmployees * totalTrainings,
      nextAudit,
      daysToNextAudit,
      clauseCompliance,
      recentActivities,
    }
  }, [risks, tasks, documents, audits, compliance, training])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">ISO 27001 ISMS Planner</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
              <button
                className="relative p-2 rounded-full hover:bg-accent"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-7 w-full max-w-4xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="audits">Audits</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.complianceRate}%</div>
                    <Progress value={dashboardMetrics.complianceRate} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {dashboardMetrics.implementedControls} implemented, {dashboardMetrics.partialControls} partial of{" "}
                      {dashboardMetrics.applicableControls} controls
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Risks</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.openRisks}</div>
                    <div className="flex items-center mt-2">
                      <div className="w-full flex text-xs">
                        <div
                          className="bg-red-500 h-2 rounded-l-full"
                          style={{
                            width: `${(dashboardMetrics.criticalRisks / Math.max(dashboardMetrics.openRisks, 1)) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-amber-500 h-2"
                          style={{
                            width: `${(dashboardMetrics.highRisks / Math.max(dashboardMetrics.openRisks, 1)) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-yellow-500 h-2"
                          style={{
                            width: `${(dashboardMetrics.mediumRisks / Math.max(dashboardMetrics.openRisks, 1)) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-green-500 h-2 rounded-r-full"
                          style={{
                            width: `${(dashboardMetrics.lowRisks / Math.max(dashboardMetrics.openRisks, 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Critical: {dashboardMetrics.criticalRisks}</span>
                      <span>High: {dashboardMetrics.highRisks}</span>
                      <span>Medium: {dashboardMetrics.mediumRisks}</span>
                      <span>Low: {dashboardMetrics.lowRisks}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.pendingTasks}</div>
                    <Progress value={dashboardMetrics.taskCompletionRate} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {dashboardMetrics.taskCompletionRate}% complete
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Document Status</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardMetrics.approvedDocs}/{dashboardMetrics.totalDocs}
                    </div>
                    <Progress value={dashboardMetrics.docApprovalRate} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {dashboardMetrics.docApprovalRate}% documents approved
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Audit</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {dashboardMetrics.nextAudit ? (
                      <>
                        <div className="text-2xl font-bold">
                          {new Date(dashboardMetrics.nextAudit.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">{dashboardMetrics.nextAudit.title}</div>
                        <div
                          className={`text-xs font-medium mt-1 ${dashboardMetrics.daysToNextAudit && dashboardMetrics.daysToNextAudit < 30 ? "text-amber-500" : "text-green-500"}`}
                        >
                          {dashboardMetrics.daysToNextAudit} days remaining
                        </div>
                      </>
                    ) : (
                      <div className="text-lg">No upcoming audits</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Training</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.trainingCompletionRate}%</div>
                    <Progress value={dashboardMetrics.trainingCompletionRate} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {dashboardMetrics.completedTrainings}/{dashboardMetrics.totalTrainingAssignments} completed
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Implementation Progress</CardTitle>
                    <CardDescription>ISO 27001 controls implementation status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end justify-between">
                      {dashboardMetrics.clauseCompliance.map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div
                            className="w-8 bg-primary rounded-t-sm"
                            style={{ height: `${item.percentage * 1.5}px` }}
                          ></div>
                          <div className="text-xs mt-2">{item.clause}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest updates on your ISMS</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardMetrics.recentActivities.map((item, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-primary"></div>
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.time} by {item.user}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risks">
              <RiskAssessment />
            </TabsContent>

            <TabsContent value="assets">
              <AssetsManagement />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentManagement />
            </TabsContent>

            <TabsContent value="audits">
              <AuditPlanner />
            </TabsContent>

            <TabsContent value="tasks">
              <TaskManager />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceStatus />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

