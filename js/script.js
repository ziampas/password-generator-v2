import { adjectives } from './adjectives.js';
import { nouns } from './nouns.js';

// Utility function to get a random element from an array or string
const getRandomElement = (items) => items[Math.floor(Math.random() * items.length)];

const generatePassword = () => {
  const includeNumbers = document.getElementById("numbers-option").checked;
  const includeSpecialChars = document.getElementById("specialchars-option").checked;

  // Initialize the characters pool
  let characters = '';
  if (includeNumbers) characters += '0123456789';
  if (includeSpecialChars) characters += '!@#%&/()_+';

  // Select random adjective and noun
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);

  // Random components: number and special character (if options are selected)
  const randomNumber = includeNumbers ? Math.floor(Math.random() * 90) + 10 : '';
  const randomSpecialChar = includeSpecialChars ? getRandomElement('!@#%&/()_+') : '';

  // Combine parts to create the password
  const password = adjective + noun + randomNumber + randomSpecialChar;

  return { password, passwordLength: password.length };
};

const showSuccessMessage = () => {
  const successAlert = document.createElement('div');
  successAlert.classList.add('alert', 'alert-success', 'my-3');
  successAlert.textContent = 'Password has been copied!';

  copyBtn.parentElement.insertBefore(successAlert, copyBtn.nextSibling);

  setTimeout(() => successAlert.remove(), 3000);
};

const toggleDarkMode = () => {
  const isDarkModeEnabled = document.body.classList.contains('dark-mode');
  // Toggle dark mode and update localStorage accordingly
  document.body.classList.toggle('dark-mode', !isDarkModeEnabled);

  if (!isDarkModeEnabled) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.removeItem('darkMode');
  }
};

// DOM elements
const generateBtn = document.getElementById('generate-password');
const generatedPasswordInput = document.getElementById('generated-password');
const passwordLengthElement = document.getElementById('generated-password-length');
const copyBtn = document.getElementById('copy-to-clipboard');
const passwordLengthSlider = document.getElementById('password-length');
const passwordLengthValue = document.getElementById('password-length-value');

// Event listeners
generateBtn.addEventListener('click', () => {
  const { password, passwordLength } = generatePassword();
  generatedPasswordInput.value = password;
  passwordLengthElement.textContent = passwordLength;
});

generatedPasswordInput.addEventListener('input', () => {
  passwordLengthElement.textContent = generatedPasswordInput.value.length;
});

copyBtn.addEventListener('click', () => {
  const password = generatedPasswordInput.value;

  if (!password || password.trim() === '') {
    // Display an error message if no password is generated
    const errorAlert = document.createElement('div');
    errorAlert.classList.add('alert', 'alert-danger', 'my-3');
    errorAlert.textContent = 'Please generate a password before copying!';

    copyBtn.parentElement.insertBefore(errorAlert, copyBtn.nextSibling);

    // Remove the error message after 3 seconds
    setTimeout(() => errorAlert.remove(), 3000);
  } else {
    // Use the modern Clipboard API for better security and functionality
    navigator.clipboard.writeText(password)
      .then(() => {
        showSuccessMessage();
      })
      .catch(err => {
        console.error('Failed to copy password:', err);
      });
  }
});


// Dark mode initialization
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
