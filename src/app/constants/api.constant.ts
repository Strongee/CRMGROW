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
  UPDATE_PAYMENT: 'payment',
  UPDATE_PASSWORD: 'user/new-password',
  SYNC_GMAIL: 'user/sync-google-calendar',
  SYNC_OUTLOOK: 'user/sync-outlook-calendar',
  CALENDAR_SYNC_GMAIL: 'user/sync-gmail',
  CALENDAR_SYNC_OUTLOOK: 'user/sync-outlook',
  AUTH_GOOGLE: 'user/authorize-gmail',
  AUTH_OUTLOOK: 'user/authorize-outlook',
  ENABLE_DESKTOP_NOTIFICATION: 'user/desktop-notification',
  LOAD_AFFILIATE: 'affiliate',
  CREATE_AFFILIATE: 'affiliate',
  LOAD_REFERRALS: 'affiliate/referrals/',
  UPDATE_GARBAGE: 'garbage',
  CONNECT_SMTP: 'integration/sync-smtp'
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
  SELECT_ALL: 'contact/get-all',
  LOAD_BY_IDS: 'contact/get',
  FILTER: 'contact/filter',
  READ: 'contact/',
  EXPORT: 'contact/export-csv',
  BULK_DELETE: 'contact/remove',
  BULK_UPDATE: 'contact/bulk-update',
  LATEST_CONTACTS: 'video/latest-sent',
  UPDATE: 'contact/update-contact',
  MERGE: 'contact/contact-merge',
  BULK_CREATE: 'contact/bulk-create',
  CHECK_EMAIL: 'contact/check-email',
  CHECK_PHONE: 'contact/check-phone',
  SHARE_CONTACT: 'contact/share-contact'
};
export const VIDEO = {
  CREATE: 'video/create',
  READ: 'video/',
  UPDATE: 'video/',
  UPDATE_VIDEO_DETAIL: 'video/detail/',
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
  SHARE_TEMPLATES: 'team/share-templates',
  SHARE_AUTOMATIONS: 'team/share-automations',
  ACCEPT_INVITATION: 'team/accept/',
  DECLINE_INVITATION: 'team/decline/',
  SEARCH_TEAM_BY_USER: 'team/user/',
  JOIN_REQUEST: 'team/request',
  ACCEPT_REQUEST: 'team/admin-accept',
  UPDATE_TEAM: 'team/update',
  REMOVE_VIDEO: 'team/remove-videos/',
  REMOVE_PDF: 'team/remove-pdfs/',
  REMOVE_IMAGE: 'team/remove-images/',
  REMOVE_TEMPLATE: 'team/remove-templates/',
  REMOVE_AUTOMATION: 'team/remove-automations/',
  REQUEST_CALL: 'team/request-call/',
  INQUIRY: 'team/nth-call/',
  CALL: 'team/call/',
  PLANNED: 'team/call-planned/',
  FINISHED: 'team/call-finished/',
  REJECT_CALL: '/team/reject-call/',
  ACCEPT_CALL: '/team/accept-call/',
  UPDATE_CALL: '/team/call/',
  DELETE_CALL: '/team/call/'
};
export const AUTOMATION = {
  SEARCH: 'automation/search',
  LOAD_PAGE: 'automation/list/',
  LOAD_ALL: 'automation/',
  DETAIL: 'automation/detail/',
  DELETE: 'automation/',
  READ: 'automation/',
  UPDATE: 'automation/',
  CREATE: 'automation',
  ASSIGN: 'timeline/create',
  LOAD_OWN: 'automation/list/own'
};
export const APPOINTMENT = {
  GET_EVENT: 'appointment',
  UPDATE_EVENT: 'appointment/',
  DELETE_EVENT: 'appointment/delete'
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
  DELETE: 'label/'
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
  GET: 'deal-stage'
};

export const DEAL = {
  GET: 'deal/',
  MOVE: 'deal/move-deal',
  ADD_NOTE: 'deal/add-note',
  SEND_EMAIL: 'deal/send-email',
  GET_EMAILS: 'deal/get-email',
  GET_NOTES: 'deal/get-note',
  ADD_FOLLOWUP: 'deal/add-follow',
  GET_FOLLOWUP: 'deal/get-follow',
  GET_ACTIVITY: 'deal/get-activity'
};

export const MATERIAL = {
  EMAIL: 'material/bulk-email'
};

export const NOTIFICATION = {
  GET: 'notification',
  LOAD_PAGE: 'notification/list/',
  READ_MARK: 'notification/bulk-read',
  UNREAD_MARK: 'notification/bulk-unread',
  DELETE: 'notification/bulk-remove',
  TEXT_DELIVERY: 'notification/get-delivery'
};
