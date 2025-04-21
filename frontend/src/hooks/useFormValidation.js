import { useState } from 'react';

export const useFormValidation = (validationRules) => {
  const [errors, setErrors] = useState({});

  const validate = (formData) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = formData[field];

      // Required field validation
      if (rules.required && (!value || value.trim() === '')) {
        newErrors[field] = 'Ce champ est requis';
        isValid = false;
      }

      // Min length validation
      if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `Doit contenir au moins ${rules.minLength} caractères`;
        isValid = false;
      }

      // Pattern validation (e.g., email)
      if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || 'Format invalide';
        isValid = false;
      }

      // Match validation (e.g., password confirmation)
      if (rules.match && formData[rules.match] !== value) {
        newErrors[field] = rules.message || 'Les valeurs ne correspondent pas';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return { errors, validate, clearErrors };
};

export default useFormValidation;