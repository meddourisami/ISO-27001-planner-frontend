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
import { Plus, Search, Filter, ArrowUpDown, FileText, Download, Eye, EditIcon } from "lucide-react"
import { AppDispatch, type RootState } from "@/lib/store"
import { approveDocumentAsync, createDocumentAsync, fetchDocumentsPageAsync, fetchVersionHistoryAsync, updateDocumentAsync } from "@/lib/features/documents/documentsSlice"
import { downloadVersion } from "@utils/api"
import { useToast } from "@/hooks/use-toast"
import { DocumentDto } from "@/types"
import { useDropzone } from "react-dropzone";
import { useAppSelector } from "@/lib/hooks"


export default function DocumentManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: documents,
    loading,
    error,
    totalPages,
    totalElements,
  } = useAppSelector((state) => state.documents);
  const versionHistory = useSelector((state: RootState) => state.documents.versions);
  const user = useSelector((s: RootState) => s.auth.user);
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("title")
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');
  const [newDocument, setNewDocument] = useState<Omit<DocumentDto, "id" | "companyId">>({
    title: "",
    description: "",
    type: "policy",
    status: "draft",
    version: "1.0",
    owner: user?.email || "",
    approver: "",
    approvalDate: "",
    reviewDate: "",
    content: "",
    relatedControls: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
  if (user?.companyId != null) {
    dispatch(fetchDocumentsPageAsync({
      companyId: user.companyId,
      page,
      size,
      search: searchTerm,
      type: filterType,
      sortBy,
      sortOrder
    }));
  }
}, [dispatch, user?.companyId, page, size, searchTerm, filterType, sortBy, sortOrder]);

  useEffect(() => {
    // Prefetch versions for all documents once
    documents.forEach(doc => {
      dispatch(fetchVersionHistoryAsync(doc.id));
    });
  }, [dispatch, documents]);

  const handleAddDocument = async () => {
    if (!user?.companyId) return toast({ title: "Error", description: "Missing company.", variant: "destructive" });

    const dto: Omit<DocumentDto, "id"> = {
      ...newDocument,
      owner: user.email,
      companyId: user.companyId,
    };
    console.log( " " + dto.version +  "   file version ")

    try {
      if (isEditing && currentDocId) {
        if (!file) {
          return toast({ title: "Error", description: "Please select a file to upload a new version.", variant: "destructive" });
        }
        // Dispatch version upload
        console.log("Uploading version:", currentDocId, file);
        const result = await dispatch(updateDocumentAsync({ id: currentDocId, dto, file })).unwrap();
        console.log(result, "result of the update ")
      } else {
        await dispatch(createDocumentAsync({ dto, file })).unwrap();
      }
      toast({ title: "Success", description: `Document ${isEditing ? "updated" : "created"}` });
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err || err.message || "something went wrong", variant: "destructive" });
      console.log(err?.data?.message, err?.message, err.response?.data, err, err.message)
    }
  };

  const resetForm = () => {
    setNewDocument({
      title: "",
      description: "",
      type: "policy",
      status: "draft",
      version: "1.0",
      owner: user?.email || "",
      approver: "",
      approvalDate: "",
      reviewDate: "",
      content: "",
      relatedControls: "",
    });
    setFile(null);
    setIsEditing(false);
    setCurrentDocId(null);
  };


  const handleEdit = (doc: DocumentDto) => {
    setNewDocument({
      title: doc.title,
      description: doc.description,
      type: doc.type,
      status: doc.status,
      version: doc.version,
      owner: doc.owner,
      approver: doc.approver,
      approvalDate: doc.approvalDate ?? "",
      reviewDate: doc.reviewDate ?? "",
      content: doc.content ?? "",
      relatedControls: doc.relatedControls ?? "",
    });
    setFile(null);              // clear old file
    setIsEditing(true);
    setCurrentDocId(doc.id!);
    setDialogOpen(true);
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    onDrop: files => files.length && setFile(files[0]),
  });

  const openDocumentPreview = async (docId: string, isDownload = false) => {
    try {
      await dispatch(fetchVersionHistoryAsync(docId)).unwrap();

      const versions = versionHistory[docId] || [];
      if (!versions || versions.length === 0) throw new Error("No versions available.");

      const latest = versions
        .slice()
        .sort((a, b) => parseFloat(b.version) - parseFloat(a.version))[0];

      const blob = await downloadVersion(latest.id);
      const url = window.URL.createObjectURL(blob);

      if (isDownload) {
        const a = document.createElement('a');
        a.href = url;
        a.download = latest.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setCurrentDocId(docId);
        setPreviewUrl(url);
        setIsPreviewOpen(true);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description: e.message || "Unable to open document.",
      });
    }
  };

  const handleDownload = (docId: string) =>
    openDocumentPreview(docId, true);

  const handleView = (docId: string) =>
    openDocumentPreview(docId, false);

  async function handleFileDownload(versionId: number, fileName = "document") {
    try {
      const blob = await downloadVersion(versionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Unable to download the document version.",
        variant: "destructive",
      });
    }
  }

  const handleApprove = async (id : String) => {
    try {
      const msg = await dispatch(approveDocumentAsync(id)).unwrap();
      toast({ title: 'Approved', description: msg });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: typeof err === 'string' ? err : err.message || 'An error occurred.',
        variant: 'destructive',
      });
    }
  };

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
  console.log(documents[1].relatedControls, "realted controls here")



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
              <CardDescription>Manage your ISMS policies, procedures, and records. Explore our templates as a start point!</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) resetForm(); setDialogOpen(v); }}>
              <DialogTrigger asChild>
                <Button><span className="mr-2">➕</span> {isEditing ? "Edit Document" : "Add Document"}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader className="sticky top-0 bg-white z-10">
                  <DialogTitle>{isEditing ? "Edit Document" : "Add New Document"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Update fields and optionally upload new version" : "Fill details and upload file if available"}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto px-2 py-4">
                  <div className="grid gap-4 py-4">
                    {/* Form fields */}
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={newDocument.title ?? ""} onChange={e => setNewDocument({ ...newDocument, title: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={newDocument.description ?? ""} onChange={e => setNewDocument({ ...newDocument, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newDocument.type  ?? ""}
                          onValueChange={(v) => setNewDocument({ ...newDocument, type: v })}
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["policy", "procedure", "standard", "record", "form"].map((o) => (
                              <SelectItem key={o} value={o}>
                                {o.charAt(0).toUpperCase() + o.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newDocument.status  ?? ""}
                          onValueChange={(v) => setNewDocument({ ...newDocument, status: v })}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {["draft", "review", "approved", "obsolete"].map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="version">Version</Label>
                        <Input id="version" value={newDocument.version  ?? ""} onChange={e => setNewDocument({ ...newDocument, version: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="approvalDate">Approval Date</Label>
                        <Input id="approvalDate" type="date" value={newDocument.approvalDate  ?? ""} onChange={e => setNewDocument({ ...newDocument, approvalDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="owner">Owner</Label>
                        <Input id="owner" value={newDocument.owner  ?? ""} onChange={e => setNewDocument({ ...newDocument, owner: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="approver">Approver</Label>
                        <Input id="approver" value={newDocument.approver  ?? ""} onChange={e => setNewDocument({ ...newDocument, approver: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reviewDate">Next Review</Label>
                      <Input id="reviewDate" type="date" value={newDocument.reviewDate  ?? ""} onChange={e => setNewDocument({ ...newDocument, reviewDate: e.target.value })} />
                    </div>
                    <div>
                      <Label>Content / Summary</Label>
                      <Textarea value={newDocument.content  ?? ""} onChange={e => setNewDocument({ ...newDocument, content: e.target.value })} />
                    </div>

                    {/* File upload */}
                    <div>
                      <Label>Upload File</Label>
                      <div {...getRootProps()} className="p-4 rounded border-2 border-dashed hover:bg-gray-50">
                        <input {...getInputProps()} />
                        {file ? <p>📄 {file.name}</p> : <p>Drag & drop or click to select file</p>}
                      </div>
                    </div>

                    {/* Version history */}
                    {isEditing && currentDocId && versionHistory[currentDocId]?.length > 0 && (
                      <div className="border-t pt-2">
                        <h4>Version History</h4>
                        <ul className="list-disc ml-4">
                          {versionHistory[currentDocId].map(v => (
                            <li key={v.id} className="flex items-center justify-between">
                              <span>v{v.version} – {new Date(v.uploadedAt).toLocaleDateString()}</span>
                              <Button size="sm" onClick={() => handleFileDownload(v.id, v.fileName || "document")}>Download</Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancel</Button>
                  <Button onClick={handleAddDocument}>{isEditing ? "Save Changes" : "Create Document"}</Button>
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
                value={searchTerm  ?? ""}
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
                {["policy", "procedure", "standard", "record", "form"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
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
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No documents found. Add a new document to get started.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
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
                    <TableCell>v{doc.version}</TableCell>
                    <TableCell>{doc.owner}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(doc.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="default" onClick={() => handleApprove(doc.id)}>
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <Dialog
            open={isPreviewOpen}
            onOpenChange={(open) => {
              if (!open && previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }
              setIsPreviewOpen(open);
            }}
          >
            <DialogContent className="max-w-4xl w-full max-h-4xl h-full p-6 flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-lg">📄 Document Preview</DialogTitle>
                <DialogDescription>
                  You are viewing the latest version of this document.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 mt-4 border rounded-md overflow-hidden shadow-inner bg-white">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="Document Preview"
                    frameBorder="0"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No preview available
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  disabled={!previewUrl}
                  onClick={() => previewUrl && window.print()}
                >
                  📃 Print
                </Button>
                <Button
                  variant="outline"
                  disabled={!previewUrl}
                  onClick={() => {
                    if (previewUrl) {
                      const a = document.createElement('a');
                      a.href = previewUrl;
                      a.download = "document.pdf";
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }
                  }}
                >
                  📥 Download
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

