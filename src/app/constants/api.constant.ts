export const AUTH = {
  SIGNIN: 'user/login',
  SIGNUP: 'user',
  FORGOT_PASSWORD: 'user/forgot-password',
  RESET_PASSWORD: 'user/reset-password',
  SOCIAL_SIGNIN: 'user/social-login',
  SOCIAL_SIGNUP: 'user/social-signup',
  OAUTH_REQUEST: '',
  OUTLOOK_PROFILE_REQUEST: '',
  GOOGLE_PROFILE_REQUEST: ''
};
export const USER = {
  PROFILE: 'user/me',
  PAYMENT: 'payment/',
  UPDATE_PROFILE: 'user/me',
  UPDATE_PASSWORD: 'user/new-password',
  SYNC_GMAIL: 'user/sync-gmail',
  SYNC_OUTLOOK: 'user/sync-outlook',
  LOAD_AFFILIATE: '',
  CREATE_AFFILIATE: ''
};
export const GARBAGE = {
  SET: 'garbage',
  UPLOAD_INTRO_VIDEO: 'garbage/intro_video'
};
export const FILE = {
  UPLOAD_IMAGE: 'file/upload?resize=true'
};
export const TASK = {
  CREATE: 'follow/',
  UPDATE: 'follow/',
  TODAY: 'follow/date?due_date=today',
  TOMORROW: 'follow/date?due_date=tomorrow',
  NEXT_WEEK: 'follow/date?due_date=next_week',
  FUTURE: 'follow/date?due_date=future',
  OVERDUE: 'follow/date?due_date=overdue',
  ALL: 'follow/load/'
};
export const ACTIVITY = {
  LOAD: 'activity/',
  REMOVE_ALL: 'activity/remove-all',
  REMOVE: 'activity/remove'
};
export const CONTACT = {
  LOAD_ALL: 'contact',
  LOAD_PAGE: 'contact/last/',
  QUICK_SEARCH: 'contact/search-easy',
  LATEST_CONTACTS: 'video/latest-sent',
  NORMAL_SEARCH: 'contact/search',
  SELECT_ALL: 'contact/select-all',
  LOAD_SERACH: 'contact/advance-search',
  LOAD_BY_IDS: 'contact/get'
};
export const VIDEO = {
  CREATE: 'video/create',
  READ: 'video/',
  UPDATE: 'video/',
  UPDATE_VIDEO_DETAIL: 'video/detail/',
  DELETE: 'video/',
  LOAD: 'video'
};
export const PDF = {
  CREATE: 'pdf',
  READ: 'pdf/',
  UPDATE: 'pdf/',
  DELETE: 'pdf/'
};
export const IMAGE = {
  CREATE: 'image',
  READ: 'image/',
  UPDATE: 'image/',
  DELETE: 'image/'
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
  SHARE_TEMPLATES: 'team/share-templates',
  SHARE_AUTOMATIONS: 'team/share-automations',
  ACCEPT_INVITATION: 'team/accept/',
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
  CREATE: 'automation'
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
