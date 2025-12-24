import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import { API_BASE_URL as API } from "../config";

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sf_token");
    if (token) fetchMySubmissions(token);
  }, []);

  const fetchMySubmissions = async (token) => {
    try {
      setLoading(true);
      // Make sure this endpoint exists in your backend!
      // It should return List<Submission> for the authenticated user
      const res = await axios.get(`${API}/submissions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle array vs Page object (just like we fixed before)
      if (Array.isArray(res.data)) {
        setSubmissions(res.data);
      } else if (res.data?.content) {
        setSubmissions(res.data.content);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (result) => {
    if (!result) return "text-gray-500";
    // Simple heuristic: If result contains "error" or "exception", make it red
    const lower = result.toLowerCase();
    if (lower.includes("error") || lower.includes("exception") || lower.includes("fail")) {
        return "text-red-600 bg-red-50 border-red-200";
    }
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Code Submissions</h2>
        <p className="text-slate-500">A history of your code execution and results.</p>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Course / Problem</th>
                <th className="p-4 font-semibold">Language</th>
                <th className="p-4 font-semibold">Output / Result</th>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 italic">
                      No submissions found. Go write some code!
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 whitespace-nowrap text-gray-600">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-medium text-blue-600">
                        {/* If your DTO has courseTitle, use it. Otherwise use ID */}
                        {sub.courseTitle || `Course #${sub.courseId}`}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold border rounded bg-gray-100 text-gray-700">
                          {sub.language ? sub.language.toUpperCase() : "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`text-xs font-mono p-2 rounded border max-w-sm overflow-x-auto ${getStatusColor(sub.result)}`}>
                            {sub.result || "No Output"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}