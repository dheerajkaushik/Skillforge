import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "./components/layout/PageContainer";
import Card from "./components/ui/Card";
import { API_BASE_URL as API} from "./config"; // for render
//const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function AdminEnrollmentStats({ token, user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback if token isn't passed directly
    const effectiveToken = token || localStorage.getItem("sf_token");
    if (effectiveToken) load(effectiveToken);
  }, [token]);

  async function load(authToken) {
    try {
      setLoading(true);
      const res = await axios.get(API + "/admin/stats/enrollments", {
          headers: { Authorization: "Bearer " + authToken }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats", err);
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

  if (loading) return <PageContainer><p className="text-gray-500">Loading enrollment data...</p></PageContainer>;
  if (!stats) return <PageContainer><p className="text-red-500">Failed to load data.</p></PageContainer>;

  return (
    <PageContainer>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Enrollment Analytics</h2>
        <p className="text-sm text-slate-500">Overview of course performance and student engagement.</p>
      </div>

      {/* --- TOP STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="flex items-center p-6">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
        </Card>

        <Card className="flex items-center p-6">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
            </div>
        </Card>
      </div>

      {/* --- DETAILED TABLE --- */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Course Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                        <th className="p-4 font-semibold w-20">ID</th>
                        <th className="p-4 font-semibold">Course Title</th>
                        <th className="p-4 font-semibold text-right">Enrollment Count</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {stats.perCourse.map((c, index) => (
                        <tr key={c.courseId || index} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-gray-400">#{c.courseId}</td>
                            <td className="p-4 font-medium text-blue-600">{c.title}</td>
                            <td className="p-4 text-right">
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-bold">
                                    {c.enrollments}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {stats.perCourse.length === 0 && (
                        <tr><td colSpan="3" className="p-8 text-center text-gray-500 italic">No course data available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </PageContainer>
  );
}