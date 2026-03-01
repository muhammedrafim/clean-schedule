# Google Sheets Setup for Shared Swaps

## Step 1: Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **"+ New"** → **Blank spreadsheet**
3. Name it: `cleaning-swaps`
4. Your sheet will open automatically

## Step 2: Create the Sheet Structure

In the first sheet (rename it to `swaps` if needed), add this header in row 1:
- Column A: `date` (e.g., 2026-03-05)
- Column B: `taskType` (e.g., kitchen or bathroom)
- Column C: `person` (e.g., Remin)

Leave the rest empty—data will be added by the Apps Script.

## Step 3: Add Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy and paste the code below:

```javascript
const SHEET_NAME = 'swaps';

// Get all swaps
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row, convert to objects
    const swaps = {};
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1] && data[i][2]) {
        const date = data[i][0];
        const taskType = data[i][1];
        const person = data[i][2];
        
        if (!swaps[date]) swaps[date] = {};
        swaps[date][taskType] = person;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(swaps))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Add or update swap
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    const date = data.date;
    const taskType = data.taskType;
    const person = data.person;
    
    // Get all data
    const allData = sheet.getDataRange().getValues();
    let found = false;
    
    // Look for existing entry to update
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][0] === date && allData[i][1] === taskType) {
        sheet.getRange(i + 1, 3).setValue(person); // Update column C
        found = true;
        break;
      }
    }
    
    // If not found, add new row
    if (!found) {
      const nextRow = allData.length + 1;
      sheet.getRange(nextRow, 1, 1, 3).setValues([[date, taskType, person]]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Delete swap
function deleteSwap(date, taskType) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const allData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][0] === date && allData[i][1] === taskType) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
```

## Step 4: Deploy the Script

1. Click **"Deploy"** button (top right, blue button)
2. Select **"New deployment"**
3. Click the gear icon → Select **"Web app"**
4. Configure:
   - Execute as: (your email)
   - Who has access: **"Anyone"**
5. Click **"Deploy"**
6. **Copy the deployment URL** (you'll see a long URL starting with `https://script.google.com/...`)
7. Click **"Done"**

## Step 5: Update the Website

Send me the deployment URL from Step 4, then I'll update the site to use it.

The URL looks like: `https://script.google.com/macros/d/{SCRIPT_ID}/userweb`

## Step 6: Share the Sheet

1. Click **Share** button (top right)
2. Set sharing to **"Anyone with the link can view"** or **"Anyone with the link can edit"**
3. Copy the link

Done! All swaps will now sync across all devices in real-time! 🎉
