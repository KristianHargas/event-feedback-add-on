/**
* Stores new review of the event; in this case to the database.
* Database is the first sheet (data sheet) of the spreadsheet defined in Constants.gs under SPREADSHEET_URL field.
*
* @param {String} eventId The id of the event.
* @param {String} eventTitle The title of the event.
* @param {String} organizerEmail The email of the event's organizer.
* @param {String} reviewerEmail The email of the reviewer.
* @param {Number} rating Star rating (1-5).
* @param {String} text Text of the review.
* @return {Object} Newly created review; review structure is { date, email, rating, text }.
*/
function storeReviewOfEvent(eventId, eventTitle, organizerEmail, reviewerEmail, rating, text) {
  return storeReviewInDatabase(getDataSheet(), eventId, eventTitle, organizerEmail, reviewerEmail, rating, text)
}

/**
* Retrieves the reviews of the event with the given id; in this case from the database.
* Database is the first sheet (data sheet) of the spreadsheet defined in Constants.gs under SPREADSHEET_URL field.
*
* @param {String} eventId The id of the event.
* @return {Object[]} Array of event reviews; review structure is { date, email, rating, text }.
*/
function retrieveReviewsOfEvent(eventId) {
  return fetchReviewsOfEventFromDatabase(getDataSheet(), eventId)
}

/**
* Updates 'Receive new feedback notifications' preferences of the event; in this case in the database.
* Database is the second sheet (preferences sheet) of the spreadsheet defined in Constants.gs under SPREADSHEET_URL field.
*
* @param {String} eventId The id of the event.
* @param {Boolean} receiveNotifications Boolean representing 'receive notifications' value.
*/
function updateReceiveNotificationsPreferencesOfEvent(eventId, receiveNotifications) {
  updateReceiveNotificationsPrefsOfEventInDatabase(getPreferencesSheet(), eventId, receiveNotifications)
}

/**
* Retrieves the preferences of the event with the given id; in this case from the database.
* Database is the second sheet (preferences sheet) of the spreadsheet defined in Constants.gs under SPREADSHEET_URL field.
*
* @param {String} eventId The id of the event.
* @return {Object} Preferences of the event; preferences structure is { eventId, receiveNotifications }.
*/
function retrievePreferencesOfEvent(eventId) {
  return fetchPreferencesOfEventFromDatabase(getPreferencesSheet(), eventId)
}
