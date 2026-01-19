export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('fr-FR', options);
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'PRESENT':
    case 'APPROUVE':
    case 'ACTIF':
      return 'success';
    case 'RETARD':
    case 'EN_ATTENTE':
      return 'warning';
    case 'ABSENT':
    case 'REJETE':
    case 'INACTIF':
      return 'error';
    default:
      return 'default';
  }
};

export const getAdaptationScore = (note) => {
  const scores = {
    'A+': 4.0, 'A': 3.7,
    'B+': 3.3, 'B': 3.0,
    'C+': 2.7, 'C': 2.3, 'C-': 2.0
  };
  return scores[note] || 0;
};