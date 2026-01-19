import api from './api';

export const qrService = {
  generateQRCode: async (sessionCoursId, dureeValidite) => {
    try {
      const response = await api.post('/qr/generate', {
        sessionCoursId,
        dureeValidite
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  scanQRCode: async (code) => {
    try {
      const response = await api.post('/qr/scan', { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSessionQRCodes: async (sessionCoursId) => {
    try {
      const response = await api.get(`/qr/session/${sessionCoursId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deactivateQRCode: async (qrCodeId) => {
    try {
      const response = await api.put(`/qr/deactivate/${qrCodeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};