import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Button from "./ui/Button";
// ^ Adjust the path if your Button is in a different folder

// Import the API helper
import QuizApi from '../api/quizApi'; // Ensure casing matches your file name
import { API_BASE_URL as API } from "../config";
//const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function QuizList({ lessonId: propLessonId, onSelect }) {
  // 1. Handle ID from Props OR URL Params
  const { lessonId: paramLessonId } = useParams();
  const lessonId = propLessonId || paramLessonId;

  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState(null);

  // UI State
  const [expandedQuizId, setExpandedQuizId] = useState(null);

  // Instructor Forms State
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A"
  });

  const token = localStorage.getItem("sf_token");

  useEffect(() => {
    if (lessonId) loadData();
    // eslint-disable-next-line
  }, [lessonId]);

  async function loadData() {
    try {
      // 1. Fetch User Role first (if not already loaded)
      let currentUser = user;
      if (token && !currentUser) {
        const userRes = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
        currentUser = userRes.data;
        setUser(currentUser);
      }

      const isInstructor = currentUser && (currentUser.role === "INSTRUCTOR" || currentUser.role === "ADMIN");

      // 2. Choose the correct API endpoint based on Role
      let res;
      if (isInstructor) {
          // ✅ Use the new Instructor endpoint
          res = await QuizApi.getInstructorQuizzes(lessonId, token);
      } else {
          // Use the Student endpoint
          res = await QuizApi.getQuizzesByLesson(lessonId, token);
      }

      setQuizzes(res.data || res);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  }

  const isInstructor = user && (user.role === "INSTRUCTOR" || user.role === "ADMIN");

  // --- ACTIONS ---

 async function handleCreateQuiz() {
     if (!newQuizTitle.trim()) return alert("Enter a title");

     // Safety check: ensure user data is loaded
     if (!user || !user.id) return alert("User data not loaded. Please refresh.");

     try {
         await QuizApi.createQuiz(lessonId, newQuizTitle, user.id, token);
         setNewQuizTitle("");
         loadData();
     } catch (err) {
         alert("Failed to create quiz: " + (err.response?.data?.message || err.message));
     }
   }

  async function handleDeleteQuiz(quizId) {
    if (!window.confirm("Delete this quiz?")) return;
    await QuizApi.deleteQuiz(quizId, token);
    loadData();
  }

  async function handleAddQuestion(quizId) {
    if (!newQuestion.text || !newQuestion.optionA) return alert("Question text required");
    await QuizApi.addQuestion(quizId, newQuestion, token);
    setNewQuestion({ text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" });
    alert("Question Added");
    loadData();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Quizzes</h2>
      <Button onClick={() => navigate(-1)}>Go Back</Button>


      {/* --- INSTRUCTOR: CREATE QUIZ --- */}
      {isInstructor && (
        <div className="mb-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-2 items-center">
          <input
            className="flex-1 p-2 border rounded-xl"
            placeholder="New Quiz Title..."
            value={newQuizTitle}
            onChange={(e) => setNewQuizTitle(e.target.value)}
          />
          <button
            onClick={handleCreateQuiz}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={18} /> Create
          </button>
        </div>
      )}

      {/* --- QUIZ LIST --- */}
      <div className="space-y-4">
        {quizzes.length === 0 && <p className="text-gray-500 text-center">No quizzes yet.</p>}

        {quizzes.map(q => {
          const isExpanded = expandedQuizId === q.id;

          return (
            <div key={q.id} className="p-5 rounded-2xl shadow bg-white hover:shadow-lg transition-all border border-gray-100">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{q.title}</h3>
                  <p className="text-sm text-gray-500">{q.questions?.length || 0} Questions</p>
                </div>

                <div className="flex gap-2 items-center">
                  {/* Instructor Controls */}
                  {isInstructor && (
                    <>
                      <button
                        onClick={() => setExpandedQuizId(isExpanded ? null : q.id)}
                        className="text-sm px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>} Manage
                      </button>
                      <button onClick={() => handleDeleteQuiz(q.id)} className="p-2 text-red-400 hover:text-red-600">
                        <Trash2 size={18}/>
                      </button>
                    </>
                  )}

                  {/* Student/Nav Button */}
                  <button
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
                    onClick={() => onSelect ? onSelect(q) : navigate(`/quiz/${q.id}`)}
                  >
                    Attempt Quiz
                  </button>
                </div>
              </div>

              {/* --- INSTRUCTOR: ADD QUESTIONS PANEL --- */}
              {isInstructor && isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-5 -mb-5 p-5 rounded-b-2xl">
                  <h4 className="font-semibold text-sm mb-3 text-gray-600">Add Question</h4>

                  <div className="space-y-3">
                    <input
                      className="w-full p-2 border rounded-lg"
                      placeholder="Question Text"
                      value={newQuestion.text}
                      onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input className="p-2 border rounded-lg" placeholder="Option A" value={newQuestion.optionA} onChange={e => setNewQuestion({...newQuestion, optionA: e.target.value})} />
                      <input className="p-2 border rounded-lg" placeholder="Option B" value={newQuestion.optionB} onChange={e => setNewQuestion({...newQuestion, optionB: e.target.value})} />
                      <input className="p-2 border rounded-lg" placeholder="Option C" value={newQuestion.optionC} onChange={e => setNewQuestion({...newQuestion, optionC: e.target.value})} />
                      <input className="p-2 border rounded-lg" placeholder="Option D" value={newQuestion.optionD} onChange={e => setNewQuestion({...newQuestion, optionD: e.target.value})} />
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">Correct:</span>
                            <select
                                className="p-2 border rounded-lg bg-white"
                                value={newQuestion.correctAnswer}
                                onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                            >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                        <button
                            onClick={() => handleAddQuestion(q.id)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700"
                        >
                            <CheckCircle size={14}/> Save Question
                        </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}