import api from './api';

export const attendanceService = {
  getMyAttendance: async () => {
    try {
      const response = await api.get('/attendance/my-attendance');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCourseAttendance: async (coursId) => {
    try {
      const response = await api.get(`/attendance/course/${coursId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  reportAbsence: async (sessionCoursId, motif, document = null) => {
    try {
      const formData = new FormData();
      formData.append('sessionCoursId', sessionCoursId);
      formData.append('motif', motif);
      if (document) formData.append('document', document);

      const response = await api.post('/attendance/absence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAttendanceStats: async (coursId) => {
    try {
      const response = await api.get(`/attendance/stats/${coursId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};