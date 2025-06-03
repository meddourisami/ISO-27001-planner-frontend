"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDown, Printer, Mail } from "lucide-react"
import type { RootState } from "@/lib/store"

export default function ReportGenerator() {
  const [reportType, setReportType] = useState("compliance")
  const [format, setFormat] = useState("pdf")
  const [activeTab, setActiveTab] = useState("generate")
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "summary",
    "details",
    "charts",
    "recommendations",
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)

  // Get data from Redux store
  const risks = useSelector((state: RootState) => state.risks.items)
  const compliance = useSelector((state: RootState) => state.compliance.controls)
  const assets = useSelector((state: RootState) => state.assets.items)
  const audits = useSelector((state: RootState) => state.audits.items)

  const reportTypes = [
    { id: "compliance", name: "Compliance Status Report" },
    { id: "risk", name: "Risk Assessment Report" },
    { id: "asset", name: "Asset Inventory Report" },
    { id: "audit", name: "Audit Findings Report" },
    { id: "executive", name: "Executive Summary" },
    { id: "gap", name: "Gap Analysis Report" },
  ]

  const reportSections = {
    compliance: [
      { id: "summary", name: "Executive Summary" },
      { id: "details", name: "Control Details" },
      { id: "charts", name: "Compliance Charts" },
      { id: "recommendations", name: "Recommendations" },
      { id: "appendix", name: "Appendices" },
    ],
    risk: [
      { id: "summary", name: "Risk Summary" },
      { id: "details", name: "Risk Details" },
      { id: "matrix", name: "Risk Matrix" },
      { id: "treatment", name: "Treatment Plans" },
      { id: "trends", name: "Risk Trends" },
    ],
    asset: [
      { id: "summary", name: "Asset Summary" },
      { id: "details", name: "Asset Details" },
      { id: "classification", name: "Classification Breakdown" },
      { id: "risks", name: "Associated Risks" },
    ],
    audit: [
      { id: "summary", name: "Audit Summary" },
      { id: "findings", name: "Audit Findings" },
      { id: "nonconformities", name: "Non-conformities" },
      { id: "recommendations", name: "Recommendations" },
      { id: "followup", name: "Follow-up Actions" },
    ],
    executive: [
      { id: "summary", name: "Executive Summary" },
      { id: "highlights", name: "Key Highlights" },
      { id: "risks", name: "Key Risks" },
      { id: "progress", name: "Implementation Progress" },
      { id: "recommendations", name: "Recommendations" },
    ],
    gap: [
      { id: "summary", name: "Gap Analysis Summary" },
      { id: "details", name: "Detailed Gaps" },
      { id: "recommendations", name: "Recommendations" },
      { id: "timeline", name: "Implementation Timeline" },
    ],
  }

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter((id) => id !== sectionId))
    } else {
      setSelectedSections([...selectedSections, sectionId])
    }
  }

  const handleReportTypeChange = (value: string) => {
    setReportType(value)
    // Reset selected sections to default for the new report type
    setSelectedSections(["summary", "details", "charts", "recommendations"])
  }

  const handleGenerateReport = () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      const reportDate = new Date().toLocaleDateString()
      let reportTitle = ""
      let reportStats = ""

      // Generate different report content based on type
      switch (reportType) {
        case "compliance":
          const implementedControls = compliance.filter((control) => control.status === "implemented").length
          const partialControls = compliance.filter((control) => control.status === "partial").length
          const totalControls = compliance.filter((control) => control.status !== "not-applicable").length
          const complianceRate =
            totalControls > 0 ? Math.round(((implementedControls + partialControls * 0.5) / totalControls) * 100) : 0

          reportTitle = "ISO 27001 Compliance Status Report"
          reportStats = `Overall compliance: ${complianceRate}%\nImplemented controls: ${implementedControls}\nPartially implemented: ${partialControls}\nTotal applicable controls: ${totalControls}`
          break

        case "risk":
          const criticalRisks = risks.filter((risk) => risk.severity === "critical").length
          const highRisks = risks.filter((risk) => risk.severity === "high").length
          const openRisks = risks.filter((risk) => risk.status === "open" || risk.status === "in-progress").length

          reportTitle = "Information Security Risk Assessment Report"
          reportStats = `Total risks: ${risks.length}\nOpen risks: ${openRisks}\nCritical risks: ${criticalRisks}\nHigh risks: ${highRisks}`
          break

        case "asset":
          const criticalAssets = assets.filter((asset) => asset.value === "critical").length
          const confidentialAssets = assets.filter(
            (asset) => asset.classification === "confidential" || asset.classification === "restricted",
          ).length

          reportTitle = "Information Asset Inventory Report"
          reportStats = `Total assets: ${assets.length}\nCritical assets: ${criticalAssets}\nConfidential/Restricted assets: ${confidentialAssets}`
          break

        case "audit":
          const completedAudits = audits.filter((audit) => audit.status === "completed").length
          const nonConformities = audits.reduce((total, audit) => total + audit.nonConformities, 0)

          reportTitle = "Information Security Audit Report"
          reportStats = `Total audits: ${audits.length}\nCompleted audits: ${completedAudits}\nTotal non-conformities: ${nonConformities}`
          break

        default:
          reportTitle = "ISO 27001 ISMS Report"
          reportStats = `Generated on: ${reportDate}`
      }

      const reportContent = `${reportTitle}\n\nGenerated on: ${reportDate}\n\nIncluded sections: ${selectedSections.join(", ")}\n\n${reportStats}\n\nThis report contains confidential information and should be handled according to the organization's information classification policy.`

      setGeneratedReport(reportContent)
      setIsGenerating(false)
      setActiveTab("preview")
    }, 1500)
  }

  const handleExportReport = () => {
    // In a real application, this would trigger a download of the report
    alert(`Report would be exported as ${format.toUpperCase()} file in a real application`)
  }

  const handlePrintReport = () => {
    // In a real application, this would open the print dialog
    alert("Print dialog would open in a real application")
  }

  const handleEmailReport = () => {
    // In a real application, this would open an email dialog
    alert("Email dialog would open in a real application")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Report Generator</CardTitle>
          <CardDescription>Generate customized reports for your ISMS</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="generate">Generate Report</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedReport}>
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={handleReportTypeChange}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="docx">Word Document</SelectItem>
                      <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include Sections</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {reportType in reportSections &&
                    reportSections[reportType as keyof typeof reportSections].map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={section.id}
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                        <Label htmlFor={section.id} className="cursor-pointer">
                          {section.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || selectedSections.length === 0}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {generatedReport && (
                <>
                  <div className="border rounded-md p-4 min-h-[300px] whitespace-pre-line">{generatedReport}</div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExportReport} className="flex items-center gap-2">
                      <FileDown className="h-4 w-4" />
                      Export as {format.toUpperCase()}
                    </Button>
                    <Button variant="outline" onClick={handlePrintReport} className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button variant="outline" onClick={handleEmailReport} className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Reports are generated based on the current data in your ISMS planner.
        </CardFooter>
      </Card>
    </div>
  )
}

