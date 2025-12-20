import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { submitQuiz, getInstructorQuizById } from '../api/quizApi'; // Ensure this path matches your file structure

const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // State
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("sf_token");

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [quizId]);

  async function loadData() {
    try {
      setLoading(true);

      // 1. Fetch User (to check role and get Student ID)
      let currentUser = user;
      if (token && !currentUser) {
         const userRes = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
         currentUser = userRes.data;
         setUser(currentUser);
      }

      const isInstructor = currentUser && (currentUser.role === "INSTRUCTOR" || currentUser.role === "ADMIN");

      // 2. Fetch Quiz Data based on Role
      let res;
      if (isInstructor) {
        // Use the INSTRUCTOR endpoint (Requires the fix we added to QuizApi.js)
        res = await getInstructorQuizById(quizId, token);
      } else {
        // Use the STUDENT endpoint
        // NOTE: Ensure your StudentQuizController has a @GetMapping("/{quizId}")
        res = await axios.get(`${API}/student/quizzes/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
      }

      setQuiz(res.data);
      // Backend should send questions inside the quiz object now
      setQuestions(res.data.questions || []);

    } catch (err) {
      console.error("Quiz Load Error:", err);
      setError("Failed to load quiz. " + (err.response?.status === 403 ? "Access Denied." : ""));
    } finally {
      setLoading(false);
    }
  }

  // --- HANDLERS ---

  const handleChange = (qid, opt) => {
    setAnswers(prev => ({ ...prev, [qid]: opt }));
  };

  const handleSubmit = async () => {
    if (!user || !user.id) return alert("User not identified");

    // Validate all questions answered
    if (Object.keys(answers).length < questions.length) {
        if(!window.confirm("You haven't answered all questions. Submit anyway?")) return;
    }

    try {
        const res = await submitQuiz(quiz.id, answers, user.id, token);
        setScore(res.data); // Assuming backend returns the score integer
        window.scrollTo(0, 0); // Scroll to top to see score
    } catch (err) {
        alert("Submission failed: " + err.message);
    }
  };

  // --- RENDER HELPERS ---
  const isInstructor = user && (user.role === "INSTRUCTOR" || user.role === "ADMIN");

  // --- RENDER ---

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Quiz...</div>;

  if (error) return (
      <div className="p-10 text-center">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="text-blue-500 underline">Go Back</button>
      </div>
  );

  if (!quiz) return <div className="p-10 text-center">Quiz not found.</div>;

  // VIEW: SCORE RESULT
  if (score !== null) {
    return (
        <div className="max-w-2xl mx-auto p-8 text-center mt-10 bg-white rounded-2xl shadow-lg border border-green-100">
            <h2 className="text-3xl font-bold text-green-700 mb-4">Quiz Completed!</h2>
            <div className="text-6xl font-bold text-slate-800 mb-6">{score}%</div>
            <p className="text-gray-500 mb-6">Great job completing the quiz.</p>
            <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900"
            >
                Back to Lesson
            </button>
        </div>
    );
  }

  // VIEW: QUIZ ATTEMPT / PREVIEW
  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4 hover:underline flex items-center gap-1">
        ← Back to Lesson
      </button>

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{quiz.title}</h2>
                <p className="text-sm text-slate-500">{questions.length} Questions</p>
            </div>
            {isInstructor && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Instructor Preview
                </span>
            )}
        </div>

        {questions.map((q, idx) => (
          <div key={q.id} className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
            <p className="font-semibold text-lg mb-4 text-slate-800">
                <span className="text-indigo-600 mr-2">{idx + 1}.</span>
                {q.text || q.questionText}
            </p>

            <div className="space-y-3 pl-2">
                {[
                    { key: 'A', val: q.optionA },
                    { key: 'B', val: q.optionB },
                    { key: 'C', val: q.optionC },
                    { key: 'D', val: q.optionD }
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${answers[q.id] === opt.key
                            ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                            : "hover:bg-gray-50 border-gray-200"
                        }
                        ${isInstructor && q.correctOption === opt.key ? "bg-green-50 border-green-500 ring-1 ring-green-500" : ""}
                    `}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.key}
                      checked={answers[q.id] === opt.key}
                      onChange={() => !isInstructor && handleChange(q.id, opt.key)}
                      disabled={isInstructor} // Instructors can't click
                      className="w-4 h-4 text-indigo-600 accent-indigo-600"
                    />
                    <span className="text-slate-700">{opt.val}</span>
                    {isInstructor && q.correctOption === opt.key && (
                        <span className="ml-auto text-xs font-bold text-green-600 uppercase">Correct Answer</span>
                    )}
                  </label>
                ))}
            </div>
          </div>
        ))}

        {!isInstructor && (
            <div className="flex justify-end pt-4">
                <button
                  className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-md transition-transform hover:scale-105 active:scale-95"
                  onClick={handleSubmit}
                >
                  Submit Quiz
                </button>
            </div>
        )}
      </div>
    </div>
  );
}