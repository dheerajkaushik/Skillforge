import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function CreateCodingProblem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lessonId");

  const [problem, setProblem] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    constraints: "",
    inputDescription: "", // ✅ ADDED
        outputDescription: "",
        timeLimitMs: 1000,
            memoryLimitMb: 256,
    starterCode: `public class Main {\n\tpublic static void main(String[] args) {\n\t\t// write your code here\n\t}\n}`
  });

  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "", isHidden: false },
    { input: "", expectedOutput: "", isHidden: false } // Add a second optional one
  ]);

  const token = localStorage.getItem("sf_token");

  const handleChange = (e) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newCases = [...testCases];
    newCases[index][field] = value;
    setTestCases(newCases);
  };

  const addTestCaseField = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
  };

  const handleSubmit = async () => {
      try {
        // 1. Get User ID
        const userRes = await axios.get(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const instructorId = userRes.data.id;

        // 2. Create Problem
        const payload = {
            ...problem,
            lessonId: lessonId,
            createdBy: instructorId
        };

        const res = await axios.post(`${API}/coding/problems`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const problemId = res.data.id;

        // 3. Add Test Cases
        for (const tc of testCases) {
          // Ensure input/output are not empty
          if(tc.input && tc.expectedOutput) {
              const testCasePayload = {
                  input: tc.input,
                  expectedOutput: tc.expectedOutput,
                  // ✅ FIX: Map 'isHidden' from state to 'isSample' for backend
                  // If 'isHidden' is true (hidden test case), then 'isSample' is false.
                  // If 'isHidden' is false (public test case), then 'isSample' is true.
                  isSample: !tc.isHidden
              };

              await axios.post(`${API}/coding/problems/${problemId}/testcases`, testCasePayload, { headers: { Authorization: `Bearer ${token}` } });
          }
        }

        alert("Coding Problem Created Successfully!");
        navigate(-1);
      } catch (err) {
        console.error(err);
        alert("Error creating problem: " + (err.response?.data?.message || err.message));
      }
    };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10 border">
      <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-blue-600">← Back</button>
          <h1 className="text-2xl font-bold text-indigo-700">Create Coding Challenge</h1>
          <div className='w-10'></div> {/* Spacer */}
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-sm font-bold text-gray-700">Title</label>
            <input name="title" className="w-full p-2 border rounded" onChange={handleChange} placeholder="e.g. Sum of Two Numbers" />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700">Description</label>
            <textarea name="description" className="w-full p-2 border rounded h-32 font-mono" onChange={handleChange} placeholder="Explain the problem..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Input Format</label>
                        <textarea name="inputDescription" className="w-full p-2 border rounded h-20" onChange={handleChange} placeholder="e.g. The first line contains an integer N..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Output Format</label>
                        <textarea name="outputDescription" className="w-full p-2 border rounded h-20" onChange={handleChange} placeholder="e.g. Print the sum of the two numbers." />
                    </div>
                </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700">Difficulty</label>
                <select name="difficulty" className="w-full p-2 border rounded" onChange={handleChange}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
            </div>
            <div>
                 <label className="block text-sm font-bold text-gray-700">Constraints</label>
                 <input name="constraints" className="w-full p-2 border rounded" onChange={handleChange} placeholder="e.g. 1 <= n <= 100" />
            </div>
            <div>
                             <label className="block text-sm font-bold text-gray-700">Time Limit (ms)</label>
                             <input type="number" name="timeLimitMs" className="w-full p-2 border rounded" onChange={handleChange} value={problem.timeLimitMs} />
                        </div>
        </div>
        <div>
                     <label className="block text-sm font-bold text-gray-700">Memory Limit (MB)</label>
                     <input type="number" name="memoryLimitMb" className="w-full p-2 border rounded" onChange={handleChange} value={problem.memoryLimitMb} />
                </div>

        <div>
            <label className="block text-sm font-bold text-gray-700">Starter Code (Java)</label>
            <textarea name="starterCode" className="w-full p-2 border rounded font-mono bg-gray-50 h-32" onChange={handleChange} value={problem.starterCode} />
        </div>

        {/* TEST CASES SECTION */}
        <div className="border-t pt-4 mt-4">
            <h3 className="font-bold text-lg mb-2">Test Cases (At least one required)</h3>
            {testCases.map((tc, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-start bg-gray-50 p-2 rounded border">
                    <div className="flex-1">
                        <label className="block text-xs font-bold">Input</label>
                        <textarea
                            className="w-full p-2 border rounded text-sm font-mono h-20"
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold">Expected Output</label>
                        <textarea
                            className="w-full p-2 border rounded text-sm font-mono h-20"
                            value={tc.expectedOutput}
                            onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                        />
                    </div>
                    <label className="flex items-center gap-1 text-xs mt-6">
                        <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                        /> Hidden?
                    </label>
                </div>
            ))}
            <button onClick={addTestCaseField} className="text-sm text-indigo-600 hover:underline">+ Add another test case</button>
        </div>

        <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 mt-6">
            Save Coding Problem
        </button>
      </div>
    </div>
  );
}