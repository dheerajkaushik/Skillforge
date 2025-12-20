import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "./components/layout/PageContainer";
import Card from "./components/ui/Card";
import { API_BASE_URL } from "./config";
//const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function AdminUserManagement({ token, user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    // Fallback: If token prop isn't passed, try localStorage
    const effectiveToken = token || localStorage.getItem("sf_token");
    if (!effectiveToken) return;

    try {
      setLoading(true);
      const res = await axios.get(API + "/admin/users", {
        headers: { Authorization: "Bearer " + effectiveToken }
      });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id, role) {
    const effectiveToken = token || localStorage.getItem("sf_token");
    try {
      await axios.put(API + `/admin/users/${id}/role?role=${role}`, {}, {
        headers: { Authorization: "Bearer " + effectiveToken }
      });
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to update role");
    }
  }

  async function deleteUser(id) {
    const effectiveToken = token || localStorage.getItem("sf_token");
    try {
      await axios.delete(API + `/admin/users/${id}`, {
        headers: { Authorization: "Bearer " + effectiveToken }
      });
      loadUsers();
    } catch (e) {
        console.error(e);
        alert("Delete failed");
    }
  }

  // Helper to color-code roles
  const getRoleBadge = (role) => {
    switch (role) {
        case "ADMIN": return "bg-purple-100 text-purple-700 border-purple-200";
        case "INSTRUCTOR": return "bg-blue-100 text-blue-700 border-blue-200";
        case "STUDENT": return "bg-green-100 text-green-700 border-green-200";
        default: return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // Access Control Checks
  if (!token && !localStorage.getItem("sf_token")) {
      return <div className="p-10 text-center text-red-500">Please login to access this page.</div>;
  }

  // Note: If 'user' prop isn't loaded yet, this might flash.
  // Ideally, fetch 'me' if user is null, but sticking to your logic:
  if (user && user.role !== "ADMIN") {
      return <div className="p-10 text-center text-red-500">⛔ Access denied. Admins only.</div>;
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <span className="text-sm text-slate-500">Total Users: {users.length}</span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Current Role</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                 <tr><td colSpan="4" className="p-6 text-center text-gray-500">Loading users...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-gray-600">#{u.id}</td>
                  <td className="p-4 font-medium text-gray-900">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getRoleBadge(u.role)}`}>
                        {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                        {/* Role Buttons */}
                        <div className="flex bg-gray-100 rounded p-1">
                            <button
                                onClick={() => updateRole(u.id, "STUDENT")}
                                className={`px-2 py-1 text-xs rounded hover:bg-white hover:shadow ${u.role === 'STUDENT' ? 'bg-white shadow font-bold text-green-700' : 'text-gray-500'}`}
                                title="Demote to Student"
                            >
                                Stu
                            </button>
                            <button
                                onClick={() => updateRole(u.id, "INSTRUCTOR")}
                                className={`px-2 py-1 text-xs rounded hover:bg-white hover:shadow ${u.role === 'INSTRUCTOR' ? 'bg-white shadow font-bold text-blue-700' : 'text-gray-500'}`}
                                title="Promote to Instructor"
                            >
                                Ins
                            </button>
                            <button
                                onClick={() => updateRole(u.id, "ADMIN")}
                                className={`px-2 py-1 text-xs rounded hover:bg-white hover:shadow ${u.role === 'ADMIN' ? 'bg-white shadow font-bold text-purple-700' : 'text-gray-500'}`}
                                title="Promote to Admin"
                            >
                                Adm
                            </button>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={() => { if(window.confirm(`Delete user ${u.email}?`)) deleteUser(u.id); }}
                            className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete User"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}