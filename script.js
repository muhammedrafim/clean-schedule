// Schedule Data
const kitchenSchedule = {
    1: 'Sid',        // Monday
    2: 'Adarsh',     // Tuesday
    3: 'Remin',      // Wednesday
    4: 'Fadil',      // Thursday
    5: 'Edwin',      // Friday
    6: 'Jasim',      // Saturday
    0: 'Akash',      // Sunday
};

// Bathroom schedule - specific dates
const bathroomSchedule = {
    '2026-03-01': 'Remin',
    '2026-03-08': 'Sid',
    '2026-03-15': 'Adarsh',
    '2026-03-22': 'Jasim',
    '2026-03-29': 'Edwin',
    '2026-04-05': 'Fadil',
    '2026-04-12': 'Akash',
    '2026-04-19': 'Remin',
    '2026-04-26': 'Sid',
    '2026-05-03': 'Adarsh',
    '2026-05-10': 'Jasim',
    '2026-05-17': 'Edwin',
    '2026-05-24': 'Fadil',
    '2026-05-31': 'Akash',
    '2026-06-07': 'Remin',
    '2026-06-14': 'Sid',
    '2026-06-21': 'Adarsh',
    '2026-06-28': 'Jasim',
    '2026-07-05': 'Edwin',
    '2026-07-12': 'Fadil',
    '2026-07-19': 'Akash',
    '2026-07-26': 'Remin',
    '2026-08-02': 'Sid',
    '2026-08-09': 'Adarsh',
    '2026-08-16': 'Jasim',
    '2026-08-23': 'Edwin',
    '2026-08-30': 'Fadil',
    '2026-09-06': 'Akash',
    '2026-09-13': 'Remin',
    '2026-09-20': 'Sid',
    '2026-09-27': 'Adarsh',
    '2026-10-04': 'Jasim',
    '2026-10-11': 'Edwin',
    '2026-10-18': 'Fadil',
    '2026-10-25': 'Akash',
    '2026-11-01': 'Remin',
    '2026-11-08': 'Sid',
    '2026-11-15': 'Adarsh',
    '2026-11-22': 'Jasim',
    '2026-11-29': 'Edwin',
    '2026-12-06': 'Fadil',
    '2026-12-13': 'Akash',
    '2026-12-20': 'Remin',
    '2026-12-27': 'Sid',
};

// Get kitchen duty for a given date
function getKitchenDuty(date) {
    const dayOfWeek = date.getDay();

    return kitchenSchedule[dayOfWeek];
}

// Get bathroom duty for a given date
function getBathroomDuty(date) {
    const dateStr = formatDateISO(date);
    return bathroomSchedule[dateStr] || 'Not Scheduled';
}

// Format date to ISO string (YYYY-MM-DD)
function formatDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display
function formatDateDisplay(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update schedule display
function updateDisplay(date) {
    const kitchen = getKitchenDuty(date);
    const bathroom = getBathroomDuty(date);

    document.getElementById('selectedDate').textContent = formatDateDisplay(date);
    document.getElementById('kitchenTask').textContent = kitchen;
    document.getElementById('bathroomTask').textContent = bathroom;

    // Update upcoming schedule
    updateUpcomingSchedule(date);
}

// Update upcoming schedule for next 14 days
function updateUpcomingSchedule(fromDate) {
    const upcomingList = document.getElementById('upcomingList');
    upcomingList.innerHTML = '';

    for (let i = 1; i <= 14; i++) {
        const currentDate = new Date(fromDate);
        currentDate.setDate(currentDate.getDate() + i);

        const dateStr = formatDateISO(currentDate);
        const kitchen = getKitchenDuty(currentDate);
        const bathroom = getBathroomDuty(currentDate);

        const item = document.createElement('div');
        item.className = 'upcoming-item';
        item.innerHTML = `
            <span class="upcoming-date">${formatDateDisplay(currentDate)}</span>
            <div class="upcoming-tasks">
                <div class="upcoming-task">
                    <span class="upcoming-task-label">🍳 Kitchen</span>
                    <span class="upcoming-task-person">${kitchen}</span>
                </div>
                <div class="upcoming-task">
                    <span class="upcoming-task-label">🚿 Bathroom</span>
                    <span class="upcoming-task-person">${bathroom}</span>
                </div>
            </div>
        `;
        upcomingList.appendChild(item);
    }
}

// Initialize the page
function init() {
    const datePicker = document.getElementById('datePicker');
    const todayBtn = document.getElementById('todayBtn');

    // Set today's date as default
    const today = new Date();
    const dateStr = formatDateISO(today);
    datePicker.value = dateStr;

    // Display today's schedule
    updateDisplay(today);

    // Event listener for date picker
    datePicker.addEventListener('change', function () {
        const selectedDate = new Date(this.value + 'T00:00:00');
        updateDisplay(selectedDate);
    });

    // Event listener for today button
    todayBtn.addEventListener('click', function () {
        const today = new Date();
        const dateStr = formatDateISO(today);
        datePicker.value = dateStr;
        updateDisplay(today);
    });
}

// Run when page loads
document.addEventListener('DOMContentLoaded', init);
