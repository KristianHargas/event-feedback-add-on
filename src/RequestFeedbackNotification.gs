/**
* HTML template representing 'Feedback request' email notification.
* Use Utilities.formatString() to replace %s with proper data.
*/
const REQUEST_FEEDBACK_NOTIFICATION_HTML_TEMPLATE = `
  <head lang="sk">
	  <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="font-family: sans-serif;">
	<p>Ahoj, bolo by skvelé, keby si si našiel alebo našla čas <b>ohodnotiť udalosť</b> <b style="color: %s;">%s</b>.</p>
	<p>Udalosť ohodnotíš cez <b>web Google kalendára na stolovom počítači</b> prostredníctvom rozšírenia <b>%s</b>. Táto funkcionalita žiaľ zatiaľ nie je na mobilných zariadeniach podporovaná.</p>
	
	<div style="text-align: center;">
		<a href="%s" style="display: inline-block; margin: 30px 0; padding: 1.25em 2em; background-color: %s; text-decoration: none; color: white; font-weight: bold; text-transform: uppercase;">
			Prejsť na udalosť
		</a>
	</div>

	<p>Veľmi si vážime tvoj názor a ďakujeme zaň! :)</p>
</body>
</html>
`

/**
* Plain text template representing 'Feedback request' email notification.
* Use Utilities.formatString() to replace %s with appropriate data.
*/
const REQUEST_FEEDBACK_NOTIFICATION_PLAIN_TEXT_TEMPLATE = ''
  + 'Ahoj, bolo by skvelé, keby si si našiel alebo našla čas ohodnotiť udalosť %s.\n\n'
  + 'Udalosť ohodnotíš cez web Google kalendára na stolovom počítači prostredníctvom rozšírenia %s. Táto funkcionalita žiaľ zatiaľ nie je na mobilných zariadeniach podporovaná.\n\n'
  + 'Link na udalosť:\n%s\n\n'
  + 'Veľmi si vážime tvoj názor a ďakujeme zaň! :)'

/**
* Fills REQUEST_FEEDBACK_NOTIFICATION_HTML_TEMPLATE template with the data provided and returns it.
*
* @param {String} eventTitle The title of the event.
* @param {String} eventUrl Event link URL.
* @param {String} appName The name of the add-on.
* @param {String} highlightColor Highlight color used to emphasize elements of the template (text, button background, etc.).
* @return {String} 'Feedback request' notification HTML template filled with the data.
*/
function createRequestFeedbackNotificationHtmlMessage(eventTitle, eventUrl, appName, highlightColor) {
  return Utilities.formatString(REQUEST_FEEDBACK_NOTIFICATION_HTML_TEMPLATE, highlightColor, escapeHtml(eventTitle), appName, eventUrl, highlightColor)
}

/**
* Fills REQUEST_FEEDBACK_NOTIFICATION_PLAIN_TEXT_TEMPLATE template with the data provided and returns it.
*
* @param {String} eventTitle The title of the event.
* @param {String} eventUrl Event link URL.
* @param {String} appName The name of the add-on (app).
* @return {String} 'Feedback request' notification plain text template filled with the data.
*/
function createRequestFeedbackNotificationPlainTextMessage(eventTitle, eventUrl, appName) {
  return Utilities.formatString(REQUEST_FEEDBACK_NOTIFICATION_PLAIN_TEXT_TEMPLATE, eventTitle, appName, eventUrl)
}

/**
* Sends 'Feedback request' email notification to the group of users specified.
*
* @param {String} eventId The id of the event.
* @param {String} eventTitle The title of the event.
* @param {String[]} recipientEmails Array of recipient emails.
*/
function sendRequestFeedbackNotifications(eventId, eventTitle, recipientEmails) {
  recipientEmails.forEach(recipientEmail => {
    // Get event link which can be shared.
    const eventUrl = getViewCalendarEventLink(eventId, recipientEmail)
    sendRequestFeedbackNotification(eventTitle, recipientEmail, eventUrl)
  })
}

/**
* Sends 'Feedback request' email notification to the user specified.
*
* @param {String} eventTitle The title of the event.
* @param {String} recipientEmail The email of the recipient.
* @param {String} eventUrl Event link URL.
*/
function sendRequestFeedbackNotification(eventTitle, recipientEmail, eventUrl) {
  MailApp.sendEmail(
    recipientEmail, 
    `${APP_NAME} - Feedback Request`,
    createRequestFeedbackNotificationPlainTextMessage(eventTitle, eventUrl, APP_NAME),
    { htmlBody: createRequestFeedbackNotificationHtmlMessage(eventTitle, eventUrl, APP_NAME, COLORS.SECONDARY) }
  )
}
