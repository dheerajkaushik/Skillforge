import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/layout/PageContainer";
import { API_BASE_URL as API } from "../config";

export default function InstructorDashboard() {
  const navigate = useNavigate();

  // 1. State matches your InstructorDashboardDto structure
  const [dashboardData, setDashboardData] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalSubmissions: 0,
    courses: [] // Your API returns a list of courses, let's use it!
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 2. Auth Check
    const token = localStorage.getItem("sf_token");
    if (!token) {
        navigate("/login");
        return;
    }

    setLoading(true);

    // 3. Fetch from your specific Controller Endpoint
    axios.get(`${API}/api/instructor/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setDashboardData(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Dashboard fetch error:", err);
      // Handle permission errors (403) specifically
      if (err.response && err.response.status === 403) {
          setError("Access denied. You must be an Instructor to view this.");
      } else {
          setError("Failed to load dashboard data.");
      }
      setLoading(false);
    });
  }, [navigate]);

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Instructor Dashboard</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading your stats...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200">
            {error}
        </div>
      ) : (
        <>
          {/* --- STATS CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <h3 className="text-sm text-slate-500">Total Courses</h3>
              <p className="text-2xl font-bold">{dashboardData.totalCourses}</p>
            </Card>

            <Card>
              <h3 className="text-sm text-slate-500">Total Enrollments</h3>
              <p className="text-2xl font-bold">{dashboardData.totalEnrollments}</p>
            </Card>

            <Card>
              {/* Swapped "Completion Rate" for "Total Submissions" to match your API */}
              <h3 className="text-sm text-slate-500">Total Submissions</h3>
              <p className="text-2xl font-bold">{dashboardData.totalSubmissions}</p>
            </Card>
          </div>

          {/* --- COURSE LIST TABLE (Bonus: Display the list your API sends) --- */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-lg">Your Courses</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-4 text-sm font-semibold text-gray-600">Title</th>
                        <th className="p-4 text-sm font-semibold text-gray-600">Enrollments</th>
                        <th className="p-4 text-sm font-semibold text-gray-600">Modules</th>
                        <th className="p-4 text-sm font-semibold text-gray-600">Submissions</th>
                    </tr>
                </thead>
                <tbody>
                    {dashboardData.courses.length > 0 ? (
                        dashboardData.courses.map((course, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-blue-600">{course.title}</td>
                                <td className="p-4 text-gray-700">{course.enrollments}</td>
                                <td className="p-4 text-gray-700">{course.moduleCount}</td>
                                <td className="p-4 text-gray-700">{course.submissionCount}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="p-8 text-center text-gray-500 italic">
                                You haven't created any courses yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </>
      )}
    </PageContainer>
  );
}