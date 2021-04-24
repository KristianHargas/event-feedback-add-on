/**
* Retrieves database spreadsheet specified by the URL in Constants.gs under SPREADSHEET_URL field.
* The first sheet of this spreadsheet holds review data and the second sheet holds event preferences.
*
* @return {SpreadSheet} Database spreadsheet.
*/
function getSpreadsheet() {
  return SpreadsheetApp.openByUrl(SPREADSHEET_URL)
}

/**
* Retrieves data sheet which is the first sheet of the database spreadsheet specified by URL in Constants.gs under SPREADSHEET_URL field.
*
* @return {Sheet} Data sheet.
*/
function getDataSheet() {
  return getSpreadsheet().getSheets()[0]
}

/**
* Retrieves preferences sheet which is the second sheet of the database spreadsheet specified by URL in Constants.gs under SPREADSHEET_URL field.
*
* @return {Sheet} Preferences sheet.
*/
function getPreferencesSheet() {
  const spreadSheet = getSpreadsheet()

  // By default empty spreadsheet contains only one sheet; so check the number of sheets first and if there is only one - add preferences sheet.
  if (spreadSheet.getNumSheets() < 2) {
    spreadSheet.insertSheet(PREFERENCES_SHEET_NAME)
  }

  return getSpreadsheet().getSheets()[1]
}

/**
* Fetches reviews of given event from the speadsheet database.
*
* @param {Sheet} sheet Source sheet - should be the first (data) sheet of the database spreadsheet.
* @param {String} eventId The id of the event.
* @return {Object[]} Array of reviews of the given event; review structure is { date, email, rating, text }.
*/
function fetchReviewsOfEventFromDatabase(sheet, eventId) {
  const reviews = sheet
    .getDataRange()
    .getValues()
    // Filter only rows which contain the given eventId in the first column..
    .filter(row => row[0] === eventId)
    // Map each row to the review structure.
    .map(row => {
      const [, , , date, email, rating, text] = row
      return { date, email, rating, text }
    })

  // Return reversed reviews so the latest reviews are on top (very poor sorting strategy).
  return reviews.reverse()
}

/**
* Stores new review of the event in the spreadsheet database.
*
* @param {Sheet} sheet Source sheet - should be the first (data) sheet of the database spreadsheet.
* @param {String} eventId The id of the event.
* @param {String} eventTitle The title of the event.
* @param {String} organizerEmail The email of the event organizer.
* @param {String} reviewerEmail The email of the reviewer.
* @param {Number} rating Star rating (1-5).
* @param {String} text Text of the review.
* @return {Object} Newly stored review; review structure is { date, email, rating, text }.
*/
function storeReviewInDatabase(sheet, eventId, eventTitle, organizerEmail, reviewerEmail, rating, text) {
  const timestamp = getNow()

  // Format sheet if not already formatted - append header row, apply proper styles etc.
  formatDataSheet(sheet)

  sheet.appendRow([
    eventId,
    eventTitle,
    organizerEmail,
    formatDateTime(timestamp),
    reviewerEmail,
    rating,
    text
  ])

  return {
    date: timestamp,
    email: reviewerEmail,
    rating,
    text
  }
}

/**
* Fetches preferences of given event from the speadsheet database.
* If no entry for the given event is present, value of PREFERENCES_RECEIVE_NOTIFICATIONS_DEFAULT field from Constants.gs will be used as receiveNotifications option in returned object.
*
* @param {Sheet} sheet Source sheet - should be the second (preferences) sheet of the database spreadsheet.
* @param {String} eventId The id of the event.
* @return {Object} Preferences of the given event; preferences structure is { eventId, receiveNotifications }.
*/
function fetchPreferencesOfEventFromDatabase(sheet, eventId) {
  // Try to locate row with the given eventId.
  const rowRange = findRowRangeContainingValueInSheet(sheet, eventId)

  // No preferences for this event - return defaults.
  if (!rowRange) {
    return {
      eventId,
      receiveNotifications: PREFERENCES_RECEIVE_NOTIFICATIONS_DEFAULT
    }
  }

  // Select the whole row with preferences and extract data from columns.
  const [ _, receiveNotifications ] = rowRange.getValues()[0]

  return {
    eventId,
    receiveNotifications
  }
}

/**
* Updates 'Receive new feedback notifications' preferences of the given event in the speadsheet database.
*
* @param {Sheet} sheet Source sheet - should be the second (preferences) sheet of the database spreadsheet.
* @param {String} eventId The id of the event.
* @param {Boolean} receiveNotifications Boolean representing 'receive notifications' value.
*/
function updateReceiveNotificationsPrefsOfEventInDatabase(sheet, eventId, receiveNotifications) {
  // Format sheet if not already formatted - append header row, apply proper styles etc.
  formatPreferencesSheet(sheet)

  // Try to locate row with given eventId.
  const rowRange = findRowRangeContainingValueInSheet(sheet, eventId)

  // There are no preferences for given event - append new row.
  if (!rowRange) {
    sheet.appendRow([eventId, receiveNotifications])
    return
  }

  // Update cell of the second column of the row with the preferences.
  rowRange.getCell(1, 2).setValue(receiveNotifications)
}

/**
* Finds row in the sheet containing given value and returns its range.
*
* @param {Sheet} sheet Source sheet.
* @param {String} value The value to look for.
* @return {Range} Row range containing given value; null othervise.
*/
function findRowRangeContainingValueInSheet(sheet, value) {
  const cell = sheet
    .createTextFinder(value)
    .findNext()

  if (!cell)
    return null

  // Select whole row and return its range.
  return cell.getDataRegion(SpreadsheetApp.Dimension.COLUMNS)
}

/**
* Formats data sheet - appends header row if not present and applies proper styling.
* Additional settings of formatting can be configured in Constants.gs file under DATA_SHEET_NAME field and DATA_SHEET_HEADER_ROW respectively.
*
* @param {Sheet} sheet Source sheet - should be the first (data) sheet of the database spreadsheet.
*/
function formatDataSheet(sheet) {
  // Apply formatting only to empty sheet.
  if (sheet.getLastRow() == 0) {
    // Append header.
    sheet.appendRow(DATA_SHEET_HEADER_ROW)

    // Bolden header.
    sheet.getRange(1, 1, 1, DATA_SHEET_HEADER_ROW.length).setFontWeight("bold")

    // Center content of all cells.
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setHorizontalAlignment('center')

    // Set sheet's name.
    sheet.setName(DATA_SHEET_NAME)
  }
}

/**
* Formats preferences sheet - appends header row if not present and applies proper styling.
* Additional settings of formatting can be configured in Constants.gs file under PREFERENCES_SHEET_NAME field and PREFERENCES_HEADER_ROW respectively.
*
* @param {Sheet} sheet Source sheet - should be the second (preferences) sheet of the database spreadsheet.
*/
function formatPreferencesSheet(sheet) {
  // Apply formatting only to empty sheet.
  if (sheet.getLastRow() == 0) {
    // Append header.
    sheet.appendRow(PREFERENCES_HEADER_ROW)

    // Bolden header.
    sheet.getRange(1, 1, 1, PREFERENCES_HEADER_ROW.length).setFontWeight("bold")

    // Center content of all cells.
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setHorizontalAlignment('center')

    // Set sheet's name.
    sheet.setName(PREFERENCES_SHEET_NAME)
  }
}
