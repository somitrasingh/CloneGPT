const { google } = require('googleapis');
const sheets = google.sheets('v4');
const fs = require('fs');

// Load your service account key (the JSON file you downloaded)
const auth = new google.auth.GoogleAuth({
  keyFile: './google-credentials.json', // Replace with the actual path to your key file
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// The ID of your Google Sheet (you can find this in the URL of the sheet)
const spreadsheetId = '1m8QB9ACtBzUHwh-XgUfhdIvboQuk7NT9zRfuhUPtEcs'; // Replace with your sheet's ID

// Function to append data to the Google Sheet
async function addToSheet(data) {
  const client = await auth.getClient();
  
  const request = {
    spreadsheetId,
    range: 'Sheet1!A:C', // Update the range according to your sheet's structure
    valueInputOption: 'RAW',
    resource: {
      values: data,
    },
    auth: client,
  };

  try {
    const response = await sheets.spreadsheets.values.append(request);
    
  } catch (err) {
    console.error('Error adding data to sheet:', err);
  }
}

module.exports = { addToSheet };
