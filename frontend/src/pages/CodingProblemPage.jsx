import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from "../components/CodeEditor";
import VerdictBox from "../components/VerdictBox";
// ✅ IMPORT YOUR LEADERBOARD COMPONENT
import Leaderboard from "../Leaderboard";
import { fetchProblem, fetchSamples, submitCode } from "../services/codingApi";
import { API_BASE_URL as API} from "../config";
//const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function CodingProblemPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("sf_token");

  // ✅ NEW STATE: For switching tabs
  const [activeTab, setActiveTab] = useState("description");

  const [problem, setProblem] = useState(null);
  const [samples, setSamples] = useState([]);
  const [code, setCode] = useState("");
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
        setStudentId(userRes.data.id);

        const probRes = await axios.get(`${API}/coding/problems/${problemId}`, { headers: { Authorization: `Bearer ${token}` } });
        setProblem(probRes.data);
        setCode(probRes.data.starterCode || `public class Main {\n\tpublic static void main(String[] args) {\n\t\t// write your code here\n\t}\n}`);

        const samplesRes = await axios.get(`${API}/coding/problems/${problemId}/samples`, { headers: { Authorization: `Bearer ${token}` } });
        setSamples(samplesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadData();
  }, [problemId, token]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${API}/coding/submissions?problemId=${problemId}&studentId=${studentId}`,
        code,
        { headers: { "Content-Type": "text/plain", Authorization: `Bearer ${token}` } }
      );
      setSubmission(res.data);
    } catch (err) {
      alert("Submission failed: " + err.message);
    }
  };

  if (loading || !problem) return <div className="p-10">Loading Problem...</div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-white flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-blue-600">← Back to Course</button>
          <h1 className="text-xl font-bold">{problem.title}</h1>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* ✅ LEFT PANEL: Now flex-col to hold Tabs + Content */}
          <div className="w-full md:w-1/3 flex flex-col border-r bg-gray-50 h-full">

            {/* 1. TAB HEADER */}
            <div className="flex bg-white border-b">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'description' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                📖 Description
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'leaderboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                🏆 Leaderboard
              </button>
              <button
              onClick={() => setActiveTab("History")}
                className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'History' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                🕒 History
               </button>
            </div>

            {/* 2. TAB CONTENT (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* CASE A: Show Description */}
                {activeTab === "description" && (
                    <>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${problem.difficulty === 'HARD' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {problem.difficulty}
                        </span>
                        <p className="mt-4 whitespace-pre-wrap">{problem.description}</p>

                        <div className="mt-6">
                            <h3 className="font-bold mb-2">Constraints:</h3>
                            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{problem.constraints}</p>
                        </div>

                        <h3 className="mt-6 font-semibold">Sample Test Cases</h3>
                        {samples.map((tc, idx) => (
                        <div key={idx} className="bg-white border p-3 mt-2 rounded text-sm font-mono">
                            <div><strong>Input:</strong> <pre className="bg-gray-100 p-1">{tc.input}</pre></div>
                            <div className="mt-2"><strong>Output:</strong> <pre className="bg-gray-100 p-1">{tc.expectedOutput}</pre></div>
                        </div>
                        ))}
                    </>
                )}

                {/* CASE B: Show Leaderboard */}
                {activeTab === "leaderboard" && (
                    <Leaderboard problemId={problemId} />
                )}
            {activeTab === "history" && (
                                <div className="animate-fade-in">
                                    {historyLoading ? (
                                        <p className="text-center text-gray-500 py-10">Loading history...</p>
                                    ) : history.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-gray-400 text-4xl mb-2">📝</p>
                                            <p className="text-gray-500">No submissions yet.</p>
                                            <p className="text-xs text-gray-400">Submit your code to see it here!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {history.map((sub, idx) => (
                                                <div key={sub.id || idx} className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(sub.verdict)}`}>
                                                            {sub.verdict ? sub.verdict.replace("_", " ") : "UNKNOWN"}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(sub.submittedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div className="text-xs text-gray-500">
                                                            Tests: <b>{sub.passedTestCases}/{sub.totalTestCases}</b>
                                                        </div>
                                                        <button
                                                            onClick={() => setCode(sub.sourceCode)}
                                                            className="text-xs text-blue-600 font-medium hover:underline"
                                                        >
                                                            Load Code
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

            </div>
          </div>

          {/* RIGHT PANEL: Code Editor (Unchanged) */}
          <div className="w-full md:w-2/3 flex flex-col h-full">
            <div className="flex-1 overflow-hidden relative">
                 <CodeEditor code={code} setCode={setCode} />
            </div>
            <div className="p-4 bg-gray-100 border-t flex justify-between items-center shrink-0">
                <VerdictBox submission={submission} />
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
                >
                  Submit Code
                </button>
            </div>
          </div>
      </div>
    </div>
  );
}