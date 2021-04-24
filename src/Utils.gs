/**
* Creates response action with snackbar notification.
*
* @param {String} message The message to be shown in notification.
* @return {ActionResponse} Action response with notification.
*/
function createResponseNotification(message) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText(message))
    .build()
}

/**
* Converts date to user-friendly readable format.
*
* @param {Object} date The string representation of the date or Date object itself.
* @return {String} Formatted string.
*/
function formatDateTime(date) {
  return Utilities.formatDate(new Date(date), 'Europe/Prague', 'd. M. yyyy HH:mm')
}

/**
* Returns the current date.
*
* @return {Date} Current date.
*/
function getNow() {
  return new Date()
}

/**
* Returns email of the current user.
*
* @return {String} Email of the current user.
*/
function getCurrentUser() {
  return Session.getActiveUser().getEmail()
}

/**
* Retrieves detail information about the calendar event.
*
* @param {String} calendarId The id of the user calendar (email).
* @param {String} eventId The id of the event.
* @return {CalendarEvent} Calendar event object containing information about the event.
*/
function getCalendarEvent(calendarId, eventId) {
  return CalendarApp.getCalendarById(calendarId).getEventById(eventId)
}

/**
* Finds review in the array of reviews by reviewer email and returns it.
*
* @param {Object[]} reviews Reviews to search through; review structure is { date, email, rating, text }.
* @param {String} email Reviewer email which is used as the filter criteria.
* @return {Object} Review object when the review with the given reviewer email is found; null otherwise.
*/
function findReviewByEmail(reviews, email) {
  return reviews.find(review => review.email === email)
}

/**
* Filters array of reviews and returns new array with review matching the provided reviewer email being excluded. 
*
* @param {Object[]} reviews Reviews to filter; review structure is { date, email, rating, text }.
* @param {String} email Reviewer email which is used as filter criteria and review with this email gets excluded.
* @return {Object[]} Filtered reviews.
*/
function filterReviewsByEmailExcluded(reviews, email) {
  return reviews.filter(review => review.email !== email)
}

/**
* Calculates and returns the average rating for the given array of reviews. 
*
* @param {Object[]} reviews Reviews which are used in calculation; review structure is { date, email, rating, text }.
* @return {Number} Average rating.
*/
function getAverageRating(reviews) {
  if (reviews.length === 0) return undefined

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.length
}

/**
* Returns an array of emails of domain attendees who haven't reviewed the event yet.
*
* @param {Object[]} reviews Reviews of the event; review structure is { date, email, rating, text }.
* @param {EventGuest[]} attendees All attendees of the event.
* @return {String[]} An array of domain attendee emails who haven't reviewed yet.
*/
function getEmailsOfDomainAttendeesWhoHaventReviewed(reviews, attendees) {
  const reviewerEmails = reviews.map(review => review.email)
  // Get only attendees of this event from the current domain.
  const attendeeEmails = getEmailsOfDomainAttendees(attendees)
  return attendeeEmails.filter(attendee => !reviewerEmails.includes(attendee))
}

/**
* Filters all attendees of the event and returns an array of emails of domain attendees only.
*
* @param {EventGuest[]} attendees All attendees of the event.
* @return {String[]} An array of domain attendee emails.
*/
function getEmailsOfDomainAttendees(attendees) {
  return attendees
    .map(attendee => attendee.getEmail())
    .filter(attendee => attendee.endsWith(DOMAIN))
}

/**
* Returns the count of domain attendees of the event.
*
* @param {CalendarEvent} calendarEvent The calendar event containing information about the event.
* @return {Number} The count of domain attendees of the event.
*/
function getDomainAttendeesCount(calendarEvent) {
  return getEmailsOfDomainAttendees(calendarEvent.getGuestList()).length
}

/**
* Escapes provided string so it doesn't break the HTML markup.
* Credits: https://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery/12034334#12034334
*
* @param {String} string The string to escape.
* @return {String} Escaped string.
*/
function escapeHtml (string) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }

  return String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s])
}

/**
* Creates and returns calendar event link which can be shared.
* Inspiration:  https://stackoverflow.com/questions/53928044/how-do-i-construct-a-link-to-a-google-calendar-event/53928045#53928045
*               https://webapps.stackexchange.com/questions/18959/can-i-form-a-direct-url-to-a-particular-gmail-account
*
* @param {String} eventId The id of the event.
* @param {String} email The email of the user who should open the link (basically it's the id of his/her calendar).
* @return {String} Event link.
*/
function getViewCalendarEventLink(eventId, email) {
  // Example of eventId of one-time event: 6hh30d9o6pj34b9k6gsjab9k6li3cbb26sojgbb261hjiopo6gs3gob46o
  // Example of eventId of recurring event: 6hh30d9o6pj34b9k6gsjab9k6li3cbb26sojgbb261hjiopo6gs3gob46o_20210409T120000Z

  // Create final event id from eventId and calendarId (email).
  let completeEventId = Utilities.base64Encode(`${eventId} ${email}`)

  // Get rid of trailing '==' or '=' which is used as 'padding' in base64 string.
  while (completeEventId.endsWith('=')) {
    completeEventId = completeEventId.slice(0, completeEventId.length - 1)
  }
  
  return Utilities.formatString(EVENT_SHARE_LINK, email, completeEventId)
}
