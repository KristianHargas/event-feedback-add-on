/**
* The URL of the spreadseet (database) which is used to store review data (first sheet) and event preferences (second sheet).
* It should be newly created - empty speadsheet (with arbitraty name) and all domain users should be able to read and modify it.
* There is no need to create, name nor add any data to the sheets within this spreadsheet; all of this is handled by the script (including header formatting).
* Example URL: https://docs.google.com/spreadsheets/d/1JViiP-WjRi3www3zSfkvjSIwaaabb97jke2iL-roU-k/edit#gid=0
*/
const SPREADSHEET_URL = ''

/**
* Domain of the company.
* Domain is used to filter attendees, so only domain members receive notifications and only domain attendees are counted as attendees of the event in the add-on.
*/
const DOMAIN = 'goodrequest.com'

/**
* Default value for 'Receive new feedback notifications' preferences option.
* If set to true, organizer receives 'New feedback email notifications' by the default.
* This default value can be changed via 'Receive new feedback notifications' preferences switch of the organizer's card (UI). 
*/
const PREFERENCES_RECEIVE_NOTIFICATIONS_DEFAULT = true

/**
* The name of the add-on (app); this value is used in email notifications and matches app name value from appscript.json manifest file. 
*/
const APP_NAME = 'Event Feedback'

/**
* Name of the first sheet of the database spreadsheet which holds review data.
*/
const DATA_SHEET_NAME = 'Data'

/**
* Header row of the review data (first) sheet which is automatically inserted as the first row so reviews are properly described.
*/
const DATA_SHEET_HEADER_ROW = ['event_id', 'event_title', 'organizer_email', 'review_date', 'reviewer_email', 'review_rating', 'review_text']

/**
* Name of the second sheet of the database spreadsheet which holds event preferences.
*/
const PREFERENCES_SHEET_NAME = 'Preferences'

/**
* Header row of the event preferences (second) sheet which is automatically inserted as the first row so event preferences are properly described.
*/
const PREFERENCES_HEADER_ROW = [ 'event_id', 'receive_notifications' ]

/**
* Placeholder text used in place of review text when there was no text entered by the attendee.
*/
const NO_TEXT_REVIEW_PLACEHOLDER = 'Bez slovného hodnotenia'

/**
* Theme colors used throughout the application; PRIMARY and SECONDARY colors match these from appscript.json manifest file.
*/
const COLORS = {
  PRIMARY: '#263238',
  SECONDARY: '#f4511e',
  NORMAL: '#000000',
  ERROR: '#E53935',
  SUCCESS: '#43A047'
}

/**
* Event share link which is used in email notifications.
* Use Utilities.formatString() to replace %s with email of the recipient and eventId.
*/
const EVENT_SHARE_LINK = 'https://calendar.google.com/calendar/u/%s/r/eventedit/%s'

/**
* URLS of images used in 'Review list item' component; there is an image with smiley face for each rating level (1-5).
*/
const RATING_IMAGE_URLS = {
  1: 'https://www.gstatic.com/images/icons/material/system/1x/sentiment_very_dissatisfied_black_24dp.png',
  2: 'https://www.gstatic.com/images/icons/material/system/1x/sentiment_dissatisfied_black_24dp.png',
  3: 'https://www.gstatic.com/images/icons/material/system/1x/sentiment_neutral_black_24dp.png',
  4: 'https://www.gstatic.com/images/icons/material/system/1x/sentiment_satisfied_black_24dp.png',
  5: 'https://www.gstatic.com/images/icons/material/system/1x/sentiment_very_satisfied_black_24dp.png'
}

/**
* URLS of other images which are used throughout the application.
*/
const IMAGE_URLS = {
  PERSON: 'https://www.gstatic.com/images/icons/material/system/1x/person_black_24dp.png',
  EVENT: 'https://www.gstatic.com/images/icons/material/system/1x/event_black_24dp.png'
}
