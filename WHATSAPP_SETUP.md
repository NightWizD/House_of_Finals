# 💬 WhatsApp Automation Guide

This guide outlines the different ways to send automated WhatsApp confirmation messages to your users. You can choose the method that best fits your budget and technical preference.

---

## 🚀 Option 1: Client-Side Redirection (100% Free & Zero Setup)
This method automatically opens the user's WhatsApp (Web or Mobile App) immediately after they confirm their booking, with a pre-filled confirmation message ready to send.

### 💡 Benefits:
- **100% Free** (No subscription or API fees)
- **Zero Configuration** (No accounts, tokens, or instance IDs required)
- **Instant Implementation**

### 🛠️ How it works:
When the user clicks "Confirm & Reserve Seat", the form is submitted to Google Sheets, and the browser instantly opens:
`https://wa.me/{user_phone}?text={encoded_message}`

---

## 🤖 Option 2: Automated Background Sender via Green-API (Hands-Free)
This method sends the message automatically in the background directly to the user's phone, without opening any WhatsApp tabs on the browser. 

### 💡 Benefits:
- **Completely Automated** (No user action required)
- **Runs in the background** via Google Apps Script
- **Saves credentials securely** in your private Google Cloud environment

### 🛠️ Step-by-Step Setup:

#### 1. Get a Free Gateway Account
1. Go to [green-api.com](https://green-api.com) and create a free developer account.
2. Scan the QR code in your Green-API dashboard with your WhatsApp to connect your number.
3. Copy your **Instance ID** and **Token** from the dashboard.

#### 2. Update Google Apps Script
Open your **Extensions ➔ Apps Script** in your spreadsheet, paste the code below at the very top of your script editor, and click **Save**:

```javascript
// ====== WHATSAPP CONFIGURATION ======
var ENABLE_WHATSAPP = true;                   // Change to true to activate
var GREEN_API_INSTANCE_ID = "1234567890";     // Paste your Instance ID here
var GREEN_API_TOKEN = "your_token_here";      // Paste your Token here
var CLIENT_ADMIN_NUMBER = "919876543210";     // Replace with your client's WhatsApp number (with country code, e.g. 91 for India)
// ====================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Automatically initialize headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Full Name", "WhatsApp Mobile No.", "Email Id", "Selected Screening", "No. Of Tickets", "Total Cover (₹)", "Payment Screenshot Link"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
    }
    
    var fileUrl = "";
    if (data.image && data.imageName) {
      try {
        var folder;
        var folderName = "Event Booking Receipts";
        var folders = DriveApp.getFoldersByName(folderName);
        folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
        var base64Data = data.image.split(",")[1] || data.image;
        var decoded = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(decoded, data.imageType || "image/jpeg", data.imageName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
      } catch (err) {
        fileUrl = "Error: " + err.message;
      }
    }
    
    sheet.appendRow([new Date(), data.name, data.whatsapp, data.email, data.screening, data.tickets, data.total, fileUrl]);
    
    // Send Automated WhatsApp messages if enabled
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
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

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

#### 3. Redeploy your Script
Every time you edit your Apps Script code, you must publish the new version:
1. Click **Deploy** ➔ **Manage deployments**.
2. Click the **Pencil icon** (Edit) on your web app deployment.
3. In the **Version** dropdown, select **New version**.
4. Click **Deploy**.

---

## 💬 Option 3: Enterprise Background Sender via Twilio (Scale API)
For production-grade scalability using Meta's official WhatsApp Business Cloud API.

### 💡 Benefits:
- **Verified Business Badge** (Green tick potential)
- **High Deliverability & Reliability**
- **Twilio sandbox testing** is completely free

### 🛠️ Google Apps Script Integration code:
Simply replace the `sendWhatsAppMessage` function at the bottom of your Google Apps Script with the Twilio endpoint:

```javascript
function sendWhatsAppMessage(phone, message) {
  var accountSid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Your Twilio Account SID
  var authToken = "your_auth_token_here";                  // Your Twilio Auth Token
  var twilioNumber = "whatsapp:+14155238886";             // Your Twilio Sandbox Number
  
  var cleanPhone = phone.replace(/[+\-\s()]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }
  
  var url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";
  
  var payload = {
    "To": "whatsapp:+" + cleanPhone,
    "From": twilioNumber,
    "Body": message
  };
  
  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Basic " + Utilities.base64Encode(accountSid + ":" + authToken)
    },
    "payload": payload,
    "muteHttpExceptions": true
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log("Twilio Error: " + err.message);
  }
}
```
