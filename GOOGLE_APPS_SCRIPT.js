// ====== CONFIGURATION ======
var ENABLE_WHATSAPP = true;                  // Set to true to enable automated WhatsApp messages
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
