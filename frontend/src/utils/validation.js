export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateNumber = (value, min = 0, max = 100) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateDate = (date) => {
  return !isNaN(Date.parse(date));
};

export const getFieldError = (field, value, rules = {}) => {
  if (rules.required && !validateRequired(value)) {
    return 'Ce champ est requis';
  }
  
  if (field === 'email' && !validateEmail(value)) {
    return 'Email invalide';
  }
  
  if (field === 'motDePasse' && !validatePassword(value)) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  
  if (field === 'telephone' && value && !validatePhone(value)) {
    return 'Numéro de téléphone invalide';
  }
  
  if (rules.min && value.length < rules.min) {
    return `Minimum ${rules.min} caractères`;
  }
  
  if (rules.max && value.length > rules.max) {
    return `Maximum ${rules.max} caractères`;
  }
  
  return null;
};