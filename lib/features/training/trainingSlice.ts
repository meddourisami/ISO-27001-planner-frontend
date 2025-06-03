import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Employee {
  id: string
  name: string
  department: string
  email: string
  completedTrainings: string[]
}

interface Training {
  id: string
  title: string
  description: string
  type: string
  status: string
  startDate: string
  endDate: string
  duration: number
  instructor: string
  materials: string
  requiredFor: string[]
}

interface TrainingState {
  items: Training[]
  employees: Employee[]
}

const initialState: TrainingState = {
  items: [
    {
      id: "1",
      title: "Annual Security Awareness Training",
      description: "Comprehensive security awareness training covering all aspects of information security",
      type: "security-awareness",
      status: "in-progress",
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      duration: 120,
      instructor: "Security Team",
      materials: "https://training.example.com/security-awareness",
      requiredFor: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    {
      id: "2",
      title: "Phishing Awareness Campaign",
      description: "Training on how to identify and report phishing attempts",
      type: "phishing-simulation",
      status: "scheduled",
      startDate: "2025-04-15",
      endDate: "2025-04-30",
      duration: 60,
      instructor: "External Vendor",
      materials: "https://training.example.com/phishing-awareness",
      requiredFor: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    {
      id: "3",
      title: "ISO 27001 Awareness",
      description: "Overview of ISO 27001 requirements and employee responsibilities",
      type: "compliance-training",
      status: "completed",
      startDate: "2025-01-15",
      endDate: "2025-01-31",
      duration: 90,
      instructor: "Compliance Officer",
      materials: "https://training.example.com/iso27001",
      requiredFor: ["1", "2", "3", "4", "5"],
    },
    {
      id: "4",
      title: "Information Classification Training",
      description: "Training on how to properly classify and handle information",
      type: "policy-training",
      status: "scheduled",
      startDate: "2025-05-10",
      endDate: "2025-05-20",
      duration: 45,
      instructor: "Data Protection Officer",
      materials: "https://training.example.com/data-classification",
      requiredFor: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    {
      id: "5",
      title: "Secure Development Practices",
      description: "Training on secure coding and development practices",
      type: "technical-training",
      status: "scheduled",
      startDate: "2025-06-01",
      endDate: "2025-06-15",
      duration: 180,
      instructor: "Security Architect",
      materials: "https://training.example.com/secure-development",
      requiredFor: ["6", "7", "8"],
    },
  ],
  employees: [
    {
      id: "1",
      name: "John Smith",
      department: "IT",
      email: "john.smith@example.com",
      completedTrainings: ["1", "3"],
    },
    {
      id: "2",
      name: "Sarah Johnson",
      department: "IT",
      email: "sarah.johnson@example.com",
      completedTrainings: ["1", "3"],
    },
    {
      id: "3",
      name: "Michael Chen",
      department: "HR",
      email: "michael.chen@example.com",
      completedTrainings: ["3"],
    },
    {
      id: "4",
      name: "Lisa Wong",
      department: "HR",
      email: "lisa.wong@example.com",
      completedTrainings: ["1", "3"],
    },
    {
      id: "5",
      name: "David Miller",
      department: "Finance",
      email: "david.miller@example.com",
      completedTrainings: ["3"],
    },
    {
      id: "6",
      name: "Robert Johnson",
      department: "Development",
      email: "robert.johnson@example.com",
      completedTrainings: ["1"],
    },
    {
      id: "7",
      name: "Jennifer Lee",
      department: "Development",
      email: "jennifer.lee@example.com",
      completedTrainings: ["1"],
    },
    {
      id: "8",
      name: "Thomas Wilson",
      department: "Development",
      email: "thomas.wilson@example.com",
      completedTrainings: [],
    },
    {
      id: "9",
      name: "Emily Davis",
      department: "Marketing",
      email: "emily.davis@example.com",
      completedTrainings: ["1"],
    },
    {
      id: "10",
      name: "Alex Martinez",
      department: "Marketing",
      email: "alex.martinez@example.com",
      completedTrainings: [],
    },
  ],
}

export const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    addTraining: (state, action: PayloadAction<Training>) => {
      state.items.push({
        ...action.payload,
        requiredFor: [...action.payload.requiredFor],
      })
    },
    updateTraining: (state, action: PayloadAction<Training>) => {
      const index = state.items.findIndex((training) => training.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = {
          ...action.payload,
          requiredFor: [...action.payload.requiredFor],
        }
      }
    },
    deleteTraining: (state, action: PayloadAction<string>) => {
      // Remove the training
      state.items = state.items.filter((training) => training.id !== action.payload)

      // Remove the training from employee completed trainings
      state.employees = state.employees.map((employee) => ({
        ...employee,
        completedTrainings: employee.completedTrainings.filter((id) => id !== action.payload),
      }))
    },
    updateEmployeeCompletion: (
      state,
      action: PayloadAction<{ trainingId: string; employeeId: string; completed: boolean }>,
    ) => {
      const { trainingId, employeeId, completed } = action.payload
      const employeeIndex = state.employees.findIndex((emp) => emp.id === employeeId)

      if (employeeIndex !== -1) {
        if (completed) {
          // Add training to completed if not already there
          if (!state.employees[employeeIndex].completedTrainings.includes(trainingId)) {
            state.employees[employeeIndex].completedTrainings.push(trainingId)
          }
        } else {
          // Remove training from completed
          state.employees[employeeIndex].completedTrainings = state.employees[employeeIndex].completedTrainings.filter(
            (id) => id !== trainingId,
          )
        }
      }
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push({
        ...action.payload,
        completedTrainings: [...action.payload.completedTrainings],
      })
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex((employee) => employee.id === action.payload.id)
      if (index !== -1) {
        state.employees[index] = {
          ...action.payload,
          completedTrainings: [...action.payload.completedTrainings],
        }
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter((employee) => employee.id !== action.payload)
    },
  },
})

export const {
  addTraining,
  updateTraining,
  deleteTraining,
  updateEmployeeCompletion,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = trainingSlice.actions

export default trainingSlice.reducer

