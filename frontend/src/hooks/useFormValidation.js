import { useState, useCallback } from 'react';

export const useFormValidation = (validationRules) => {
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(true);

    const validate = useCallback((data) => {
        const newErrors = {};
        let valid = true;

        Object.keys(validationRules).forEach(field => {
            const value = data[field];
            const rules = validationRules[field];

            if (rules.required && !value) {
                newErrors[field] = 'Ce champ est obligatoire';
                valid = false;
            } else if (rules.pattern && !rules.pattern.test(value)) {
                newErrors[field] = rules.message || 'Format invalide';
                valid = false;
            } else if (rules.minLength && value.length < rules.minLength) {
                newErrors[field] = `Minimum ${rules.minLength} caractères requis`;
                valid = false;
            } else if (rules.match && value !== data[rules.match]) {
                newErrors[field] = rules.message || 'Les valeurs ne correspondent pas';
                valid = false;
            } else if (rules.custom && !rules.custom(value)) {
                newErrors[field] = rules.message || 'Valeur invalide';
                valid = false;
            }
        });

        setErrors(newErrors);
        setIsValid(valid);
        return valid;
    }, [validationRules]);

    return {
        errors,
        isValid,
        validate,
        clearErrors: () => setErrors({}),
        setFieldError: (field, error) => setErrors(prev => ({ ...prev, [field]: error }))
    };
};