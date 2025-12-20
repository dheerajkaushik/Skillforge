import axios from "axios";


const API = axios.create({
baseURL: "http://localhost:8080/api",
});


export const fetchProblem = (id) =>
API.get(`/coding/problems/${id}`);


export const fetchSamples = (id) =>
API.get(`/coding/problems/${id}/samples`);


export const submitCode = (problemId, studentId, code) =>
API.post(
`/coding/submissions?problemId=${problemId}&studentId=${studentId}`,
code,
{ headers: { "Content-Type": "text/plain" } }
);