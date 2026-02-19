// Application State
const appState = {
    habits: [],
    completions: {},
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

// DOM Elements
const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitList = document.getElementById('habitList');
const calendar = document.getElementById('calendar');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const tooltip = document.getElementById('tooltip');

// Statistics Elements
const currentStreakEl = document.getElementById('currentStreak');
const longestStreakEl = document.getElementById('longestStreak');
const totalCompletionsEl = document.getElementById('totalCompletions');
const completionRateEl = document.getElementById('completionRate');

// Initialize App
function initApp() {
    loadFromLocalStorage();
    renderHabitList();
    renderCalendar();
    updateStatistics();
    updateMonthDisplay();
}

// Add Habit
function addHabit() {
    const habitName = habitInput.value.trim();
    if (!habitName) return;
    
    if (appState.habits.includes(habitName)) {
        alert('Habit already exists!');
        return;
    }
    
    appState.habits.push(habitName);
    habitInput.value = '';
    renderHabitList();
    saveToLocalStorage();
}

// Delete Habit
function deleteHabit(habitName) {
    appState.habits = appState.habits.filter(h => h !== habitName);
    
    // Remove from completions
    Object.keys(appState.completions).forEach(date => {
        appState.completions[date] = appState.completions[date].filter(h => h !== habitName);
        if (appState.completions[date].length === 0) {
            delete appState.completions[date];
        }
    });
    
    renderHabitList();
    renderCalendar();
    updateStatistics();
    saveToLocalStorage();
}

// Toggle Habit Completion
function toggleHabitCompletion(habitName) {
    const today = formatDate(new Date());
    
    if (!appState.completions[today]) {
        appState.completions[today] = [];
    }
    
    const index = appState.completions[today].indexOf(habitName);
    if (index > -1) {
        appState.completions[today].splice(index, 1);
        if (appState.completions[today].length === 0) {
            delete appState.completions[today];
        }
    } else {
        appState.completions[today].push(habitName);
    }
    
    renderHabitList();
    renderCalendar();
    updateStatistics();
    saveToLocalStorage();
}

// Check if habit is completed today
function isHabitCompletedToday(habitName) {
    const today = formatDate(new Date());
    return appState.completions[today]?.includes(habitName) || false;
}

// Render Habit List
function renderHabitList() {
    habitList.innerHTML = '';
    
    if (appState.habits.length === 0) {
        habitList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No habits yet. Add one to get started!</p>';
        return;
    }
    
    appState.habits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        
        const habitName = document.createElement('span');
        habitName.className = 'habit-name';
        habitName.textContent = habit;
        
        const actions = document.createElement('div');
        actions.className = 'habit-actions';
        
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        const isCompleted = isHabitCompletedToday(habit);
        completeBtn.textContent = isCompleted ? 'Completed' : 'Complete';
        if (isCompleted) completeBtn.classList.add('completed');
        completeBtn.onclick = () => toggleHabitCompletion(habit);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            if (confirm(`Delete habit "${habit}"?`)) {
                deleteHabit(habit);
            }
        };
        
        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);
        habitItem.appendChild(habitName);
        habitItem.appendChild(actions);
        habitList.appendChild(habitItem);
    });
}

// Render Calendar
function renderCalendar() {
    calendar.innerHTML = '';
    
    const daysInMonth = new Date(appState.currentYear, appState.currentMonth + 1, 0).getDate();
    const firstDay = new Date(appState.currentYear, appState.currentMonth, 1).getDay();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell heat-0';
        emptyCell.style.opacity = '0.3';
        calendar.appendChild(emptyCell);
    }
    
    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(appState.currentYear, appState.currentMonth, day);
        const dateStr = formatDate(date);
        const completionCount = appState.completions[dateStr]?.length || 0;
        
        const dayCell = document.createElement('div');
        dayCell.className = `day-cell ${getHeatClass(completionCount)}`;
        dayCell.textContent = day;
        dayCell.dataset.date = dateStr;
        dayCell.dataset.count = completionCount;
        
        dayCell.addEventListener('mouseenter', showTooltip);
        dayCell.addEventListener('mouseleave', hideTooltip);
        
        calendar.appendChild(dayCell);
    }
}

// Get Heat Class based on completion count
function getHeatClass(count) {
    if (count === 0) return 'heat-0';
    if (count === 1) return 'heat-1';
    if (count === 2) return 'heat-2';
    if (count === 3) return 'heat-3';
    return 'heat-4';
}

// Show Tooltip
function showTooltip(e) {
    const date = e.target.dataset.date;
    const count = e.target.dataset.count;
    const habits = appState.completions[date] || [];
    
    let tooltipText = `${date}\n${count} completion${count !== '1' ? 's' : ''}`;
    if (habits.length > 0) {
        tooltipText += `\n${habits.join(', ')}`;
    }
    
    tooltip.textContent = tooltipText;
    tooltip.style.whiteSpace = 'pre-line';
    tooltip.classList.add('show');
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

// Hide Tooltip
function hideTooltip() {
    tooltip.classList.remove('show');
}

// Update Month Display
function updateMonthDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${monthNames[appState.currentMonth]} ${appState.currentYear}`;
}

// Navigate to Previous Month
function prevMonth() {
    appState.currentMonth--;
    if (appState.currentMonth < 0) {
        appState.currentMonth = 11;
        appState.currentYear--;
    }
    updateMonthDisplay();
    renderCalendar();
}

// Navigate to Next Month
function nextMonth() {
    appState.currentMonth++;
    if (appState.currentMonth > 11) {
        appState.currentMonth = 0;
        appState.currentYear++;
    }
    updateMonthDisplay();
    renderCalendar();
}

// Calculate Current Streak
function calculateCurrentStreak() {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
        const dateStr = formatDate(currentDate);
        const completions = appState.completions[dateStr];
        
        if (!completions || completions.length === 0) {
            break;
        }
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}

// Calculate Longest Streak
function calculateLongestStreak() {
    const dates = Object.keys(appState.completions).sort();
    if (dates.length === 0) return 0;
    
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate = null;
    
    dates.forEach(dateStr => {
        if (appState.completions[dateStr].length > 0) {
            if (prevDate) {
                const diff = (new Date(dateStr) - new Date(prevDate)) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    currentStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            prevDate = dateStr;
        }
    });
    
    return Math.max(longestStreak, currentStreak);
}

// Calculate Total Completions
function calculateTotalCompletions() {
    return Object.values(appState.completions).reduce((sum, habits) => sum + habits.length, 0);
}

// Calculate Completion Rate
function calculateCompletionRate() {
    if (appState.habits.length === 0) return 0;
    
    const daysWithData = Object.keys(appState.completions).length;
    if (daysWithData === 0) return 0;
    
    const totalPossible = daysWithData * appState.habits.length;
    const totalCompleted = calculateTotalCompletions();
    
    return Math.round((totalCompleted / totalPossible) * 100);
}

// Update Statistics
function updateStatistics() {
    const currentStreak = calculateCurrentStreak();
    const longestStreak = calculateLongestStreak();
    const totalCompletions = calculateTotalCompletions();
    const completionRate = calculateCompletionRate();
    
    currentStreakEl.textContent = `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`;
    longestStreakEl.textContent = `${longestStreak} day${longestStreak !== 1 ? 's' : ''}`;
    totalCompletionsEl.textContent = totalCompletions;
    completionRateEl.textContent = `${completionRate}%`;
}

// Format Date to YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('habitTrackerState', JSON.stringify(appState));
}

// Load from LocalStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('habitTrackerState');
    if (saved) {
        const parsed = JSON.parse(saved);
        appState.habits = parsed.habits || [];
        appState.completions = parsed.completions || {};
    }
}

// Event Listeners
addHabitBtn.addEventListener('click', addHabit);
habitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});
prevMonthBtn.addEventListener('click', prevMonth);
nextMonthBtn.addEventListener('click', nextMonth);

// Initialize on Load
initApp();
