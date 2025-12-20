import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "./components/layout/PageContainer";
import Card from "./components/ui/Card";
import { API_BASE_URL } from "./config";
//const API = process.env.REACT_APP_API || "http://localhost:8080/api"; //for local

export default function AdminSubmissions({ token, user }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback logic for token
    const effectiveToken = token || localStorage.getItem("sf_token");
    if (effectiveToken) load(effectiveToken);
  }, [token]);

  async function load(authToken) {
    try {
      setLoading(true);
      const res = await axios.get(API + "/admin/submissions", {
        headers: { Authorization: "Bearer " + authToken }
      });
      setSubs(res.data);
    } catch (e) {
      console.error("Failed to load submissions", e);
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

  // Helper to style language badges
  const getLangBadge = (lang) => {
      const l = lang ? lang.toUpperCase() : "UNKNOWN";
      switch(l) {
          case "JAVA": return "bg-orange-50 text-orange-700 border-orange-200";
          case "PYTHON": return "bg-blue-50 text-blue-700 border-blue-200";
          case "JS":
          case "JAVASCRIPT": return "bg-yellow-50 text-yellow-700 border-yellow-200";
          case "CPP": return "bg-blue-900 text-white border-blue-900";
          default: return "bg-gray-100 text-gray-600 border-gray-200";
      }
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Submission Log</h2>
            <p className="text-sm text-slate-500">Live feed of all student code executions.</p>
        </div>
        <span className="bg-white border text-gray-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            Total Submissions: {subs.length}
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold w-20">ID</th>
                <th className="p-4 font-semibold">User ID</th>
                <th className="p-4 font-semibold">Course ID</th>
                <th className="p-4 font-semibold">Language</th>
                <th className="p-4 font-semibold">Submitted At</th>
                <th className="p-4 font-semibold">Output / Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading submissions...</td></tr>
              ) : subs.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No submissions found.</td></tr>
              ) : (
                subs.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-400">#{s.id}</td>
                    <td className="p-4 font-medium text-gray-700">User #{s.userId}</td>
                    <td className="p-4 text-gray-600">Course #{s.courseId}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold tracking-wide ${getLangBadge(s.language)}`}>
                            {s.language ? s.language.toUpperCase() : "N/A"}
                        </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(s.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                        {/* Terminal Style Output Box */}
                        <div className="bg-gray-900 text-green-400 p-2 rounded-md font-mono text-xs max-w-xs overflow-x-auto max-h-20 scrollbar-thin scrollbar-thumb-gray-700 border border-gray-800">
                             {s.result ? String(s.result).slice(0, 150) : <span className="text-gray-600 italic">No output</span>}
                             {String(s.result).length > 150 && <span className="text-gray-500">...</span>}
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