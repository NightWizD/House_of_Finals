# 📊 Google Sheets & Email Setup Guide

Follow these simple steps to connect your booking form to a Google Sheet and automatically send premium email confirmations to your buyers and alert notifications to you!

This script automatically:
1. Saves all reservations into a Google Sheet.
2. **Saves user-uploaded payment receipt screenshots directly to your Google Drive**, listing the links in your sheet!
3. Sends a beautiful email confirmation to the buyer instantly.
4. Sends an instant alert email to the admin with the buyer's full details and receipt.

---

## 🛠️ Setup Instructions (2 Minutes)

### Step 1: Create a Google Spreadsheet
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Give your spreadsheet a name (e.g., `Event Glide Bookings`).

### Step 2: Open Google Apps Script
1. In the top menu of your spreadsheet, click on **Extensions** ➔ **Apps Script**.
2. Delete any default code in the editor (usually `function myFunction() {}`).

### Step 3: Paste the Deployment Code
1. Copy and paste the complete code block from `GOOGLE_APPS_SCRIPT.js` into the editor.
2. On line 2, replace `"your-email@gmail.com"` with your actual Gmail address to receive the booking alerts:
   ```javascript
   var ADMIN_EMAIL = "your-actual-email@gmail.com";
   ```
3. Click the **Save** icon (floppy disk) at the top of the editor or press `Ctrl + S`.

### Step 4: Authorize and Test your Email Setup
1. In the toolbar of the Apps Script editor, click on the **Run** button or run a simple function to trigger the authorization modal.
2. If prompted, click **Review Permissions** or **Authorize Access**, select your Google Account, click **Advanced** ➔ **Go to Untitled project (unsafe)**, and click **Allow**.
3. *Note:* This gives the script permission to save receipt screenshots to your Google Drive and send emails on your behalf via standard Google `MailApp`.

### Step 5: Deploy as a Web App (Crucial)
1. Click the **Deploy** button (blue button in top right) ➔ Select **New deployment**.
2. Click the **Gear icon** next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Event Glide Booking Form`
   - **Execute as**: **Me (your-email@gmail.com)**
   - **Who has access**: **Anyone** *(This is required so the website form can submit to it)*
4. Click **Deploy**.
5. Copy the generated **Web app URL** (it ends with `/exec`).

### Step 6: Configure your Website
1. Open the `.env` file in the root of your project.
2. Paste your copied **Web app URL** next to `VITE_GOOGLE_SHEETS_URL` like this:
   ```env
   VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/AKfycby...your_url_here.../exec
   ```
3. Restart your dev server (`npm run dev`) for the environment variable changes to take effect.

---

## 📧 Testing the Flow

Once everything is deployed:
1. Fill out the reservation form on the website.
2. Upload a test payment receipt screenshot.
3. Click **Confirm & Reserve Seat**.
4. Check your Google Sheet to verify the data was appended and the screenshot was saved in Google Drive.
5. Check the buyer's inbox (and your admin inbox) for the beautiful, instant confirmation emails!
