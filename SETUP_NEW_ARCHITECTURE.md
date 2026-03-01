# 🎉 Complete Architecture Redesign - Setup Instructions

## What Changed?
✅ ALL schedule data now stored in Google Sheets (no hardcoded data)
✅ Google Sheets acts as the database
✅ Swap buttons added directly to upcoming schedule items
✅ Much more stable and reliable
✅ You can edit the schedule directly in Google Sheets

---

## Step 1: Import Schedule Data into Google Sheets

1. **Open your Google Sheet**: https://docs.google.com/spreadsheets/d/1myZVr2cieEyXzA2VYPPgveNjEAmQvgDcaVNhJ8zf2n0

2. **Create a new sheet tab** (bottom of the page):
   - Click the **+** button
   - Name it exactly: **Schedule**

3. **Import the CSV data**:
   - In the new "Schedule" sheet, click **File** → **Import**
   - Click **Upload** tab
   - Drag and drop the file: `schedule_data.csv` (from your computer at `/home/rafi/Documents/personal/clean-schedule/schedule_data.csv`)
   - Import location: **Replace current sheet**
   - Click **Import data**

4. **Verify the data**:
   - You should see 3 columns: date, kitchen, bathroom
   - 306 rows of data from 2026-03-01 to 2026-12-31

---

## Step 2: Update Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**

2. **Delete ALL existing code**

3. **Paste this new code**:

```javascript
const SHEET_NAME = 'Schedule';

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const schedule = {};
    
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      let date = data[i][0];
      const kitchen = data[i][1];
      const bathroom = data[i][2];
      
      if (!date) continue;
      
      // Convert date to ISO string
      if (date instanceof Date) {
        date = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        date = String(date).trim();
      }
      
      schedule[date] = {
        kitchen: String(kitchen || '').trim(),
        bathroom: String(bathroom || '').trim()
      };
    }
    
    return ContentService.createTextOutput(JSON.stringify(schedule))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const allData = sheet.getDataRange().getValues();
    
    // Find the row for this date
    for (let i = 1; i < allData.length; i++) {
      let sheetDate = allData[i][0];
      
      if (sheetDate instanceof Date) {
        sheetDate = Utilities.formatDate(sheetDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        sheetDate = String(sheetDate).trim();
      }
      
      if (sheetDate === data.date) {
        // Update kitchen or bathroom column
        if (data.taskType === 'kitchen') {
          sheet.getRange(i + 1, 2).setValue(data.person); // Column B (kitchen)
        } else if (data.taskType === 'bathroom') {
          sheet.getRange(i + 1, 3).setValue(data.person); // Column C (bathroom)
        }
        
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // If date not found, add new row
    const nextRow = allData.length + 1;
    sheet.getRange(nextRow, 1).setValue("'" + data.date);
    sheet.getRange(nextRow, 2).setValue(data.taskType === 'kitchen' ? data.person : '');
    sheet.getRange(nextRow, 3).setValue(data.taskType === 'bathroom' ? data.person : '');
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon)

---

## Step 3: Deploy the Apps Script

1. Click **Deploy** button (top right, blue button)

2. Select **New deployment**

3. Click the gear icon ⚙️ → Select **"Web app"**

4. Configure:
   - **Execute as**: (your email)
   - **Who has access**: **"Anyone"**

5. Click **Deploy**

6. If the deployment URL changed, copy it and update line 5 in `script_new.js` (but your current URL should still work!)

7. Click **Done**

---

## Step 4: Test the Website

1. Open your website: https://muhammedrafim.github.io/clean-schedule/

2. **You should see**:
   - Today's schedule loaded from Google Sheets
   - Upcoming 14 days with **"Swap" buttons** next to each person
   - Original swap section still works

3. **Test swapping**:
   - Click a "Swap" button in the upcoming schedule
   - Enter a new person name
   - The change saves to Google Sheets instantly
   - All devices see the update within 30 seconds

4. **Manual edits**:
   - You can also edit the Google Sheet directly
   - Changes appear on the website automatically

---

## ✅ Done!

Your cleaning schedule now:
- ✅ Stores everything in Google Sheets (stable database)
- ✅ Allows swaps from upcoming schedule items
- ✅ Syncs across all devices in real-time
- ✅ Can be edited directly in Google Sheets
- ✅ Much more reliable and maintainable

🎉 Enjoy your new architecture!
