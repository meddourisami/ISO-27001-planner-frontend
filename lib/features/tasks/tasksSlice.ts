import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  status: string
  priority: string
  dueDate: string
  category: string
  progress: number
  relatedControl: string
}

interface TasksState {
  items: Task[]
}

const initialState: TasksState = {
  items: [
    {
      id: "1",
      title: "Update Information Security Policy",
      description:
        "Review and update the Information Security Policy to reflect current business needs and compliance requirements",
      assignee: "John Smith",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-04-10",
      category: "documentation",
      progress: 60,
      relatedControl: "A.5.1.1",
    },
    {
      id: "2",
      title: "Implement Multi-Factor Authentication",
      description: "Deploy MFA for all administrative accounts and remote access",
      assignee: "Sarah Johnson",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-04-15",
      category: "implementation",
      progress: 40,
      relatedControl: "A.9.4.2",
    },
    {
      id: "3",
      title: "Conduct Security Awareness Training",
      description: "Deliver security awareness training to all employees",
      assignee: "Michael Chen",
      status: "todo",
      priority: "medium",
      dueDate: "2025-05-20",
      category: "training",
      progress: 0,
      relatedControl: "A.7.2.2",
    },
    {
      id: "4",
      title: "Perform Vulnerability Assessment",
      description: "Conduct a vulnerability assessment of all internet-facing systems",
      assignee: "Lisa Wong",
      status: "todo",
      priority: "high",
      dueDate: "2025-04-30",
      category: "implementation",
      progress: 0,
      relatedControl: "A.12.6.1",
    },
    {
      id: "5",
      title: "Review Access Rights",
      description: "Conduct a review of user access rights across all systems",
      assignee: "David Miller",
      status: "todo",
      priority: "medium",
      dueDate: "2025-05-15",
      category: "implementation",
      progress: 0,
      relatedControl: "A.9.2.5",
    },
    {
      id: "6",
      title: "Update Business Continuity Plan",
      description: "Review and update the Business Continuity Plan",
      assignee: "Jennifer Lee",
      status: "in-progress",
      priority: "medium",
      dueDate: "2025-06-01",
      category: "documentation",
      progress: 30,
      relatedControl: "A.17.1.1",
    },
    {
      id: "7",
      title: "Implement Secure Configuration Baselines",
      description: "Develop and implement secure configuration baselines for all system types",
      assignee: "Robert Johnson",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-05-10",
      category: "implementation",
      progress: 25,
      relatedControl: "A.12.1.2",
    },
    {
      id: "8",
      title: "Remediate Audit Findings",
      description: "Address non-conformities identified in the last internal audit",
      assignee: "Thomas Wilson",
      status: "todo",
      priority: "high",
      dueDate: "2025-04-25",
      category: "remediation",
      progress: 0,
      relatedControl: "A.18.2.2",
    },
    {
      id: "9",
      title: "Develop Incident Response Procedures",
      description: "Create detailed procedures for different types of security incidents",
      assignee: "Emily Davis",
      status: "done",
      priority: "medium",
      dueDate: "2025-03-15",
      category: "documentation",
      progress: 100,
      relatedControl: "A.16.1.5",
    },
    {
      id: "10",
      title: "Implement Data Loss Prevention",
      description: "Deploy DLP solution for sensitive data protection",
      assignee: "Alex Martinez",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-05-30",
      category: "implementation",
      progress: 15,
      relatedControl: "A.8.2.3",
    },
  ],
}

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.push(action.payload)
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex((task) => task.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((task) => task.id !== action.payload)
    },
  },
})

export const { addTask, updateTask, deleteTask } = tasksSlice.actions

export default tasksSlice.reducer

