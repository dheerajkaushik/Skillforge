//import React, { useState, useEffect } from "react";
//import { useParams, useNavigate } from "react-router-dom";
//import axios from "axios";
//import {
//  PlayCircle, CheckCircle, Lock, FileText, ChevronDown, ChevronRight,
//  Plus, Trash2, File
//} from "lucide-react";
//
//import PageContainer from "../components/layout/PageContainer";
//import Card from "../components/ui/Card";
//import Progress from "../components/ui/Progress";
//import Button from "../components/ui/Button";
//import DragDropUpload from "../components/DragDropUpload";
//import { API_BASE_URL as API} from "../config";
////const API = process.env.REACT_APP_API || "http://localhost:8080/api";
//


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlayCircle, CheckCircle, Lock, FileText, ChevronDown, ChevronRight,
  Plus, Trash2, File, ArrowLeft, Code, Layout
} from "lucide-react";

// Keeping your custom uploader, assuming it works
import DragDropUpload from "../components/DragDropUpload";
import { API_BASE_URL as API} from "../config";

export default function CoursePage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE (UNCHANGED) ---
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [moduleLessons, setModuleLessons] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // --- INSTRUCTOR STATE (UNCHANGED) ---
  const [activeModuleIdForAdd, setActiveModuleIdForAdd] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("VIDEO");
  const [textContent, setTextContent] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [activeCodingProblem, setActiveCodingProblem] = useState(null);

  // Auth Helpers
  const isInstructor = user && (user.role === "INSTRUCTOR" || user.role === "ADMIN");
  const token = localStorage.getItem("sf_token");
  const headers = () => (token ? { Authorization: "Bearer " + token } : {});

  // --- INITIAL DATA FETCH (UNCHANGED) ---
  useEffect(() => {
    async function fetchData() {
      try {
        const courseRes = await axios.get(`${API}/courses/${id}`, { headers: headers() });
        setCourse(courseRes.data);

        const modulesRes = await axios.get(`${API}/courses/${id}/modules`, { headers: headers() });
        setModules(modulesRes.data || []);

        if (token) {
            try {
                const progRes = await axios.get(`${API}/progress/course/${id}`, { headers: headers() });
                setProgress(progRes.data);
            } catch (e) { console.log("Progress fetch skipped or failed"); }
        }

        if (modulesRes.data.length > 0) {
           toggleModule(modulesRes.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load course data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [id, token]);

  // --- LOGIC (UNCHANGED) ---
  async function toggleModule(moduleId) {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }
    setExpandedModuleId(moduleId);
    try {
      const res = await axios.get(`${API}/courses/${id}/modules/${moduleId}/lessons`, { headers: headers() });
      setModuleLessons((prev) => ({ ...prev, [moduleId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  }

  async function handleLessonSelect(lesson) {
    setActiveLesson(lesson);
    setActiveCodingProblem(null);
    try {
        const res = await axios.get(`${API}/coding/problems/lesson/${lesson.id}`, { headers: headers() });
        if (res.data) setActiveCodingProblem(res.data);
    } catch (err) {
        console.log("No coding problem found for this lesson");
    }
  }

  async function handleCreateModule() {
    const title = prompt("Module title?");
    const desc = prompt("Module description?");
    if (!title) return;
    try {
      await axios.post(`${API}/courses/${id}/modules`, { title, description: desc }, { headers: headers() });
      const res = await axios.get(`${API}/courses/${id}/modules`, { headers: headers() });
      setModules(res.data);
    } catch (err) {
      alert("Failed to create module");
    }
  }

  async function handleSaveLesson(moduleId) {
    if (!newLessonTitle) return alert("Title required");
    let content = "";
    if (newLessonType === "VIDEO" || newLessonType === "PDF") {
        if (!uploadedUrl) return alert("Please upload a file first");
        content = uploadedUrl;
    } else {
        if (!textContent) return alert("Please write some content");
        content = textContent;
    }
    try {
      await axios.post(
        `${API}/courses/${id}/modules/${moduleId}/lessons`,
        { title: newLessonTitle, type: newLessonType, content: content },
        { headers: headers() }
      );
      setNewLessonTitle("");
      setUploadedUrl("");
      setTextContent("");
      setActiveModuleIdForAdd(null);
      const res = await axios.get(`${API}/courses/${id}/modules/${moduleId}/lessons`, { headers: headers() });
      setModuleLessons((prev) => ({ ...prev, [moduleId]: res.data }));
      alert("Lesson Created!");
    } catch(err) {
      alert("Failed to save lesson: " + err.message);
    }
  }

  async function handleDeleteLesson(e, moduleId, lessonId) {
    e.stopPropagation();
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await axios.delete(`${API}/courses/${id}/modules/${moduleId}/lessons/${lessonId}`, { headers: headers() });
      const currentLessons = moduleLessons[moduleId] || [];
      setModuleLessons(prev => ({ ...prev, [moduleId]: currentLessons.filter(l => l.id !== lessonId) }));
      if (activeLesson && activeLesson.id === lessonId) setActiveLesson(null);
    } catch (err) {
      alert("Failed to delete lesson");
    }
  }

  async function markCompleted() {
    if (!activeLesson) return;
    try {
      await axios.post(`${API}/progress/lesson/${activeLesson.id}/complete`, {}, { headers: headers() });
      const progRes = await axios.get(`${API}/progress/course/${id}`, { headers: headers() });
      setProgress(progRes.data);
      alert("Lesson marked as completed!");
    } catch (err) {
      alert("Error marking completion.");
    }
  }

  const getFullUrl = (path) => {
      if (!path) return "";
      return path.startsWith("http") ? path : `http://localhost:8080${path}`;
  };

  // --- RENDER ---

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Course...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center text-slate-500">Course not found</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-6 md:p-10">

      {/* HEADER NAV */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
        <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 text-slate-600 transition"
        >
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-slate-500 text-sm">{modules.length} Modules • {progress}% Completed</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- LEFT SIDEBAR (Modules) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-slate-800">Course Content</h3>
                 {isInstructor && (
                    <button onClick={handleCreateModule} className="text-xs flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition">
                      <Plus size={14} /> Module
                    </button>
                 )}
               </div>
               {/* Custom Progress Bar */}
               <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
               </div>
            </div>

            <div className="divide-y divide-gray-100">
              {modules.map((module) => {
                const isOpen = expandedModuleId === module.id;
                const lessons = moduleLessons[module.id] || [];
                const isAddingLesson = activeModuleIdForAdd === module.id;

                return (
                  <div key={module.id} className="bg-white">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`w-full text-left p-4 flex items-center justify-between transition-colors ${isOpen ? "bg-indigo-50/50 text-indigo-900" : "hover:bg-gray-50 text-slate-700"}`}
                    >
                      <div className="flex items-center gap-3">
                         {isOpen ? <ChevronDown size={18} className="text-indigo-500" /> : <ChevronRight size={18} className="text-gray-400" />}
                         <span className="font-semibold text-sm">{module.title}</span>
                      </div>
                    </button>

                    {/* Lessons List */}
                    {isOpen && (
                      <div className="bg-gray-50/30 pb-2">
                         {/* Lesson Items */}
                         {lessons.map((lesson) => {
                             const isActive = activeLesson && activeLesson.id === lesson.id;
                             let Icon = FileText;
                             if(lesson.type === "VIDEO") Icon = PlayCircle;
                             if(lesson.type === "PDF") Icon = File;

                             return (
                               <div
                                 key={lesson.id}
                                 onClick={() => handleLessonSelect(lesson)}
                                 className={`
                                   group flex items-center justify-between cursor-pointer py-3 px-4 pl-10 text-sm transition-all border-l-4
                                   ${isActive
                                     ? "bg-indigo-100 border-indigo-600 text-indigo-900 font-medium"
                                     : "border-transparent text-slate-600 hover:bg-gray-100 hover:text-slate-900"}
                                 `}
                               >
                                 <div className="flex items-center gap-3 overflow-hidden">
                                   <Icon size={16} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                                   <span className="truncate">{lesson.title}</span>
                                 </div>
                                 {isInstructor && (
                                   <button onClick={(e) => handleDeleteLesson(e, module.id, lesson.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                     <Trash2 size={14} />
                                   </button>
                                 )}
                               </div>
                             );
                         })}

                         {/* Instructor Add Lesson Area */}
                         {isInstructor && (
                           <div className="px-4 py-2">
                             {!isAddingLesson ? (
                               <button
                                 onClick={() => setActiveModuleIdForAdd(module.id)}
                                 className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pl-6"
                               >
                                 <Plus size={14}/> Add Lesson
                               </button>
                             ) : (
                               <div className="p-4 bg-white border border-indigo-100 rounded-xl shadow-sm space-y-3">
                                  <input className="w-full text-sm border-gray-200 rounded-lg" placeholder="Lesson Title" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                                  <select className="w-full text-sm border-gray-200 rounded-lg" value={newLessonType} onChange={(e) => setNewLessonType(e.target.value)}>
                                    <option value="VIDEO">Video</option>
                                    <option value="TEXT">Text</option>
                                    <option value="PDF">PDF</option>
                                  </select>
                                  {(newLessonType === "VIDEO" || newLessonType === "PDF") && (
                                    <div className="text-xs">
                                      <DragDropUpload folder={newLessonType === "VIDEO" ? "lesson-videos" : "lesson-pdfs"} token={token} onUploaded={(data) => setUploadedUrl(data.url)} />
                                      {uploadedUrl && <p className="text-green-600 mt-1 truncate">Uploaded!</p>}
                                    </div>
                                  )}
                                  {newLessonType === "TEXT" && (
                                    <textarea className="w-full text-sm border-gray-200 rounded-lg" placeholder="Content..." value={textContent} onChange={(e) => setTextContent(e.target.value)} />
                                  )}
                                  <div className="flex gap-2">
                                    <button onClick={() => handleSaveLesson(module.id)} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
                                    <button onClick={() => setActiveModuleIdForAdd(null)} className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg">Cancel</button>
                                  </div>
                               </div>
                             )}
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              })}
              {modules.length === 0 && <div className="p-6 text-center text-gray-400 italic text-sm">No modules yet.</div>}
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="lg:col-span-8">
            {activeLesson ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                {/* Lesson Title Bar */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{activeLesson.type}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{activeLesson.title}</h2>
                    </div>
                    <button
                        onClick={markCompleted}
                        className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-lg font-medium transition text-sm whitespace-nowrap"
                    >
                        <CheckCircle size={18} /> Mark Complete
                    </button>
                </div>

                {/* Lesson Content Viewer */}
                <div className="flex-1 p-6 bg-gray-50/50">
                    {/* VIDEO PLAYER */}
                    {activeLesson.type === "VIDEO" && activeLesson.content && (
                        <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video">
                            <video key={activeLesson.content} controls className="w-full h-full" src={getFullUrl(activeLesson.content)} />
                        </div>
                    )}

                    {/* PDF VIEWER */}
                    {activeLesson.type === "PDF" && activeLesson.content && (
                        <div className="h-[700px] border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                            <iframe src={getFullUrl(activeLesson.content)} title="PDF Viewer" className="w-full h-full" />
                        </div>
                    )}

                    {/* TEXT CONTENT */}
                    {(activeLesson.type === "TEXT" || !activeLesson.type) && (
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-slate-700 leading-loose prose max-w-none">
                            {activeLesson.content}
                        </div>
                    )}
                </div>

                {/* Action Footer (Quiz & Coding) */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Lesson Actions</h4>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate(`/lesson/${activeLesson.id}/quizzes`)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition font-medium"
                        >
                            <FileText size={20} /> Attempt Quiz
                        </button>

                        {/* Coding Problems */}
                        {isInstructor && !activeCodingProblem && (
                            <button
                                onClick={() => navigate(`/instructor/coding/create?lessonId=${activeLesson.id}`)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition font-medium"
                            >
                                <Code size={20} /> + Add Coding Problem
                            </button>
                        )}

                        {activeCodingProblem && (
                            <button
                                onClick={() => navigate(`/coding/problem/${activeCodingProblem.id}`)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition font-medium"
                            >
                                <Code size={20} /> Solve Coding Challenge
                            </button>
                        )}
                    </div>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                      <Layout size={32} className="text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to start learning?</h2>
                  <p className="text-slate-500 max-w-sm">Select a module from the left sidebar to view video lessons, reading materials, and coding challenges.</p>
              </div>
            )}
        </div>

      </div>
    </div>
  );
}