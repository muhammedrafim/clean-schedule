// ============================================
// CONFIGURATION - UPDATE THIS with your Google Apps Script URL
// ============================================
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw0_ExrdGI3Z_X0CfzJYURarcddWY6W790mq5gaUmUMw1soR3KQXb3brpfr-eBu0YA2Lw/exec'; // Paste your deployment URL here
const USE_GOOGLE_SHEETS = GOOGLE_APPS_SCRIPT_URL.length > 0;

// ============================================
// Schedule Data
// ============================================
const kitchenSchedule = {
    1: 'Sid',        // Monday
    2: 'Adarsh',     // Tuesday
    3: 'Remin',      // Wednesday
    4: 'Fadil',      // Thursday
    5: 'Edwin',      // Friday
    6: 'Jasim',      // Saturday
    0: 'Akash',      // Sunday
};

// All team members
const allMembers = ['Sid', 'Adarsh', 'Remin', 'Fadil', 'Edwin', 'Jasim', 'Akash'];

// Load duty overrides from Google Sheets or localStorage
async function loadDutyOverrides() {
    if (USE_GOOGLE_SHEETS) {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Verify data is valid
            if (data && typeof data === 'object' && !data.error) {
                console.log('Loaded swaps from Google Sheets:', data);
                // Ensure dates are strings
                const normalizedData = {};
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        normalizedData[String(key).trim()] = data[key];
                    }
                }
                return normalizedData;
            } else {
                throw new Error('Invalid data from Google Sheets');
            }
        } catch (error) {
            console.error('Error loading from Google Sheets, falling back to localStorage:', error);
            return loadDutyOverridesLocal();
        }
    } else {
        return loadDutyOverridesLocal();
    }
}

// Load from localStorage
function loadDutyOverridesLocal() {
    const stored = localStorage.getItem('dutyOverrides');
    return stored ? JSON.parse(stored) : {};
}

// Save duty overrides to Google Sheets or localStorage
async function saveDutyOverrides(dateStr, taskType, person) {
    if (USE_GOOGLE_SHEETS) {
        try {
            const payload = {
                date: dateStr,
                taskType: taskType,
                person: person
            };
            
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            saveDutyOverridesLocal(dateStr, taskType, person);
        }
    } else {
        saveDutyOverridesLocal(dateStr, taskType, person);
    }
}

// Save to localStorage
function saveDutyOverridesLocal(dateStr, taskType, person) {
    const overrides = loadDutyOverridesLocal();
    if (!overrides[dateStr]) {
        overrides[dateStr] = {};
    }
    if (taskType && person) {
        overrides[dateStr][taskType] = person;
    }
    localStorage.setItem('dutyOverrides', JSON.stringify(overrides));
}

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

// Get kitchen duty for a given date (with override check)
function getKitchenDuty(date) {
    const dateStr = formatDateISO(date);
    const overrides = window.currentOverrides || {};
    
    // Check if there's an override for this date
    if (overrides[dateStr] && overrides[dateStr].kitchen) {
        return overrides[dateStr].kitchen;
    }
    
    const dayOfWeek = date.getDay();
    // For Sundays, use the bathroom schedule person (Sunday Common)
    if (dayOfWeek === 0) {
        return getBathroomDuty(date);
    }
    return kitchenSchedule[dayOfWeek];
}

// Get bathroom duty for a given date (with override check)
function getBathroomDuty(date) {
    const dateStr = formatDateISO(date);
    const overrides = window.currentOverrides || {};
    
    // Check if there's an override for this date
    if (overrides[dateStr] && overrides[dateStr].bathroom) {
        return overrides[dateStr].bathroom;
    }
    
    return bathroomSchedule[dateStr] || 'Not Scheduled';
}

// Get original (non-overridden) kitchen duty
function getKitchenDutyOriginal(date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) {
        return getBathroomDutyOriginal(date);
    }
    return kitchenSchedule[dayOfWeek];
}

// Get original (non-overridden) bathroom duty
function getBathroomDutyOriginal(date) {
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
    
    // Update swap section UI
    updateSwapUI(date);
}

// Update swap UI based on selected date
function updateSwapUI(date) {
    const taskTypeSelect = document.getElementById('swapTaskType');
    const taskType = taskTypeSelect.value;
    
    let currentAssignee = '-';
    
    if (taskType === 'kitchen') {
        currentAssignee = getKitchenDuty(date);
    } else {
        currentAssignee = getBathroomDuty(date);
    }
    
    document.getElementById('currentAssignee').textContent = currentAssignee;
    
    // Populate replacement person dropdown
    const replacementSelect = document.getElementById('replacementPerson');
    replacementSelect.innerHTML = '';
    allMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        replacementSelect.appendChild(option);
    });
}

// Apply swap
async function applySwap(date) {
    const taskType = document.getElementById('swapTaskType').value;
    const replacementPerson = document.getElementById('replacementPerson').value;
    
    if (!replacementPerson) {
        showSwapStatus('Please select a replacement person', 'error');
        return;
    }
    
    const dateStr = formatDateISO(date);
    
    // Save to Google Sheets or localStorage
    await saveDutyOverrides(dateStr, taskType, replacementPerson);
    
    // Update local cache
    if (!window.currentOverrides[dateStr]) {
        window.currentOverrides[dateStr] = {};
    }
    window.currentOverrides[dateStr][taskType] = replacementPerson;
    
    showSwapStatus(`Swap applied! ${taskType} duty reassigned to ${replacementPerson}`, 'success');
    
    // Update display
    updateDisplay(date);
}

// Clear swap for selected date
async function clearSwap(date) {
    const dateStr = formatDateISO(date);
    
    if (window.currentOverrides[dateStr]) {
        delete window.currentOverrides[dateStr];
        
        // Clear from Google Sheets by deleting both kitchen and bathroom entries
        if (USE_GOOGLE_SHEETS) {
            try {
                // We'll need to call a delete function from Apps Script
                // For now, save empty entries will overwrite
            } catch (error) {
                console.error('Error clearing swaps:', error);
            }
        }
        
        // Clear from localStorage
        const localOverrides = loadDutyOverridesLocal();
        if (localOverrides[dateStr]) {
            delete localOverrides[dateStr];
            saveDutyOverridesLocal(dateStr, '', ''); // Dummy call
        }
        
        showSwapStatus('Swap cleared! Schedule restored to original', 'success');
        updateDisplay(date);
    } else {
        showSwapStatus('No swaps to clear for this date', 'error');
    }
}

// Show status message
function showSwapStatus(message, type) {
    const statusEl = document.getElementById('swapStatus');
    statusEl.textContent = message;
    statusEl.className = `swap-status ${type}`;
    
    setTimeout(() => {
        statusEl.className = 'swap-status';
    }, 3000);
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
async function init() {
    const datePicker = document.getElementById('datePicker');
    const todayBtn = document.getElementById('todayBtn');
    const swapTaskTypeSelect = document.getElementById('swapTaskType');
    const applySwapBtn = document.getElementById('applySwapBtn');
    const clearSwapBtn = document.getElementById('clearSwapBtn');

    // Load overrides from Google Sheets or localStorage
    try {
        window.currentOverrides = await loadDutyOverrides();
    } catch (error) {
        console.error('Failed to load overrides:', error);
        window.currentOverrides = loadDutyOverridesLocal();
    }
    
    // Ensure it's always an object
    if (!window.currentOverrides || typeof window.currentOverrides !== 'object') {
        window.currentOverrides = {};
    }

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
    
    // Event listener for swap task type change
    swapTaskTypeSelect.addEventListener('change', function () {
        const selectedDate = new Date(datePicker.value + 'T00:00:00');
        updateSwapUI(selectedDate);
    });
    
    // Event listener for apply swap button
    applySwapBtn.addEventListener('click', function () {
        const selectedDate = new Date(datePicker.value + 'T00:00:00');
        applySwap(selectedDate);
    });
    
    // Event listener for clear swap button
    clearSwapBtn.addEventListener('click', function () {
        const selectedDate = new Date(datePicker.value + 'T00:00:00');
        clearSwap(selectedDate);
    });

    // If using Google Sheets, sync every 10 seconds
    if (USE_GOOGLE_SHEETS) {
        setInterval(async () => {
            try {
                const updated = await loadDutyOverrides();
                if (updated && typeof updated === 'object') {
                    window.currentOverrides = updated;
                    const selectedDate = new Date(datePicker.value + 'T00:00:00');
                    updateDisplay(selectedDate);
                }
            } catch (error) {
                console.error('Error syncing from Google Sheets:', error);
            }
        }, 10000);
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', init);
