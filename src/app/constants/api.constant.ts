export const AUTH = {
  SIGNIN: 'user/login',
  SIGNUP: 'user',
  FORGOT_PASSWORD: 'user/forgot-password',
  RESET_PASSWORD: 'user/reset-password',
  SOCIAL_SIGNIN: 'user/social-login',
  SOCIAL_SIGNUP: 'user/social-signup',
  OAUTH_REQUEST: 'user/signup-',
  OUTLOOK_PROFILE_REQUEST: 'user/social-outlook?code=',
  GOOGLE_PROFILE_REQUEST: 'user/social-gmail?code=',
  LOG_OUT: 'user/logout',
  CHECK_EMAIL: 'user/check',
  CHECK_NICKNAME: 'user/search-nickname',
  CHECK_PHONE: 'user/search-phone'
};
export const USER = {
  PROFILE: 'user/me',
  PAYMENT: 'payment/',
  UPDATE_PROFILE: 'user/me',
  UPDATE_PAYMENT: 'payment/',
  GET_INVOICE: 'payment/transactions',
  UPDATE_PASSWORD: 'user/new-password',
  CREATE_PASSWORD: 'user/create-password',
  SYNC_GMAIL: 'user/sync-gmail',
  SYNC_OUTLOOK: 'user/sync-outlook',
  SYNC_ZOOM: 'user/sync-zoom',
  CALENDAR_SYNC_GMAIL: 'user/sync-google-calendar',
  CALENDAR_SYNC_OUTLOOK: 'user/sync-outlook-calendar',
  AUTH_GOOGLE: 'user/authorize-gmail',
  AUTH_OUTLOOK: 'user/authorize-outlook',
  AUTH_GOOGLE_CALENDAR: 'user/authorize-google-calendar',
  AUTH_OUTLOOK_CALENDAR: 'user/authorize-outlook-calendar',
  SET_ANOTHER_MAIL: 'user/another-con',
  ENABLE_DESKTOP_NOTIFICATION: 'user/desktop-notification',
  LOAD_AFFILIATE: 'affiliate',
  CREATE_AFFILIATE: 'affiliate',
  LOAD_REFERRALS: 'affiliate/referrals/',
  UPDATE_GARBAGE: 'garbage',
  CONNECT_SMTP: 'integration/sync-smtp',
  DISCONNECT_MAIL: 'user/discon-email',
  DISCONNECT_CALENDAR: 'user/discon-calendar',
  CANCEL_ACCOUNT: 'user/cancel-account',
  UPDATE_PACKAGE: 'user/update-package',
  CHECK_DOWNGRADE: 'user/check-downgrade',
  INFO: 'user/'
};
export const GUEST = {
  LOAD: 'guest/load',
  CREATE: 'guest',
  DELETE: 'guest/',
  EDIT: 'guest/'
};
export const GARBAGE = {
  SET: 'garbage',
  UPLOAD_INTRO_VIDEO: 'garbage/intro_video',
  LOAD_DEFAULT: 'garbage/load-default'
};
export const FILE = {
  UPLOAD_IMAGE: 'file/upload?resize=true'
};
export const NOTE = {
  CREATE: 'note',
  BULK_CREATE: 'note/create',
  DELETE: 'note/',
  UPDATE: 'note/'
};
export const TASK = {
  CREATE: 'follow/',
  BULK_CREATE: 'follow/create',
  UPDATE: 'follow/',
  COMPLETE: 'follow/completed',
  BULK_UPDATE: 'follow/update',
  BULK_COMPLETE: 'follow/checked',
  BULK_ARCHIVE: 'follow/archived',
  TODAY: 'follow/date?due_date=today',
  TOMORROW: 'follow/date?due_date=tomorrow',
  NEXT_WEEK: 'follow/date?due_date=next_week',
  FUTURE: 'follow/date?due_date=future',
  OVERDUE: 'follow/date?due_date=overdue',
  LOAD: 'follow/load/',
  SELECT: 'follow/select-all'
};
export const ACTIVITY = {
  LOAD: 'activity/get',
  // LOAD: 'activity/',
  REMOVE_ALL: 'activity/remove-all',
  REMOVE: 'activity/remove'
};
export const CONTACT = {
  CREATE: 'contact',
  LOAD_ALL: 'contact',
  LOAD_PAGE: 'contact/last/',
  ADVANCE_SERACH: 'contact/advance-search',
  NORMAL_SEARCH: 'contact/search',
  QUICK_SEARCH: 'contact/search-easy',
  LOAD_BY_EMAIL: 'contact/load-by-emails',
  SELECT_ALL: 'contact/get-all',
  LOAD_BY_IDS: 'contact/get',
  FILTER: 'contact/filter',
  UPDATE_DETAIL: 'contact/',
  READ: 'contact/get-detail/',
  EXPORT: 'contact/export-csv',
  BULK_DELETE: 'contact/remove',
  BULK_UPDATE: 'contact/bulk-update',
  LATEST_CONTACTS: 'video/latest-sent',
  UPDATE: 'contact/update-contact',
  MERGE: 'contact/contact-merge',
  BULK_CREATE: 'contact/bulk-create',
  CHECK_EMAIL: 'contact/check-email',
  CHECK_PHONE: 'contact/check-phone',
  SHARE_CONTACT: 'contact/share-contact',
  STOP_SHARE: 'contact/stop-share',
  TEAM_SHARED: 'contact/team-shared/',
  LOAD_NOTES: 'contact/load-notes/'
};
export const VIDEO = {
  CREATE: 'video/create',
  READ: 'video/',
  UPDATE: 'video/',
  DOWNLOAD: 'video/download/',
  UPDATE_VIDEO_DETAIL: 'video/detail/',
  UPDATE_CONVERTING: 'video/converting/',
  UPDATE_ADMIN: 'video/update-admin',
  DELETE: 'video/',
  LOAD: 'video',
  LOAD_CONVERTING_STATUS: 'video/convert-status',
  ANALYTICS: 'video/analytics/'
};
export const PDF = {
  CREATE: 'pdf/create',
  READ: 'pdf/',
  UPDATE: 'pdf/',
  UPDATE_ADMIN: 'pdf/update-admin',
  DELETE: 'pdf/',
  LOAD: 'pdf'
};
export const IMAGE = {
  CREATE: 'image/create',
  READ: 'image/',
  UPDATE: 'image/',
  UPDATE_ADMIN: 'image/update-admin',
  DELETE: 'image/',
  LOAD: 'image'
};
export const TEMPLATE = {
  CREATE: 'template/create',
  READ: 'template/',
  UPDATE: 'template/',
  DELETE: 'template/',
  BULK_DELETE: 'template/delete',
  LOAD: 'template/list/',
  SEARCH: 'template/search',
  OWNSEARCH: 'template/search-own',
  LOAD_OWN: 'template/list/own',
  LOAD_ALL: 'template/'
};
export const TEAM = {
  LOAD: 'team/load',
  LOAD_LEADERS: 'team/load-leaders',
  LOAD_INVITED: 'team/load-invited',
  CREATE: 'team',
  READ: 'team/',
  UPDATE: 'team/',
  DELETE: 'team/',
  SEARCH_TEAM_USER: 'team/search-user',
  SEARCH_LEADER: 'team/search-leader',
  INVITE_USERS: 'team/bulk-invite/',
  SHARE_VIDEOS: 'team/share-videos',
  SHARE_PDFS: 'team/share-pdfs',
  SHARE_IMAGES: 'team/share-images',
  SHARE_MATERIALS: 'team/share-materials',
  LOAD_SHARE_CONTACTS: 'team/shared-contacts',
  LOAD_SHARE_MATERIALS: 'team/material/',
  LOAD_SHARE_AUTOMATIONS: 'team/automation/',
  LOAD_SHARE_TEMPLATES: 'team/template/',
  SHARE_TEMPLATES: 'team/share-templates',
  SHARE_AUTOMATIONS: 'team/share-automations',
  ACCEPT_INVITATION: 'team/accept/',
  DECLINE_INVITATION: 'team/decline/',
  SEARCH_TEAM_BY_USER: 'team/user/',
  JOIN_REQUEST: 'team/request',
  ACCEPT_REQUEST: 'team/admin-accept',
  DECLINE_REQUEST: 'team/admin-decline',
  UPDATE_TEAM: 'team/update',
  REMOVE_VIDEO: 'team/remove-videos/',
  REMOVE_PDF: 'team/remove-pdfs/',
  REMOVE_IMAGE: 'team/remove-images/',
  REMOVE_FOLDER: 'team/remove-folders/',
  REMOVE_TEMPLATE: 'team/remove-templates/',
  REMOVE_AUTOMATION: 'team/remove-automations/',
  SEARCH_CONTACT: 'team/search-contact',
  ALL_SHARED_CONTACT: 'team/get-all/',
  REQUEST_CALL: 'team-call/request-call/',
  INQUIRY: 'team-call/nth-call/',
  CALL: 'team-call/call/',
  PLANNED: 'team-call/call-planned/',
  FINISHED: 'team-call/call-finished/',
  REJECT_CALL: 'team-call/reject-call/',
  ACCEPT_CALL: 'team-call/accept-call/',
  UPDATE_CALL: 'team-call/call/',
  DELETE_CALL: 'team-call/call/',
  TEAM_CALL_LOAD: 'team-call/load-call'
};
export const AUTOMATION = {
  SEARCH: 'automation/search',
  LOAD_PAGE: 'automation/list/',
  LOAD_ALL: 'automation/',
  DETAIL: 'automation/detail/',
  CONTACTS: 'automation/assigned-contacts/',
  CONTACT_DETAIL: 'automation/contact-detail',
  DELETE: 'automation/',
  READ: 'automation/get-detail',
  UPDATE: 'automation/',
  CREATE: 'automation',
  ASSIGN: 'timeline/create',
  ASSIGN_NEW: 'timeline/create_new',
  CANCEL: 'timeline/cancel/',
  LOAD_OWN: 'automation/list/own',
  SEARCH_CONTACT: 'automation/search-contact'
};
export const APPOINTMENT = {
  LOAD_CALENDARS: 'appointment/calendar',
  GET_EVENT: 'appointment',
  UPDATE_EVENT: 'appointment/',
  DELETE_EVENT: 'appointment/delete',
  ACCEPT: 'appointment/accept',
  DECLINE: 'appointment/decline',
  DETAIL: 'appointment/detail'
};
export const THEME = {
  GET_THEME: 'theme/',
  SET_THEME: 'theme/set-video'
};
export const LABEL = {
  CREATE: 'label',
  PUT: 'label/',
  GET: 'label',
  BULK_CREATE: 'label/create',
  DELETE: 'label/',
  CHANGE_ORDER: 'label/order'
};

export const MAILLIST = {
  CREATE: 'mail-list',
  GET: 'mail-list/',
  ADD_CONTACTS: 'mail-list/add-contacts',
  REMOVE_CONTACTS: 'mail-list/remove-contacts'
};

export const CAMPAIGN = {
  CREATE: 'campaign',
  GET: 'campaign/'
};

export const SEND = {
  VIDEO_EMAIL: 'video/bulk-email',
  VIDEO_GMAIL: 'video/bulk-gmail',
  VIDEO_OUTLOOK: 'video/bulk-outlook',
  PDF_EMAIL: 'pdf/bulk-email',
  PDF_GMAIL: 'pdf/bulk-gmail',
  PDF_OUTLOOK: 'pdf/bulk-outlook',
  IMAGE_EMAIL: 'image/bulk-email',
  IMAGE_GMAIL: 'image/bulk-gmail',
  IMAGE_OUTLOOK: 'image/bulk-outlook',
  VIDEO_TEXT: 'video/bulk-text',
  PDF_TEXT: 'pdf/bulk-text',
  IMAGE_TEXT: 'image/bulk-text',
  EMAIL: 'email/bulk-email',
  GMAIL: 'email/bulk-gmail',
  OUTLOOK: 'email/bulk-outlook',
  TEXT: '',
  SHARE: 'email/share-platform',
  SEND_EMAIL: 'email/send-email'
};
export const TAG = {
  ALL: 'tag/getAll',
  GET: 'tag/load',
  UPDATE: 'tag/update',
  DELETE: 'tag/delete',
  LOAD_SOURCES: 'contact/sources',
  LOAD_COMPANIES: 'contact/brokerage'
};
export const DEALSTAGE = {
  GET: 'deal-stage',
  DELETE: 'deal-stage/remove',
  EDIT: 'deal-stage/',
  CHANGE_ORDER: 'deal-stage/change-order',
  EASY_LOAD: 'deal-stage/easy-load',
  WITHCONTACT: 'deal-stage/with-contact'
};

export const DEAL = {
  GET: 'deal/',
  MOVE: 'deal/move-deal',
  ADD_NOTE: 'deal/add-note',
  EDIT_NOTE: 'deal/edit-note',
  REMOVE_NOTE: 'deal/remove-note',
  SEND_EMAIL: 'deal/send-email',
  GET_EMAILS: 'deal/get-email',
  GET_NOTES: 'deal/get-note',
  ADD_FOLLOWUP: 'deal/add-follow',
  EDIT_FOLLOWUP: 'deal/update-follow',
  COMPLETE_FOLLOWUP: 'deal/complete-follow',
  REMOVE_FOLLOWUP: 'deal/remove-follow',
  GET_FOLLOWUP: 'deal/get-follow',
  GET_ACTIVITY: 'deal/get-activity',
  ADD_APPOINTMENT: 'deal/create-appointment',
  GET_APPOINTMENT: 'deal/get-appointments',
  UPDATE_APPOINTMENT: 'deal/update-appointment',
  REMOVE_APPOINTMENT: 'deal/remove-appointment',
  ADD_GROUP_CALL: 'deal/create-team-call',
  GET_GROUP_CALL: 'deal/get-team-calls',
  UPDAGE_GROUP_CALL: '',
  REMOVE_GROUP_CALL: '',
  SEND_TEXT: 'deal/send-text',
  UPDATE_CONTACT: 'deal/update-contact/'
};

export const MATERIAL = {
  EMAIL: 'material/bulk-email',
  BULK_TEXT: 'material/bulk-text',
  VIDEO_TEXT: 'video/bulk-text',
  PDF_TEXT: 'pdf/bulk-text',
  IMAGE_TEXT: 'image/bulk-text',
  LOAD: 'material/load',
  BULK_REMOVE: 'material/remove',
  CREATE_FOLDER: 'material/folder',
  UPDATE_FOLDER: 'material/folder/',
  REMOVE_FOLDER: 'material/remove-folder',
  UPDATE_FOLDERS: 'material/update-folders',
  REMOVE_FOLDERS: 'material/remove-folders',
  MOVE_FILES: 'material/move-material'
};

export const NOTIFICATION = {
  GET: 'notification',
  LOAD_PAGE: 'notification/list/',
  READ_MARK: 'notification/bulk-read',
  UNREAD_MARK: 'notification/bulk-unread',
  DELETE: 'notification/bulk-remove',
  TEXT_DELIVERY: 'notification/get-delivery',
  STATUS: 'notification/status'
};

export const FILTER = {
  API: 'filter/'
};

export const SMS = {
  GET: 'sms/',
  GET_MESSAGE: 'sms/get-messages',
  MARK_READ: 'sms/mark-read',
  SEARCH_NUMBER: 'sms/search-numbers',
  BUY_NUMBER: 'sms/buy-numbers',
  BUY_CREDIT: 'sms/buy-credit',
  LOAD_FILES: 'sms/load-files'
};

export const INTEGRATION = {
  CHECK_CALENDLY: 'integration/calendly/check-auth',
  DISCONNECT_CALENDLY: 'integration/calendly/disconnect',
  GET_CALENDLY: 'integration/calendly',
  SET_EVENT: 'integration/calendly/set-event',
  GET_TOKEN: 'integration/token'
};
