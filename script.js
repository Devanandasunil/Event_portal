
// BMI calculator (plain JS) - called from oninput attributes in HTML
function calculateBMI() {
const weightEl = document.getElementById('weight');
const heightEl = document.getElementById('height');
const resultEl = document.getElementById('bmi-result');

const w = parseFloat(weightEl.value) || 0;
const hCm = parseFloat(heightEl.value) || 0;

if (w > 0 && hCm > 0) {
const h = hCm / 100;
const bmi = w / (h * h);
resultEl.textContent = 'BMI: ' + bmi.toFixed(1);
} else {
resultEl.textContent = 'BMI: —';
}
}

/* Form progress tracker
- Tracks a fixed set of important fields (required-ish)
- Updates the <progress id="form-progress"> element
*/
(function setupProgressTracker() {
const progress = document.getElementById('form-progress');

// Fields to track for progress (IDs or a special name 'eventchoice' for radios)
const tracked = ['fullname', 'regno', 'email', 'phone', 'dob', 'dept', 'photo', 'pwd', 'eventchoice'];

// set max appropriately (should match HTML progress max)
if (progress) {
progress.max = tracked.length;
progress.value = 0;
}

function isFieldFilled(idOrName) {
if (idOrName === 'eventchoice') {
const radios = document.getElementsByName('eventchoice');
return Array.from(radios).some(r => r.checked);
}
const el = document.getElementById(idOrName);
if (!el) return false;
if (el.type === 'file') return el.files && el.files.length > 0;
return String(el.value || '').trim() !== '';
}

function updateProgress() {
if (!progress) return;
let filled = 0;
tracked.forEach(k => { if (isFieldFilled(k)) filled++; });
progress.value = filled;
}

// Update on input/change across the form
document.addEventListener('input', updateProgress);
document.addEventListener('change', updateProgress);
// Initialize once
updateProgress();
})();

/* File upload guard: reject `.exe` and non-images if they bypass accept
- File input id assumed to be 'photo'
*/
(function setupFileGuard() {
const photo = document.getElementById('photo');
if (!photo) return;

photo.addEventListener('change', function () {
const file = this.files[0];
if (!file) return;
const name = file.name.toLowerCase();

// Basic extension reject for dangerous executables
const forbidden = ['.exe', '.bat', '.cmd', '.sh'];
if (forbidden.some(ext => name.endsWith(ext))) {
alert('Executable files are not allowed. Please upload an image (png/jpg).');
this.value = ''; // clear
// update progress after clearing
const ev = new Event('change'); document.dispatchEvent(ev);
return;
}

// Optional: check MIME type starts with image/
if (!file.type.startsWith('image/')) {
// allow but warn and clear
alert('Please upload a valid image file (PNG/JPG). The selected file is not an image.');
this.value = '';
const ev = new Event('change'); document.dispatchEvent(ev);
}
});
})();

/* Form-level validation and submit handling
- Uses built-in checkValidity plus custom phone/email checks
- Highlights invalid fields visually and prevents submission if invalid
*/
document.addEventListener('DOMContentLoaded', function () {
const form = document.getElementById('registration-form');
if (!form) return;

// Helper to highlight invalid elements
function highlightInvalid(el) {
el.style.outline = '3px solid #d9534f';
el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Remove highlight on input
form.addEventListener('input', function (ev) {
const t = ev.target;
if (t && t.style) t.style.outline = '';
});

form.addEventListener('submit', function (e) {
// Prevent default for demo; remove e.preventDefault() to actually submit
// but still validate before allowing.
let blocked = false;

// Use HTML5 validation first
if (!form.checkValidity()) {
blocked = true;
}

// Additional custom checks:
const phone = document.getElementById('phone');
if (phone && phone.value.trim() !== '') {
const phoneOk = /^[0-9]{10}$/.test(phone.value.trim());
if (!phoneOk) {
blocked = true;
highlightInvalid(phone);
alert('Phone number must be 10 digits (numbers only).');
}
}

const email = document.getElementById('email');
if (email && email.value.trim() !== '') {
if (!email.checkValidity()) { // let HTML5 type=email do the job
blocked = true;
highlightInvalid(email);
alert('Please enter a valid email address (example: user@example.com).');
}
}

// If blocked, show native invalid highlights and stop
if (blocked) {
e.preventDefault();
// highlight the first invalid element
const firstInvalid = form.querySelector(':invalid');
if (firstInvalid) highlightInvalid(firstInvalid);
// Let browser show built-in messages where possible
return;
}

// All good — demo: prevent actual submit and show success message
e.preventDefault();
// Optionally you can submit with: form.submit(); if server is ready
alert('✅ Registration validated successfully.');
}, false);
});


/* ---------------------------
jQuery Section (EMI calculator)
--------------------------- */
/* Requires: jQuery loaded in HTML before this script */
(function setupEMICalculator($) {
if (typeof $ === 'undefined') return;

function computeEMI(P, rAnnual, nMonths) {
P = Number(P);
rAnnual = Number(rAnnual);
nMonths = Number(nMonths);
if (P <= 0 || rAnnual <= 0 || nMonths <= 0) return 0;
const r = rAnnual / 12 / 100;
const numerator = P * r * Math.pow(1 + r, nMonths);
const denominator = Math.pow(1 + r, nMonths) - 1;
return numerator / denominator;
}

// Update preview on keyup/change (jQuery action #1)
$('#loan-amt, #loan-rate, #loan-tenure').on('keyup change', function () {
const P = parseFloat($('#loan-amt').val()) || 0;
const r = parseFloat($('#loan-rate').val()) || 0;
const n = parseInt($('#loan-tenure').val()) || 0;
const emi = computeEMI(P, r, n);
if (emi > 0) {
$('#emi-result').text('EMI (preview): ' + emi.toFixed(2));
} else {
$('#emi-result').text('EMI: —');
}
});

// Final calculate on button click (jQuery action #2)
$('#emi-calc-btn').on('click', function () {
const P = parseFloat($('#loan-amt').val()) || 0;
const r = parseFloat($('#loan-rate').val()) || 0;
const n = parseInt($('#loan-tenure').val()) || 0;
const emi = computeEMI(P, r, n);
if (emi > 0) {
$('#emi-result').text('EMI: ' + emi.toFixed(2));
} else {
alert('Please enter positive numeric values for Loan Amount, Rate and Tenure.');
}
});

// Optional: helpful quick sample button (if you want)
// $('#sample-emi').on('click', function(){ $('#loan-amt').val(100000); $('#loan-rate').val(7.5); $('#loan-tenure').val(60); $('#emi-calc-btn').click(); });
})(jQuery);


/* ---------------------------
Small UX helpers (optional)
--------------------------- */

// Softly remove any outline highlight on focus out
document.addEventListener('focusout', function (ev) {
if (ev.target && ev.target.style) {
// remove outline after a short delay so the user sees it briefly
setTimeout(() => { ev.target.style.outline = ''; }, 700);
}
});

// Optional: prevent form duplicate submission by disabling submit after success (if actually submitting)
// (Not enabled here since we use demo preventDefault)

/* End of script.js */
