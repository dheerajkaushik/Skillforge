//import React, { useState, useEffect } from "react";
//import { Routes, Route, useNavigate } from "react-router-dom";
//import axios from "axios";
//import GoogleLoginButton from "./components/GoogleLoginButton";
//
//// Pages & Components
//import InstructorDashboard from "./pages/InstructorDashboard";
//import CoursePage from "./pages/CoursePage";
//import AdminUserManagement from "./AdminUserManagement";
//import AdminEnrollmentStats from "./AdminEnrollmentStats";
//import AdminSubmissions from "./AdminSubmissions";
//import AdminLogs from "./AdminLogs";
//import QuizList from "./components/QuizList";
//import QuizAttempt from "./components/QuizAttempt";
//import CodingProblemPage from "./pages/CodingProblemPage";
//import CreateCodingProblem from "./pages/CreateCodingProblem";
//import StudentSubmissions from "./pages/StudentSubmissions";
//import { API_BASE_URL as API} from "./config"; // for render
////const API = process.env.REACT_APP_API || "http://localhost:8080/api"; // for local


import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleLoginButton from "./components/GoogleLoginButton";

// Pages & Components
import InstructorDashboard from "./pages/InstructorDashboard";
import CoursePage from "./pages/CoursePage";
import AdminUserManagement from "./AdminUserManagement";
import AdminEnrollmentStats from "./AdminEnrollmentStats";
import AdminSubmissions from "./AdminSubmissions";
import AdminLogs from "./AdminLogs";
import QuizList from "./components/QuizList";
import QuizAttempt from "./components/QuizAttempt";
import CodingProblemPage from "./pages/CodingProblemPage";
import CreateCodingProblem from "./pages/CreateCodingProblem";
import StudentSubmissions from "./pages/StudentSubmissions";
import { API_BASE_URL as API } from "./config";

function App() {
  const navigate = useNavigate();

  // --- STATE ---
  const [token, setToken] = useState(localStorage.getItem("sf_token") || "");
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);

  // Auth Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // UI Toggles
  const [showInstructorDashboard, setShowInstructorDashboard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminView, setAdminView] = useState("users");

  useEffect(() => {
    axios.get(`${API}/wake-up`).catch(() => {
      console.log("Wake-up signal sent.");
    });
  }, []);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchCourses();
    if (token) fetchMe();
  }, [token]);

  // --- API HELPERS ---
  function headers() {
    return token ? { Authorization: "Bearer " + token } : {};
  }

  async function fetchMe() {
    try {
      const res = await axios.get(API + "/me", { headers: headers() });
      setUser(res.data);
    } catch (err) {
      console.error("Me failed", err);
      setUser(null);
      if (err.response && err.response.status === 401) {
        setToken("");
        localStorage.removeItem("sf_token");
      }
    }
  }
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  async function fetchCourses(retryCount = 0) {
    try {
      const res = await axios.get(API + "/courses");
      setCourses(res.data);
    } catch (err) {

      if (retryCount < 3) {
              console.log(`Backend might be sleeping. Retrying... (${retryCount + 1}/3)`);
              await wait(3000); // Wait 3 seconds
              fetchCourses(retryCount + 1); // Retry
            } else {
              console.error("Failed to fetch courses after retries", err);
            }
    }
  }

  // --- AUTH ACTIONS ---
  async function signup() {
    try {
      const res = await axios.post(API + "/auth/signup", { email, password, name });
      setToken(res.data.token);
      localStorage.setItem("sf_token", res.data.token);
      fetchMe();
      alert("Signed up successfully!");
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  }

  async function login() {
    try {
      const res = await axios.post(API + "/auth/login", { email, password });
      setToken(res.data.token);
      localStorage.setItem("sf_token", res.data.token);
      await fetchMe();
      setEmail("");
      setPassword("");
    } catch (err) {
      alert("Login failed. Check credentials.");
    }
  }

  function handleGoogleLoginSuccess(data) {
    if (data.token) {
      setToken(data.token);
      localStorage.setItem("sf_token", data.token);
      setUser(data.user);
    } else {
      console.warn("Backend did not return a token structure we expected.");
      setUser(data);
    }
  }

  function logout() {
    setToken("");
    localStorage.removeItem("sf_token");
    setUser(null);
    setShowAdmin(false);
    setShowInstructorDashboard(false);
    navigate("/");
  }

  // --- COURSE ACTIONS ---
  async function createCourse() {
    if (!user || user.role === "STUDENT") return alert("Unauthorized");
    const title = prompt("Course title?");
    const desc = prompt("Course description?");
    if (!title) return;

    try {
      await axios.post(API + "/courses", { title, description: desc }, { headers: headers() });
      fetchCourses();
    } catch (err) {
      alert("Failed to create course");
    }
  }

  async function enroll(id) {
    if (!token) return alert("Please login to enroll");
    try {
      await axios.post(API + `/courses/${id}/enroll`, {}, { headers: headers() });
      alert("Enrolled successfully!");
    } catch (err) {
      alert(err.response?.data || "Enrollment failed");
    }
  }

  // ============================================================
  //      RENDER
  // ============================================================

  // 1. Instructor Dashboard Overlay (Styled)
  if (showInstructorDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InstructorDashboard
          user={user}
          api={API}
          headers={headers}
          onExit={() => setShowInstructorDashboard(false)}
        />
      </div>
    );
  }

  // 2. Admin Panel Overlay (Styled)
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[80vh]">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button onClick={() => setShowAdmin(false)} className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition">
              ← Exit Admin Panel
            </button>
          </div>

          <div className="flex border-b border-gray-200">
            {["users", "stats", "submissions", "logs"].map((view) => (
              <button
                key={view}
                onClick={() => setAdminView(view)}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  adminView === view ? "bg-slate-50 text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {adminView === "users" && <AdminUserManagement token={token} user={user} />}
            {adminView === "stats" && <AdminEnrollmentStats token={token} user={user} />}
            {adminView === "submissions" && <AdminSubmissions token={token} user={user} />}
            {adminView === "logs" && <AdminLogs token={token} user={user} />}
          </div>
        </div>
      </div>
    );
  }

  // 3. Main App Layout
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">

      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SkillForge</span>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
                    <button
                      onClick={() => setShowInstructorDashboard(true)}
                      className="hidden sm:block text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Instructor Dashboard
                    </button>
                  )}
                  {user.role === "ADMIN" && (
                    <button
                      onClick={() => setShowAdmin(true)}
                      className="hidden sm:block text-sm font-medium text-red-600 hover:text-red-800 transition"
                    >
                      Admin
                    </button>
                  )}
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-sm text-gray-500">Welcome, Guest</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* HERO SECTION (If not logged in) */}
        {!user && (
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                Master your skills with <span className="text-indigo-600">SkillForge</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                The aesthetic, cozy platform to learn, code, and grow. Join the community today.
              </p>
              <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-md">
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <input
                  className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex gap-3 mt-2">
                  <button onClick={signup} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:-translate-y-0.5">
                    Sign Up
                  </button>
                  <button onClick={login} className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition">
                    Log In
                  </button>
                </div>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                </div>
                <div className="flex justify-center">
                    <GoogleLoginButton onLoginSuccess={handleGoogleLoginSuccess} />
                </div>
              </div>
            </div>
            {/* Decorative Placeholder / Illustration */}
            <div className="hidden md:block h-96 w-full">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKxijbpZmd_rjvJnQlRni50QgyEYAE5YqAvg&s"
                  alt="Start Learning"
                  className="w-full h-full object-cover rounded-3xl shadow-lg"
                />
            </div>
          </div>
        )}

        <Routes>
          {/* ROUTE 1: HOME (Course List) */}
          <Route path="/" element={
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Explore Courses</h2>
                  <p className="text-slate-500 mt-1">Select a course to start your journey</p>
                </div>
                {user && (user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
                  <button onClick={createCourse} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-sm font-medium transition">
                    + Create New Course
                  </button>
                )}
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No courses available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((c) => (
                    <div key={c.id} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="h-40 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl mb-4 flex items-center justify-center">
                        <span className="text-4xl">📚</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">{c.description}</p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => enroll(c.id)}
                          className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Enroll
                        </button>
                        <button
                          onClick={() => navigate(`/course/${c.id}`)}
                          className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Open →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          } />

          {/* OTHER ROUTES (Keeping wrappers simple but aligned) */}
          <Route path="/course/:id" element={<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><CoursePage user={user} /></div>} />
          <Route path="/lesson/:lessonId/quizzes" element={<div className="bg-white p-6 rounded-2xl shadow-sm"><QuizList /></div>} />
          <Route path="/quiz/:quizId" element={<div className="bg-white p-6 rounded-2xl shadow-sm"><QuizAttempt /></div>} />
          <Route path="/coding/problem/:problemId" element={<div className="bg-white p-6 rounded-2xl shadow-sm"><CodingProblemPage /></div>} />
          <Route path="/instructor/coding/create" element={<div className="bg-white p-6 rounded-2xl shadow-sm"><CreateCodingProblem /></div>} />
          <Route path="/student/submissions" element={<div className="bg-white p-6 rounded-2xl shadow-sm"><StudentSubmissions /></div>} />
        </Routes>
      </main>

      {/* FOOTER */}

    </div>
  );
}

export default App;