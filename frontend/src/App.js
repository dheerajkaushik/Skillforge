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
import { API_BASE_URL as API} from "./config"; // for render
//const API = process.env.REACT_APP_API || "http://localhost:8080/api"; // for local

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
      // Optional: Clear invalid token
      if (err.response && err.response.status === 401) {
        setToken("");
        localStorage.removeItem("sf_token");
      }
    }
  }

  async function fetchCourses() {
    try {
      const res = await axios.get(API + "/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  // --- AUTH ACTIONS ---
  async function signup() {
    try {
      const res = await axios.post(API + "/auth/signup", { email, password, name });
      setToken(res.data.token);
      localStorage.setItem("sf_token", res.data.token);
      fetchMe(); // Fetch full user object
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
      // Clear sensitive fields
      setEmail("");
      setPassword("");
      alert("Logged in successfully");
    } catch (err) {
      alert("Login failed. Check credentials.");
    }
  }

  // ✅ FIXED: Handle Google Login with Token+User Object
  function handleGoogleLoginSuccess(data) {
    if (data.token) {
        setToken(data.token);
        localStorage.setItem("sf_token", data.token);
        setUser(data.user);
    } else {
        // Fallback for safety
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

  // 1. Instructor Dashboard Overlay
  if (showInstructorDashboard) {
    return (
      <InstructorDashboard
        user={user}
        api={API}
        headers={headers}
        onExit={() => setShowInstructorDashboard(false)}
      />
    );
  }

  // 2. Admin Panel Overlay (Restored your Tabbed UI)
  if (showAdmin) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setShowAdmin(false)} className="mb-4 text-blue-600">← Exit Admin Panel</button>
        <h1 style={{ marginTop: 10 }}>Admin Dashboard</h1>

        {/* Admin Navigation */}
        <div style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
          <button onClick={() => setAdminView("users")} style={{ marginRight: 10, fontWeight: adminView === "users" ? "bold" : "normal" }}>User Management</button>
          <button onClick={() => setAdminView("stats")} style={{ marginRight: 10, fontWeight: adminView === "stats" ? "bold" : "normal" }}>Enrollment Stats</button>
          <button onClick={() => setAdminView("submissions")} style={{ marginRight: 10, fontWeight: adminView === "submissions" ? "bold" : "normal" }}>Code Submissions</button>
          <button onClick={() => setAdminView("logs")} style={{ fontWeight: adminView === "logs" ? "bold" : "normal" }}>System Logs</button>
        </div>

        {/* Admin Content */}
        {adminView === "users" && <AdminUserManagement token={token} user={user} />}
        {adminView === "stats" && <AdminEnrollmentStats token={token} user={user} />}
        {adminView === "submissions" && <AdminSubmissions token={token} user={user} />}
        {adminView === "logs" && <AdminLogs token={token} user={user} />}
      </div>
    );
  }

  // 3. Main App Layout
  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-3xl font-bold mb-6">SkillForge MVP</h1>

      {/* HEADER / NAV AREA */}
      <div style={{ marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 20 }}>
         {/* Instructor/Admin Buttons */}
        {user && (user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
          <button style={{ background: "purple", color: "white", padding: "8px 16px", marginRight: 10, borderRadius: 4 }} onClick={() => setShowInstructorDashboard(true)}>
            Open Instructor Dashboard
          </button>
        )}
        {user && user.role === "ADMIN" && (
          <button onClick={() => setShowAdmin(true)} style={{ background: "darkred", color: "white", padding: "8px 16px", borderRadius: 4 }}>
            Admin Panel
          </button>
        )}

        {/* Login/Logout Area */}
        <div style={{ marginTop: 20 }}>
          {!user ? (
            <div className="flex flex-col gap-3">
              {/* Manual Login Form */}
              <div className="flex gap-2">
                <input className="border p-2" placeholder="Name (for signup)" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="border p-2" placeholder="Password" value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={signup}>Sign up</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={login}>Log in</button>
              </div>

              {/* Google Login Button */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Or sign in with:</span>
                <GoogleLoginButton onLoginSuccess={handleGoogleLoginSuccess} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="font-medium">Welcome, {user.name} ({user.role})</span>
              <button className="bg-slate-500 text-white px-4 py-2 rounded" onClick={logout}>Log out</button>
            </div>
          )}
        </div>
      </div>

      {/* ROUTES DEFINITION */}
      <Routes>

        {/* ROUTE 1: HOME (Course List) */}
        <Route path="/" element={
          <div>
            <div style={{ marginBottom: 20 }}>
               {user && (user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
                 <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={createCourse}>
                   + Create New Course
                 </button>
               )}
            </div>

            <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>

            {courses.length === 0 && <p>No courses available yet.</p>}

            <ul className="space-y-4">
              {courses.map((c) => (
                <li key={c.id} className="border p-4 rounded shadow-sm bg-white">
                  <div className="font-bold text-lg">{c.title}</div>
                  <div className="text-gray-600 mb-2">{c.description}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-green-100 text-green-800 px-3 py-1 rounded" onClick={() => enroll(c.id)}>
                      Enroll
                    </button>

                    <button
                      onClick={() => navigate(`/course/${c.id}`)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Open Course &rarr;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        } />

        {/* ROUTE 2: COURSE PAGE */}
        <Route path="/course/:id" element={<CoursePage user={user} />} />

        {/* OTHER ROUTES */}
        <Route path="/lesson/:lessonId/quizzes" element={<QuizList />} />
        <Route path="/quiz/:quizId" element={<QuizAttempt />} />
        <Route path="/coding/problem/:problemId" element={<CodingProblemPage />} />
        <Route path="/instructor/coding/create" element={<CreateCodingProblem />} />
                <Route path="/coding/problem/:problemId" element={<CodingProblemPage />} />

      </Routes>
    </div>
  );
}

export default App;