/**
 * PassBear Password Generator - Restored & Enhanced Logic
 */

import { generateSlug } from 'random-word-slugs';

// --- 1. CONSTANTS ---
const SPECIALS = '!@#%)_';

const CATEGORIES = {
    adjective: [
        'color', 'size', 'condition', 'appearance', 'shapes',
        'personality', 'quantity', 'time'
    ],
    noun: [
        'animals', 'food', 'transportation',
        'thing', 'instruments'
    ]
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

    // Attempt up to 100 times to meet length constraints
    for (let attempts = 0; attempts < 100; attempts++) {
        const suffix = getSuffix();
        let slugParts = generateSlug(2, {
            format: formatType,
            categories: CATEGORIES
        });

        if (!capitalize) slugParts = slugParts.toLowerCase();

        const slug = useDashes ? slugParts.replace(/ /g, '-') : slugParts.replace(/ /g, '');
        const candidate = slug + suffix;

        if (candidate.length >= minLength && candidate.length <= maxLength) {
            password = candidate;
            break;
        }
    }

    // Fallback: If constraints aren't met, generate anyway and trim if needed
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

    let copyTimer;

    const controls = [
        minSlider, maxSlider, saveCheck,
        document.getElementById('numbers-option'),
        document.getElementById('specialchars-option'),
        document.getElementById('capitalize-option'),
        document.getElementById('dash-option')
    ];

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

    // Update character count on manual input
    passwordInput.addEventListener('input', () => {
        actualLengthDisplay.textContent = passwordInput.value.length;
    });

    controls.forEach(el => el.addEventListener('change', handlePersistence));

    // Sync Sliders
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

    // Generate Action
    generateBtn.addEventListener('click', () => {
        const { password, passwordLength } = generatePassword();
        passwordInput.value = password;
        actualLengthDisplay.textContent = passwordLength;
    });

    // Copy Action
    copyBtn.addEventListener('click', () => {
        if (!passwordInput.value) return;
        clearTimeout(copyTimer);
        const originalContent = 'Copy to Clipboard';
        
        navigator.clipboard.writeText(passwordInput.value).then(() => {
            copyBtn.textContent = 'Copied!';
            copyTimer = setTimeout(() => {
                copyBtn.textContent = originalContent;
            }, 2000);
        });
    });

    loadSavedData();
    generateBtn.click();
});