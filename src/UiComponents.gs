/**
* Creates component of 'Star rating bar' which is used in attendee's feedback form.
* Components groups five star buttons into button set.
*
* @param {String} onStarClickCallback Name of the callback which will be called when a star is clicked (selected rating is available under event.parameters.rating value passed to callback).
* @return {ButtonSet} Button set containing 5 star buttons.
*/
function createStarRatingComponent(onStarClickCallback) {
  const values = [1, 2, 3, 4, 5]

  const buttons = CardService.newButtonSet()

  values.forEach(val => {
    const button = CardService.newImageButton()
      .setIcon(CardService.Icon.STAR)
      .setOnClickAction(CardService.newAction()
        .setLoadIndicator(CardService.LoadIndicator.SPINNER)
        .setFunctionName(onStarClickCallback)
        .setParameters({ rating: val.toString() }))

    buttons.addButton(button)
  })

  return buttons
}

/**
* Creates 'List of reviews' component which is used to show reviews of attendees.
*
* @param {Object[]} reviews Reviews which should be shown in the list; review structure is { date, email, rating, text }.
* @param {Boolean} anonymous Whether the reviewer email should be visible or not.
* @return {CardSection} CardSection containing the review list.
*/
function createReviewListComponent(reviews, anonymous = false) {
  const list = CardService.newCardSection()

  reviews.forEach(review => {
    list.addWidget(createReviewListItemComponent(review, anonymous ? null : review.email))
  })

  return list
}

/**
* Creates 'Review list item' component which can be used to show review info; this component is also used by review list component.
* Placeholder text shown in place of review text when there was no text provided can be configured in Constants.gs under NO_TEXT_REVIEW_PLACEHOLDER field.
*
* @param {Object} review Review which should be shown by the component; review structure is { date, email, rating, text }.
* @param {String} reviewer The name, email or custom label which will be shown in place of reviewer; if nothing is provided, this review is anonymous.
* @param {String} icon Custom icon URL which will be used as review image; if nothing is provided, smiley face based on rating (1-5) will be used.
* @return {DecoratedText} Decorated text item representing the review.
*/
function createReviewListItemComponent(review, reviewer = null, icon = null) {
  const iconUrl = icon || RATING_IMAGE_URLS[review.rating]
  const topLabel = reviewer ? `${review.rating}/5 - ${reviewer}` : `${review.rating}/5`
  // Escape html tags which may be present in the review text.
  const text = (review.text && escapeHtml(review.text)) || NO_TEXT_REVIEW_PLACEHOLDER
  const bottomLabel = formatDateTime(review.date)

  return CardService.newDecoratedText()
      .setIconUrl(iconUrl)
      .setTopLabel(topLabel)
      .setText(text)
      .setBottomLabel(bottomLabel)
      .setWrapText(true)
}

/**
* Creates 'Feedback summary statistics' component which includes average rating of the event and how many attendees already reviewed out of total domain attendee count.
*
* @param {Object[]} reviews Reviews of the event; review structure is { date, email, rating, text }.
* @param {Number} attendeeCount Total number of (domain) attendees.
* @return {CardSection} Card section with feedback summary statistics.
*/
function createFeedbackSummaryComponent(reviews, attendeeCount) {
  const summary = CardService.newDecoratedText()
    .setIcon(CardService.Icon.STAR)

  // This event has no reviews so far.
  if (!reviews.length) {
    return CardService.newCardSection()
      .addWidget(summary
        .setText('Zatiaľ nehodnotené')
        .setBottomLabel(`Nehodnotil žiaden z ${attendeeCount} účastníkov`))
  }

  // Get average rating.
  const average = getAverageRating(reviews)
  const averageText = `${average.toFixed(2)} / 5.00`
  
  // Form nice message containing how many attendees already reviewed.
  const bottomLabelPrefix = reviews.length == 1 ? 'Hodnotil' :
    reviews.length < 5 ? 'Hodnotili' : 'Hodnotilo'
  const bottomLabel = `${bottomLabelPrefix} ${reviews.length} z ${attendeeCount} účastníkov`

  return CardService.newCardSection()
    .addWidget(summary
      .setTopLabel('Priemerne')
      .setText(averageText)
      .setBottomLabel(bottomLabel))
}

/**
* Creates 'Receive new feedback notifications' preferences component which includes switch for adjusting the settings; this component is used in the organizer's card (UI).
* If the switch is on, the organizer of the event will receive email notifications when new review is made.
*
* @param {Boolean} defaultSwitchValue Initial state of the switch.
* @param {String} onSwitchChangeCallback The name of the callback which will be called when switch state is changed (switch state is available under event.formInput.preferences_receive_notifications_switch value passed to callback).
* @return {DecoratedText} Decorated text item containing the switch with the description.
*/
function createPreferencesReceiveNotificationsComponent(defaultSwitchValue, onSwitchChangeCallback) {
  return CardService.newDecoratedText()
    .setText('Dostávať notifikácie')
    .setBottomLabel('Pri novom feedbacku od účastníka')
    .setSwitchControl(CardService.newSwitch()
        .setFieldName('preferences_receive_notifications_switch')
        .setValue('switch_is_on')
        .setSelected(defaultSwitchValue)
        .setOnChangeAction(CardService.newAction()
          .setLoadIndicator(CardService.LoadIndicator.SPINNER)
          .setFunctionName(onSwitchChangeCallback)))
}

/**
* Creates 'Event info' component which shows basic information about the selected event - event title and whether the current user is the organizer or an attendee.
*
* @param {String} eventTitle The title of the event.
* @param {Boolean} isOrganizer Boolean representing whether the current user is the organizer or not.
* @return {CardSection} Card section containing the basic event info.
*/
function createEventInfoComponent(eventTitle, isOrganizer) {
  const status = isOrganizer ? 'Si organizátor' : 'Si účastník'

  const item = CardService.newDecoratedText()
    .setIconUrl(IMAGE_URLS.EVENT)
    .setTopLabel('Udalosť')
    .setText(escapeHtml(eventTitle))
    .setBottomLabel(status)

  return CardService.newCardSection()
    .addWidget(item)
}
