# Fixed Google Apps Script Code

Replace ALL code in your Google Apps Script with this:

```javascript
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const swaps = {};
    
    for (let i = 1; i < data.length; i++) {
      let date = data[i][0];
      const taskType = data[i][1];
      const person = data[i][2];
      
      // Skip empty rows
      if (!date || !taskType || !person) continue;
      
      // Convert date to ISO string if it's a Date object
      if (date instanceof Date) {
        date = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        date = String(date).trim();
      }
      
      if (!swaps[date]) swaps[date] = {};
      swaps[date][taskType] = String(person).trim();
    }
    
    return ContentService.createTextOutput(JSON.stringify(swaps))
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
    
    let found = false;
    
    // Look for existing entry
    for (let i = 1; i < allData.length; i++) {
      let sheetDate = allData[i][0];
      
      // Convert sheet date to ISO format for comparison
      if (sheetDate instanceof Date) {
        sheetDate = Utilities.formatDate(sheetDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        sheetDate = String(sheetDate).trim();
      }
      
      if (sheetDate === data.date && String(allData[i][1]).trim() === data.taskType) {
        sheet.getRange(i + 1, 3).setValue(data.person);
        found = true;
        break;
      }
    }
    
    // Add new row if not found
    if (!found) {
      const nextRow = allData.length + 1;
      sheet.getRange(nextRow, 1).setValue("'" + data.date); // Apostrophe forces text format
      sheet.getRange(nextRow, 2).setValue(data.taskType);
      sheet.getRange(nextRow, 3).setValue(data.person);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Steps:

1. Go to your Google Sheet
2. Click **Extensions** → **Apps Script**
3. **Delete ALL existing code**
4. **Paste the code above** (the whole thing)
5. Click **Save** 
6. Click **Deploy** → **New Deployment** → **Web app**
7. Execute as: Your email
8. Who has access: **Anyone**
9. Click **Deploy** and copy the new URL
10. The website already has your URL, so it should work now!

Test by applying a swap and refreshing—it should persist! 🎉
