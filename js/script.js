/**
 * PassBear Password Generator - Final Optimized Logic
 */

import { generateSlug } from 'random-word-slugs';

// --- 1. CONSTANTS ---
const SPECIALS = '!@#%)_';

// Optimized for memorable, easy-to-type visual words
const CATEGORIES = {
    adjective: ['color', 'size', 'condition', 'appearance'],
    noun: ['animals', 'food', 'thing', 'people']
};

// --- 2. SECURE RANDOM HELPERS ---
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

// --- 3. CORE GENERATION LOGIC ---
const generatePassword = () => {
    const minLength = parseInt(document.getElementById('password-length').value, 10);
    const maxLength = parseInt(document.getElementById('password-max-length').value, 10);
    const includeNumbers = document.getElementById('numbers-option').checked;
    const includeSpecialChars = document.getElementById('specialchars-option').checked;
    const capitalize = document.getElementById('capitalize-option').checked;
    const useDashes = document.getElementById('dash-option').checked;

    let password = "";
    const formatType = capitalize ? 'title' : 'lowercase';

    const getSuffix = () => {
        const num = includeNumbers ? String(10 + cryptoRandomInt(90)) : '';
        const spec = includeSpecialChars ? getRandomElementSecure(SPECIALS) : '';
        return num + spec;
    };

    // Main attempt loop: Tries 100 times to fit 2 words + suffix into your length limits
    for (let attempts = 0; attempts < 100; attempts++) {
        const suffix = getSuffix();
        let slugParts = generateSlug(2, { format: formatType, categories: CATEGORIES });
        if (!capitalize) slugParts = slugParts.toLowerCase();

        const slug = useDashes ? slugParts.replace(/ /g, '-') : slugParts.replace(/ /g, '');
        const candidate = slug + suffix;

        if (candidate.length >= minLength && candidate.length <= maxLength) {
            password = candidate;
            break; 
        }
    }

    // Waterproof Fallback: If 100 tries failed, force 2 words and trim only if strictly necessary
    if (!password) {
        const suffix = getSuffix();
        let fallbackSlug = generateSlug(2, { format: formatType, categories: CATEGORIES });
        if (!capitalize) fallbackSlug = fallbackSlug.toLowerCase();
        
        let slug = useDashes ? fallbackSlug.replace(/ /g, '-') : fallbackSlug.replace(/ /g, '');
        let candidate = slug + suffix;
        
        password = candidate.length > maxLength ? candidate.substring(0, maxLength) : candidate;
    }

    return { password, passwordLength: password.length };
};

// --- 4. UI & EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-password');
    const passwordInput = document.getElementById('generated-password');
    const actualLengthDisplay = document.getElementById('generated-password-length');
    const copyBtn = document.getElementById('copy-to-clipboard');
    const minSlider = document.getElementById('password-length');
    const minLabel = document.getElementById('password-length-value');
    const maxSlider = document.getElementById('password-max-length');
    const maxLabel = document.getElementById('password-max-length-value');
    const saveCheck = document.getElementById('save-settings-option');

    let copyTimer; // Prevents the copy button from getting stuck

    const controls = [
        minSlider, maxSlider, saveCheck,
        document.getElementById('numbers-option'),
        document.getElementById('specialchars-option'),
        document.getElementById('capitalize-option'),
        document.getElementById('dash-option')
    ];

    // Persistence Logic
    const loadSavedData = () => {
        if (localStorage.getItem('pb_save_enabled') === 'true') {
            saveCheck.checked = true;
            if (localStorage.getItem('pb_min')) minSlider.value = localStorage.getItem('pb_min');
            if (localStorage.getItem('pb_max')) maxSlider.value = localStorage.getItem('pb_max');
            document.getElementById('numbers-option').checked = localStorage.getItem('pb_num') === 'true';
            document.getElementById('specialchars-option').checked = localStorage.getItem('pb_spec') === 'true';
            document.getElementById('capitalize-option').checked = localStorage.getItem('pb_cap') === 'true';
            document.getElementById('dash-option').checked = localStorage.getItem('pb_dash') === 'true';
        }
        minLabel.textContent = minSlider.value;
        maxLabel.textContent = maxSlider.value;
    };

    const handlePersistence = () => {
        if (saveCheck.checked) {
            localStorage.setItem('pb_save_enabled', 'true');
            localStorage.setItem('pb_min', minSlider.value);
            localStorage.setItem('pb_max', maxSlider.value);
            localStorage.setItem('pb_num', document.getElementById('numbers-option').checked);
            localStorage.setItem('pb_spec', document.getElementById('specialchars-option').checked);
            localStorage.setItem('pb_cap', document.getElementById('capitalize-option').checked);
            localStorage.setItem('pb_dash', document.getElementById('dash-option').checked);
        } else {
            localStorage.clear();
        }
    };

    // Manual Edit Listener
    passwordInput.addEventListener('input', () => {
        actualLengthDisplay.textContent = passwordInput.value.length;
    });

    // Control Listeners
    controls.forEach(el => el.addEventListener('change', handlePersistence));

    minSlider.addEventListener('input', (e) => {
        if (parseInt(e.target.value) > parseInt(maxSlider.value)) {
            maxSlider.value = e.target.value;
            maxLabel.textContent = e.target.value;
        }
        minLabel.textContent = e.target.value;
        handlePersistence();
    });

    maxSlider.addEventListener('input', (e) => {
        if (parseInt(e.target.value) < parseInt(minSlider.value)) {
            minSlider.value = e.target.value;
            minLabel.textContent = e.target.value;
        }
        maxLabel.textContent = e.target.value;
        handlePersistence();
    });

    generateBtn.addEventListener('click', () => {
        const { password, passwordLength } = generatePassword();
        passwordInput.value = password;
        actualLengthDisplay.textContent = passwordLength;
    });

    // Robust Copy Listener (3 second clear)
    copyBtn.addEventListener('click', () => {
        if (!passwordInput.value) return;

        // Clear existing timer to prevent flickering or sticking
        clearTimeout(copyTimer);
        const originalContent = 'Copy to Clipboard';

        navigator.clipboard.writeText(passwordInput.value).then(() => {
            copyBtn.textContent = 'Copied!';
            
            // Revert back after 3 seconds
            copyTimer = setTimeout(() => {
                copyBtn.textContent = originalContent;
            }, 2000);
        });
    });

    loadSavedData();
    generateBtn.click(); 
});