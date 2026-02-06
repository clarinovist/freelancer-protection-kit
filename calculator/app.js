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
        days: document.getElementById('daysPerWeek'),
        hours: document.getElementById('hoursPerDay')
    };

    const displays = {
        days: document.getElementById('daysValue'),
        hours: document.getElementById('hoursValue'),
        rate: document.getElementById('hourlyRate'),
        totalNeed: document.getElementById('totalNeed'),
        totalHours: document.getElementById('totalHours')
    };

    // 3. Format Currency
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(num);
    };

    // 4. Calculation Logic
    function calculate() {
        // Get values
        const salary = Number(inputs.salary.value) || 0;
        const ops = Number(inputs.operational.value) || 0;
        const save = Number(inputs.savings.value) || 0;
        const days = Number(inputs.days.value);
        const hours = Number(inputs.hours.value);

        // Update Slider Displays
        displays.days.textContent = days;
        displays.hours.textContent = hours;

        // Core Calc
        const totalMonthlyNeed = salary + ops + save;
        const totalMonthlyHours = days * hours * 4; // 4 weeks

        let hourlyRateBase = 0;
        if (totalMonthlyHours > 0) {
            hourlyRateBase = totalMonthlyNeed / totalMonthlyHours;
        }

        const sellingPrice = hourlyRateBase * 1.3; // 30% Margin

        // Update UI
        displays.rate.textContent = formatRupiah(Math.ceil(sellingPrice));
        displays.totalNeed.textContent = 'Rp ' + formatRupiah(totalMonthlyNeed);
        displays.totalHours.textContent = totalMonthlyHours + ' Jam/Bulan';

        // Dynamic color for rate
        const rateEl = displays.rate.parentElement;
        if (sellingPrice > 0) {
            rateEl.style.opacity = '1';
        } else {
            rateEl.style.opacity = '0.5';
        }
    }

    // 5. Add Listeners
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initial run
    calculate();
});
