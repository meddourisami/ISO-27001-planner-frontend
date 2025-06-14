"use client"

import { useState, useMemo, useEffect } from "react"
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
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Server,
  Database,
  HardDrive,
  Laptop,
  FileText,
  Users,
  Building,
  LinkIcon,
} from "lucide-react"
import type { RootState } from "@/lib/store"
import { fetchAssets, deleteAssetAsync, addAssetAsync, updateAssetAsync } from "@/lib/features/assets/assetsSlice"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { useToast } from "@/hooks/use-toast"
import { AssetDto } from "@/types"
import { fetchRisks, updateRiskAsync } from "@/lib/features/risks/risksSlice"

export default function AssetsManagement() {
  const assets = useAppSelector((s) => s.assets.items);
  const status = useAppSelector((s) => s.assets.loading);
  const dispatch = useAppDispatch();

  const risks = useSelector((state: RootState) => state.risks.items);

  const getRisk = (riskId: string) => risks.find((r) => r.id === riskId);

  const user = useAppSelector(state => state.auth.user)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState<keyof typeof assets[0]>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("list")

  const initialNewAsset: Omit<AssetDto, "id"> = {
    name: "",
    description: "",
    type: "hardware",
    classification: "confidential",
    ownerEmail: "",
    location: "",
    status: "active",
    value: "medium",
    vulnerabilities: "",
    controls: "",
    lastReview: new Date().toISOString().split("T")[0],
    relatedRisks: [],
    companyId: 0, // will be replaced when dispatching
  };

  const [newAsset, setNewAsset] = useState(initialNewAsset);

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  // Use useMemo for all derived state to avoid unnecessary recalculations and mutations
  const filteredAssets = useMemo(() => {
    // Create a new array to avoid modifying the original
    return [...assets]
      .filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .filter((asset) => (filterType === "all" ? true : asset.type === filterType))
      .sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a]
        const bValue = b[sortBy as keyof typeof b]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
  }, [assets, searchTerm, filterType, sortBy, sortOrder])

  // Calculate asset statistics with useMemo
  const assetStats = useMemo(() => {
    const totalAssets = assets.length

    const assetsByType = assets.reduce((acc: Record<string, number>, asset) => {
      const type = asset.type || "unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const assetsByClassification = assets.reduce((acc: Record<string, number>, asset) => {
      const classification = asset.classification || "unknown"
      acc[classification] = (acc[classification] || 0) + 1
      return acc
    }, {})

    const criticalAssets = assets.filter((a) => a.value === "critical").length
    const highValueAssets = assets.filter((a) => a.value === "high").length
    const assetsWithRisks = assets.filter((a) => a.relatedRisks && a.relatedRisks.length > 0).length

    return {
      totalAssets,
      assetsByType,
      assetsByClassification,
      criticalAssets,
      highValueAssets,
      assetsWithRisks,
    }
  }, [assets])

  // Get top assets by risk count
  const topAssetsByRisk = useMemo(() => {
    return [...assets]
      .sort((a, b) => {
        const aRisks = a.relatedRisks ? a.relatedRisks.length : 0
        const bRisks = b.relatedRisks ? b.relatedRisks.length : 0
        return bRisks - aRisks
      })
      .slice(0, 5)
  }, [assets])

  // Get related risks for an asset
  const getRelatedRisks = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset || !asset.relatedRisks) return []

    return asset
    ? risks.filter((risk) => asset.relatedRisks.includes(risk.id))
    : [];
  }

  // Get asset details
  const getAssetDetails = (assetId: string) => {
    return assets.find((asset) => asset.id === assetId)
  }

  const handleAddAsset = async () => {
  try {
    console.log("[DEBUG] Starting handleAddAsset", { newAsset, isEditing, user });

    if (!user?.email || !user.companyId) throw new Error("User not authenticated properly.");

    const payload: Omit<AssetDto, "id"> = {
      ...newAsset,
      ownerEmail: user.email!,
      companyId: user.companyId,
      lastReview: new Date().toISOString().split("T")[0],
    };

    console.log("[DEBUG] Asset payload:", payload);

    const asset = isEditing
      ? await dispatch(updateAssetAsync(payload as AssetDto)).unwrap()
      : await dispatch(addAssetAsync(payload)).unwrap();

    console.log("[DEBUG] Asset processed:", asset);

    await Promise.all(
      asset.relatedRisks.map(async (riskId) => {
        const existing = risks.find(r => r.id === riskId);
        if (existing && existing.assetId !== asset.id) {
          await dispatch(updateRiskAsync({ ...existing, assetId: asset.id })).unwrap();
        }
      })
    );

    await dispatch(fetchRisks(user.companyId)).unwrap();

    toast({ title: "Success", description: `Asset ${isEditing ? "updated" : "created"} successfully` });
    setDialogOpen(false);
    resetForm();

  } catch (err: any) {
    console.error("[ERROR] handleAddAsset error:", err);
    toast({
      title: "Error",
      description: err.message || "Failed to save asset.",
      variant: "destructive",
    });
  }
};

  const handleEdit = (asset: typeof newAsset) => {
    setNewAsset(asset);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this asset?")) {
      await dispatch(deleteAssetAsync(id)).unwrap();
    }
  };

  const resetForm = () => {
    setNewAsset({
      ...initialNewAsset,
      lastReview: new Date().toISOString().split("T")[0],
    });
    setIsEditing(false);
  };

  const handleRiskCheckboxChange = (riskId: string, checked: boolean) => {
    if (checked) {
      // Add the risk ID to the array by creating a new array
      setNewAsset({
        ...newAsset,
        relatedRisks: [...newAsset.relatedRisks, riskId],
      })
    } else {
      // Remove the risk ID by creating a new filtered array
      setNewAsset({
        ...newAsset,
        relatedRisks: newAsset.relatedRisks.filter((id) => id !== riskId),
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hardware":
        return <HardDrive className="h-4 w-4" />
      case "software":
        return <Laptop className="h-4 w-4" />
      case "data":
        return <Database className="h-4 w-4" />
      case "system":
        return <Server className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "people":
        return <Users className="h-4 w-4" />
      case "facility":
        return <Building className="h-4 w-4" />
      default:
        return <HardDrive className="h-4 w-4" />
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "public":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "internal":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "confidential":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "restricted":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "maintenance":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "retired":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="list">Asset List</TabsTrigger>
          <TabsTrigger value="dashboard">Asset Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Asset Inventory</CardTitle>
                  <CardDescription>Manage your information assets and their security controls</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Asset
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                    <DialogHeader className="sticky top-0 bg-white z-10">
                      <DialogTitle>{isEditing ? "Edit Asset" : "Add New Asset"}</DialogTitle>
                      <DialogDescription>
                        {isEditing
                          ? "Update the asset details below"
                          : "Fill in the details to add a new asset to your inventory"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-2 py-4">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="name">Asset Name</Label>
                          <Input
                            id="name"
                            value={newAsset.name}
                            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newAsset.description}
                            onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Asset Type</Label>
                          <Select
                            value={newAsset.type}
                            onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}
                          >
                            <SelectTrigger id="type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hardware">Hardware</SelectItem>
                              <SelectItem value="software">Software</SelectItem>
                              <SelectItem value="data">Data</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="people">People</SelectItem>
                              <SelectItem value="facility">Facility</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="classification">Classification</Label>
                          <Select
                            value={newAsset.classification}
                            onValueChange={(value) => setNewAsset({ ...newAsset, classification: value })}
                          >
                            <SelectTrigger id="classification">
                              <SelectValue placeholder="Select classification" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="internal">Internal</SelectItem>
                              <SelectItem value="confidential">Confidential</SelectItem>
                              <SelectItem value="restricted">Restricted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="owner">Asset Owner</Label>
                          <Input
                            id="owner"
                            value={newAsset.ownerEmail}
                            onChange={(e) => setNewAsset({ ...newAsset, ownerEmail: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newAsset.location}
                            onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newAsset.status}
                            onValueChange={(value) => setNewAsset({ ...newAsset, status: value })}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="retired">Retired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="value">Business Value</Label>
                          <Select
                            value={newAsset.value}
                            onValueChange={(value) => setNewAsset({ ...newAsset, value: value })}
                          >
                            <SelectTrigger id="value">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="vulnerabilities">Known Vulnerabilities</Label>
                          <Textarea
                            id="vulnerabilities"
                            value={newAsset.vulnerabilities}
                            onChange={(e) => setNewAsset({ ...newAsset, vulnerabilities: e.target.value })}
                            placeholder="List known vulnerabilities of this asset"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="controls">Security Controls</Label>
                          <Textarea
                            id="controls"
                            value={newAsset.controls}
                            onChange={(e) => setNewAsset({ ...newAsset, controls: e.target.value })}
                            placeholder="List security controls protecting this asset"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Related Risks</Label>
                          <div className="border rounded-md p-2 mt-1 max-h-[150px] overflow-y-auto">
                            {risks.length === 0 ? (
                              <p className="text-sm text-muted-foreground p-2">No risks available</p>
                            ) : (
                              risks.map((risk) => (
                                <div key={risk.id} className="flex items-center space-x-2 py-1">
                                  <input
                                    type="checkbox"
                                    id={`risk-${risk.id}`}
                                    checked={newAsset.relatedRisks.includes(risk.id)}
                                    onChange={(e) => handleRiskCheckboxChange(risk.id, e.target.checked)}
                                    className="rounded"
                                  />
                                  <label htmlFor={`risk-${risk.id}`} className="text-sm">
                                    {risk.title}
                                  </label>
                                </div>
                              ))
                            )}
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
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddAsset}>{isEditing ? "Update Asset" : "Add Asset"}</Button>
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
                    placeholder="Search assets..."
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
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="people">People</SelectItem>
                    <SelectItem value="facility">Facility</SelectItem>
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
                          setSortBy("name")
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
                          setSortBy("classification")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Classification
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 font-medium"
                        onClick={() => {
                          setSortBy("ownerEmail")
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
                          setSortBy("status")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Risks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No assets found. Add a new asset to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id} className={selectedAsset === asset.id ? "bg-accent" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {getTypeIcon(asset.type)}
                            <span className="ml-2">{asset.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{asset.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getClassificationColor(asset.classification)}>
                            {asset.classification.charAt(0).toUpperCase() + asset.classification.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.ownerEmail}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(asset.status)}>
                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            {asset.relatedRisks ? asset.relatedRisks.length : 0}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {selectedAsset && (
                <div className="mt-4 border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Related Risks</h3>
                  {getAssetDetails(selectedAsset)?.relatedRisks?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No risks associated with this asset.</p>
                  ) : (
                    <div className="space-y-2">
                      {getRelatedRisks(selectedAsset).map((risk) => (
                        <div key={risk.id} className="p-2 border rounded-md">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{risk.title}</h4>
                            <Badge className={`ml-2 ${getSeverityColor(risk.severity)}`}>
                              {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredAssets.length} of {assets.length} assets
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assetStats.totalAssets}</div>
                <p className="text-xs text-muted-foreground mt-2">Assets in inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{assetStats.criticalAssets}</div>
                <Progress
                  value={(assetStats.criticalAssets / assetStats.totalAssets) * 100}
                  className="h-2 mt-2 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((assetStats.criticalAssets / assetStats.totalAssets) * 100)}% of total assets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Value Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{assetStats.highValueAssets}</div>
                <Progress
                  value={(assetStats.highValueAssets / assetStats.totalAssets) * 100}
                  className="h-2 mt-2 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((assetStats.highValueAssets / assetStats.totalAssets) * 100)}% of total assets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Assets with Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{assetStats.assetsWithRisks}</div>
                <Progress
                  value={(assetStats.assetsWithRisks / assetStats.totalAssets) * 100}
                  className="h-2 mt-2 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((assetStats.assetsWithRisks / assetStats.totalAssets) * 100)}% of total assets
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assets by Type</CardTitle>
                <CardDescription>Distribution of assets by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(assetStats.assetsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center">
                      <div className="w-12 text-sm capitalize">{type}</div>
                      <div className="w-full ml-2">
                        <div className="flex items-center">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${((count as number) / assetStats.totalAssets) * 100}%` }}
                          ></div>
                          <span className="ml-2 text-sm">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assets by Classification</CardTitle>
                <CardDescription>Distribution of assets by classification level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(assetStats.assetsByClassification).map(([classification, count]) => (
                    <div key={classification} className="flex items-center">
                      <div className="w-24 text-sm capitalize">{classification}</div>
                      <div className="w-full ml-2">
                        <div className="flex items-center">
                          <div
                            className={`h-2 rounded-full ${
                              classification === "restricted"
                                ? "bg-red-500"
                                : classification === "confidential"
                                  ? "bg-amber-500"
                                  : classification === "internal"
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                            }`}
                            style={{ width: `${((count as number) / assetStats.totalAssets) * 100}%` }}
                          ></div>
                          <span className="ml-2 text-sm">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Assets by Risk</CardTitle>
              <CardDescription>Assets with the most associated risks</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Risk Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAssetsByRisk.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getTypeIcon(asset.type)}
                          <span className="ml-2">{asset.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{asset.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getClassificationColor(asset.classification)}>
                          {asset.classification.charAt(0).toUpperCase() + asset.classification.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{asset.value}</TableCell>
                      <TableCell>
                        <Badge variant={asset.relatedRisks && asset.relatedRisks.length > 0 ? "default" : "outline"}>
                          {asset.relatedRisks ? asset.relatedRisks.length : 0}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

