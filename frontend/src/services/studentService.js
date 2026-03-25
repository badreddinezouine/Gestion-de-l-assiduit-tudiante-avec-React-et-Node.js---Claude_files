import api from './api';

export const studentService = {

  // ✅ Récupérer mes notes
  getMyGrades: async () => {
    const res = await api.get('/students/my-grades');
    return res.data.grades;
  },

  // ✅ Récupérer mon calendrier (sessions)
  getMyCalendar: async () => {
    const res = await api.get('/students/my-calendar');
    return res.data.sessions;
  },

  // ✅ Récupérer mes présences/absences
  getMyAttendance: async () => {
    const res = await api.get('/students/my-attendance');
    return res.data.attendance;
  },

};