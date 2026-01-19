import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  connect(userId) {
    this.userId = userId;
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    
    this.socket.on('connect', () => {
      console.log('Connecté au serveur WebSocket');
      this.joinUserRoom();
    });

    this.socket.on('disconnect', () => {
      console.log('Déconnecté du serveur WebSocket');
    });

    return this.socket;
  }

  joinUserRoom() {
    if (this.socket && this.userId) {
      this.socket.emit('join', this.userId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();