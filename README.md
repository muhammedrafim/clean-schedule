# 🧹 Cleaning Schedule

A responsive web application to manage and display household cleaning schedules for kitchen and bathroom duties.

## Features

✨ **Current Day Display** - Shows today's assigned duties by default
🗓️ **Date Picker** - Select any date to view that day's schedule
📅 **Upcoming Schedule** - See the next 14 days of assignments
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
🎨 **Modern UI** - Clean interface with gradient styling and smooth animations

## Schedule System

- **Kitchen Duty**: Rotates weekly by day of the week (Monday-Sunday)
- **Bathroom Duty**: Assigned on specific calendar dates (weekly rotation per month)
- **Sundays**: Kitchen duty is assigned from the bathroom schedule (Sunday Common)

## How to Use

1. Open `index.html` in your web browser
2. The current day's schedule is displayed by default
3. Use the date picker to view any date's schedule
4. Scroll down to see upcoming assignments for the next 14 days
5. Click "Today" button to return to the current date

## Project Structure

```
clean-schedule/
├── index.html      # Main HTML structure
├── styles.css      # Responsive styling
├── script.js       # Schedule logic and date handling
├── .gitignore      # Git ignore rules
└── README.md       # This file
```

## Technologies

- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript (ES6+)

## Viewing Schedule Data

The schedule data is stored in `script.js` and includes:
- Kitchen schedule indexed by day of week (0-6)
- Bathroom schedule indexed by specific dates (YYYY-MM-DD format)

## Live Demo

Visit the live version hosted on GitHub Pages: [Your GitHub Pages URL]

---

Created: March 2026
