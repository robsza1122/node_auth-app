export function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export const validatePassword = (value) => {
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,25}$/;
  if (!passwordPattern.test(value)) {
    return 'Password should have from 8 to 25 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
  }
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

export const validateUserName = (value) => {
  const usernamePattern = /^[a-zA-Z0-9_.]+$/;
  if (!usernamePattern.test(value)) {
    return 'Username can use only letters, numbers, underscores and periods'
  }
  if (!value) {
    return 'Username is required'
  }

  if (value.length < 6) {
    return 'Username should have at least 6 characters'
  }



}
