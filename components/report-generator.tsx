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
import { useToast } from "@/hooks/use-toast"
import { fetchCustomRiskReport } from "@/lib/features/reports/reportsSlice"
import { useAppDispatch } from "@/lib/hooks"
import { fetchCustomAssetReportPdf, fetchCustomAuditReportPdf, fetchCustomRiskReportPdf } from "@utils/api"

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
  const user = useSelector((state: RootState) => state.auth.user)
  
  const dispatch = useAppDispatch();


  const { toast } = useToast();

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
      { id: "audit logs", name: "Audit logs" },
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
    setSelectedSections(["summary"])
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(async () => {
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
          if (!user?.companyId) {
            toast({ title: 'Error', description: 'Missing company ID', variant: 'destructive' });
            setIsGenerating(false);
            return;
          }
          try {
            console.log(selectedSections, "selected sections ..")
            const blob: Blob = await fetchCustomRiskReportPdf(user.companyId, selectedSections);
            const url = URL.createObjectURL(blob);
            setGeneratedReport(url);
            setIsGenerating(false);
            setActiveTab('preview');
          } catch (err: any) {
            toast({ title: 'Error', description: err, variant: 'destructive' });
            setIsGenerating(false);
          }
          break

        case "asset":
          setIsGenerating(true);
          if (!user?.companyId) {
            toast({ title: 'Error', description: 'Missing company ID', variant: 'destructive' });
            setIsGenerating(false);
            return;
          }
          try {
            const blob = await fetchCustomAssetReportPdf(user.companyId, selectedSections);
            const url = URL.createObjectURL(blob);
            setGeneratedReport(url);
            setActiveTab("preview");
          } catch (e: any) {
            toast({
              title: "Error generating report",
              description: e.message || "Unable to fetch asset report",
              variant: "destructive",
            });
          } finally {
            setIsGenerating(false);
          }
          return;
          break

        case "audit":
          setIsGenerating(true);
          if (!user?.companyId) {
            toast({ title: 'Error', description: 'Missing company ID', variant: 'destructive' });
            setIsGenerating(false);
            return;
          }
          try {
            const blob = await fetchCustomAuditReportPdf(user?.companyId, selectedSections);
            const url = URL.createObjectURL(blob);
            setGeneratedReport(url);
            setActiveTab("preview");
          } catch (e: any) {
            toast({
              title: "Error generating audit report",
              description: e.message || "Unable to fetch audit report",
              variant: "destructive",
            });
          } finally {
            setIsGenerating(false);
          }
          return;
          break

        default:
          reportTitle = "ISO 27001 ISMS Report"
          reportStats = `Generated on: ${reportDate}`
      }

      //const reportContent = `${reportTitle}\n\nGenerated on: ${reportDate}\n\nIncluded sections: ${selectedSections.join(", ")}\n\n${reportStats}\n\nThis report contains confidential information and should be handled according to the organization's information classification policy.`

      //setGeneratedReport(reportContent)
      setIsGenerating(false)
      setActiveTab("preview")
    }, 1500)
  }

  const handleExportReport = () => {
    if (!generatedReport?.startsWith("blob:")) {
      toast({ title: "Export Error", description: "Only PDF reports can be exported.", variant: "destructive" });
      return;
    }

    const link = document.createElement("a");
    link.href = generatedReport;
    link.download = `report.${format}`;
    link.click();
  };

  const handlePrintReport = () => {
    if (!generatedReport?.startsWith("blob:")) {
      toast({ title: "Print Error", description: "Only PDF reports can be printed.", variant: "destructive" });
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = generatedReport;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    };
  };

  const handleEmailReport = () => {
    toast({
      title: "Feature not implemented",
      description: "Emailing reports is coming soon!",
      variant: "default",
    });
  };

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
                  {generatedReport.startsWith("blob:") ? (
                    <iframe
                      src={generatedReport}
                      className="w-full h-[800px] border rounded-md"
                      title="Generated Report"
                    />
                  ) : (
                    <div className="border rounded-md p-4 min-h-[300px] whitespace-pre-line">
                      {generatedReport}
                    </div>
                  )}

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

