// ─────────────────────────────────────────────
// CONFIGURATION
// Paste your deployed Apps Script Web App URL here:
// ─────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygyXRLkM55lFRdaR2icpyStxLiLIB6ygkklFXpYIb9mjbvDITtP9vhjBaF_X-UiMyE/exec';

// ── Phone auto-formatter ──
document.getElementById('phone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '');
  if (v.length <= 10) {
    this.value = v
      .replace(/^(\d{3})(\d)/, '($1) $2')
      .replace(/(\(\d{3}\) \d{3})(\d)/, '$1-$2');
  }
});

// ── Auto-prepend @ for social handles ──
['instagram', 'tiktok'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('blur', () => {
    if (el.value && !el.value.startsWith('@')) el.value = '@' + el.value;
  });
});

// ── Show toast helper ──
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
}

// ── Form submission → Google Sheet ──
document.getElementById('userForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const instagram = document.getElementById('instagram').value.trim();
  const tiktok    = document.getElementById('tiktok').value.trim();
  const gender    = document.querySelector('input[name="gender"]:checked')?.value || '';
  const bornAgain = document.getElementById('bornAgain').checked ? 'Yes' : 'No';

  // Basic validation
  if (!firstName || !lastName || !phone) {
    showToast('⚠️ Please fill in your name and phone number.', 'error');
    return;
  }

  const submitBtn = document.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';
  submitBtn.classList.add('loading');

  const payload = { firstName, lastName, phone, instagram, tiktok, gender, bornAgain };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      // no-cors avoids CORS preflight; response is opaque but data still reaches Apps Script
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });

    // With no-cors we can't read the response, so we optimistically treat a resolved fetch as success
    this.querySelectorAll('input').forEach(el => el.disabled = true);
    submitBtn.textContent = '✓ Submitted!';
    submitBtn.classList.add('submitted');
    showToast('Your info has been saved to our records.', 'success');
  } catch (err) {
    console.error('Submission error:', err);
    showToast('❌ Something went wrong. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit →';
  }
});