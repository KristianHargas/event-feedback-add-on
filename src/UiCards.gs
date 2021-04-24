/**
* Creates a text card (UI) which can be used to provide user with some information.
*
* @param {String} text Text message of the text card.
* @param {String} color The color of the text.
* @return {Card} Text card.
*/
function createTextCard(text, color = COLORS.NORMAL) {
  return CardService.newCardBuilder()
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(`<font color="${color}">${text}</font>`)))
    .build()
}

/**
* Creates an error text card (UI) which can be used to show error.
*
* @param {String} text Text of the error message.
* @return {Card} Error text card.
*/
function createErrorCard(text) {
  return createTextCard(`<b>${text}</b>`, COLORS.ERROR)
}

/**
* Creates an organizer's card (UI) which contains 'Event info' component, 'Feedback summary statistics' component, 'Preferences' component, 'Review list' component and 'Send notifications' button.
*
* @param {CalendarEvent} calendarEvent Calendar event object containing information about the currently selected event.
* @param {Object[]} reviews Reviews of the event; review structure is { date, email, rating, text }.
* @param {Number} attendeeCount Number of (domain) attendees of the event.
* @param {Object} preferences Preferences of the event; preferences structure is { eventId, receiveNotifications }.
* @param {String} onSendNotificationsButtonClickCallback Name of the callback which will be called when 'Send notifications' button is clicked.
* @param {String} onPreferencesReceiveNotificationsSwitchChangeCallback Name of the callback which will be called when 'Receive new feedback notifications' preferences switch is changed.
* @return {Card} Card representing the organizer's UI.
*/
function createOrganizerCard(calendarEvent, reviews, attendeeCount, preferences, onSendNotificationsButtonClickCallback, onPreferencesReceiveNotificationsSwitchChangeCallback) {
  const cardBuilder = CardService.newCardBuilder()

  // 'Event info', 'Feedback summary statistics' and 'Receive new feedback notifications' preferences components.
  cardBuilder
    .addSection(createEventInfoComponent(calendarEvent.getTitle(), true))
    .addSection(createFeedbackSummaryComponent(reviews, attendeeCount))
    .addSection(CardService.newCardSection()
      .addWidget(createPreferencesReceiveNotificationsComponent(preferences.receiveNotifications, onPreferencesReceiveNotificationsSwitchChangeCallback)))

  // Add review list only when there is at least one review.
  if (reviews.length) {
    cardBuilder.addSection(createReviewListComponent(reviews))
  }

  // Footer with 'Send notifications' button.
  cardBuilder.setFixedFooter(CardService.newFixedFooter()
    .setPrimaryButton(CardService.newTextButton()
        .setText('Odoslať notifikácie')
        .setOnClickAction(CardService.newAction()
          .setLoadIndicator(CardService.LoadIndicator.SPINNER)
          .setFunctionName(onSendNotificationsButtonClickCallback))))

  return cardBuilder.build()
}

/**
* Creates an attendee feedback form card (UI).
* This component is shown to the attendee only when the attendee hasn't reviewed the event yet.
* The component allows to enter optional review text and to select rating via 'Rating star component'.
* The form is submitted when the star is selected.
* Attendee is not allowed to review future events; error card will be shown in that scenario.
*
* @param {CalendarEvent} calendarEvent Calendar event object containing information about the event.
* @param {String} onStarRatingClickCallback Name of the callback which will be called when a star is selected.
* @return {Card} Attendee feedback form card (rating is available under event.parameters.rating value and review text under event.formInput.review_text value passed to the callback).
*/
function createAttendeeFeedbackFormCard(calendarEvent, onStarRatingClickCallback) {
  // Attendee should not be able to review event before it occurs.
  if (getNow() < calendarEvent.getStartTime()) {
    return createErrorCard('Udalosť môžeš hodnotiť až po jej začiatku.')
  }

  // Feedback form UI.
  return CardService.newCardBuilder()
    .addSection(createEventInfoComponent(calendarEvent.getTitle(), false))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('<b>Prosím ohodnoť túto udalosť.</b>.' + '<br><br>'
          + 'Ak chceš, zadaj slovné hodnotenie. Recenziu <b>odošleš výberom hviezdičky</b>.' + '<br><br>'
          + 'Ďakujeme za tvoj názor :)')))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextInput()
        .setFieldName('review_text')
        .setTitle('Slovné hodnotenie')
        .setMultiline(true))
      .addWidget(CardService.newTextParagraph()
        .setText('<br>Vyber hviezdičku'))
      .addWidget(createStarRatingComponent(onStarRatingClickCallback)))
    .build()
}

/**
* Creates an 'Attendee feedback summary' card (UI).
* This component is shown to an attendee who already reviewed.
* The component includes 'Event info' component, 'Feedback summary statistics' component, 'Current user's review' component and 'Anonymous review list' component.
*
* @param {CalendarEvent} calendarEvent Calendar event object containing information about the event.
* @param {Object[]} reviews Reviews of the event; review structure is { date, email, rating, text }.
* @param {String} attendeeEmail Email of the current user (attendee).
* @param {Number} attendeeCount Number of (domain) attendees of the event.
* @return {Card} Attendee feedback summary card.
*/
function createAttendeeFeedbackSummaryCard(calendarEvent, reviews, attendeeEmail, attendeeCount) {
  const attendeeReview = findReviewByEmail(reviews, attendeeEmail)
  const attendeeExcludedReviews = filterReviewsByEmailExcluded(reviews, attendeeEmail)

  const cardBuilder = CardService.newCardBuilder()

  // 'Event info', 'Feedback summary statistics' and 'Current user's review' components.
  cardBuilder
    .addSection(createEventInfoComponent(calendarEvent.getTitle(), false))
    .addSection(createFeedbackSummaryComponent(reviews, attendeeCount))
    // Current user's review with custom reviewer label and icon.
    .addSection(CardService.newCardSection()
      .addWidget(createReviewListItemComponent(attendeeReview, 'Tvoje hodnotenie', IMAGE_URLS.PERSON)))

  // Add 'Anonymous feedback list' only when there is at least one review.
  if (attendeeExcludedReviews.length) {
    cardBuilder.addSection(createReviewListComponent(attendeeExcludedReviews, true))
  }

  return cardBuilder.build()
}
