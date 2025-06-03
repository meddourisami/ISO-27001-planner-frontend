"use client"

import { Label } from "@/components/ui/label"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  User,
  Send,
  Copy,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Lightbulb,
  Sparkles,
  Download,
  Clipboard,
  RefreshCw,
} from "lucide-react"

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: Date }>>([
    {
      role: "assistant",
      content:
        "Hello! I'm your ISO 27001 ISMS AI Assistant. How can I help you today? You can ask me questions about ISO 27001, request guidance on implementation, or get help with risk assessments and controls.",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [generatedPolicy, setGeneratedPolicy] = useState("")
  const [policyTitle, setPolicyTitle] = useState("")
  const [policyScope, setPolicyScope] = useState("")
  const [isGeneratingPolicy, setIsGeneratingPolicy] = useState(false)
  const [selectedControl, setSelectedControl] = useState("")
  const [controlGuidance, setControlGuidance] = useState("")
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false)
  const [complianceInput, setComplianceInput] = useState("")
  const [complianceResult, setComplianceResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mock policy templates
  const policyTemplates = [
    { id: "information-security", name: "Information Security Policy" },
    { id: "acceptable-use", name: "Acceptable Use Policy" },
    { id: "access-control", name: "Access Control Policy" },
    { id: "password", name: "Password Policy" },
    { id: "data-protection", name: "Data Protection Policy" },
    { id: "incident-response", name: "Incident Response Policy" },
    { id: "business-continuity", name: "Business Continuity Policy" },
    { id: "remote-working", name: "Remote Working Policy" },
    { id: "byod", name: "Bring Your Own Device (BYOD) Policy" },
    { id: "third-party", name: "Third-Party Security Policy" },
  ]

  // Mock ISO 27001 controls for guidance
  const iso27001Controls = [
    { id: "A.5.1.1", name: "A.5.1.1 - Policies for information security" },
    { id: "A.6.1.1", name: "A.6.1.1 - Information security roles and responsibilities" },
    { id: "A.7.2.2", name: "A.7.2.2 - Information security awareness, education and training" },
    { id: "A.8.1.1", name: "A.8.1.1 - Inventory of assets" },
    { id: "A.8.2.1", name: "A.8.2.1 - Classification of information" },
    { id: "A.9.1.1", name: "A.9.1.1 - Access control policy" },
    { id: "A.9.4.3", name: "A.9.4.3 - Password management system" },
    { id: "A.11.1.2", name: "A.11.1.2 - Physical entry controls" },
    { id: "A.12.2.1", name: "A.12.2.1 - Controls against malware" },
    { id: "A.12.6.1", name: "A.12.6.1 - Management of technical vulnerabilities" },
    { id: "A.13.1.1", name: "A.13.1.1 - Network controls" },
    { id: "A.16.1.1", name: "A.16.1.1 - Responsibilities and procedures" },
    { id: "A.17.1.1", name: "A.17.1.1 - Planning information security continuity" },
    { id: "A.18.2.2", name: "A.18.2.2 - Compliance with security policies and standards" },
  ]

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      // Generate AI response based on user input
      const aiResponse = generateAIResponse(inputMessage)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        },
      ])

      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string) => {
    // This is a mock function that would be replaced with actual AI integration
    const input = userInput.toLowerCase()

    if (input.includes("risk") && (input.includes("assessment") || input.includes("analysis"))) {
      return "For risk assessment, I recommend following these steps:\n\n1. Identify assets and their value\n2. Identify threats and vulnerabilities\n3. Assess likelihood and impact\n4. Calculate risk levels\n5. Determine risk treatment options\n\nWould you like me to help you with a specific part of the risk assessment process?"
    } else if (input.includes("control") && input.includes("implement")) {
      return "Implementing controls effectively requires a systematic approach:\n\n1. Understand the control requirements\n2. Assess your current state\n3. Identify gaps\n4. Develop an implementation plan\n5. Allocate resources\n6. Implement the control\n7. Test effectiveness\n8. Document evidence\n\nYou can use the Control Implementation Guidance tab to get specific guidance for individual controls."
    } else if (input.includes("audit") && (input.includes("prepare") || input.includes("ready"))) {
      return "To prepare for an ISO 27001 audit:\n\n1. Review your ISMS documentation\n2. Ensure policies and procedures are up to date\n3. Check that risk assessments are current\n4. Verify control implementation evidence\n5. Conduct an internal audit\n6. Address any non-conformities\n7. Brief staff on the audit process\n8. Prepare an audit schedule and resources\n\nIs there a specific aspect of audit preparation you need help with?"
    } else if (
      input.includes("policy") &&
      (input.includes("write") || input.includes("create") || input.includes("develop"))
    ) {
      return "For policy development, consider using our Policy Generator in the Templates tab. A good policy should:\n\n1. State its purpose clearly\n2. Define scope and applicability\n3. Outline roles and responsibilities\n4. Provide clear requirements\n5. Include compliance measures\n6. Reference related documents\n7. Specify review frequency\n\nWould you like specific guidance on a particular policy?"
    } else if (
      input.includes("iso") &&
      input.includes("27001") &&
      (input.includes("what") || input.includes("explain"))
    ) {
      return "ISO 27001 is an international standard for information security management. It provides a framework for establishing, implementing, maintaining, and continually improving an Information Security Management System (ISMS).\n\nKey components include:\n\n- Risk assessment methodology\n- Security policy\n- Organization of information security\n- Asset management\n- Access control\n- Cryptography\n- Physical and environmental security\n- Operations security\n- Communications security\n- System acquisition and development\n- Supplier relationships\n- Incident management\n- Business continuity\n- Compliance\n\nThe standard follows a Plan-Do-Check-Act cycle and includes Annex A with 114 controls across 14 domains."
    } else if (input.includes("gap") && input.includes("analysis")) {
      return "A gap analysis helps identify differences between your current state and ISO 27001 requirements. You can use our Compliance Analyzer in the Analysis tab to help with this.\n\nThe process typically involves:\n\n1. Understanding the requirements\n2. Assessing your current controls\n3. Identifying gaps\n4. Prioritizing gaps based on risk\n5. Developing an implementation plan\n\nWould you like guidance on conducting a gap analysis for a specific area?"
    } else if (input.includes("certification") && (input.includes("process") || input.includes("steps"))) {
      return "The ISO 27001 certification process typically includes:\n\n1. Preparation: Implement ISMS and operate it for at least 3 months\n2. Stage 1 Audit: Documentation review by certification body\n3. Address gaps identified in Stage 1\n4. Stage 2 Audit: Detailed assessment of ISMS implementation\n5. Address any non-conformities\n6. Certification decision\n7. Surveillance audits (typically annual)\n8. Recertification (every 3 years)\n\nThe timeline varies but typically takes 6-12 months from implementation to certification."
    } else if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      return "Hello! I'm your ISO 27001 ISMS AI Assistant. I can help with:\n\n- Answering questions about ISO 27001\n- Providing implementation guidance\n- Helping with risk assessments\n- Generating policy templates\n- Analyzing compliance gaps\n- Recommending controls\n\nWhat would you like assistance with today?"
    } else {
      return (
        "I understand you're asking about " +
        userInput +
        ". To provide the most helpful response, could you provide more specific details about what you're looking for? I can help with ISO 27001 implementation, risk assessments, control guidance, policy development, and compliance analysis."
      )
    }
  }

  const handleGeneratePolicy = () => {
    if (!selectedTemplate || !policyTitle || !policyScope) {
      alert("Please fill in all required fields")
      return
    }

    setIsGeneratingPolicy(true)

    // Simulate policy generation
    setTimeout(() => {
      const template = policyTemplates.find((t) => t.id === selectedTemplate)

      // Generate mock policy based on template
      const policy = generatePolicyTemplate(template?.name || "", policyTitle, policyScope)

      setGeneratedPolicy(policy)
      setIsGeneratingPolicy(false)
    }, 2000)
  }

  const generatePolicyTemplate = (templateName: string, title: string, scope: string) => {
    // This would be replaced with actual AI-generated content
    return `# ${title}

## 1. Purpose
This policy establishes the guidelines and requirements for ${templateName.toLowerCase()} within ${scope}.

## 2. Scope
This policy applies to ${scope} and all information systems, employees, contractors, and third parties that access organizational information and systems.

## 3. Policy Statement
[Organization Name] is committed to protecting the confidentiality, integrity, and availability of its information assets through the implementation of effective security controls.

## 4. Roles and Responsibilities
- **Management**: Ensure resources are available for policy implementation
- **Information Security Officer**: Oversee policy implementation and compliance
- **System Administrators**: Implement technical controls
- **All Users**: Comply with policy requirements

## 5. Requirements
- Requirement 1: [Specific to the policy type]
- Requirement 2: [Specific to the policy type]
- Requirement 3: [Specific to the policy type]
- Requirement 4: [Specific to the policy type]

## 6. Compliance
Violations of this policy may result in disciplinary action, up to and including termination of employment or contract.

## 7. Related Documents
- ISO 27001 Information Security Management System
- Risk Assessment Procedure
- Incident Response Procedure

## 8. Review and Update
This policy shall be reviewed annually or when significant changes occur.

## 9. Approval
Approved by: [Approver Name]
Position: [Position]
Date: ${new Date().toLocaleDateString()}
Version: 1.0
`
  }

  const handleLoadControlGuidance = () => {
    if (!selectedControl) {
      alert("Please select a control")
      return
    }

    setIsLoadingGuidance(true)

    // Simulate loading guidance
    setTimeout(() => {
      const guidance = generateControlGuidance(selectedControl)
      setControlGuidance(guidance)
      setIsLoadingGuidance(false)
    }, 1500)
  }

  const generateControlGuidance = (controlId: string) => {
    // This would be replaced with actual AI-generated guidance
    const controlGuidanceMap: { [key: string]: string } = {
      "A.5.1.1": `# A.5.1.1 - Policies for information security

## Control Description
A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.

## Implementation Guidance
1. **Develop a comprehensive information security policy** that:
   - Aligns with organizational objectives
   - Addresses legal, regulatory, and contractual requirements
   - Provides a framework for security controls
   - Defines roles and responsibilities

2. **Ensure management approval** through:
   - Formal review process
   - Executive sign-off
   - Documented approval

3. **Publish and communicate** the policy:
   - Make accessible to all employees (intranet, document management system)
   - Include in onboarding for new employees
   - Provide regular awareness sessions
   - Distribute to relevant external parties with appropriate confidentiality agreements

4. **Supporting documents** should include:
   - Topic-specific policies (e.g., access control, acceptable use)
   - Procedures for implementation
   - Guidelines for users

## Common Pitfalls
- Policies too generic or too detailed
- Lack of management commitment
- Poor communication to staff
- Outdated policies not reflecting current threats
- No process for regular review

## Evidence for Audit
- Documented and approved information security policy
- Records of policy reviews and updates
- Communication records (emails, training materials)
- Acknowledgment records from employees
- Evidence of accessibility (screenshots of intranet, etc.)

## Related Controls
- A.5.1.2 Review of the policies for information security
- A.6.1.1 Information security roles and responsibilities
- A.18.2.2 Compliance with security policies and standards`,

      "A.9.4.3": `# A.9.4.3 - Password management system

## Control Description
Password management systems shall be interactive and shall ensure quality passwords.

## Implementation Guidance
1. **Implement a password management system** that:
   - Enforces minimum password complexity requirements
   - Prevents use of common or previously breached passwords
   - Requires regular password changes (but not too frequent)
   - Prevents reuse of recent passwords
   - Securely stores passwords (using strong hashing algorithms)

2. **Password complexity requirements** should include:
   - Minimum length (at least 12 characters recommended)
   - Combination of character types (uppercase, lowercase, numbers, special characters)
   - Validation against dictionary words and common patterns

3. **User experience considerations**:
   - Provide password strength meters
   - Allow paste functionality for password managers
   - Implement secure password reset mechanisms
   - Consider implementing multi-factor authentication

4. **Technical implementation**:
   - Use secure hashing algorithms (e.g., bcrypt, Argon2)
   - Implement account lockout after failed attempts
   - Log and monitor failed login attempts
   - Consider implementing CAPTCHA for login attempts

## Common Pitfalls
- Storing passwords in plaintext or using weak encryption
- Implementing complexity that encourages users to write down passwords
- Too frequent password changes leading to predictable patterns
- Lack of monitoring for compromised credentials
- Not supporting password managers

## Evidence for Audit
- Password policy documentation
- Screenshots of password requirements during creation/change
- System configuration settings
- Password hashing mechanism documentation
- Password reset procedure documentation

## Related Controls
- A.9.2.4 Management of secret authentication information of users
- A.9.3.1 Use of secret authentication information
- A.9.4.2 Secure log-on procedures`,

      "A.8.1.1": `# A.8.1.1 - Inventory of assets

## Control Description
Assets associated with information and information processing facilities shall be identified and an inventory of these assets shall be drawn up and maintained.

## Implementation Guidance
1. **Identify all assets** including:
   - Information assets (databases, files, documentation)
   - Software assets (applications, systems, development tools)
   - Physical assets (computers, network equipment, media)
   - Services (computing services, communications)
   - People and their qualifications/skills

2. **Create and maintain an asset inventory** that includes:
   - Unique identifier for each asset
   - Type and format of asset
   - Location of asset
   - Backup information
   - License information (for software)
   - Business value
   - Classification
   - Owner

3. **Establish processes** for:
   - Regular review and updates of the inventory
   - Adding new assets to the inventory
   - Removing decommissioned assets
   - Periodic verification of inventory accuracy

4. **Assign ownership** for:
   - Maintaining the inventory
   - Each individual asset in the inventory

## Common Pitfalls
- Incomplete inventory missing critical assets
- Outdated inventory not reflecting current environment
- No clear ownership of assets
- No process for maintaining the inventory
- Too detailed or too generic asset descriptions

## Evidence for Audit
- Asset inventory documentation
- Process for inventory maintenance
- Records of inventory reviews
- Asset ownership assignments
- Sample verification of physical assets against inventory

## Related Controls
- A.8.1.2 Ownership of assets
- A.8.2.1 Classification of information
- A.11.2.6 Security of equipment and assets off-premises`,

      "A.12.6.1": `# A.12.6.1 - Management of technical vulnerabilities

## Control Description
Information about technical vulnerabilities of information systems being used shall be obtained in a timely fashion, the organization's exposure to such vulnerabilities evaluated and appropriate measures taken to address the associated risk.

## Implementation Guidance
1. **Establish a vulnerability management process** that includes:
   - Defining roles and responsibilities
   - Maintaining an inventory of assets and software
   - Defining information sources for vulnerabilities
   - Risk assessment methodology
   - Patch management procedures
   - Testing procedures
   - Deployment procedures
   - Verification of remediation

2. **Implement vulnerability identification** through:
   - Subscription to security advisories
   - Vendor notifications
   - Regular vulnerability scanning
   - Penetration testing
   - Threat intelligence feeds

3. **Vulnerability assessment and prioritization**:
   - Evaluate applicability to your environment
   - Assess potential impact
   - Consider exploitability
   - Prioritize based on risk
   - Document exceptions with justification

4. **Remediation activities**:
   - Patch management
   - Configuration changes
   - Compensating controls
   - Acceptance of risk (with proper documentation)

## Common Pitfalls
- No defined process for tracking vulnerabilities
- Incomplete asset inventory
- Irregular or infrequent vulnerability scanning
- Lack of prioritization leading to critical vulnerabilities being overlooked
- No testing of patches before deployment
- No verification of successful remediation

## Evidence for Audit
- Vulnerability management policy and procedure
- Vulnerability scanning reports
- Patch management records
- Risk assessments for vulnerabilities
- Remediation tracking documentation
- Exception documentation with risk acceptance

## Related Controls
- A.12.5.1 Installation of software on operational systems
- A.14.2.2 System change control procedures
- A.14.2.3 Technical review of applications after operating platform changes
- A.14.2.8 System security testing`,
    }

    return controlGuidanceMap[controlId] || "Guidance not available for this control. Please try another control."
  }

  const handleAnalyzeCompliance = () => {
    if (!complianceInput.trim()) {
      alert("Please provide information about your current practices")
      return
    }

    setIsAnalyzing(true)

    // Simulate analysis
    setTimeout(() => {
      // This would be replaced with actual AI analysis
      const result = {
        overallScore: 65,
        strengths: [
          "Documentation is well-maintained",
          "Access control procedures are defined",
          "Regular security awareness training is conducted",
        ],
        gaps: [
          "Risk assessment methodology is not fully documented",
          "Asset inventory is incomplete",
          "Incident response procedures need improvement",
          "Supplier security requirements are not consistently applied",
        ],
        recommendations: [
          "Develop a comprehensive risk assessment methodology",
          "Complete and maintain an up-to-date asset inventory",
          "Enhance incident response procedures with regular testing",
          "Implement consistent supplier security assessment process",
        ],
      }

      setComplianceResult(result)
      setIsAnalyzing(false)
    }, 3000)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="templates">Policy Templates</TabsTrigger>
          <TabsTrigger value="guidance">Control Guidance</TabsTrigger>
          <TabsTrigger value="analysis">Compliance Analyzer</TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                ISO 27001 AI Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about ISO 27001, implementation guidance, risk assessment, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`flex max-w-[80%] ${
                        message.role === "assistant"
                          ? "bg-muted rounded-lg p-3"
                          : "bg-primary text-primary-foreground rounded-lg p-3"
                      }`}
                    >
                      <div className="mr-2 mt-0.5">
                        {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className="text-xs opacity-70 text-right">{formatTimestamp(message.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-5 w-5" />
                        <div className="typing-indicator">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Type your question about ISO 27001..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
          <div className="text-sm text-muted-foreground">
            <p>Example questions:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                "What is ISO 27001?",
                "How do I conduct a risk assessment?",
                "Help me prepare for an audit",
                "How to implement access controls?",
                "What's the certification process?",
              ].map((question, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setInputMessage(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Policy Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Policy Generator
              </CardTitle>
              <CardDescription>Generate policy templates for your ISMS documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="policy-template">Policy Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="policy-template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy-title">Policy Title</Label>
                  <Input
                    id="policy-title"
                    placeholder="e.g., Corporate Information Security Policy"
                    value={policyTitle}
                    onChange={(e) => setPolicyTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy-scope">Policy Scope</Label>
                <Textarea
                  id="policy-scope"
                  placeholder="Describe the scope of this policy (e.g., all employees, systems, and information assets)"
                  value={policyScope}
                  onChange={(e) => setPolicyScope(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGeneratePolicy}
                disabled={isGeneratingPolicy || !selectedTemplate || !policyTitle || !policyScope}
                className="w-full"
              >
                {isGeneratingPolicy ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating Policy...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Policy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedPolicy && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Policy</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedPolicy)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md whitespace-pre-line font-mono text-sm">{generatedPolicy}</div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                This is an AI-generated template. Review and customize it to fit your organization's specific needs.
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Control Guidance Tab */}
        <TabsContent value="guidance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Control Implementation Guidance
              </CardTitle>
              <CardDescription>Get detailed guidance on implementing ISO 27001 controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="control-select">Select Control</Label>
                <Select value={selectedControl} onValueChange={setSelectedControl}>
                  <SelectTrigger id="control-select">
                    <SelectValue placeholder="Select a control" />
                  </SelectTrigger>
                  <SelectContent>
                    {iso27001Controls.map((control) => (
                      <SelectItem key={control.id} value={control.id}>
                        {control.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleLoadControlGuidance}
                disabled={isLoadingGuidance || !selectedControl}
                className="w-full"
              >
                {isLoadingGuidance ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading Guidance...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Load Implementation Guidance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {controlGuidance && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Implementation Guidance</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(controlGuidance)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md whitespace-pre-line font-mono text-sm">{controlGuidance}</div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                This guidance is based on industry best practices and the ISO 27001 standard.
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Analyzer Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Compliance Gap Analyzer
              </CardTitle>
              <CardDescription>Analyze your current practices against ISO 27001 requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compliance-input">Describe Your Current Practices</Label>
                <Textarea
                  id="compliance-input"
                  placeholder="Describe your current information security practices, controls, and documentation..."
                  value={complianceInput}
                  onChange={(e) => setComplianceInput(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              <Button
                onClick={handleAnalyzeCompliance}
                disabled={isAnalyzing || !complianceInput.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Analyze Compliance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {complianceResult && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="10"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                      />
                      <circle
                        className="text-primary stroke-current"
                        strokeWidth="10"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        strokeDasharray={`${(2.5 * Math.PI * 40 * complianceResult.overallScore) / 100} ${2.5 * Math.PI * 40 * (1 - complianceResult.overallScore / 100)}`}
                        strokeDashoffset={2.5 * Math.PI * 10}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{complianceResult.overallScore}%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Overall Compliance Score</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                      Strengths
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {complianceResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                      Gaps Identified
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {complianceResult.gaps.map((gap, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
                      Recommendations
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {complianceResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button variant="outline" onClick={() => setComplianceResult(null)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Analysis
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: currentColor;
          opacity: 0.6;
          margin-right: 4px;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .dot:nth-child(3) {
          animation-delay: 0.4s;
          margin-right: 0;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  )
}

