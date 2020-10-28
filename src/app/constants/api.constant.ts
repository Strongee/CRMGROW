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
  UPDATE_PROFILE: 'user/me'
};
export const TASK = {
  CREATE: 'follow/',
  UPDATE: 'follow/'
};
export const ACTIVITY = {
  LOAD: 'activity/',
  REMOVE_ALL: 'activity/remove-all',
  REMOVE: 'activity/remove'
};
export const CONTACT = {
  LOAD_ALL: 'contact',
  LOAD_PAGE: 'contact/last'
};
export const VIDEO = {
  CREATE: 'video/create',
  READ: 'video/',
  UPDATE: 'video/',
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

export const GARBAGE = {
  SET: 'garbage',
  UPLOAD_INTRO_VIDEO: 'garbage/intro_video'
};

export const FILE = {
  UPLOAD_IMAGE: 'file/upload?resize=true'
};

export const APPOINTMENT = {
  GET_EVENT: 'appointment',
  UPDATE_EVENT: 'appointment/',
  DELETE_EVENT: 'appointment/delete'
}

export const THEME = {
  GET_THEME: 'theme/',
  SET_THEME: 'theme/set-video'
};
