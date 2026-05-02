/**
 * PassBear Password Generator Logic
 * 
 * Features:
 * - Cryptographically secure random number generation.
 * - "Perfect Fit" word scanning (whole words only).
 * - LocalStorage persistence for user settings.
 * - Dynamic UI syncing for Min/Max sliders.
 */

import { generateSlug } from 'random-word-slugs';

/**
 * 1. SECURE RANDOM HELPERS
 * Uses Web Crypto API to ensure numbers are not predictable.
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
 * Finds whole-word combinations that fit specifically within the user's length range.
 */
const generatePassword = () => {
    // Current Input States
    const minLength = parseInt(document.getElementById('password-length').value);
    const maxLength = parseInt(document.getElementById('password-max-length').value);
    const includeNumbers = document.getElementById('numbers-option').checked;
    const includeSpecialChars = document.getElementById('specialchars-option').checked;

    const specials = '!@#%&()_+';
    const allowedCategories = {
    adjective: ['color', 'appearance', 'shapes'],
    noun: ['animals', 'instruments', 'food', 'sports', 'transportation']
    };

    let password = "";
    let attempts = 0;

    // Scan for a combination that fits the "Perfect Fit" criteria
    while (attempts < 50) {
        attempts++;
        
        // Generate Suffix (Numbers and/or Special Characters)
        const randomNumber = includeNumbers ? String(10 + cryptoRandomInt(90)) : '';
        const randomSpecialChar = includeSpecialChars ? getRandomElementSecure(specials) : '';
        const suffix = randomNumber + randomSpecialChar;

        // Try 2-word slug first
        let slug = generateSlug(2, { format: 'none', categories: allowedCategories }).replace(/ /g, '');
        let candidate = slug + suffix;

        // If 2 words are too long, fall back to 1 word
        if (candidate.length > maxLength) {
            slug = generateSlug(1, { format: 'none', categories: allowedCategories }).replace(/ /g, '');
            candidate = slug + suffix;
        }

        // Validate if candidate sits perfectly within the slider range
        if (candidate.length >= minLength && candidate.length <= maxLength) {
            password = candidate;
            break; 
        }
    }

    // Safety Fallback: Ensures a password is produced even if scan fails
    if (!password) {
        const slug = generateSlug(1, { format: 'none', categories: allowedCategories }).replace(/ /g, '');
        const suffix = (includeNumbers ? "99" : "") + (includeSpecialChars ? "!" : "");
        password = (slug + suffix).substring(0, maxLength);
    }

    return { password, passwordLength: password.length };
};

/**
 * 3. UI, EVENT LISTENERS & PERSISTENCE
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
    const saveCheck = document.getElementById('save-settings-option');

    /**
     * LOAD LOGIC
     * Retrieves settings from LocalStorage if "Save Settings" is enabled.
     */
    const loadSavedData = () => {
        const isSaveEnabled = localStorage.getItem('pb_save_enabled') === 'true';
        
        if (isSaveEnabled) {
            saveCheck.checked = true;
            if (localStorage.getItem('pb_min')) minSlider.value = localStorage.getItem('pb_min');
            if (localStorage.getItem('pb_max')) maxSlider.value = localStorage.getItem('pb_max');
            if (localStorage.getItem('pb_num')) numCheck.checked = localStorage.getItem('pb_num') === 'true';
            if (localStorage.getItem('pb_spec')) specCheck.checked = localStorage.getItem('pb_spec') === 'true';
        } else {
            // Default Factory State (Strict Reset)
            minSlider.value = 12;
            maxSlider.value = 20;
            numCheck.checked = true;
            specCheck.checked = true; 
            saveCheck.checked = false;
        }
        
        // Sync Visual Labels
        minLabel.textContent = minSlider.value;
        maxLabel.textContent = maxSlider.value;
    };

    /**
     * SAVE LOGIC
     * Commits settings to LocalStorage or wipes them based on checkbox state.
     */
    const handlePersistence = () => {
        if (saveCheck.checked) {
            localStorage.setItem('pb_save_enabled', 'true');
            localStorage.setItem('pb_min', minSlider.value);
            localStorage.setItem('pb_max', maxSlider.value);
            localStorage.setItem('pb_num', numCheck.checked);
            localStorage.setItem('pb_spec', specCheck.checked);
        } else {
            // Clean up LocalStorage if user opts out
            localStorage.clear();
        }
    };

    // --- EVENT LISTENERS ---

    // Trigger persistence whenever an option is changed
    [minSlider, maxSlider, numCheck, specCheck, saveCheck].forEach(el => {
        el.addEventListener('change', handlePersistence);
    });

    // Min Slider Sync: Ensures Min <= Max
    minSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val > parseInt(maxSlider.value)) {
            maxSlider.value = val;
            maxLabel.textContent = val;
        }
        minLabel.textContent = val;
        handlePersistence();
    });

    // Max Slider Sync: Ensures Max >= Min
    maxSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val < parseInt(minSlider.value)) {
            minSlider.value = val;
            minLabel.textContent = val;
        }
        maxLabel.textContent = val;
        handlePersistence();
    });

    // Password Generation Action
    generateBtn.addEventListener('click', () => {
        const { password, passwordLength } = generatePassword();
        passwordInput.value = password;
        actualLengthDisplay.textContent = passwordLength;
    });

    // Copy to Clipboard Action
    copyBtn.addEventListener('click', () => {
        if (passwordInput.value) {
            navigator.clipboard.writeText(passwordInput.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = originalText, 2000);
            });
        }
    });

    // --- INITIALIZATION ---
    loadSavedData();
    generateBtn.click(); // Generate first password on load
});