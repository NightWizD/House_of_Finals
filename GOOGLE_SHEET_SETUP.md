# 📊 Google Sheets Setup Guide

Follow these simple steps to connect your booking form to a Google Sheet. This script automatically saves all reservations, calculates prices, and **saves user-uploaded payment receipt screenshots directly to your Google Drive**, listing the links in your sheet!

---

## 🛠️ Setup Instructions (2 Minutes)

### Step 1: Create a Google Spreadsheet
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Give your spreadsheet a name (e.g., `Event Glide Bookings`).

### Step 2: Open Google Apps Script
1. In the top menu of your spreadsheet, click on **Extensions** ➔ **Apps Script**.
2. Delete any default code in the editor (usually `function myFunction() {}`).

### Step 3: Paste the Deployment Code
1. Copy and paste the complete code block below into the editor:

```javascript
// ====== CONFIGURATION ======
var ENABLE_WHATSAPP = false;                  // Set to true to enable automated WhatsApp messages
var GREEN_API_INSTANCE_ID = "1101XXXXXX";    // Replace with your Green-API Instance ID (from green-api.com)
var GREEN_API_TOKEN = "your_token_here";     // Replace with your Green-API ApiTokenInstance
var CLIENT_ADMIN_NUMBER = "919876543210";    // Replace with your client's WhatsApp number (with country code, e.g., 91 for India)
// ===========================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", 
        "Full Name", 
        "WhatsApp Mobile No.", 
        "Email Id", 
        "Selected Screening", 
        "No. Of Tickets", 
        "Total Cover (₹)", 
        "Payment Screenshot Link"
      ]);
      // Format headers with a nice background and bold font
      sheet.getRange(1, 1, 1, 8)
        .setFontWeight("bold")
        .setBackground("#0f172a") // sleek slate-900 background
        .setFontColor("#ffffff");
    }
    
    var fileUrl = "";
    if (data.image && data.imageName) {
      try {
        var folder;
        var folderName = "Event Booking Receipts";
        var folders = DriveApp.getFoldersByName(folderName);
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }
        
        // Extract clean base64 data
        var base64Data = data.image.split(",")[1] || data.image;
        var decoded = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(decoded, data.imageType || "image/jpeg", data.imageName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
      } catch (err) {
        fileUrl = "Error saving receipt: " + err.message;
      }
    }
    
    sheet.appendRow([
      new Date(),
      data.name,
      data.whatsapp,
      data.email,
      data.screening,
      data.tickets,
      data.total,
      fileUrl
    ]);
    
    // Send Automated WhatsApp Messages if enabled
    if (ENABLE_WHATSAPP) {
      // 1. Send confirmation message TO THE BUYER
      var buyerMessage = "Hi " + data.name + ",\n\nWe have received your payment of *₹" + data.total + "* for *" + data.tickets + " seat(s)* to *" + data.screening + "*.\n\nWe have received your payment, we will share the ticket soon! 🎟️✨";
      sendWhatsAppMessage(data.whatsapp, buyerMessage);
      
      // 2. Send instant alert notification TO YOUR CLIENT (THE WEBSITE OWNER / ADMIN)
      var adminMessage = "🔔 *New Reservation Alert!*\n\n" +
                         "👤 *Name:* " + data.name + "\n" +
                         "📱 *WhatsApp:* " + data.whatsapp + "\n" +
                         "📧 *Email:* " + data.email + "\n" +
                         "🎟️ *Screening:* " + data.screening + "\n" +
                         "👥 *Seats:* " + data.tickets + "\n" +
                         "💰 *Total Cover:* ₹" + data.total + "\n\n" +
                         "📄 *View Payment Screenshot:* " + (fileUrl || "No screenshot uploaded");
      sendWhatsAppMessage(CLIENT_ADMIN_NUMBER, adminMessage);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data successfully appended to Google Sheet"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to send WhatsApp messages using Green-API (100% Free Developer Instance)
function sendWhatsAppMessage(phone, message) {
  var url = "https://api.green-api.com/waInstance" + GREEN_API_INSTANCE_ID + "/sendMessage/" + GREEN_API_TOKEN;
  
  // Clean phone number: remove non-digits
  var cleanPhone = phone.replace(/[+\-\s()]/g, "");
  
  // Default to country code prefix if not provided (e.g., India 91)
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }
  
  var payload = {
    "chatId": cleanPhone + "@c.us",
    "message": message
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Green-API Send Response: " + response.getContentText());
  } catch (err) {
    Logger.log("Green-API Send Error: " + err.message);
  }
}
```

2. Click the **Save** icon (floppy disk) at the top of the editor or press `Ctrl + S`.

### Step 4: Deploy as a Web App (Crucial)
1. Click the **Deploy** button (blue button in top right) ➔ Select **New deployment**.
2. Click the **Gear icon** next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Event Glide Booking Form`
   - **Execute as**: **Me (your-email@gmail.com)**
   - **Who has access**: **Anyone** *(This is required so the website form can submit to it)*
4. Click **Deploy**.
5. *If prompted:* Click **Authorize access**, log in to your Google Account, click **Advanced** ➔ **Go to Untitled project (unsafe)**, and click **Allow**.
6. Copy the generated **Web app URL** (it ends with `/exec`).

### Step 5: Configure your Website
1. Open the `.env` file in the root of your cloned project.
2. Paste your copied **Web app URL** next to `VITE_GOOGLE_SHEETS_URL` like this:
   ```env
   VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/AKfycby...your_url_here.../exec
   ```
3. Restart your dev server (`npm run dev`) for the environment variable changes to take effect.

---

## 💬 Enabling Automated WhatsApp Messages (Optional)

We have built full **WhatsApp Automated Messaging** right into your Google Apps Script! Since it runs inside the Google Cloud, your WhatsApp API keys are completely secure and hidden from website visitors.

To activate it:
1. Go to [green-api.com](https://green-api.com) and create a free developer account.
2. Go to your Green-API dashboard and copy your **Instance ID** and **Token**.
3. In your Google Apps Script editor, update the three lines of config at the very top:
   ```javascript
   var ENABLE_WHATSAPP = true;                  // Change false to true
   var GREEN_API_INSTANCE_ID = "1101XXXXXX";    // Enter your Green-API Instance ID
   var GREEN_API_TOKEN = "your_token_here";     // Enter your Green-API ApiTokenInstance
   ```
4. Click **Save** (`Ctrl + S`).
5. **CRUCIAL**: Every time you modify your Google Apps Script, you must redeploy it so the web app gets the updates:
   - Click **Deploy** ➔ **Manage deployments**.
   - Click the **Pencil icon** (Edit) on the active deployment.
   - For **Version**, select **New version**.
   - Click **Deploy**.

🎉 **You're all set!** Any seats reserved on your website will now automatically populate your Google Sheet in real-time, save receipt screenshots in Google Drive, and instantly send a WhatsApp notification to the buyer's mobile number:
> *"Hi [Name], We have received your payment of ₹[Amount] for [Seats] seat(s) to [Screening]. We have received your payment, we will share the ticket soon! 🎟️✨"*

