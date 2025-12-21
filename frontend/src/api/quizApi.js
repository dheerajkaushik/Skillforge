import axios from 'axios';
import { API_BASE_URL } from "../config";

// Define Base URL (adjust if needed)
//const API_BASE = "http://localhost:8080";

// Helper to get headers (Uses passed token OR localStorage)
const getHeaders = (token) => {
    const validToken = token || localStorage.getItem("sf_token");
    return { headers: { Authorization: `Bearer ${validToken}` } };
};

// ==========================================
//  👩‍🎓 STUDENT ENDPOINTS
// ==========================================

export const getQuizzesByLesson = (lessonId, token) =>
    axios.get(`${API_BASE_URL}/api/student/lessons/${lessonId}/quizzes`, getHeaders(token));

export const submitQuiz = (quizId, answers, studentId, token) =>
    axios.post(`${API_BASE_URL}/api/student/quizzes/${quizId}/submit?studentId=${studentId}`, answers, getHeaders(token));


// ==========================================
//  👨‍🏫 INSTRUCTOR ENDPOINTS
// ==========================================

// ✅ NEW: Instructor specific fetch to avoid 403 errors
export const getInstructorQuizzes = (lessonId, token) =>
    axios.get(`${API_BASE_URL}/api/instructor/quizzes/lesson/${lessonId}`, getHeaders(token));

    // ✅ NEW: Get Single Quiz for Instructor
    export const getInstructorQuizById = (quizId, token) =>
        axios.get(`${API_BASE_URL}/api/instructor/quizzes/${quizId}`, getHeaders(token));

export const createQuiz = (lessonId, title, instructorId, token) => {
    return axios.post(
        `${API_BASE_URL}/api/instructor/quizzes`,
        null,
        {
            ...getHeaders(token),
            params: { lessonId, title, instructorId }
        }
    );
};

export const addQuestion = (quizId, qData, token) => {
    return axios.post(
        `${API_BASE_URL}/api/instructor/quizzes/${quizId}/questions`,
        null,
        {
            ...getHeaders(token),
            params: {
                questionText: qData.text,
                optionA: qData.optionA,
                optionB: qData.optionB,
                optionC: qData.optionC,
                optionD: qData.optionD,
                correctOption: qData.correctAnswer,
                marks: 5
            }
        }
    );
};

export const deleteQuiz = (quizId, token) =>
    axios.delete(`${API_BASE_URL}/api/instructor/quizzes/${quizId}`, getHeaders(token));

export const deleteQuestion = (questionId, token) =>
    axios.delete(`${API_BASE_URL}/api/instructor/questions/${questionId}`, getHeaders(token));




// ==========================================
//  DEFAULT EXPORT
// ==========================================
const QuizApi = {
    getQuizzesByLesson,
    getInstructorQuizzes, // Export the new function
    submitQuiz,
    createQuiz,
    addQuestion,
    deleteQuiz,
    deleteQuestion,
    getInstructorQuizById,
};

export default QuizApi;