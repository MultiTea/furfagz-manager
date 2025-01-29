// composables/useFormValidation.ts
interface ValidationRule {
    validate: (value: any) => boolean;
    message: string;
  }
  
  export function useFormValidation() {
    const errors = ref<Record<string, string>>({});
  
    const validateField = (
      fieldName: string,
      value: any,
      rules: ValidationRule[]
    ) => {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          errors.value[fieldName] = rule.message;
          return false;
        }
      }
      delete errors.value[fieldName];
      return true;
    };
  
    const validateForm = (
      fields: Record<string, any>,
      validationRules: Record<string, ValidationRule[]>
    ): boolean => {
      let isValid = true;
      errors.value = {};
  
      for (const [fieldName, value] of Object.entries(fields)) {
        const rules = validationRules[fieldName];
        if (rules && !validateField(fieldName, value, rules)) {
          isValid = false;
        }
      }
  
      return isValid;
    };
  
    return {
      errors,
      validateField,
      validateForm
    };
  }