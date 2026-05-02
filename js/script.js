/**
 * PassBear Password Generator Logic
 */

import { generateSlug } from 'random-word-slugs';

/**
 * 1. SECURE RANDOM HELPERS
 */
function cryptoRandomInt(maxExclusive) {
    const a = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    let r;
    do {
        window.crypto.getRandomValues(a);
        r = a[0];
    } while (r >= limit);
    return r % maxExclusive;
}

function getRandomElementSecure(items) {
    return items[cryptoRandomInt(items.length)];
}

/**
 * 2. CORE GENERATION LOGIC
 */
const generatePassword = () => {
    const minLength = parseInt(document.getElementById('password-length').value);
    const maxLength = parseInt(document.getElementById('password-max-length').value);
    const includeNumbers = document.getElementById('numbers-option').checked;
    const includeSpecialChars = document.getElementById('specialchars-option').checked;
    const capitalize = document.getElementById('capitalize-option').checked;
    const useDashes = document.getElementById('dash-option').checked;

    const specials = '!@#%&';
    const allowedCategories = {
        adjective: ['color', 'appearance', 'shapes'],
        noun: ['animals', 'instruments', 'food', 'sports', 'transportation']
    };

    let password = "";
    let attempts = 0;
    const formatType = capitalize ? 'title' : 'lowercase';

    while (attempts < 50) {
        attempts++;
        const randomNumber = includeNumbers ? String(10 + cryptoRandomInt(90)) : '';
        const randomSpecialChar = includeSpecialChars ? getRandomElementSecure(specials) : '';
        const suffix = randomNumber + randomSpecialChar;

        let slugParts = generateSlug(2, { format: formatType, categories: allowedCategories });
        
        if (!capitalize) {
            slugParts = slugParts.toLowerCase();
        }

        let slug = useDashes ? slugParts.replace(/ /g, '-') : slugParts.replace(/ /g, '');
        let candidate = slug + suffix;

        if (candidate.length > maxLength) {
            slugParts = generateSlug(1, { format: formatType, categories: allowedCategories });
            if (!capitalize) slugParts = slugParts.toLowerCase();
            slug = slugParts;
            candidate = slug + suffix;
        }

        if (candidate.length >= minLength && candidate.length <= maxLength) {
            password = candidate;
            break; 
        }
    }

    if (!password) {
        let fallbackSlug = generateSlug(1, { format: formatType });
        if (!capitalize) fallbackSlug = fallbackSlug.toLowerCase();
        const suffix = (includeNumbers ? "99" : "") + (includeSpecialChars ? "!" : "");
        password = (fallbackSlug + suffix).substring(0, maxLength);
    }

    return { password, passwordLength: password.length };
};

/**
 * 3. UI & EVENT LISTENERS
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM SELECTORS ---
    const generateBtn = document.getElementById('generate-password');
    const passwordInput = document.getElementById('generated-password');
    const actualLengthDisplay = document.getElementById('generated-password-length');
    const copyBtn = document.getElementById('copy-to-clipboard');

    const minSlider = document.getElementById('password-length');
    const minLabel = document.getElementById('password-length-value');
    const maxSlider = document.getElementById('password-max-length');
    const maxLabel = document.getElementById('password-max-length-value');
    
    const numCheck = document.getElementById('numbers-option');
    const specCheck = document.getElementById('specialchars-option');
    const capCheck = document.getElementById('capitalize-option');
    const dashCheck = document.getElementById('dash-option');
    const saveCheck = document.getElementById('save-settings-option');

    // --- NYTT: Live-uppdatering av längd när man skriver själv ---
    passwordInput.addEventListener('input', () => {
        actualLengthDisplay.textContent = passwordInput.value.length;
    });

    // --- PERSISTENCE LOGIC ---
    const loadSavedData = () => {
        const isSaveEnabled = localStorage.getItem('pb_save_enabled') === 'true';
        
        if (isSaveEnabled) {
            saveCheck.checked = true;
            if (localStorage.getItem('pb_min')) minSlider.value = localStorage.getItem('pb_min');
            if (localStorage.getItem('pb_max')) maxSlider.value = localStorage.getItem('pb_max');
            if (localStorage.getItem('pb_num')) numCheck.checked = localStorage.getItem('pb_num') === 'true';
            if (localStorage.getItem('pb_spec')) specCheck.checked = localStorage.getItem('pb_spec') === 'true';
            if (localStorage.getItem('pb_cap')) capCheck.checked = localStorage.getItem('pb_cap') === 'true';
            if (localStorage.getItem('pb_dash')) dashCheck.checked = localStorage.getItem('pb_dash') === 'true';
        } else {
            minSlider.value = 12;
            maxSlider.value = 20;
            numCheck.checked = true;
            specCheck.checked = true; 
            capCheck.checked = true;
            dashCheck.checked = false;
            saveCheck.checked = false;
        }
        minLabel.textContent = minSlider.value;
        maxLabel.textContent = maxSlider.value;
    };

    const handlePersistence = () => {
        if (saveCheck.checked) {
            localStorage.setItem('pb_save_enabled', 'true');
            localStorage.setItem('pb_min', minSlider.value);
            localStorage.setItem('pb_max', maxSlider.value);
            localStorage.setItem('pb_num', numCheck.checked);
            localStorage.setItem('pb_spec', specCheck.checked);
            localStorage.setItem('pb_cap', capCheck.checked);
            localStorage.setItem('pb_dash', dashCheck.checked);
        } else {
            localStorage.clear();
        }
    };

    // --- EVENT LISTENERS ---
    [minSlider, maxSlider, numCheck, specCheck, capCheck, dashCheck, saveCheck].forEach(el => {
        el.addEventListener('change', handlePersistence);
    });

    minSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val > parseInt(maxSlider.value)) {
            maxSlider.value = val;
            maxLabel.textContent = val;
        }
        minLabel.textContent = val;
        handlePersistence();
    });

    maxSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val < parseInt(minSlider.value)) {
            minSlider.value = val;
            minLabel.textContent = val;
        }
        maxLabel.textContent = val;
        handlePersistence();
    });

    generateBtn.addEventListener('click', () => {
        const { password, passwordLength } = generatePassword();
        passwordInput.value = password;
        actualLengthDisplay.textContent = passwordLength;
    });

    copyBtn.addEventListener('click', () => {
        if (passwordInput.value) {
            navigator.clipboard.writeText(passwordInput.value).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.innerHTML = originalText, 2000);
            });
        }
    });

    loadSavedData();
    generateBtn.click();
});