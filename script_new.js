// ============================================
// CONFIGURATION
// ============================================
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_gtV7RbvMQevQKyv52KM7wUGmK8C3qZae7Hvr50KBqB0Hs9OvOQ3RBGtwJxzJ2W7tJg/exec';

// All team members
const allMembers = ['Sid', 'Adarsh', 'Remin', 'Fadil', 'Edwin', 'Jasim', 'Akash'];

// Global schedule data loaded from Google Sheets
let scheduleData = {};

// Load complete schedule from Google Sheets
async function loadSchedule() {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data && typeof data === 'object' && !data.error) {
            console.log('Schedule loaded successfully');
            return data;
        } else {
            throw new Error('Invalid schedule data');
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
        alert('Failed to load schedule from Google Sheets. Please check your connection.');
        return {};
    }
}

// Save assignment change to Google Sheets
async function saveAssignment(date, taskType, person) {
    try {
        const payload = {
            date: date,
            taskType: taskType,
            person: person
        };
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error saving assignment:', error);
        return false;
    }
}

// Get schedule for a specific date
function getScheduleForDate(date) {
    const dateStr = formatDateISO(date);
    return scheduleData[dateStr] || { kitchen: 'Not Scheduled', bathroom: 'Not Scheduled' };
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

// Update main schedule display
function updateDisplay(date) {
    const schedule = getScheduleForDate(date);
    
    document.getElementById('selectedDate').textContent = formatDateDisplay(date);
    document.getElementById('kitchenTask').textContent = schedule.kitchen;
    document.getElementById('bathroomTask').textContent = schedule.bathroom;
    
    // Update upcoming schedule
    updateUpcomingSchedule(date);
    
    // Update swap section UI
    updateSwapUI(date);
}

// Update swap UI
function updateSwapUI(date) {
    const taskTypeSelect = document.getElementById('swapTaskType');
    const taskType = taskTypeSelect.value;
    const schedule = getScheduleForDate(date);
    
    const currentAssignee = taskType === 'kitchen' ? schedule.kitchen : schedule.bathroom;
    document.getElementById('currentAssignee').textContent = currentAssignee;
    
    // Populate replacement person dropdown
    const replacementSelect = document.getElementById('replacementPerson');
    replacementSelect.innerHTML = '';
    allMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        if (member === currentAssignee) {
            option.selected = true;
        }
        replacementSelect.appendChild(option);
    });
}

// Apply swap from main swap section
async function applySwap(date) {
    const taskType = document.getElementById('swapTaskType').value;
    const replacementPerson = document.getElementById('replacementPerson').value;
    
    if (!replacementPerson) {
        showSwapStatus('Please select a replacement person', 'error');
        return;
    }
    
    const dateStr = formatDateISO(date);
    const success = await saveAssignment(dateStr, taskType, replacementPerson);
    
    if (success) {
        // Update local cache
        if (!scheduleData[dateStr]) {
            scheduleData[dateStr] = { kitchen: '', bathroom: '' };
        }
        scheduleData[dateStr][taskType] = replacementPerson;
        
        showSwapStatus(`Swap applied! ${taskType} duty reassigned to ${replacementPerson}`, 'success');
        updateDisplay(date);
    } else {
        showSwapStatus('Failed to apply swap. Please try again.', 'error');
    }
}

// Apply swap from upcoming schedule item
async function swapFromUpcoming(dateStr, taskType) {
    const members = allMembers.join(',');
    const currentSchedule = scheduleData[dateStr] || { kitchen: '', bathroom: '' };
    const currentPerson = taskType === 'kitchen' ? currentSchedule.kitchen : currentSchedule.bathroom;
    
    const newPerson = prompt(
        `Swap ${taskType} duty for ${dateStr}\n\nCurrent: ${currentPerson}\n\nEnter new person name:\n(${allMembers.join(', ')})`,
        currentPerson
    );
    
    if (newPerson && allMembers.includes(newPerson)) {
        const success = await saveAssignment(dateStr, taskType, newPerson);
        
        if (success) {
            if (!scheduleData[dateStr]) {
                scheduleData[dateStr] = { kitchen: '', bathroom: '' };
            }
            scheduleData[dateStr][taskType] = newPerson;
            
            // Refresh display
            const datePicker = document.getElementById('datePicker');
            const selectedDate = new Date(datePicker.value + 'T00:00:00');
            updateDisplay(selectedDate);
            
            alert('Swap applied successfully!');
        } else {
            alert('Failed to apply swap. Please try again.');
        }
    } else if (newPerson) {
        alert('Invalid person name. Please choose from: ' + allMembers.join(', '));
    }
}

// Clear swap (not really needed anymore, but kept for UI)
async function clearSwap(date) {
    showSwapStatus('To reset, just change the person in Google Sheets directly', 'error');
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

// Update upcoming schedule with swap buttons
function updateUpcomingSchedule(fromDate) {
    const upcomingList = document.getElementById('upcomingList');
    upcomingList.innerHTML = '';
    
    for (let i = 1; i <= 14; i++) {
        const currentDate = new Date(fromDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = formatDateISO(currentDate);
        const schedule = getScheduleForDate(currentDate);
        
        const item = document.createElement('div');
        item.className = 'upcoming-item';
        item.innerHTML = `
            <span class="upcoming-date">${formatDateDisplay(currentDate)}</span>
            <div class="upcoming-tasks">
                <div class="upcoming-task">
                    <span class="upcoming-task-label">🍳 Kitchen</span>
                    <span class="upcoming-task-person">${schedule.kitchen}</span>
                    <button class="btn-swap-mini" onclick="swapFromUpcoming('${dateStr}', 'kitchen')">Swap</button>
                </div>
                <div class="upcoming-task">
                    <span class="upcoming-task-label">🚿 Bathroom</span>
                    <span class="upcoming-task-person">${schedule.bathroom}</span>
                    <button class="btn-swap-mini" onclick="swapFromUpcoming('${dateStr}', 'bathroom')">Swap</button>
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
    
    // Show loading message
    document.getElementById('selectedDate').textContent = 'Loading schedule...';
    
    // Load schedule from Google Sheets
    scheduleData = await loadSchedule();
    
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
    
    // Auto-refresh every 30 seconds to sync with Google Sheets
    setInterval(async () => {
        const updated = await loadSchedule();
        scheduleData = updated;
        const selectedDate = new Date(datePicker.value + 'T00:00:00');
        updateDisplay(selectedDate);
    }, 30000);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', init);
