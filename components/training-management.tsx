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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  GraduationCap,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { RootState } from "@/lib/store"
import {
  addTraining,
  updateTraining,
  deleteTraining,
  updateEmployeeCompletion,
} from "@/lib/features/training/trainingSlice"

export default function TrainingManagement() {
  const trainings = useSelector((state: RootState) => state.training.items)
  const employees = useSelector((state: RootState) => state.training.employees)
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")
  const [sortOrder, setSortOrder] = useState("asc")
  const [activeTab, setActiveTab] = useState("courses")

  const [newTraining, setNewTraining] = useState({
    id: "",
    title: "",
    description: "",
    type: "security-awareness",
    status: "scheduled",
    startDate: "",
    endDate: "",
    duration: 60,
    instructor: "",
    materials: "",
    requiredFor: [] as string[],
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null)

  const handleAddTraining = () => {
    if (isEditing) {
      dispatch(updateTraining({ ...newTraining }))
    } else {
      dispatch(
        addTraining({
          ...newTraining,
          id: Date.now().toString(),
        }),
      )
    }
    setDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setNewTraining({
      id: "",
      title: "",
      description: "",
      type: "security-awareness",
      status: "scheduled",
      startDate: "",
      endDate: "",
      duration: 60,
      instructor: "",
      materials: "",
      requiredFor: [],
    })
    setIsEditing(false)
  }

  const handleEdit = (training: any) => {
    setNewTraining({
      id: training.id,
      title: training.title,
      description: training.description,
      type: training.type,
      status: training.status,
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      instructor: training.instructor,
      materials: training.materials,
      requiredFor: [...training.requiredFor],
    })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this training?")) {
      dispatch(deleteTraining(id))
    }
  }

  const handleEmployeeCompletion = (trainingId: string, employeeId: string, completed: boolean) => {
    dispatch(updateEmployeeCompletion({ trainingId, employeeId, completed }))
  }

  const handleDepartmentCheckboxChange = (department: string, checked: boolean) => {
    if (checked) {
      // Add all employees from this department
      const departmentEmployees = employees.filter((emp) => emp.department === department).map((emp) => emp.id)

      setNewTraining({
        ...newTraining,
        requiredFor: [...new Set([...newTraining.requiredFor, ...departmentEmployees])],
      })
    } else {
      // Remove all employees from this department
      const departmentEmployees = employees.filter((emp) => emp.department === department).map((emp) => emp.id)

      setNewTraining({
        ...newTraining,
        requiredFor: newTraining.requiredFor.filter((id) => !departmentEmployees.includes(id)),
      })
    }
  }

  const filteredTrainings = trainings
    .filter(
      (training) =>
        training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((training) => (filterStatus === "all" ? true : training.status === filterStatus))
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = new Date(a.endDate).getTime()
        const dateB = new Date(b.endDate).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  // Calculate training statistics
  const totalEmployees = employees.length
  const totalTrainings = trainings.length
  const completedTrainings = employees.reduce((total, employee) => {
    return total + employee.completedTrainings.length
  }, 0)

  const overallCompletionRate =
    totalEmployees > 0 && totalTrainings > 0
      ? Math.round((completedTrainings / (totalEmployees * totalTrainings)) * 100)
      : 0

  // Get departments from employees
  const departments = [...new Set(employees.map((emp) => emp.department))]

  // Calculate completion by department
  const completionByDepartment = departments.map((dept) => {
    const deptEmployees = employees.filter((emp) => emp.department === dept)
    const totalDeptEmployees = deptEmployees.length
    const completedDeptTrainings = deptEmployees.reduce((total, emp) => {
      return total + emp.completedTrainings.length
    }, 0)

    const completionRate =
      totalDeptEmployees > 0 && totalTrainings > 0
        ? Math.round((completedDeptTrainings / (totalDeptEmployees * totalTrainings)) * 100)
        : 0

    return {
      department: dept,
      completionRate,
      totalEmployees: totalDeptEmployees,
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "in-progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security-awareness":
        return <Shield className="h-4 w-4" />
      case "phishing-simulation":
        return <Mail className="h-4 w-4" />
      case "policy-training":
        return <FileText className="h-4 w-4" />
      case "compliance-training":
        return <CheckSquare className="h-4 w-4" />
      default:
        return <GraduationCap className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="courses">Training Courses</TabsTrigger>
          <TabsTrigger value="dashboard">Training Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Training Management</CardTitle>
                  <CardDescription>Manage security awareness and compliance training</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Training
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                    <DialogHeader className="sticky top-0 bg-white z-10">
                      <DialogTitle>{isEditing ? "Edit Training" : "Add New Training"}</DialogTitle>
                      <DialogDescription>
                        {isEditing
                          ? "Update the training details below"
                          : "Fill in the details to add a new training course"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto px-4">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="title">Training Title</Label>
                          <Input
                            id="title"
                            value={newTraining.title}
                            onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newTraining.description}
                            onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Training Type</Label>
                          <Select
                            value={newTraining.type}
                            onValueChange={(value) => setNewTraining({ ...newTraining, type: value })}
                          >
                            <SelectTrigger id="type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="security-awareness">Security Awareness</SelectItem>
                              <SelectItem value="phishing-simulation">Phishing Simulation</SelectItem>
                              <SelectItem value="policy-training">Policy Training</SelectItem>
                              <SelectItem value="compliance-training">Compliance Training</SelectItem>
                              <SelectItem value="technical-training">Technical Training</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newTraining.status}
                            onValueChange={(value) => setNewTraining({ ...newTraining, status: value })}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={newTraining.startDate}
                            onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newTraining.endDate}
                            onChange={(e) => setNewTraining({ ...newTraining, endDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={newTraining.duration.toString()}
                            onChange={(e) =>
                              setNewTraining({ ...newTraining, duration: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructor">Instructor</Label>
                          <Input
                            id="instructor"
                            value={newTraining.instructor}
                            onChange={(e) => setNewTraining({ ...newTraining, instructor: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="materials">Training Materials</Label>
                          <Textarea
                            id="materials"
                            value={newTraining.materials}
                            onChange={(e) => setNewTraining({ ...newTraining, materials: e.target.value })}
                            placeholder="Links to training materials or resources"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Required For</Label>
                          <div className="border rounded-md p-2 mt-1 max-h-[150px] overflow-y-auto">
                            <div className="mb-2 pb-2 border-b">
                              <p className="text-sm font-medium mb-1">Departments</p>
                              {departments.map((dept) => (
                                <div key={dept} className="flex items-center space-x-2 py-1">
                                  <input
                                    type="checkbox"
                                    id={`dept-${dept}`}
                                    checked={employees
                                      .filter((emp) => emp.department === dept)
                                      .every((emp) => newTraining.requiredFor.includes(emp.id))}
                                    onChange={(e) => handleDepartmentCheckboxChange(dept, e.target.checked)}
                                    className="rounded"
                                  />
                                  <label htmlFor={`dept-${dept}`} className="text-sm">
                                    {dept}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm font-medium mb-1">Individual Employees</p>
                            {employees.map((employee) => (
                              <div key={employee.id} className="flex items-center space-x-2 py-1">
                                <input
                                  type="checkbox"
                                  id={`emp-${employee.id}`}
                                  checked={newTraining.requiredFor.includes(employee.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewTraining({
                                        ...newTraining,
                                        requiredFor: [...newTraining.requiredFor, employee.id],
                                      })
                                    } else {
                                      setNewTraining({
                                        ...newTraining,
                                        requiredFor: newTraining.requiredFor.filter((id) => id !== employee.id),
                                      })
                                    }
                                  }}
                                  className="rounded"
                                />
                                <label htmlFor={`emp-${employee.id}`} className="text-sm">
                                  {employee.name} ({employee.department})
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                    <DialogFooter >
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false)
                          resetForm()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddTraining}>{isEditing ? "Update Training" : "Add Training"}</Button>
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
                    placeholder="Search trainings..."
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                        Training
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
                          setSortBy("startDate")
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }}
                      >
                        Date
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
                    <TableHead>Completion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No trainings found. Add a new training to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrainings.map((training) => {
                      // Calculate completion rate for this training
                      const requiredEmployees = training.requiredFor.length
                      const completedEmployees = employees.filter((emp) =>
                        emp.completedTrainings.includes(training.id),
                      ).length

                      const completionRate =
                        requiredEmployees > 0 ? Math.round((completedEmployees / requiredEmployees) * 100) : 0

                      return (
                        <TableRow key={training.id} className={selectedTraining === training.id ? "bg-accent" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{training.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{training.type.replace("-", " ")}</TableCell>
                          <TableCell>
                            {training.startDate && (
                              <div className="flex flex-col">
                                <span>{new Date(training.startDate).toLocaleDateString()}</span>
                                {training.endDate && (
                                  <span className="text-xs text-muted-foreground">
                                    to {new Date(training.endDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(training.status)}>
                              {training.status.charAt(0).toUpperCase() + training.status.slice(1).replace("-", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">{completionRate}%</span>
                                <span className="text-xs text-muted-foreground">
                                  {completedEmployees}/{requiredEmployees}
                                </span>
                              </div>
                              <Progress value={completionRate} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedTraining(selectedTraining === training.id ? null : training.id)
                                }
                              >
                                Details
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(training)}>
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(training.id)}>
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {selectedTraining && (
                <div className="mt-4 border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Training Completion Status</h3>
                  <div className="space-y-4">
                    {(() => {
                      const training = trainings.find((t) => t.id === selectedTraining)
                      if (!training) return <p>Training not found</p>

                      const requiredEmployees = employees.filter((emp) => training.requiredFor.includes(emp.id))

                      if (requiredEmployees.length === 0) {
                        return <p className="text-sm text-muted-foreground">No employees assigned to this training.</p>
                      }

                      return (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Employee</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {requiredEmployees.map((employee) => {
                              const completed = employee.completedTrainings.includes(selectedTraining)

                              return (
                                <TableRow key={employee.id}>
                                  <TableCell>{employee.name}</TableCell>
                                  <TableCell>{employee.department}</TableCell>
                                  <TableCell>
                                    {completed ? (
                                      <div className="flex items-center text-green-600">
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        <span>Completed</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-amber-600">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        <span>Pending</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleEmployeeCompletion(selectedTraining, employee.id, !completed)
                                      }
                                    >
                                      {completed ? "Mark Incomplete" : "Mark Complete"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTrainings.length} of {trainings.length} trainings
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallCompletionRate}%</div>
                <Progress value={overallCompletionRate} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completedTrainings} of {totalEmployees * totalTrainings} total required trainings completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <div className="text-xs text-muted-foreground mt-2">Across {departments.length} departments</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainings.filter((t) => t.status === "in-progress").length}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {trainings.filter((t) => t.status === "scheduled").length} upcoming
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Trainings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainings.filter((t) => t.status === "completed").length}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {Math.round((trainings.filter((t) => t.status === "completed").length / totalTrainings) * 100)}% of
                  all trainings
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completion by Department</CardTitle>
                <CardDescription>Training completion rates across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completionByDepartment.map((item) => (
                    <div key={item.department} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.department}</span>
                        <span className="text-sm">{item.completionRate}%</span>
                      </div>
                      <Progress value={item.completionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">{item.totalEmployees} employees in department</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Trainings</CardTitle>
                <CardDescription>Scheduled training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainings
                    .filter((t) => t.status === "scheduled")
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(0, 5)
                    .map((training) => (
                      <div key={training.id} className="flex items-center space-x-4 p-2 border rounded-md">
                        <Calendar className="h-10 w-10 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-medium">{training.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(training.startDate).toLocaleDateString()}
                            {training.duration && ` • ${training.duration} minutes`}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(training.status)}>
                          {training.status.charAt(0).toUpperCase() + training.status.slice(1).replace("-", " ")}
                        </Badge>
                      </div>
                    ))}
                  {trainings.filter((t) => t.status === "scheduled").length === 0 && (
                    <p className="text-sm text-muted-foreground">No upcoming trainings scheduled.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Training Status</CardTitle>
              <CardDescription>Individual employee training completion</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const requiredTrainings = trainings.filter((t) => t.requiredFor.includes(employee.id)).length

                    const completedCount = employee.completedTrainings.length
                    const pendingCount = requiredTrainings - completedCount
                    const completionRate =
                      requiredTrainings > 0 ? Math.round((completedCount / requiredTrainings) * 100) : 100

                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{completedCount}</TableCell>
                        <TableCell>{pendingCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={completionRate} className="h-2 w-[100px]" />
                            <span className="text-sm">{completionRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing imports
import { Shield, Mail, CheckSquare } from "lucide-react"

