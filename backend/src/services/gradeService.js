import api from './api';

export const gradeService = {

  // ✅ Récupérer toutes les notes du professeur
  getMyGrades: async () => {
    const res = await api.get('/grades/my');
    return res.data.grades;
  },

  // ✅ Créer une nouvelle évaluation
  createGrade: async (data) => {
    const res = await api.post('/grades', data);
    return res.data.grade;
  },

  // ✅ Supprimer une évaluation
  deleteGrade: async (gradeId) => {
    await api.delete(`/grades/${gradeId}`);
  },

  // ✅ Récupérer les étudiants inscrits à un cours
  getStudentsForCourse: async (courseId) => {
    const res = await api.get(`/grades/students-for-course/${courseId}`);
    return res.data.students;
  },

};