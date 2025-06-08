import { User } from "@/types";
import api from "../lib/axios";


//Company api endpoints
export async function fetchCompanyDetails() {
  const { data } = await api.get("/company/my");
  return data;
}

export async function fetchCompanyUsers() {
  const { data } = await api.get("/user/list-members");
  return data;
}

export async function updateCompanyDetails(details: { companyId: number; name: string; ismsScope: string }) {
  const { data } = await api.put("/company/update", details);
  return data;
}

//Users api endpoints

export const registerMember = async (email: string, password: string, role: string) => {
  return api.post('/user/register-member', { email, password, role });
};

export const deleteMember = async (email: string) => {
  return api.delete('/user/delete-member', { params: { email } });
};

export const listMembers = async (): Promise<User[]> => {
  const response = await api.get('/user/list-members');
  return response.data.content;
};

export async function editMember(
  targetEmail: string,
  email: string,
  fullName: string,
  role: string
): Promise<void> {
  await api.put("/user/edit-member", { targetEmail, email, fullName, role });
}

//role api endpoints

export const fetchRoles = async (): Promise<string[]> => {
  const response = await api.get('/user/roles');
  return response.data;
};