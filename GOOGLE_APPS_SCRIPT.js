// ====== CONFIGURATION ======
var ADMIN_EMAIL = "your-email@gmail.com";    // ← Replace with your own Gmail address to receive booking alerts
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
        "Payment Screenshot Link",
        "Verified"
      ]);
      sheet.getRange(1, 1, 1, 9)
        .setFontWeight("bold")
        .setBackground("#0f172a")
        .setFontColor("#ffffff");
    }

    // Save payment screenshot to Google Drive
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

    // Save booking data to Google Sheet
    sheet.appendRow([
      new Date(),
      data.name,
      data.whatsapp,
      data.email,
      data.screening,
      data.tickets,
      data.total,
      fileUrl,
      false // default value for "Verified" checkbox is unchecked
    ]);
    
    // Insert interactive checkbox in the 9th column
    sheet.getRange(sheet.getLastRow(), 9).insertCheckboxes();

    // ====== SEND CONFIRMATION EMAIL TO BUYER ======
    var buyerSubject = "🎟️ Your Reservation is Confirmed – The House of Finals";
    var buyerHtml = getBuyerHtml(data.name, data.screening, data.tickets, data.total, data.whatsapp);

    // Fallback plain text for email clients that do not support HTML
    var buyerBody = "Hi " + data.name + ",\n\n" +
      "We have received your payment of ₹" + data.total + " for " + data.tickets + " seat(s) to " + data.screening + ".\n\n" +
      "✅ Your payment receipt has been received and is under review.\n" +
      "We will share your ticket details very soon!\n\n" +
      "📅 Screening: " + data.screening + "\n" +
      "👥 Seats: " + data.tickets + "\n" +
      "💰 Amount Paid: ₹" + data.total + "\n" +
      "📱 WhatsApp: " + data.whatsapp + "\n\n" +
      "Venue: https://maps.app.goo.gl/mU4JRcm78LXGVa8o6\n" +
      "For any queries, reach us at: +91 8401 401 312\n\n" +
      "See you at the rooftop! 🏆\n" +
      "Team – The House of Finals";

    MailApp.sendEmail({
      to: data.email,
      subject: buyerSubject,
      body: buyerBody,
      htmlBody: buyerHtml
    });

    // ====== SEND ALERT EMAIL TO ADMIN ======
    var adminSubject = "🔔 New Reservation – " + data.name + " (" + data.tickets + " seats)";
    var adminHtml = getAdminHtml(data.name, data.whatsapp, data.email, data.screening, data.tickets, data.total, fileUrl);

    var adminBody = "New reservation received!\n\n" +
      "👤 Name: " + data.name + "\n" +
      "📱 WhatsApp: " + data.whatsapp + "\n" +
      "📧 Email: " + data.email + "\n" +
      "🎟️ Screening: " + data.screening + "\n" +
      "👥 Seats: " + data.tickets + "\n" +
      "💰 Total Cover: ₹" + data.total + "\n\n" +
      "📄 Payment Screenshot: " + (fileUrl || "No screenshot uploaded");

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: adminSubject,
      body: adminBody,
      htmlBody: adminHtml
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data saved and confirmation HTML emails sent"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Generates an elegant, fully responsive HTML email for the buyer
function getBuyerHtml(name, screening, tickets, total, whatsapp) {
  return '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '  <meta charset="utf-8">' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '  <title>Reservation Confirmed</title>' +
    '</head>' +
    '<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">' +
    '  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">' +
    '    <tr>' +
    '      <td align="center">' +
    '        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);">' +
    '          <!-- Header -->' +
    '          <tr>' +
    '            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 24px; text-align: center; border-bottom: 4px solid #f59e0b;">' +
    '              <span style="font-size: 11px; font-weight: 700; color: #f59e0b; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: 8px;">THE HOUSE OF FINALS</span>' +
    '              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">RESERVATION CONFIRMED</h1>' +
    '            </td>' +
    '          </tr>' +
    '          ' +
    '          <!-- Body -->' +
    '          <tr>' +
    '            <td style="padding: 35px 24px;">' +
    '              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #1e293b;">' +
    '                Hi <strong>' + name + '</strong>,' +
    '              </p>' +
    '              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">' +
    '                We have received your payment of <strong>₹' + total.toLocaleString("en-IN") + '</strong> for <strong>' + tickets + ' seat(s)</strong>. Your reservation is under review and will be verified shortly!' +
    '              </p>' +
    '              ' +
    '              <!-- Green Alert Badge -->' +
    '              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 28px;">' +
    '                <tr>' +
    '                  <td style="padding: 16px;">' +
    '                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #15803d;">' +
    '                      ✓ Payment Receipt Received' +
    '                    </p>' +
    '                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #166534; line-height: 1.4;">' +
    '                      Our team is validating your transaction screenshot. We will share your entry ticket details very soon!' +
    '                    </p>' +
    '                  </td>' +
    '                </tr>' +
    '              </table>' +
    '              ' +
    '              <!-- Ticket Details -->' +
    '              <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase;">BOOKING DETAILS</h3>' +
    '              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">' +
    '                <tr>' +
    '                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569;">Selected Screening</td>' +
    '                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">' + screening + '</td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569;">No. of Seats</td>' +
    '                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">' + tickets + ' Seat(s)</td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569;">Cover Charges</td>' +
    '                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">₹' + (total / tickets).toLocaleString("en-IN") + ' / seat</td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 14px 18px; font-size: 14px; color: #475569; font-weight: 600;">Total Paid (Fully Redeemable)</td>' +
    '                  <td style="padding: 14px 18px; font-size: 18px; font-weight: 800; color: #10b981; text-align: right;">₹' + total.toLocaleString("en-IN") + '</td>' +
    '                </tr>' +
    '              </table>' +
    '              ' +
    '              <!-- Action Button -->' +
    '              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px;">' +
    '                <tr>' +
    '                  <td align="center">' +
    '                    <a href="https://maps.app.goo.gl/mU4JRcm78LXGVa8o6" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 16px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); border: 1px solid #0f172a;">' +
    '                      📍 View Venue Location' +
    '                    </a>' +
    '                  </td>' +
    '                </tr>' +
    '              </table>' +
    '            </td>' +
    '          </tr>' +
    '          ' +
    '          <!-- Footer -->' +
    '          <tr>' +
    '            <td style="background-color: #0f172a; padding: 28px 24px; text-align: center;">' +
    '              <p style="margin: 0; font-size: 13px; color: #94a3b8;">' +
    '                Have any questions? Drop us a WhatsApp or call:' +
    '              </p>' +
    '              <p style="margin: 4px 0 16px 0; font-size: 15px; font-weight: 700; color: #ffffff;">' +
    '                📞 +91 8401 401 312' +
    '              </p>' +
    '              <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b;">' +
    '                © 2026 The House of Finals. Rooftop screenings like never before.' +
    '              </div>' +
    '            </td>' +
    '          </tr>' +
    '        </table>' +
    '      </td>' +
    '    </tr>' +
    '  </table>' +
    '</body>' +
    '</html>';
}

// Generates an elegant, structured HTML email notification for the Admin/Client
function getAdminHtml(name, whatsapp, email, screening, tickets, total, fileUrl) {
  var screenshotHtml = "";
  if (fileUrl && fileUrl.indexOf("http") === 0) {
    screenshotHtml = '<a href="' + fileUrl + '" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 15px 25px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);">📄 View Payment Screenshot</a>';
  } else {
    screenshotHtml = '<span style="color: #ef4444; font-size: 13px; font-weight: 600;">⚠️ No screenshot or error saving to Drive</span>';
  }

  return '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '  <meta charset="utf-8">' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '  <title>New Reservation Alert</title>' +
    '</head>' +
    '<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #334155;">' +
    '  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 10px;">' +
    '    <tr>' +
    '      <td align="center">' +
    '        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">' +
    '          <!-- Header -->' +
    '          <tr>' +
    '            <td style="background-color: #0f172a; padding: 30px 24px; text-align: center; border-bottom: 4px solid #10b981;">' +
    '              <span style="font-size: 11px; font-weight: 700; color: #10b981; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">DASHBOARD NOTIFICATION</span>' +
    '              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">🔔 NEW BOOKING RECEIVED</h1>' +
    '            </td>' +
    '          </tr>' +
    '          ' +
    '          <!-- Body -->' +
    '          <tr>' +
    '            <td style="padding: 30px 24px;">' +
    '              <p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; line-height: 1.5;">' +
    '                A new reservation has been made on the website. Here are the customer and payment details:' +
    '              </p>' +
    '              ' +
    '              <!-- Details Table -->' +
    '              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">' +
    '                <tr>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600; width: 40%;">CUSTOMER NAME</td>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">' + name + '</td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">WHATSAPP MOBILE</td>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;"><a href="https://wa.me/' + whatsapp.replace(/[+\-\s()]/g, "") + '" style="color: #10b981; text-decoration: none;">💬 ' + whatsapp + '</a></td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">EMAIL ID</td>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;"><a href="mailto:' + email + '" style="color: #0f172a; text-decoration: none;">✉️ ' + email + '</a></td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">SCREENING NIGHT</td>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">' + screening + '</td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">SEAT COUNT</td>' +
    '                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">' + tickets + ' Seat(s)</td>' +
    '                </tr>' +
    '                <tr>' +
    '                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b; font-weight: 600;">TOTAL COVER PAID</td>' +
    '                  <td style="padding: 12px 16px; font-size: 16px; font-weight: 800; color: #10b981;">₹' + total.toLocaleString("en-IN") + '</td>' +
    '                </tr>' +
    '              </table>' +
    '              ' +
    '              <!-- Receipt Button -->' +
    '              <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
    '                <tr>' +
    '                  <td align="center">' +
    '                    ' + screenshotHtml +
    '                  </td>' +
    '                </tr>' +
    '              </table>' +
    '            </td>' +
    '          </tr>' +
    '          ' +
    '          <!-- Footer -->' +
    '          <tr>' +
    '            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b;">' +
    '              This is an automated operational email. Record is also updated in your Google Sheet.' +
    '            </td>' +
    '          </tr>' +
    '        </table>' +
    '      </td>' +
    '    </tr>' +
    '  </table>' +
    '</body>' +
    '</html>';
}

function testEmail() {
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: "🎟️ Test Email Setup - The House of Finals",
    body: "If you received this email, the Google Apps Script is successfully configured to send reservation notifications! 🎉",
    htmlBody: getBuyerHtml("John Doe", "UCL Finals (PSG V/S Arsenal) - 30th May 2026", 2, 1000, "+91 98765 43210")
  });
}
