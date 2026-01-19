import { useEffect, useRef, useCallback } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './useAuth';

export const useWebSocket = (onNotification, onQRGenerated) => {
  const { user } = useAuth();
  const onNotificationRef = useRef(onNotification);
  const onQRGeneratedRef = useRef(onQRGenerated);

  // Mettre à jour les références des callbacks
  useEffect(() => {
    onNotificationRef.current = onNotification;
    onQRGeneratedRef.current = onQRGenerated;
  }, [onNotification, onQRGenerated]);

  // Gérer la connexion WebSocket
  useEffect(() => {
    if (!user?.id) return;

    const socket = socketService.connect(user.id);

    // Écouter les notifications
    socket.on('notification', (notification) => {
      if (onNotificationRef.current) {
        onNotificationRef.current(notification);
      }
    });

    // Écouter les générations de QR
    socket.on('qr_generated', (qrData) => {
      if (onQRGeneratedRef.current) {
        onQRGeneratedRef.current(qrData);
      }
    });

    // Écouter les présences
    socket.on('presence_recorded', (presence) => {
      console.log('Présence enregistrée:', presence);
    });

    // Nettoyage
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Fonction pour émettre un événement
  const emitEvent = useCallback((event, data) => {
    socketService.emit(event, data);
  }, []);

  // Fonction pour générer un QR code via WebSocket
  const generateQR = useCallback((sessionData) => {
    socketService.emit('generate_qr', sessionData);
  }, []);

  return {
    emitEvent,
    generateQR,
    socket: socketService.socket
  };
};