/**
* HTML template representing 'New feedback' email notification.
* Use Utilities.formatString() to replace %s with appropriate data.
*/
const NEW_FEEDBACK_NOTIFICATION_HTML_TEMPLATE = `
  <!DOCTYPE html>
  <html>
  <head lang="sk">
    <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
  </head>
  <body style="font-family: sans-serif;">
    <p>Ahoj, obdržali sme <b>nové hodnotenie udalosti</b> <b style="color: %s;">%s</b>.</p>
    <p>Tento feedback spolu so všetkými ostatnými si môžeš pozrieť cez <b>web Google kalendára na stolovom počítači</b> prostredníctvom rozšírenia <b>%s</b>. Táto funkcionalita žiaľ zatiaľ nie je na mobilných zariadeniach podporovaná.</p>
    
    <div style="margin: 50px 10px 0 10px;">
      <table style="max-width: 650px; border: 3px solid %s; border-collapse: collapse; margin: 0 auto;">
        <tr>
          <td style="border: 3px solid %s; padding: 1em; font-weight: bold;">Udalosť</td>
          <td style="border: 3px solid %s; padding: 1em;">%s</td>
        </tr>
        <tr>
          <td style="border: 3px solid %s; padding: 1em; font-weight: bold;">Hodnotiteľ</td>
          <td style="border: 3px solid %s; padding: 1em;">%s</td>
        </tr>
        <tr>
          <td style="border: 3px solid %s; padding: 1em; font-weight: bold;">Dátum hodnotenia</td>
          <td style="border: 3px solid %s; padding: 1em;">%s</td>
        </tr>
        <tr>
          <td style="border: 3px solid %s; padding: 1em; font-weight: bold;">Rating</td>
          <td style="border: 3px solid %s; padding: 1em;">%s/5</td>
        </tr>
        <tr>
          <td style="border: 3px solid %s; padding: 1em; font-weight: bold;">Slovné hodnotenie</td>
          <td style="border: 3px solid %s; padding: 1em;">%s</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 30px 0 50px 0;">
      <a href="%s" style="display: inline-block; padding: 1.25em 2em; background-color: %s; text-decoration: none; color: white; font-weight: bold; text-transform: uppercase;">
        Prejsť na udalosť
      </a>
    </div>

    <p>Snáď ťa feedback potešil :)</p>
  </body>
  </html>
`

/**
* Plain text template representing 'New feedback' email notification.
* Use Utilities.formatString() to replace %s with appropriate data.
*/
const NEW_FEEDBACK_NOTIFICATION_PLAIN_TEXT_TEMPLATE = ''
  + 'Ahoj, obdržali sme nové hodnotenie udalosti %s.\n\n'
  + 'Tento feedback spolu so všetkými ostatnými si môžeš pozrieť cez web Google kalendára na stolovom počítači prostredníctvom rozšírenia %s. Táto funkcionalita žiaľ zatiaľ nie je na mobilných zariadeniach podporovaná.\n\n'
  + 'Udalosť: %s\n'
  + 'Hodnotiteľ: %s\n'
  + 'Dátum hodnotenia: %s\n'
  + 'Rating: %s/5\n'
  + 'Slovné hodnotenie: %s\n\n'
  + 'Link na udalosť:\n%s\n\n'
  + 'Snáď ťa feedback potešil :)'

/**
* Fills NEW_FEEDBACK_NOTIFICATION_HTML_TEMPLATE template with the data provided and returns it.
*
* @param {String} eventTitle The title of the event.
* @param {Object} review Newly added review; review structure is { date, email, rating, text }.
* @param {String} eventUrl Event link URL.
* @param {String} appName The name of the add-on.
* @param {String} highlightColor Highlight color used to emphasize elements of the template (text, button background, etc.).
* @param {String} tableColor Color of the review table's frame.
* @return {String} 'New feedback' notification HTML template filled with the data.
*/
function createNewFeedbackNotificationHtmlMessage(eventTitle, review, eventUrl, appName, highlightColor, tableColor) {
  return Utilities.formatString(NEW_FEEDBACK_NOTIFICATION_HTML_TEMPLATE,
    highlightColor, escapeHtml(eventTitle), appName, tableColor,
    tableColor, tableColor, escapeHtml(eventTitle),
    tableColor, tableColor, review.email,
    tableColor, tableColor, formatDateTime(review.date),
    tableColor, tableColor, review.rating,
    tableColor, tableColor, (review.text && escapeHtml(review.text)) || NO_TEXT_REVIEW_PLACEHOLDER,
    eventUrl, highlightColor
  )
}

/**
* Fills NEW_FEEDBACK_NOTIFICATION_PLAIN_TEXT_TEMPLATE template with the data provided and returns it.
*
* @param {String} eventTitle The title of the event.
* @param {Object} review Newly added review; review structure is { date, email, rating, text }.
* @param {String} eventUrl Event link URL.
* @param {String} appName The name of the add-on.
* @return {String} 'New feedback' notification plain text template filled with data.
*/
function createNewFeedbackNotificationPlainTextMessage(eventTitle, review, eventUrl, appName) {
  return Utilities.formatString(NEW_FEEDBACK_NOTIFICATION_PLAIN_TEXT_TEMPLATE,
    eventTitle, appName,
    eventTitle, review.email, formatDateTime(review.date), review.rating, review.text || NO_TEXT_REVIEW_PLACEHOLDER,
    eventUrl  
  )
}

/**
* Sends 'New feedback' email notification to the user specified.
*
* @param {String} eventId The id of the event.
* @param {String} eventTitle The title of the event.
* @param {Object} review Newly added review; review structure is { date, email, rating, text }.
* @param {String} recipientEmail The email of the recipient.
*/
function sendNewFeedbackNotification(eventId, eventTitle, review, recipientEmail) {
  // Get event link which can be shared.
  const eventUrl = getViewCalendarEventLink(eventId, recipientEmail)

  MailApp.sendEmail(
    recipientEmail,
    `${APP_NAME} - New Feedback`,
    createNewFeedbackNotificationPlainTextMessage(eventTitle, review, eventUrl, APP_NAME),
    { htmlBody: createNewFeedbackNotificationHtmlMessage(eventTitle, review, eventUrl, APP_NAME, COLORS.SECONDARY, COLORS.PRIMARY) }
  )
}
