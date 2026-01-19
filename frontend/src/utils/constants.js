export const USER_ROLES = {
  PROFESSEUR: 'PROFESSEUR',
  ETUDIANT: 'ETUDIANT',
  ADMIN: 'ADMIN'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  RETARD: 'RETARD',
  ABSENT: 'ABSENT'
};

export const ADAPTATION_GRADES = {
  'A+': { value: 4.0, label: 'A+ (Excellent)' },
  'A': { value: 3.7, label: 'A (Très bon)' },
  'B+': { value: 3.3, label: 'B+ (Bon)' },
  'B': { value: 3.0, label: 'B (Assez bon)' },
  'C+': { value: 2.7, label: 'C+ (Passable)' },
  'C': { value: 2.3, label: 'C (Faible)' },
  'C-': { value: 2.0, label: 'C- (Très faible)' }
};

export const DECISION_TYPES = {
  RATTRAPAGE: { color: 'success', label: 'Rattrapage' },
  REFUS: { color: 'error', label: 'Refus' },
  REVUE_MANUELLE: { color: 'warning', label: 'Revue manuelle' },
  ALERTE: { color: 'info', label: 'Alerte' },
  CONSEIL: { color: 'primary', label: 'Conseil' }
};

export const COURSE_TYPES = {
  COURS: 'Cours magistral',
  TD: 'Travaux dirigés',
  TP: 'Travaux pratiques',
  EXAMEN: 'Examen'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile'
  },
  QR: {
    GENERATE: '/qr/generate',
    SCAN: '/qr/scan'
  },
  ATTENDANCE: {
    MY_ATTENDANCE: '/attendance/my-attendance',
    COURSE_ATTENDANCE: '/attendance/course'
  },
  CHATBOT: {
    ANALYZE: '/chatbot/analyze',
    HISTORY: '/chatbot/history'
  }
};