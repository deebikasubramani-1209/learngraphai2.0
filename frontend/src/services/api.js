import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Health & System
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  // Student Profile & Mastery
  getStudent: async (studentId = 'student-demo-1') => {
    const res = await client.get(`/students/${studentId}`);
    return res.data;
  },

  getMasteryOverview: async (studentId = 'student-demo-1') => {
    const res = await client.get(`/students/${studentId}/mastery`);
    return res.data;
  },

  // Knowledge Graph
  getKnowledgeGraph: async (studentId = 'student-demo-1') => {
    const res = await client.get(`/students/${studentId}/graph`);
    return res.data;
  },

  // Knowledge Decay
  getDecayAnalytics: async (studentId = 'student-demo-1') => {
    const res = await client.get(`/students/${studentId}/decay`);
    return res.data;
  },

  // Explainable Recommendations
  getRecommendations: async (studentId = 'student-demo-1') => {
    const res = await client.get(`/students/${studentId}/recommendations`);
    return res.data;
  },

  // Quiz Engine
  getQuestionsByConcept: async (conceptId) => {
    const res = await client.get(`/questions/${conceptId}`);
    return res.data;
  },

  submitQuiz: async (studentId, conceptId, answers) => {
    const res = await client.post('/quiz/submit', {
      student_id: studentId,
      concept_id: conceptId,
      answers,
    });
    return res.data;
  },

  // Demo Controls
  getDemoStages: async () => {
    const res = await client.get('/demo/stages');
    return res.data;
  },

  setDemoStage: async (stage) => {
    const res = await client.post('/demo/set-stage', { stage });
    return res.data;
  },

  simulateGap: async (studentId = 'student-demo-1', conceptId = 'concept-recursion', days = 21) => {
    const res = await client.post(`/demo/simulate-gap?student_id=${studentId}&concept_id=${conceptId}&days=${days}`);
    return res.data;
  },
};
