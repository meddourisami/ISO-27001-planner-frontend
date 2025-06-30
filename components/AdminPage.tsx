"use client"

import { useToast } from "@/hooks/use-toast";
import { addAdminUserAsync, deleteAdminAsync, fetchAdminsAsync, updateAdminAsync } from "@/lib/features/admin/adminSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { BackendUser } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { logoutAsync } from "@/lib/features/auth/authSlice";
import { Textarea } from "./ui/textarea";
import { fetchCompanyDetails, getCompanyById } from "@utils/api";

export default function AdminPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();
  const admins = useAppSelector(state => state.admin.items);
  const loading = useAppSelector(state => state.admin.loading);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<BackendUser | null>(null);
  const [companyNames, setCompanyNames] = useState<Record<number, string>>({});
  const [formState, setFormState] = useState<Omit<BackendUser, 'id'>>({
    email: '',
    fullName: '',
    mfaEnabled: false,
    role: 'ISMS_ADMIN',
    companyId: 0,
  });
  
    const [adminForm, setAdminForm] = useState({
        email: '',
        password: '',
        companyName: '',
        scope: '',
    });

  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
        dispatch(fetchAdminsAsync());
    } else {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    const fetchAllCompanyNames = async () => {
      const nameMap: Record<number, string> = {};
      const fetchedIds = new Set(Object.keys(companyNames).map(Number));

      await Promise.all(
        admins.map(async (admin) => {
          if (admin.companyId && !fetchedIds.has(admin.companyId)) {
            try {
              const data = await getCompanyById(admin.companyId);
              nameMap[admin.companyId] = data.name;
            } catch (err) {
              nameMap[admin.companyId] = "Unknown Company";
            }
          }
        })
      );

      if (Object.keys(nameMap).length > 0) {
        setCompanyNames((prev) => ({ ...prev, ...nameMap }));
      }
    };

    if (admins.length > 0) {
      fetchAllCompanyNames();
    }
  }, [admins]);

  const resetForm = () => {
    setFormState({ email: '', fullName: '', mfaEnabled: false, role: 'ISMS_ADMIN', companyId: user!.companyId });
    setSelectedAdmin(null);
    setIsEditing(false);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (admin: BackendUser) => {
    setFormState({ email: admin.email, fullName: admin.fullName, mfaEnabled: admin.mfaEnabled, role: admin.role, companyId: admin.companyId });
    setSelectedAdmin(admin);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEditing && selectedAdmin) {
        await dispatch(updateAdminAsync({ id: selectedAdmin.id!, ...formState })).unwrap();
        toast({ title: 'Admin updated' });
      } else {
        await dispatch(addAdminUserAsync(adminForm)).unwrap();
        toast({ title: "Admin Added", description: "A new ISMS admin has been created." });
        setAdminForm({ email: '', password: '', companyName: '', scope: '' });
      }
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      toast({ title: 'Error', description: e, variant: 'destructive' });
    }
  };

  const handleDelete = (email: string) => {
  if (confirm('Delete this admin?')) {
    dispatch(deleteAdminAsync(email))
      .unwrap()
      .then(() => toast({ title: 'Admin deleted' }))
      .catch(e => toast({ title: 'Error', description: e, variant: 'destructive' }));
  }
};
    
    const handleLogout = async () => {
        await dispatch(logoutAsync()).unwrap();
        router.push('/login');
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ISMS Admin Management</CardTitle>
        <Button onClick={openAdd}>Add Admin</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map(a => (
              <TableRow key={a.email}>
                <TableCell>{a.email}</TableCell>
                <TableCell>
                  {companyNames[a.companyId]}
                </TableCell>
                <TableCell>{a.role}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(a.email!)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit ISMS Admin' : 'Add Company ISMS Admin'}</DialogTitle>
          </DialogHeader>

          <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={adminForm.companyName}
                onChange={(e) => setAdminForm({ ...adminForm, companyName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="scope">Scope</Label>
              <Textarea
                id="scope"
                value={adminForm.scope}
                onChange={(e) => setAdminForm({ ...adminForm, scope: e.target.value })}
                placeholder="e.g. HR, IT, Finance"
              />
            </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
        <Button variant="destructive" onClick={handleLogout}>
            Sign Out
        </Button>
    </Card>
  );
}