# New Architecture: Google Sheets as Database

## Google Sheets Structure

Create a sheet named **"Schedule"** with these columns:

| date       | kitchen | bathroom |
|------------|---------|----------|
| 2026-03-01 | Remin   | Remin    |
| 2026-03-02 | Sid     | Remin    |
| 2026-03-03 | Adarsh  | Remin    |
| etc...     |         |          |

## Google Apps Script Code

Replace ALL code in Apps Script with this:

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

## Setup Steps

1. In your Google Sheet, create a new sheet tab called "Schedule"
2. Add headers: date | kitchen | bathroom
3. I'll generate all the date rows for you in the next step
4. Replace the Apps Script code with the above
5. Deploy as Web App (Anyone access)

Done! Much simpler and more reliable. 🎉
