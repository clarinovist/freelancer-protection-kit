// ===== Countdown Timer =====
function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return; // Exit if countdown element doesn't exist (cleaned up in V2)

    // ... (rest of logic unused but safe)
}

// ===== FAQ Accordion =====
function initFAQ() {
    const buttons = document.querySelectorAll('.faq-btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const content = item.querySelector('.faq-content');

            // Toggle current
            const isActive = item.classList.contains('active');

            // Close all others
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Form Handling =====
function initForm() {
    const form = document.getElementById('checkoutForm');

    if (form) {
        // Check if we're on checkout page (has referral field)
        const isCheckoutPage = document.getElementById('referral') !== null;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const referral = isCheckoutPage ? (document.getElementById('referral').value || '') : '';

            // Validate Email
            if (!isValidEmail(email)) {
                showError('email', 'Mohon masukkan alamat email yang valid (contoh: nama@gmail.com)');
                return;
            }
            clearError('email');

            // Validate WhatsApp number
            const cleanWhatsapp = whatsapp.replace(/\D/g, '');
            if (cleanWhatsapp.length < 10) {
                showError('whatsapp', 'Mohon masukkan nomor WhatsApp yang valid (minimal 10 digit)');
                return;
            }
            clearError('whatsapp');

            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }

            // Create order message for WhatsApp
            const productTitle = window.currentPlan === 'cohort' ? 'Cohort Batch 1 (Premium)' : 'Freelancer Protection Kit v2.0';
            const message = `Halo, saya ingin mendaftar ${productTitle}!

Nama: ${name}
Email: ${email}
WhatsApp: ${whatsapp}${referral ? `\nTahu dari: ${referral}` : ''}

Mohon informasi untuk proses pembayaran. Terima kasih!`;

            // Encode message for WhatsApp URL
            const encodedMessage = encodeURIComponent(message);

            // Replace with your Google Sheets Script URL
            const scriptURL = 'https://script.google.com/macros/s/AKfycbZstEKrmQvGm1wOj60luLNmiqAQB02suNARdvthUiQFV79xjORAFuIcmGidkaf1rf0Ag/exec';

            // Replace with your WhatsApp number
            const waNumber = '6285155421080'; // NOMOR WHATSAPP ANDA

            // Save data to sessionStorage for success page
            if (isCheckoutPage) {
                sessionStorage.setItem('checkout_name', name);
                sessionStorage.setItem('checkout_email', email);
                sessionStorage.setItem('checkout_whatsapp', whatsapp);
                if (referral) sessionStorage.setItem('checkout_referral', referral);

                // Save to Google Sheets first
                const formData = new URLSearchParams();
                formData.append('nama', name);
                formData.append('email', email);
                formData.append('whatsapp', whatsapp);
                formData.append('referral', referral);
                // (Lead Magnet logic moved to global initLeadMagnet function)
                fetch(scriptURL, { method: 'POST', body: formData })
                    .then(response => console.log('Lead saved successfully'))
                    .catch(error => console.error('Error saving lead:', error))
                    .finally(() => {
                        // Open WhatsApp in new tab
                        window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');

                        // Redirect to success page with data
                        setTimeout(() => {
                            window.location.href = `success.html?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&whatsapp=${encodeURIComponent(whatsapp)}${referral ? `&referral=${encodeURIComponent(referral)}` : ''}`;
                        }, 500);
                    });
            } else {
                // Legacy behavior for index.html (if form still exists there)
                window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
                alert('Terima kasih! Anda akan diarahkan ke WhatsApp untuk melanjutkan pembelian.');
            }
        });
    }
}

// Helper functions for validation errors
function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('error');

    // Focus on the error field
    if (inputEl) inputEl.focus();
}

function clearError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('error');
}


// ===== Dynamic Checkout (Dual Tier) =====
const PRODUCTS = {
    'kit': {
        title: 'Protection Kit v2.0',
        logo: 'assets/products/freelancer_kit_2d_logo.png',
        price: 'Rp 99.000',
        strike: 'Rp 499.000',
        features: [
            { icon: 'check_circle', text: 'Draft Kontrak Hukum (Legal Contracts)', color: 'text-green-500' },
            { icon: 'check_circle', text: 'Kalkulator Rate Desainer Pro', color: 'text-green-500' },
            { icon: 'check_circle', text: 'Script Negosiasi Klien Sulit', color: 'text-green-500' },
            { icon: 'add_box', text: 'Bonus: Template Invoice Profesional', color: 'text-primary' }
        ]
    },
    'cohort': {
        title: 'Cohort Batch 1 (Premium)',
        logo: 'assets/products/cohort_premium_2d_logo.png',
        price: 'Rp 499.000',
        strike: 'Rp 1.500.000',
        features: [
            { icon: 'check_circle', text: 'Semua Fitur Freelancer Kit (Kontrak, dll)', color: 'text-green-500' },
            { icon: 'videocam', text: '4x Live Mentoring via Zoom', color: 'text-primary' },
            { icon: 'rate_review', text: 'Personal Portfolio Review', color: 'text-green-500' },
            { icon: 'groups', text: 'Accountability Pods & Komunitas VIP', color: 'text-primary' },
            { icon: 'workspace_premium', text: 'Sertifikasi Kompetensi', color: 'text-green-500' }
        ]
    }
};

function initDynamicCheckout() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') === 'cohort' ? 'cohort' : 'kit'; // Default to kit
    const product = PRODUCTS[plan];

    // Update UI elements
    const titleEl = document.getElementById('product-title');
    const logoEl = document.getElementById('product-logo-img');
    const priceEl = document.getElementById('product-price');
    const strikeEl = document.getElementById('product-strike-price');
    const featuresEl = document.getElementById('product-features');

    if (titleEl) titleEl.textContent = product.title;
    if (logoEl) logoEl.src = product.logo;
    if (priceEl) priceEl.textContent = product.price;
    if (strikeEl) strikeEl.textContent = product.strike;

    // Render features
    if (featuresEl) {
        featuresEl.innerHTML = product.features.map(feat => `
            <li class="flex items-start gap-3">
                <span class="material-symbols-outlined ${feat.color} text-xl">${feat.icon}</span>
                <span class="text-sm font-medium">${feat.text}</span>
            </li>
        `).join('');
    }

    // Update hidden input or state for form submission (so WhatsApp msg is correct)
    window.currentPlan = plan;
}

// ===== Sticky Header (Handled by Tailwind in new design) =====
function initStickyHeader() {
    // New design uses 'sticky top-0' in Tailwind classes directly.
    // This function is kept for legacy support if needed, but made safe.
    const nav = document.querySelector('.sticky-nav');
    if (!nav) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const heroHeight = hero.offsetHeight;
    window.addEventListener('scroll', () => {
        if (window.scrollY > heroHeight / 2) {
            nav.classList.add('show');
        } else {
            nav.classList.remove('show');
        }
    });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.problem-card, .solution-card, .testimonial-card, .stat-box, .section-header, .faq-item, .final-card, .animate-fade-up, [class*="bg-surface-dark"], .rounded-xl'
    );

    animatedElements.forEach(el => {
        if (!el.classList.contains('animate-fade-up')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        }
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });
}

// Add animate-in styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ===== Button Hover Effects =====
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn-primary');

    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.style.setProperty('--x', `${x}px`);
            this.style.setProperty('--y', `${y}px`);
        });
    });
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initFAQ();
    initSmoothScroll();
    initForm();
    initScrollAnimations();
    initButtonEffects();
    initStickyHeader();
    initLeadMagnet(); // <-- Initialize Lead Magnet FIRST

    // Wrap dynamic checkout in try-catch to prevent blocking
    try {
        initDynamicCheckout();
    } catch (e) {
        console.warn('Dynamic Checkout Init skipped:', e);
    }

    console.log('Freelancer Protection Kit - Landing Page Loaded');
});

// ===== Lead Magnet (Free Sample) =====
function initLeadMagnet() {
    const leadModal = document.getElementById('leadModal');
    const leadForm = document.getElementById('leadForm');

    // Make functions global so proper onclick works
    window.openLeadModal = function () {
        if (leadModal) leadModal.classList.remove('hidden');
    };

    window.closeLeadModal = function () {
        if (leadModal) leadModal.classList.add('hidden');
    };

    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target == leadModal) {
            window.closeLeadModal();
        }
    });

    if (leadForm) {
        leadForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('leadName').value;
            const email = document.getElementById('leadEmail').value;
            const whatsapp = document.getElementById('leadWhatsapp').value;
            const submitBtn = leadForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            const scriptURL = 'https://script.google.com/macros/s/AKfycbZstEKrmQvGm1wOj60luLNmiqAQB02suNARdvthUiQFV79xjORAFuIcmGidkaf1rf0Ag/exec';

            // UI Elements for Loading
            const leadFormContainer = document.getElementById('leadFormContainer');
            const leadLoading = document.getElementById('leadLoading');
            const loadingStatus = document.getElementById('loadingStatus');

            // 1. Show Loading UI
            if (leadFormContainer && leadLoading) {
                leadFormContainer.classList.add('hidden');
                leadLoading.classList.remove('hidden');
            }

            // 2. Fire Facebook Pixel Lead Event
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Interactive Calculator Access',
                    currency: 'IDR',
                    value: 0
                });
            }

            // 3. Status Message Sequence
            const statuses = [
                'Menyinkronkan data...',
                'Menyiapkan workspace Anda...',
                'Hampir siap! Mengalihkan...'
            ];
            let statusIdx = 0;
            const statusInterval = setInterval(() => {
                statusIdx++;
                if (statusIdx < statuses.length && loadingStatus) {
                    loadingStatus.innerText = statuses[statusIdx];
                }
            }, 1200);

            // 4. Send data to Google Sheets
            const formData = new URLSearchParams();
            formData.append('nama', name);
            formData.append('email', email);
            formData.append('whatsapp', whatsapp);
            formData.append('referral', 'Calculator Lead');
            formData.append('status', 'Free Sample'); // Matches Apps Script CAPI 'Lead' event

            console.log('Submitting lead to spreadsheet...', Object.fromEntries(formData));

            fetch(scriptURL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Restored for reliable background sync with Apps Script
            })
                .then(() => {
                    console.log('Lead request sent (no-cors)');

                    // Final transition timing
                    setTimeout(() => {
                        clearInterval(statusInterval);
                        if (loadingStatus) loadingStatus.innerText = 'Mengalihkan...';

                        // Close modal and reset form
                        window.closeLeadModal();
                        leadForm.reset();

                        // Redirect to Interactive Calculator App
                        const targetUrl = `./calculator/index.html?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
                        console.log('Redirecting to:', targetUrl);
                        window.location.href = targetUrl;
                    }, 3500); // Give user time to see the premium transition
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    clearInterval(statusInterval);
                    if (leadFormContainer && leadLoading) {
                        leadFormContainer.classList.remove('hidden');
                        leadLoading.classList.add('hidden');
                    }
                    alert('Maaf, ada gangguan sinkronisasi. Coba lagi nanti.');
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                });
        });
    }
}

// ===== Utility: Format Currency =====
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

// ===== Utility: Validate Email =====
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ===== Utility: Format Phone =====
function formatPhone(phone) {
    // Remove non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Convert 08 to 628
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }

    return cleaned;
}
