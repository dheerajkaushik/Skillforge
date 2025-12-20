import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlayCircle, CheckCircle, Lock, FileText, ChevronDown, ChevronRight,
  Plus, Trash2, File
} from "lucide-react";

import PageContainer from "../components/layout/PageContainer";
import Card from "../components/ui/Card";
import Progress from "../components/ui/Progress";
import Button from "../components/ui/Button";
import DragDropUpload from "../components/DragDropUpload";

const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function CoursePage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [moduleLessons, setModuleLessons] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // --- INSTRUCTOR STATE ---
  const [activeModuleIdForAdd, setActiveModuleIdForAdd] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("VIDEO");
  const [textContent, setTextContent] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  // ✅ STATE FOR CODING PROBLEM
  const [activeCodingProblem, setActiveCodingProblem] = useState(null);

  // Auth Helpers
  const isInstructor = user && (user.role === "INSTRUCTOR" || user.role === "ADMIN");
  const token = localStorage.getItem("sf_token");
  const headers = () => (token ? { Authorization: "Bearer " + token } : {});

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Course Info
        const courseRes = await axios.get(`${API}/courses/${id}`, { headers: headers() });
        setCourse(courseRes.data);

        // 2. Fetch Modules
        const modulesRes = await axios.get(`${API}/courses/${id}/modules`, { headers: headers() });
        setModules(modulesRes.data || []);

        // 3. Fetch Progress (if logged in)
        if (token) {
            try {
                const progRes = await axios.get(`${API}/progress/course/${id}`, { headers: headers() });
                setProgress(progRes.data);
            } catch (e) { console.log("Progress fetch skipped or failed"); }
        }

        // 4. Auto-expand first module if available
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

  // --- MODULE LOGIC ---
  async function toggleModule(moduleId) {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }
    setExpandedModuleId(moduleId);

    // Fetch lessons for this module if we haven't already (or always refresh to be safe)
    try {
      const res = await axios.get(`${API}/courses/${id}/modules/${moduleId}/lessons`, { headers: headers() });
      setModuleLessons((prev) => ({ ...prev, [moduleId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  }

  // ✅ NEW FUNCTION: Handle Lesson Selection & Fetch Coding Problem
  async function handleLessonSelect(lesson) {
    setActiveLesson(lesson);
    setActiveCodingProblem(null); // Reset first

    try {
        // Check if there is a coding problem for this lesson
        // Requires the new backend endpoint: /api/coding/problems/lesson/{lessonId}
        const res = await axios.get(`${API}/coding/problems/lesson/${lesson.id}`, { headers: headers() });
        if (res.data) {
            setActiveCodingProblem(res.data);
        }
    } catch (err) {
        // It's normal to error (404/204) if no problem exists
        console.log("No coding problem found for this lesson");
    }
  }

  // --- INSTRUCTOR ACTIONS ---
  async function handleCreateModule() {
    const title = prompt("Module title?");
    const desc = prompt("Module description?");
    if (!title) return;

    try {
      await axios.post(`${API}/courses/${id}/modules`, { title, description: desc }, { headers: headers() });
      // Refresh modules list
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

      // Reset and Refresh
      setNewLessonTitle("");
      setUploadedUrl("");
      setTextContent("");
      setActiveModuleIdForAdd(null);

      // Refresh the lesson list for this module
      const res = await axios.get(`${API}/courses/${id}/modules/${moduleId}/lessons`, { headers: headers() });
      setModuleLessons((prev) => ({ ...prev, [moduleId]: res.data }));

      alert("Lesson Created!");
    } catch(err) {
      alert("Failed to save lesson: " + err.message);
    }
  }

  async function handleDeleteLesson(e, moduleId, lessonId) {
    e.stopPropagation(); // Prevent clicking the module row
    if (!window.confirm("Delete this lesson?")) return;

    try {
      await axios.delete(`${API}/courses/${id}/modules/${moduleId}/lessons/${lessonId}`, { headers: headers() });

      // Remove from UI
      const currentLessons = moduleLessons[moduleId] || [];
      setModuleLessons(prev => ({
          ...prev,
          [moduleId]: currentLessons.filter(l => l.id !== lessonId)
      }));

      if (activeLesson && activeLesson.id === lessonId) setActiveLesson(null);
    } catch (err) {
      alert("Failed to delete lesson");
    }
  }

  // --- STUDENT ACTIONS ---
  async function markCompleted() {
    if (!activeLesson) return;
    try {
      await axios.post(`${API}/progress/lesson/${activeLesson.id}/complete`, {}, { headers: headers() });

      // Refresh Progress Bar
      const progRes = await axios.get(`${API}/progress/course/${id}`, { headers: headers() });
      setProgress(progRes.data);

      alert("Lesson marked as completed!");
    } catch (err) {
      alert("Error marking completion.");
    }
  }

  // Helper to ensure media URLs point to backend
  const getFullUrl = (path) => {
      if (!path) return "";
      return path.startsWith("http") ? path : `http://localhost:8080${path}`;
  };

  if (loading) return <PageContainer><div className="p-10 text-center">Loading Course...</div></PageContainer>;
  if (!course) return <PageContainer><div className="p-10 text-center">Course not found</div></PageContainer>;

  return (
    <PageContainer>
    <Button onClick={() => navigate(-1)}>Go Back</Button>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* --- LEFT SIDEBAR (Modules & Navigation) --- */}
        <div className="col-span-1 md:col-span-4 h-fit">
          <Card>
            <h3 className="font-semibold text-lg mb-2">{course.title}</h3>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Course Progress</span>
                    <span>{progress}%</span>
                </div>
                <Progress value={progress} />
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Modules Header */}
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm uppercase text-slate-500 tracking-wider">Modules</h4>
              {isInstructor && (
                <button onClick={handleCreateModule} className="text-xs bg-indigo-50 text-indigo-600 p-1 rounded hover:bg-indigo-100" title="Add Module">
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Modules Accordion */}
            <ul className="space-y-3 text-sm">
              {modules.map((module) => {
                const isOpen = expandedModuleId === module.id;
                const lessons = moduleLessons[module.id] || [];
                const isAddingLesson = activeModuleIdForAdd === module.id;

                return (
                  <li key={module.id}>
                    {/* Module Header Row */}
                    <div
                      onClick={() => toggleModule(module.id)}
                      className={`font-medium flex items-center justify-between cursor-pointer p-2 rounded transition-colors ${isOpen ? "bg-slate-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-2">
                         {isOpen ? <PlayCircle size={16} /> : <Lock size={16} className="text-slate-400" />}
                         {module.title}
                      </div>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>

                    {/* Module Body (Lessons) */}
                    {isOpen && (
                      <div className="ml-2 mt-1 border-l-2 border-indigo-100 pl-2">
                         {/* Add Lesson Button (Instructor Only) */}
                         {isInstructor && !isAddingLesson && (
                           <button
                             onClick={() => setActiveModuleIdForAdd(module.id)}
                             className="text-xs text-indigo-600 mb-2 mt-2 flex items-center gap-1 hover:underline ml-2"
                           >
                             <Plus size={12}/> Add Lesson
                           </button>
                         )}

                         {/* Add Lesson Form */}
                         {isAddingLesson && (
                           <div className="mb-4 p-3 bg-white border border-slate-200 rounded shadow-sm text-xs mt-2">
                              <input
                                className="w-full mb-2 p-2 border rounded"
                                placeholder="Lesson Title"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                              />
                              <select
                                className="w-full mb-2 p-2 border rounded"
                                value={newLessonType}
                                onChange={(e) => setNewLessonType(e.target.value)}
                              >
                                <option value="VIDEO">Video</option>
                                <option value="TEXT">Text</option>
                                <option value="PDF">PDF Document</option>
                              </select>

                              {/* Uploaders based on Type */}
                              {(newLessonType === "VIDEO" || newLessonType === "PDF") && (
                                <div className="mb-2">
                                  <DragDropUpload
                                    folder={newLessonType === "VIDEO" ? "lesson-videos" : "lesson-pdfs"}
                                    token={token}
                                    onUploaded={(data) => setUploadedUrl(data.url)}
                                  />
                                  {uploadedUrl && <p className="text-green-600 mt-1 truncate">{uploadedUrl}</p>}
                                </div>
                              )}

                              {newLessonType === "TEXT" && (
                                <textarea
                                  className="w-full mb-2 p-2 border rounded h-20"
                                  placeholder="Lesson content..."
                                  value={textContent}
                                  onChange={(e) => setTextContent(e.target.value)}
                                />
                              )}

                              <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => handleSaveLesson(module.id)}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setActiveModuleIdForAdd(null)}>Cancel</Button>
                              </div>
                           </div>
                         )}

                         {/* Lessons List */}
                         <ul className="space-y-1 mt-1">
                           {lessons.map((lesson) => {
                             const isActive = activeLesson && activeLesson.id === lesson.id;
                             let Icon = FileText;
                             if(lesson.type === "VIDEO") Icon = PlayCircle;
                             if(lesson.type === "PDF") Icon = File;

                             return (
                               <li
                                 key={lesson.id}
                                 // ✅ UPDATED: Call handleLessonSelect instead of setActiveLesson
                                 onClick={() => handleLessonSelect(lesson)}
                                 className={`
                                   flex items-center justify-between group cursor-pointer py-2 px-3 rounded text-sm transition-all
                                   ${isActive ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:text-indigo-600 hover:bg-white"}
                                 `}
                               >
                                 <div className="flex items-center gap-2">
                                   <Icon size={14} className={isActive ? "text-indigo-200" : "text-slate-400"} />
                                   <span className="truncate max-w-[150px]">{lesson.title}</span>
                                 </div>
                                 {isInstructor && (
                                   <button
                                     onClick={(e) => handleDeleteLesson(e, module.id, lesson.id)}
                                     className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "text-white hover:bg-indigo-700" : "text-slate-400 hover:text-red-600"}`}
                                     title="Delete Lesson"
                                   >
                                     <Trash2 size={12} />
                                   </button>
                                 )}
                               </li>
                             );
                           })}
                           {lessons.length === 0 && !isAddingLesson && (
                               <li className="text-xs text-slate-400 italic pl-3 py-2">No lessons yet</li>
                           )}
                         </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* --- RIGHT CONTENT AREA (Player & Actions) --- */}
        <div className="col-span-1 md:col-span-8">
          <Card className="min-h-[500px]">
            {activeLesson ? (
              <div>
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{activeLesson.title}</h2>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 mt-1 inline-block">
                            {activeLesson.type} Lesson
                        </span>
                    </div>

                    {/* Mark Complete Button */}
                    <Button variant="success" onClick={markCompleted}>
                        <CheckCircle size={16} /> Complete Lesson
                    </Button>
                </div>

                {/* --- CONTENT VIEWERS --- */}

                {/* 1. VIDEO PLAYER */}
                {activeLesson.type === "VIDEO" && activeLesson.content && (
                  <div className="bg-black rounded-xl overflow-hidden aspect-video mb-6 shadow-lg">
                     <video
                        key={activeLesson.content} // Key forces reload on change
                        controls
                        className="w-full h-full"
                        src={getFullUrl(activeLesson.content)}
                     />
                  </div>
                )}

                {/* 2. PDF VIEWER */}
                {activeLesson.type === "PDF" && activeLesson.content && (
                   <div className="mb-6 h-[700px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                       <iframe
                           src={getFullUrl(activeLesson.content)}
                           title="PDF Viewer"
                           className="w-full h-full"
                       />
                   </div>
                )}

                {/* 3. TEXT CONTENT */}
                {(activeLesson.type === "TEXT" || !activeLesson.type) && (
                  <div className="bg-slate-50 p-6 rounded-xl mb-6 border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {activeLesson.content}
                  </div>
                )}

                {/* --- ACTION BUTTONS (Quiz & Coding) --- */}
                <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-slate-700">Practice & Assignments</h4>
                      <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/lesson/${activeLesson.id}/quizzes`)}
                          >
                            📝 Attempt Quiz
                          </Button>

                          {/* ✅ NEW: Coding Problem Buttons */}

                          {/* FOR INSTRUCTORS: Add Problem (Shows if NO active problem) */}
                          {isInstructor && !activeCodingProblem && (
                             <Button
                                variant="outline"
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                onClick={() => navigate(`/instructor/coding/create?lessonId=${activeLesson.id}`)}
                             >
                               + Add Coding Problem
                             </Button>
                          )}

                          {/* FOR STUDENTS/ALL: Solve Problem (Shows if active problem exists) */}
                          {activeCodingProblem && (
                            <Button
                              variant="secondary"
                              className="bg-slate-800 text-white hover:bg-slate-900"
                              onClick={() => navigate(`/coding/problem/${activeCodingProblem.id}`)}
                            >
                              💻 Solve Coding Problem
                            </Button>
                          )}
                      </div>
                  </div>
                </div>

              </div>
            ) : (
              // EMPTY STATE
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <PlayCircle size={48} className="text-slate-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-600">Select a lesson to begin</h2>
                <p className="text-sm">Choose a module from the left sidebar</p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </PageContainer>
  );
}