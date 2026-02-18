document.addEventListener('DOMContentLoaded', function () {
    // 1. Initialize User Name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('name');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    // 2. Elements
    const inputs = {
        salary: document.getElementById('salary'),
        operational: document.getElementById('operational'),
        savings: document.getElementById('savings'),
        insurance: document.getElementById('insurance'), // NEW
        tax: document.getElementById('tax'), // NEW
        days: document.getElementById('daysPerWeek'),
        hours: document.getElementById('hoursPerDay')
    };

    const displays = {
        days: document.getElementById('daysValue'),
        hours: document.getElementById('hoursValue'),
        rate: document.getElementById('hourlyRate'),
        totalNeed: document.getElementById('totalNeed'),
        totalHours: document.getElementById('totalHours'),
        healthLabel: document.getElementById('healthLabel'), // NEW
        healthBar: document.getElementById('healthBar'), // NEW
        healthAdvice: document.getElementById('healthAdvice') // NEW
    };

    // 3. Format Currency
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(num);
    };

    // 4. Calculation Logic
    let currentSellingPrice = 0;

    function calculate() {
        // Get values
        const salary = Number(inputs.salary.value) || 0;
        const ops = Number(inputs.operational.value) || 0;
        const save = Number(inputs.savings.value) || 0;
        const ins = Number(inputs.insurance.value) || 0;
        const tax = Number(inputs.tax.value) || 0;
        const days = Number(inputs.days.value);
        const hours = Number(inputs.hours.value);

        // Update Slider Displays
        displays.days.textContent = days;
        displays.hours.textContent = hours;

        // Core Calc
        const totalMonthlyNeed = salary + ops + save + ins + tax;
        const totalMonthlyHours = days * hours * 4; // 4 weeks

        let hourlyRateBase = 0;
        if (totalMonthlyHours > 0) {
            hourlyRateBase = totalMonthlyNeed / totalMonthlyHours;
        }

        currentSellingPrice = hourlyRateBase * 1.3; // 30% Margin

        // Update UI
        displays.rate.textContent = formatRupiah(Math.ceil(currentSellingPrice));
        displays.totalNeed.textContent = 'Rp ' + formatRupiah(totalMonthlyNeed);
        displays.totalHours.textContent = totalMonthlyHours + ' Jam/Bulan';

        // Dynamic color for rate
        const rateEl = displays.rate.parentElement;
        if (currentSellingPrice > 0) {
            rateEl.style.opacity = '1';
        } else {
            rateEl.style.opacity = '0.5';
        }

        // --- HEALTH DASHBOARD LOGIC ---
        let healthScore = 0;
        let advice = "";
        let color = "#ef4444"; // Red

        if (salary > 0 && ops > 0) healthScore += 50;
        if (save > 0) healthScore += 20;
        if (ins > 0) healthScore += 15;
        if (tax > 0) healthScore += 15;

        if (healthScore < 50) {
            displays.healthLabel.textContent = "Survival Mode ⚠️";
            advice = "Tarif ini berisiko! Anda belum memasukkan tabungan atau asuransi.";
            color = "#ef4444";
        } else if (healthScore < 85) {
            displays.healthLabel.textContent = "Stable ✅";
            advice = "Sudah aman, tapi belum maksimal untuk pertumbuhan jangka panjang.";
            color = "#eab308"; // Yellow
        } else {
            displays.healthLabel.textContent = "Professional 🚀";
            advice = "Sempurna! Tarif ini mencakup masa depan, kesehatan, dan pajak.";
            color = "#22c55e"; // Green
        }

        if (displays.healthBar) {
            displays.healthBar.style.width = `${healthScore}%`;
            displays.healthBar.style.backgroundColor = color;
        }
        if (displays.healthAdvice) {
            displays.healthAdvice.textContent = advice;
        }
    }

    // 5. Add Listeners
    Object.values(inputs).forEach(input => {
        if (input) input.addEventListener('input', calculate);
    });

    // --- QUOTATION GENERATOR LOGIC ---
    const modal = document.getElementById('quoteModal');
    const generateBtn = document.getElementById('generateQuoteBtn');
    const closeBtn = document.querySelector('.close-modal');
    const copyBtn = document.getElementById('copyQuoteBtn');

    // Inputs inside modal
    const clientNameInput = document.getElementById('clientName');
    const projectHoursInput = document.getElementById('projectHours');
    const adjustmentInput = document.getElementById('adjustment');
    const quoteTextArea = document.getElementById('quoteText');

    function updateQuoteText() {
        const client = clientNameInput.value || '[Nama Klien]';
        const hours = Number(projectHoursInput.value) || 0;
        const adjust = Number(adjustmentInput.value) || 0;

        const subtotal = Math.ceil(currentSellingPrice) * hours;
        const total = subtotal - adjust;

        const text = `Halo ${client},

Terima kasih atas diskusinya. Berdasarkan kebutuhan project ini, berikut adalah estimasi penawaran profesional saya:

📋 **Rincian Biaya**
• Rate Profesional: Rp ${formatRupiah(Math.ceil(currentSellingPrice))}/jam
• Estimasi Waktu: ${hours} jam
• Subtotal: Rp ${formatRupiah(subtotal)}
${adjust > 0 ? `• Diskon/Adjustment: -Rp ${formatRupiah(adjust)}\n` : ''}
**TOTAL ESTIMASI: Rp ${formatRupiah(total)}**

⏳ **Waktu Pengerjaan:** ±${Math.ceil(hours / (Number(inputs.hours.value) || 1))} hari kerja standard.

Harga ini sudah mencakup revisi minor 2x dan serah terima file master. Jika setuju, saya akan siapkan draft kontrak kerjanya (SPK).

Salam,
${document.getElementById('userName').textContent}`;

        quoteTextArea.value = text;
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            updateQuoteText();
            // Tracking
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Freelance Rate Calculated',
                    currency: 'IDR',
                    value: 0
                });
            }
            if (typeof gtag === 'function') gtag('event', 'generate_quote', { 'event_category': 'calculator' });
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    [clientNameInput, projectHoursInput, adjustmentInput].forEach(el => {
        if (el) el.addEventListener('input', updateQuoteText);
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            quoteTextArea.select();
            document.execCommand('copy'); // Fallback
            navigator.clipboard.writeText(quoteTextArea.value).then(() => {
                copyBtn.textContent = "Tersalin! ✅";
                setTimeout(() => copyBtn.textContent = "Salin Teks", 2000);
            });
            // Tracking
            if (typeof fbq === 'function') fbq('trackCustom', 'CopyQuote');
            if (typeof gtag === 'function') gtag('event', 'copy_quote', { 'event_category': 'calculator' });
        });
    }

    // Initial run
    calculate();
});

document.addEventListener('DOMContentLoaded', function () {
    // Exit Intent Logic for Calculator
    const popup = document.getElementById('exitPopup');
    if (!popup) return;

    // Check if already shown
    if (sessionStorage.getItem('calcExitPopupShown')) return;

    const showPopup = () => {
        if (popup.classList.contains('hidden')) {
            popup.classList.remove('hidden');
            sessionStorage.setItem('calcExitPopupShown', 'true');
            if (typeof gtag === 'function') {
                gtag('event', 'calc_exit_popup_shown', { page_title: document.title });
            }
        }
    };

    // Desktop
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0) showPopup();
    });

    // Mobile (Scroll + Timer)
    let scrollTriggered = false;
    window.addEventListener('scroll', () => {
        if (scrollTriggered) return;
        const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        if (scrollPercent > 50) {
            scrollTriggered = true;
            setTimeout(showPopup, 20000); // 20s delay
        }
    });
});
