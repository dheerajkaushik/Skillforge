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
    if (token) {
        fetchMySubmissions(token);
    } else {
        setLoading(false); // No token, stop loading
    }
  }, []);

  const fetchMySubmissions = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/coding/submissions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle both standard Array and Spring Boot "Page" object
      if (Array.isArray(res.data)) {
        setSubmissions(res.data);
      } else if (res.data && Array.isArray(res.data.content)) {
        setSubmissions(res.data.content);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to style the status badge
  const getVerdictBadge = (verdict) => {
    if (!verdict) return "bg-gray-100 text-gray-600 border-gray-200";

    switch (verdict) {
      case "ACCEPTED":
        return "bg-green-100 text-green-700 border-green-200";
      case "WRONG_ANSWER":
        return "bg-red-50 text-red-700 border-red-200";
      case "RUNTIME_ERROR":
      case "COMPILATION_ERROR":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Code Submissions</h2>
        <p className="text-slate-500">A history of all your coding practice attempts.</p>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Problem Title</th>
                    <th className="p-4 font-semibold">Language</th>
                    <th className="p-4 font-semibold">Verdict</th>
                    <th className="p-4 font-semibold">Test Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                      No submissions found. Go solve some problems!
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      {/* 1. Date */}
                      <td className="p-4 whitespace-nowrap text-gray-600">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>

                      {/* 2. Problem Title (Fixes empty column) */}
                      <td className="p-4 font-medium text-blue-600">
                        {sub.problem?.title || `Problem #${sub.problem?.id || sub.problemId}`}
                      </td>

                      {/* 3. Language */}
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold border rounded bg-gray-50 text-gray-600">
                          {sub.language || "JAVA"}
                        </span>
                      </td>

                      {/* 4. Verdict Badge */}
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold tracking-wide uppercase ${getVerdictBadge(sub.verdict)}`}>
                            {sub.verdict ? sub.verdict.replace("_", " ") : "PENDING"}
                        </span>
                      </td>

                      {/* 5. Test Case Stats */}
                      <td className="p-4 font-mono text-gray-600 text-xs">
                        {sub.passedTestCases} / {sub.totalTestCases} passed
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