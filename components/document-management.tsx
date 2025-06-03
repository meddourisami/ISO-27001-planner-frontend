"use client"

import { useState } from "react"
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
import { Plus, Search, Filter, ArrowUpDown, FileText, Download, Eye, EditIcon } from "lucide-react"
import type { RootState } from "@/lib/store"
import { addDocument, updateDocument } from "@/lib/features/documents/documentsSlice"

export default function DocumentManagement() {
  const documents = useSelector((state: RootState) => state.documents.items)
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("title")
  const [sortOrder, setSortOrder] = useState("asc")

  const [newDocument, setNewDocument] = useState({
    id: "",
    title: "",
    description: "",
    type: "policy",
    status: "draft",
    version: "1.0",
    owner: "",
    approver: "",
    approvalDate: "",
    reviewDate: "",
    content: "",
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleAddDocument = () => {
    if (isEditing) {
      dispatch(updateDocument(newDocument))
    } else {
      dispatch(
        addDocument({
          ...newDocument,
          id: Date.now().toString(),
        }),
      )
    }
    setDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setNewDocument({
      id: "",
      title: "",
      description: "",
      type: "policy",
      status: "draft",
      version: "1.0",
      owner: "",
      approver: "",
      approvalDate: "",
      reviewDate: "",
      content: "",
    })
    setIsEditing(false)
  }

  const handleEdit = (document: any) => {
    setNewDocument(document)
    setIsEditing(true)
    setDialogOpen(true)
  }

  const filteredDocuments = documents
    .filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((doc) => (filterType === "all" ? true : doc.type === filterType))
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "review":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "obsolete":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
              <CardTitle>Document Management</CardTitle>
              <CardDescription>Manage your ISMS policies, procedures, and records</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Document" : "Add New Document"}</DialogTitle>
                  <DialogDescription>
                    {isEditing
                      ? "Update the document details below"
                      : "Fill in the details to add a new document to your ISMS"}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-2 py-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDocument.description}
                        onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Document Type</Label>
                      <Select
                        value={newDocument.type}
                        onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="policy">Policy</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="record">Record</SelectItem>
                          <SelectItem value="form">Form</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newDocument.status}
                        onValueChange={(value) => setNewDocument({ ...newDocument, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="review">In Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="obsolete">Obsolete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={newDocument.version}
                        onChange={(e) => setNewDocument({ ...newDocument, version: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="owner">Document Owner</Label>
                      <Input
                        id="owner"
                        value={newDocument.owner}
                        onChange={(e) => setNewDocument({ ...newDocument, owner: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="approver">Approver</Label>
                      <Input
                        id="approver"
                        value={newDocument.approver}
                        onChange={(e) => setNewDocument({ ...newDocument, approver: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="approvalDate">Approval Date</Label>
                      <Input
                        id="approvalDate"
                        type="date"
                        value={newDocument.approvalDate}
                        onChange={(e) => setNewDocument({ ...newDocument, approvalDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviewDate">Next Review Date</Label>
                      <Input
                        id="reviewDate"
                        type="date"
                        value={newDocument.reviewDate}
                        onChange={(e) => setNewDocument({ ...newDocument, reviewDate: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="content">Document Content</Label>
                      <Textarea
                        id="content"
                        value={newDocument.content}
                        onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                        className="min-h-[200px]"
                        placeholder="Enter document content or upload a file"
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
                  <Button onClick={handleAddDocument}>{isEditing ? "Update Document" : "Add Document"}</Button>
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
                placeholder="Search documents..."
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
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="record">Record</SelectItem>
                <SelectItem value="form">Form</SelectItem>
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
                    Document
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
                      setSortBy("version")
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }}
                  >
                    Version
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
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No documents found. Add a new document to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        {doc.title}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{doc.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>{doc.owner}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
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
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

