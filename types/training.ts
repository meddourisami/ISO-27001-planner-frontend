export interface TrainingDto {
  id?: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  duration: number;
  instructor: string;
  materials: string;
  companyId: number;
}

export interface EmployeeDto {
  id?: string;
  name: string;
  department: string;
  email: string;
  companyId: number;
  completedTrainings: string[];
}