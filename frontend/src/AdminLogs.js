import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "./components/layout/PageContainer";
import Card from "./components/ui/Card";

const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function AdminLogs({ token, user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback logic for token
    const effectiveToken = token || localStorage.getItem("sf_token");
    if (effectiveToken) load(effectiveToken);
  }, [token]);

  async function load(authToken) {
    try {
      setLoading(true);
      const res = await axios.get(API + "/admin/logs", {
        headers: { Authorization: "Bearer " + authToken }
      });
      setLogs(res.data);
    } catch (e) {
      console.error("Failed to load logs", e);
    } finally {
      setLoading(false);
    }
  }

  // Access Control
  if (user && user.role !== "ADMIN") {
      return (
        <PageContainer>
            <div className="p-10 text-center text-red-500 bg-red-50 rounded border border-red-200">
                ⛔ Access Denied. Admin permissions required.
            </div>
        </PageContainer>
      );
  }

  // Helper to color-code action types
  const getActionStyle = (action) => {
      const act = action ? action.toUpperCase() : "";
      if (act.includes("DELETE") || act.includes("REMOVE")) return "bg-red-100 text-red-700 border-red-200";
      if (act.includes("CREATE") || act.includes("ADD")) return "bg-green-100 text-green-700 border-green-200";
      if (act.includes("UPDATE") || act.includes("EDIT")) return "bg-blue-100 text-blue-700 border-blue-200";
      if (act.includes("LOGIN") || act.includes("AUTH")) return "bg-purple-100 text-purple-700 border-purple-200";
      return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>
            <p className="text-sm text-slate-500">Audit trail of user activities and system events.</p>
        </div>
        <span className="bg-white border text-gray-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            Total Events: {logs.length}
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold w-40">Timestamp</th>
                <th className="p-4 font-semibold w-24">User ID</th>
                <th className="p-4 font-semibold w-32">Action</th>
                <th className="p-4 font-semibold">Details / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading system logs...</td></tr>
              ) : logs.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No logs found.</td></tr>
              ) : (
                logs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-gray-600">
                        {l.userId ? `#${l.userId}` : <span className="text-gray-400">System</span>}
                    </td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold tracking-wide uppercase ${getActionStyle(l.action)}`}>
                            {l.action}
                        </span>
                    </td>
                    <td className="p-4">
                        {/* Log Detail View */}
                        <div className="bg-gray-50 text-gray-700 p-2 rounded border border-gray-200 font-mono text-xs overflow-x-auto max-h-24 scrollbar-thin scrollbar-thumb-gray-300">
                             <pre className="whitespace-pre-wrap break-words">
                                {l.details || <span className="text-gray-400 italic">No additional details</span>}
                             </pre>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}