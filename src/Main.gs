/**
* Renders the home page for the add-on.
* This function is called when add-on is opened but no event is selected.
*
* @param {Object} _event Event object describing event that occured.
* @return {Card} Card (UI) to display.
*/
function onHomePage(_event) {
  const message = ''
    + 'Ahoj, toto je modul pre získavanie <b>feedbacku</b> ku kalendárovým udalostiam :)' + '<br><br>'
    + 'Začni <b>výberom nejakej udalosti</b> kalendára.'

  return createTextCard(message)
}

/**
* Renders the contextual interface for a calendar event.
* This function is called when particular event is selected and add-on is opened.
*
* @param {Object} event Event object describing event that occured (including info about selected event under event.calendar).
* @return {Card} Card (UI) to display.
*/
function onCalendarEventOpen(event) {
  // Get calendar event object so we can access event title etc.
  const calendarEvent = getCalendarEvent(event.calendar.calendarId, event.calendar.id)

  // Event is being created but not saved yet.
  if (!calendarEvent) {
    return createErrorCard('Informácie o udalosti nenájdené, asi ešte nie je uložená.')
  }

  const currentUser = getCurrentUser()
  const organizer = calendarEvent.getCreators()[0]
  
  // Get reviews of selected event from the store (sheet).
  let reviews = []

  try {
    reviews = retrieveReviewsOfEvent(event.calendar.id)
  } catch (ex) {
    return createErrorCard('Chyba pri načítavaní feedbacku.')
  }

  // Current user is the organizer of the event.
  if (currentUser === organizer) {
    // Get preferences so 'Receive new feedback notifications preferences' switch has proper default value.
    let preferences = []

    try {
      preferences = retrievePreferencesOfEvent(event.calendar.id)
    } catch (ex) {
      return createErrorCard('Chyba pri načítavaní preferencií.')
    }

    // Return UI for the organizer of the event.
    return createOrganizerCard(
      calendarEvent,
      reviews,
      getDomainAttendeesCount(calendarEvent),
      preferences,
      'onSendNotificationsButtonClick',
      'onPreferencesReceiveNotificationsSwitchChange'
    )
  }

  // Current user is an attendee; try to find his/her review.
  const attendeeReview = findReviewByEmail(reviews, currentUser)

  // Current user is an attendee who already reviewed.
  if (attendeeReview) {
    // Return feedback summary card with anonymous list of other reviews.
    return createAttendeeFeedbackSummaryCard(
      calendarEvent,
      reviews,
      currentUser,
      getDomainAttendeesCount(calendarEvent)
    )
  }
  
  // Current user is an attendee who hasn't reviewed yet; return feedback form UI.
  return createAttendeeFeedbackFormCard(
    calendarEvent,
    'onStarRatingClick'
  )
}

/**
* This function is called when 'Send notifications' button of organizer's card (UI) is clicked.
* Function sends notifications to all attendees of the current domain (defined in Constants.gs under DOMAIN field) who haven't reviewed yet.
* Response notification includes information about how many notifications were sent.
*
* @param {Object} event Event object describing event that occured (including info about selected event under event.calendar).
* @return {ActionResponse} Action response with the snackbar notification containing the result of the action.
*/
function onSendNotificationsButtonClick(event) {
  // Get calendar event object so we can access event title etc.
  const calendarEvent = getCalendarEvent(event.calendar.calendarId, event.calendar.id)

  // Event details not found.
  if (!calendarEvent) {
    return createResponseNotification('Informácie o udalosti nenájdené')
  }

  // All reviews of the currently selected event.
  let reviews = []

  try {
    reviews = retrieveReviewsOfEvent(event.calendar.id)
  } catch (ex) {
    return createResponseNotification('Chyba pri načítavaní feedbacku')
  }

  // Get emails of all attendees of this domain who haven't reviewed yet.
  const recipientEmails = getEmailsOfDomainAttendeesWhoHaventReviewed(reviews, calendarEvent.getGuestList())

  // Send request feedback email notifications.
  try {
    sendRequestFeedbackNotifications(event.calendar.id, calendarEvent.getTitle(), recipientEmails)
  } catch (ex) {
    return createResponseNotification('Chyba pri odosielaní notifikácií')
  }
  
  // Form nice response message with the count of sent notifications.
  const message = recipientEmails.length === 0 ? 'Už všetci hlasovali' :
    recipientEmails.length === 1 ? `Odoslané jedno upozornenie` :
    recipientEmails.length < 5 ? `Odoslané ${recipientEmails.length} upozornenia` :
   `Odoslaných ${recipientEmails.length} upozornení`

  return createResponseNotification(message)
}

/**
* This function is called when 'Receive new feedback notifications' preferences switch of organizer's card (UI) is changed.
* Function persists selected option to the second sheet of the spreadsheet defined in Constants.gs under SPREADSHEET_URL field.
* Name of this sheet along with its header can be specified in Constants.gs under PREFERENCES_SHEET_NAME field and PREFERENCES_HEADER_ROW respectively.
* There is no need to create this second sheet nor add any data to it; all formatting, naming and data handling is done by the script.
* Default value of 'Receive new feedback notifications' preferences switch can be set by PREFERENCES_RECEIVE_NOTIFICATIONS_DEFAULT field in Constants.gs file.
*
* @param {Object} event Event object describing event that occured (including info about selected event under event.calendar and switch state under event.formInput.preferences_receive_notifications_switch).
* @return {Object} Either Card in case of error or ActionResponse with descriptive notification when operation is finished successfuly.
*/
function onPreferencesReceiveNotificationsSwitchChange(event) {
  // Get calendar event object so we can access event title etc.
  const calendarEvent = getCalendarEvent(event.calendar.calendarId, event.calendar.id)

  // Event details not found.
  if (!calendarEvent) {
    return createErrorCard('Informácie o udalosti nenájdené.')
  }

  // Get the new state of the switch.
  const receiveNotifications = !!event.formInput.preferences_receive_notifications_switch

  // Update preferences in the store (sheet).
  try {
    updateReceiveNotificationsPreferencesOfEvent(event.calendar.id, receiveNotifications)
  } catch (ex) {
    return createErrorCard('Chyba pri aktualizovaní preferencií.')
  }

  return createResponseNotification(receiveNotifications ? 'Notikácie zapnuté' : 'Notifikácie vypnuté')
}

/**
* This function is called when star of 'Rating star component' of attendee's card (UI) is selected.
* Function persists review to the first sheet of the spreadsheet defined in Constants.gs under SPREADSHEET_URL field.
* Name of this sheet along with its header can be specified in Constants.gs under DATA_SHEET_NAME field and DATA_SHEET_HEADER_ROW respectively.
* There is no need to configure this first sheet nor adding any data to it; all formatting, naming and data handling is done by the script.
*
* @param {Object} event Event object describing event that occured (including info about selected event under event.calendar; review text under event.formInput.review_text and selected star under event.parameters.rating).
* @return {Card} Attendee's feedback summary card in case feedback was processed successfuly or error card describing the error.
*/
function onStarRatingClick(event) {
  // Get calendar event object so we can access event title etc.
  const calendarEvent = getCalendarEvent(event.calendar.calendarId, event.calendar.id)

  // Event details not found.
  if (!calendarEvent) {
    return createErrorCard('Informácie o udalosti nenájdené, feedback nebol uložený.')
  }

  // Newly added review.
  let review = null

  // Try to persist new review in store (sheet).
  try {
    review = storeReviewOfEvent(
      event.calendar.id,
      calendarEvent.getTitle(),
      calendarEvent.getCreators()[0],
      getCurrentUser(),
      parseInt(event.parameters.rating, 10),
      event.formInput.review_text || ''
    )
  } catch (ex) {
    return createErrorCard('Chyba pri ukladaní feedbacku.')
  }

  // Send new feedback notification to organizer about new feedback.
  try {
    // Firstly get preferences to find out whether the organizer wants to receive new feedback notifications or not.
    const preferences = retrievePreferencesOfEvent(event.calendar.id)

    if (preferences.receiveNotifications) {
      const organizerEmail = calendarEvent.getCreators()[0]
      sendNewFeedbackNotification(event.calendar.id, calendarEvent.getTitle(), review, organizerEmail)
    }
  } catch (ex) {
    return createErrorCard('Feedback bol uložený, no nastala chyba pri odosielaní notifikácie organizátorovi.')
  }

  // Get all reviews - newly created included.
  let reviews = []

  try {
    reviews = retrieveReviewsOfEvent(event.calendar.id)
  } catch (ex) {
    return createErrorCard('Feedback bol uložený, no nastala chyba pri načítavaní celkového feedbacku.')
  }
  
  // Return attendee's feedback summary card with anonymous list of other reviews.
  return createAttendeeFeedbackSummaryCard(
    calendarEvent,
    reviews,
    getCurrentUser(),
    getDomainAttendeesCount(calendarEvent)
  )
}
