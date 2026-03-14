import api from './api';

export const courseService = {

  getMyCourses: async () => {
    const res = await api.get('/courses/my');
    return res.data.courses;
  },

  createCourse: async (data) => {
    const res = await api.post('/courses', data);
    return res.data.course;
  },

  deleteCourse: async (courseId) => {
    await api.delete(`/courses/${courseId}`);
  },

  addSession: async (courseId, sessionData) => {
    const res = await api.post(`/courses/${courseId}/sessions`, sessionData);
    return res.data.session;
  },

  deleteSession: async (courseId, sessionId) => {
    await api.delete(`/courses/${courseId}/sessions/${sessionId}`);
  },

  enrollStudents: async (courseId, studentIds) => {
    const res = await api.put(`/courses/${courseId}/enroll`, { studentIds });
    return res.data.course;
  },

  getAllStudents: async () => {
    const res = await api.get('/courses/students');
    return res.data.students;
  },

  // ✅ Récupérer filières et niveaux disponibles
  getFilieres: async () => {
    const res = await api.get('/courses/filieres');
    return res.data;
  },

  // ✅ Inscrire toute une filière d'un coup
  enrollByFiliere: async (courseId, filiere, niveau = 'Tous') => {
    const res = await api.post(`/courses/${courseId}/enroll-filiere`, {
      filiere,
      niveau,
    });
    return res.data;
  },
};