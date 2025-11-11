import { adjectives } from './adjectives.js';
import { nouns } from './nouns.js';

// Kryptografiskt säker heltal i [0, maxExclusive)
function cryptoRandomInt(maxExclusive) {
  if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) {
    throw new Error('cryptoRandomInt: maxExclusive måste vara > 0');
  }
  const a = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive; // rejection sampling
  let r;
  do {
    crypto.getRandomValues(a);
    r = a[0];
  } while (r >= limit);
  return r % maxExclusive;
}

// Välj säkert ett element ur array eller sträng
function getRandomElementSecure(items) {
  const len = items.length;
  if (len === 0) return ''; // eller throw new Error('Empty collection')
  const idx = cryptoRandomInt(len);
  return items[idx];
}

const generatePassword = () => {
  const includeNumbers = document.getElementById('numbers-option').checked;
  const includeSpecialChars = document.getElementById('specialchars-option').checked;

  // Slumpa adjektiv + substantiv säkert
  const adjective = getRandomElementSecure(adjectives);
  const noun = getRandomElementSecure(nouns);

  // Tvåsiffrig siffersvans 10–99 med säker RNG
  const randomNumber = includeNumbers ? String(10 + cryptoRandomInt(90)) : '';

  // Specialtecken säkert
  const specials = '!@#%&()_+';
  const randomSpecialChar = includeSpecialChars ? getRandomElementSecure(specials) : '';

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
  document.body.classList.toggle('dark-mode', !isDarkModeEnabled);
  if (!isDarkModeEnabled) localStorage.setItem('darkMode', 'enabled');
  else localStorage.removeItem('darkMode');
};

// DOM elements
const generateBtn = document.getElementById('generate-password');
const generatedPasswordInput = document.getElementById('generated-password');
const passwordLengthElement = document.getElementById('generated-password-length');
const copyBtn = document.getElementById('copy-to-clipboard');
// (Slider/Value är inte använda här – lämnas kvar om du behöver dem)
const passwordLengthSlider = document.getElementById('password-length');
const passwordLengthValue = document.getElementById('password-length-value');

// Event listeners
generateBtn.addEventListener('click', () => {
  const { password, passwordLength } = generatePassword();
  generatedPasswordInput.value = password;
  passwordLengthElement.textContent = passwordLength;

  // Flytta markören till slutet så man kan börja editera direkt
  requestAnimationFrame(() => {
    const len = generatedPasswordInput.value.length;
    generatedPasswordInput.focus();
    generatedPasswordInput.setSelectionRange(len, len);
  });
});

generatedPasswordInput.addEventListener('input', () => {
  passwordLengthElement.textContent = generatedPasswordInput.value.length;
});

copyBtn.addEventListener('click', () => {
  const password = generatedPasswordInput.value;
  if (!password || password.trim() === '') {
    const errorAlert = document.createElement('div');
    errorAlert.classList.add('alert', 'alert-danger', 'my-3');
    errorAlert.textContent = 'Please generate a password before copying!';
    copyBtn.parentElement.insertBefore(errorAlert, copyBtn.nextSibling);
    setTimeout(() => errorAlert.remove(), 3000);
  } else {
    navigator.clipboard.writeText(password)
      .then(showSuccessMessage)
      .catch(err => console.error('Failed to copy password:', err));
  }
});

// Dark mode init
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
}
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
