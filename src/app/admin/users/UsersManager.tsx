"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  Shield,
  User as UserIcon,
  ShieldAlert,
  CheckCircle,
  Ban,
  AlertTriangle,
  Search,
  Mail,
  Calendar,
} from "lucide-react";
import { updateUserRole, updateUserStatus } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "USER" | "STAFF" | "ADMIN";
  status: "ACTIVE" | "BLOCKED" | "SUSPENDED";
  createdAt: string;
}

interface UsersManagerProps {
  initialUsers: User[];
}

export default function UsersManager({ initialUsers }: UsersManagerProps) {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters based on query
  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(term) ?? false) ||
      (u.email?.toLowerCase().includes(term) ?? false) ||
      u.id.toLowerCase().includes(term)
    );
  });

  const handleRoleChange = async (userId: string, newRole: "USER" | "STAFF" | "ADMIN") => {
    // Safety check: Prevent self-demotion
    if (userId === currentUser?.id && newRole !== "ADMIN") {
      toast.error("Security Lock: You cannot demote your own administrator account.", {
        position: "top-center",
      });
      return;
    }

    try {
      const data = new FormData();
      data.append("userId", userId);
      data.append("role", newRole);

      // Optimistic UI update
      const previousUsers = [...users];
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      toast.promise(
        (async () => {
          await updateUserRole(data);
        })(),
        {
          loading: `Updating role to ${newRole} & syncing with Clerk Auth...`,
          success: "User role synchronized successfully!",
          error: (err) => {
            // Revert on error
            setUsers(previousUsers);
            return err instanceof Error ? err.message : "Failed to sync user role.";
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: "ACTIVE" | "BLOCKED" | "SUSPENDED") => {
    // Safety check: Prevent self-blocking
    if (userId === currentUser?.id && newStatus !== "ACTIVE") {
      toast.error("Security Lock: You cannot block or suspend your own active administrator account.", {
        position: "top-center",
      });
      return;
    }

    try {
      const data = new FormData();
      data.append("userId", userId);
      data.append("status", newStatus);

      // Optimistic UI update
      const previousUsers = [...users];
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );

      toast.promise(
        (async () => {
          await updateUserStatus(data);
        })(),
        {
          loading: `Updating status to ${newStatus}...`,
          success: "User status updated successfully!",
          error: (err) => {
            // Revert on error
            setUsers(previousUsers);
            return err instanceof Error ? err.message : "Failed to update status.";
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Info */}
      <div className="flex flex-col gap-1 select-none">
        <h2 className="text-xl font-black uppercase tracking-tight">Users Management</h2>
        <p className="text-xs text-neutral-500">
          Monitor customer profiles, modify staff roles, and manage access privileges dynamically.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or user ID..."
          className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
        />
      </div>

      {/* Users table */}
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-sm text-neutral-550 font-medium">
            No registered users found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Profile</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Role Authority</TableHead>
                <TableHead>Account Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                
                return (
                  <TableRow key={u.id} className={isSelf ? "bg-rose-50/20" : ""}>
                    {/* Identity Info */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-black uppercase relative shrink-0 overflow-hidden">
                          {u.image ? (
                            <img src={u.image} alt={u.name || "User avatar"} className="h-full w-full object-cover" />
                          ) : (
                            u.name ? u.name.substring(0, 2) : "US"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-neutral-900 truncate max-w-[200px]">
                              {u.name || "Anonymous Shopper"}
                            </span>
                            {isSelf && (
                              <span className="rounded-md bg-rose-600/10 border border-rose-500/25 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#B61C38]">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-semibold mt-0.5 select-all">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[220px]">{u.email || "No email"}</span>
                          </div>
                          <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                            ID: {u.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Date Registered */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                        <span>
                          {new Date(u.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Role Adjust Selector */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as "USER" | "STAFF" | "ADMIN")
                          }
                          className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-black transition-colors"
                        >
                          <option value="USER">Standard User</option>
                          <option value="STAFF">Store Staff</option>
                          <option value="ADMIN">Administrator</option>
                        </select>

                        {/* Visual Badge Display */}
                        {u.role === "ADMIN" && (
                          <Badge className="bg-rose-500 text-white font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Admin
                          </Badge>
                        )}
                        {u.role === "STAFF" && (
                          <Badge className="bg-purple-500 text-white font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Staff
                          </Badge>
                        )}
                        {u.role === "USER" && (
                          <Badge variant="outline" className="text-neutral-500 font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-1">
                            <UserIcon className="h-3 w-3" /> User
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Status Toggle Selector */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={u.status}
                          onChange={(e) =>
                            handleStatusChange(u.id, e.target.value as "ACTIVE" | "BLOCKED" | "SUSPENDED")
                          }
                          className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-black transition-colors"
                        >
                          <option value="ACTIVE">Active Account</option>
                          <option value="BLOCKED">Blocked</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>

                        {/* Visual Badge Display */}
                        {u.status === "ACTIVE" && (
                          <Badge className="bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Active
                          </Badge>
                        )}
                        {u.status === "BLOCKED" && (
                          <Badge className="bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-1">
                            <Ban className="h-3 w-3" /> Blocked
                          </Badge>
                        )}
                        {u.status === "SUSPENDED" && (
                          <Badge className="bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Suspended
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
