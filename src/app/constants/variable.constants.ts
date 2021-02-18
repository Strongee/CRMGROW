import { CountryISO } from 'ngx-intl-tel-input';

export const CONTACT_SORT_OPTIONS = {
  alpha_down: { dir: false, field: 'name', name: 'alpha_down' },
  alpha_up: { dir: true, field: 'name', name: 'alpha_up' },
  last_added: { dir: true, field: 'updated_at', name: 'last_added' },
  last_active: { dir: false, field: 'updated_at', name: 'last_active' }
};
export const STATUS = {
  NONE: 'none',
  REQUEST: 'request',
  SUCCESS: 'success',
  FAILURE: 'failure'
};
export const COMPANIES = ['eXp Realty', 'other'];
export const MONTH = [
  { id: '1', text: 'January' },
  { id: '2', text: 'February' },
  { id: '3', text: 'March' },
  { id: '4', text: 'April' },
  { id: '5', text: 'May' },
  { id: '6', text: 'June' },
  { id: '7', text: 'July' },
  { id: '8', text: 'August' },
  { id: '9', text: 'September' },
  { id: '10', text: 'October' },
  { id: '11', text: 'November' },
  { id: '12', text: 'December' }
];
export const YEAR = [
  { id: '2019', text: '2019' },
  { id: '2020', text: '2020' },
  { id: '2021', text: '2021' },
  { id: '2022', text: '2022' },
  { id: '2023', text: '2023' },
  { id: '2024', text: '2024' },
  { id: '2025', text: '2025' },
  { id: '2026', text: '2026' },
  { id: '2027', text: '2027' },
  { id: '2028', text: '2028' },
  { id: '2029', text: '2029' },
  { id: '2030', text: '2030' },
  { id: '2031', text: '2031' },
  { id: '2032', text: '2032' },
  { id: '2033', text: '2033' },
  { id: '2034', text: '2034' },
  { id: '2035', text: '2035' }
];
export const TIMES = [
  { id: '00:00:00.000', text: '12:00 AM' },
  { id: '00:30:00.000', text: '12:30 AM' },
  { id: '01:00:00.000', text: '1:00 AM' },
  { id: '01:30:00.000', text: '1:30 AM' },
  { id: '02:00:00.000', text: '2:00 AM' },
  { id: '02:30:00.000', text: '2:30 AM' },
  { id: '03:00:00.000', text: '3:00 AM' },
  { id: '03:30:00.000', text: '3:30 AM' },
  { id: '04:00:00.000', text: '4:00 AM' },
  { id: '04:30:00.000', text: '4:30 AM' },
  { id: '05:00:00.000', text: '5:00 AM' },
  { id: '05:30:00.000', text: '5:30 AM' },
  { id: '06:00:00.000', text: '6:00 AM' },
  { id: '06:30:00.000', text: '6:30 AM' },
  { id: '07:00:00.000', text: '7:00 AM' },
  { id: '07:30:00.000', text: '7:30 AM' },
  { id: '08:00:00.000', text: '8:00 AM' },
  { id: '08:30:00.000', text: '8:30 AM' },
  { id: '09:00:00.000', text: '9:00 AM' },
  { id: '09:30:00.000', text: '9:30 AM' },
  { id: '10:00:00.000', text: '10:00 AM' },
  { id: '10:30:00.000', text: '10:30 AM' },
  { id: '11:00:00.000', text: '11:00 AM' },
  { id: '11:30:00.000', text: '11:30 AM' },
  { id: '12:00:00.000', text: '12:00 PM' },
  { id: '12:30:00.000', text: '12:30 PM' },
  { id: '13:00:00.000', text: '1:00 PM' },
  { id: '13:30:00.000', text: '1:30 PM' },
  { id: '14:00:00.000', text: '2:00 PM' },
  { id: '14:30:00.000', text: '2:30 PM' },
  { id: '15:00:00.000', text: '3:00 PM' },
  { id: '15:30:00.000', text: '3:30 PM' },
  { id: '16:00:00.000', text: '4:00 PM' },
  { id: '16:30:00.000', text: '4:30 PM' },
  { id: '17:00:00.000', text: '5:00 PM' },
  { id: '17:30:00.000', text: '5:30 PM' },
  { id: '18:00:00.000', text: '6:00 PM' },
  { id: '18:30:00.000', text: '6:30 PM' },
  { id: '19:00:00.000', text: '7:00 PM' },
  { id: '19:30:00.000', text: '7:30 PM' },
  { id: '20:00:00.000', text: '8:00 PM' },
  { id: '20:30:00.000', text: '8:30 PM' },
  { id: '21:00:00.000', text: '9:00 PM' },
  { id: '21:30:00.000', text: '9:30 PM' },
  { id: '22:00:00.000', text: '10:00 PM' },
  { id: '22:30:00.000', text: '10:30 PM' },
  { id: '23:00:00.000', text: '11:00 PM' },
  { id: '23:30:00.000', text: '11:30 PM' }
];
export const PHONE_COUNTRIES = [
  CountryISO.UnitedStates,
  CountryISO.UnitedKingdom,
  CountryISO.Canada,
  CountryISO.Australia,
  CountryISO.SouthAfrica,
  CountryISO.India,
  CountryISO.Mexico,
  CountryISO.Portugal,
  CountryISO.France,
  CountryISO.Germany,
  CountryISO.Italy,
  CountryISO.Spain,
  CountryISO.Switzerland
];
export const COUNTRY_CODES = {
  USA: 'US',
  CAN: 'CA',
  GBR: 'GB',
  ZAF: 'ZA'
};
export const COUNTRIES = [
  {
    code: 'US',
    name: 'United States'
  },
  {
    code: 'CA',
    name: 'Canada'
  }
];
export const REGIONS = {
  US: [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Guam',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Palau',
    'Pennsylvania',
    'Puerto Rico',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ],
  CA: [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan'
  ]
};

export const STAGES = [
  'Initial Contact Made',
  'Attraction Material Shared',
  'Attended Webinar or demo',
  'Interested in joining',
  'Application submitted',
  'Joined company',
  'Long term follow-up',
  'Not interested now',
  'Not interest(lost)',
  'Attended Lunch & Learn'
];

export const TIMEZONE = [
  {
    country: 'US',
    timezones: [
      {
        country: 'US',
        name: 'EDT (Eastern Daylight Time: UTC -04)',
        zone: '-04:00',
        tz_name: 'America/New_York',
        standard: '-05:00',
        daylight: '-04:00'
      },
      {
        country: 'US',
        name: 'CDT (Central Daylight Time: UTC -05)',
        zone: '-05:00',
        tz_name: 'America/Chicago',
        standard: '-06:00',
        daylight: '-05:00'
      },
      {
        country: 'US',
        name: 'MDT (Mountain Daylight Time: UTC -06)',
        zone: '-06:00',
        tz_name: 'America/Denver',
        standard: '-07:00',
        daylight: '-06:00'
      },
      {
        country: 'US',
        name: 'PDT (Pacific Daylight Time: UTC -07)',
        zone: '-07:00',
        tz_name: 'America/Los_Angeles',
        standard: '-08:00',
        daylight: '-07:00'
      },
      {
        country: 'US',
        name: 'ADT (Alaska Daylight Time: UTC -08)',
        zone: '-08:00',
        tz_name: 'America/Anchorage',
        standard: '-09:00',
        daylight: '-08:00'
      },
      {
        country: 'US',
        name: 'HST (Hawaii Standard Time: UTC -10)',
        zone: '-10:00',
        tz_name: 'Pacific/Honolulu',
        standard: '-09:00',
        daylight: '-08:00'
      }
    ]
  },
  {
    country: 'CA',
    timezones: [
      {
        country: 'CA',
        name: 'PST (Pacific Standard Time: UTC -08)',
        zone: '-08:00',
        tz_name: 'America/Tijuana',
        standard: '-08:00',
        daylight: '-07:00'
      },
      {
        country: 'CA',
        name: 'MST (Mountain Standard Time: UTC -07)',
        zone: '-07:00',
        tz_name: 'America/Edmonton',
        standard: '-07:00',
        daylight: '-06:00'
      },
      {
        country: 'CA',
        name: 'CST (Central Standard Time: UTC -06)',
        zone: '-06:00',
        tz_name: 'America/Winnipeg',
        standard: '-06:00',
        daylight: '-05:00'
      },
      {
        country: 'CA',
        name: 'EST (Eastern Standard Time: UTC -05)',
        zone: '-05:00',
        tz_name: 'America/Toronto',
        standard: '-05:00',
        daylight: '-04:00'
      },
      {
        country: 'CA',
        name: 'AST (Atlantic Standard Time: UTC -04)',
        zone: '-04:00',
        tz_name: 'America/Halifax',
        standard: '-04:00',
        daylight: '-03:00'
      },
      {
        country: 'CA',
        name: 'NST (Newfoundland Standard Time: UTC -03:30)',
        zone: '-03:30',
        tz_name: 'America/St_Johns',
        standard: '-03:30',
        daylight: '-02:30'
      }
    ]
  }
];
export const CALENDAR_DURATION = [
  {
    value: 0.25,
    text: '15 minutes'
  },
  {
    value: 0.5,
    text: '30 minutes'
  },
  {
    value: 0.75,
    text: '45 minutes'
  },
  {
    value: 1,
    text: '1 hour'
  },
  {
    value: 1.25,
    text: '1 hour 15 minutes'
  },
  {
    value: 1.5,
    text: '1 hour 30 minutes'
  },
  {
    value: 1.75,
    text: '1 hour 45 minutes'
  },
  {
    value: 2,
    text: '2 hour'
  }
];
export const RECURRING_TYPE = [
  {
    value: '',
    text: 'DO NOT REPEAT'
  },
  {
    value: 'DAILY',
    text: 'DAILY'
  },
  {
    value: 'WEEKLY',
    text: 'WEEKLY'
  },
  {
    value: 'MONTHLY',
    text: 'MONTHLY'
  }
];
export const REPEAT_DURATIONS = [
  {
    value: 1,
    label: 'Daily'
  },
  {
    value: 7,
    label: 'Weekly'
  },
  {
    value: 30,
    label: 'Monthly'
  }
];
export const STATISTICS_DURATION = ['monthly', 'weekly', 'yearly'];

export const REMINDER = [
  { id: '10', text: '10 min' },
  { id: '20', text: '20 min' },
  { id: '30', text: '30 min' },
  { id: '40', text: '40 min' },
  { id: '50', text: '50 min' },
  { id: '60', text: '1 hour' }
];
export const DELAY = [
  { id: '0', text: 'Immediately' },
  { id: '1', text: '1 min' },
  { id: '2', text: '2 min' },
  { id: '3', text: '3 min' },
  { id: '4', text: '4 min' },
  { id: '5', text: '5 min' },
  { id: '6', text: '6 min' },
  { id: '7', text: '7 min' },
  { id: '8', text: '8 min' },
  { id: '9', text: '9 min' },
  { id: '10', text: '10 min' }
];
export const AUTO_FOLLOW_DELAY = [
  { id: '0', text: 'Immediately' },
  { id: '1', text: '1 hour' },
  { id: '6', text: '6 hours' },
  { id: '12', text: '12 hours' },
  { id: '24', text: '1 day' },
  { id: '48', text: '2 days' },
  { id: '72', text: '3 days' },
  { id: '168', text: '1 week' },
  { id: '336', text: '2 weeks' }
];
export const AUTO_RESEND_DELAY = [
  { id: '0', text: 'Immediately' },
  { id: '12', text: '12 hours' },
  { id: '24', text: '1 day' },
  { id: '48', text: '2 days' },
  { id: '72', text: '3 days' },
  { id: '168', text: '1 week' },
  { id: '336', text: '2 weeks' }
];
export const CALL_REQUEST_DURATION = [
  '15 mins',
  '30 mins',
  '45 mins',
  '1 hour'
];
export const ActionName = {
  note: 'Note',
  email: 'Send Email',
  send_email_video: 'Send Video Email',
  send_text_video: 'Send Video Text',
  send_email_pdf: 'Send PDF Email',
  send_text_pdf: 'Send PDF Text',
  send_email_image: 'Send Image Email',
  send_text_image: 'Send Image Text',
  follow_up: 'Follow up',
  watched_video: 'Watched Video',
  watched_pdf: 'Watched PDF',
  watched_image: 'Watched Image',
  opened_email: 'Opened Email',
  update_contact: 'Update Contact'
};

export const ACTION_CAT = {
  START: 'START',
  NORMAL: 'NORMAL',
  CONDITION: 'CONDITION'
};

export const DefaultMessage = {
  AUTO_VIDEO_TEXT:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here is the link to the video we discussed. Please call/text me back at {user_phone}.',
  AUTO_VIDEO_TEXT1:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here is the link to the video we discussed. Please call/text me back at {user_phone}.',
  AUTO_VIDEO_EMAIL:
    '<div>Hi {contact_first_name},</div><div><br/></div><div>This is {user_name} with eXp Realty. Here is the link to the video we discussed:</div>',
  AUTO_PDF_TEXT:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here is the link to the PDF we discussed. Please call/text me back at {user_phone}.',
  AUTO_PDF_TEXT1:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here is the link to the PDF we discussed. Please call/text me back at {user_phone}.',
  AUTO_PDF_EMAIL:
    '<div>Hi {contact_first_name},</div> <div><br/></div><div>This is {user_name} with eXp Realty. Here is the link to the PDF we discussed:</div>',
  AUTO_IMAGE_TEXT:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here is the link to the Image we discussed. Please call/text me back at {user_phone}.',
  AUTO_IMAGE_TEXT1:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here is the link to the Image we discussed. Please call/text me back at {user_phone}.',
  AUTO_IMAGE_EMAIL:
    '<div>Hi {contact_first_name},</div> <div><br/></div><div>This is {user_name} with eXp Realty. Here is the link to the Image we discussed:</div>',
  AUTO_VIDEOS_TEXT:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here are the links to the videos we discussed. Please call/text me back at {user_phone}.',
  AUTO_VIDEOS_TEXT1:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here are the links to the videos we discussed. Please call/text me back at {user_phone}.',
  AUTO_VIDEOS_EMAIL:
    '<div>Hi {contact_first_name},</div> <div><br/></div><div>This is {user_name} with eXp Realty. Here are the links to the videos we discussed:</div>',
  AUTO_PDFS_TEXT:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here are the link to the PDFs we discussed. Please call/text me back at {user_phone}.',
  AUTO_PDFS_TEXT1:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here are the link to the PDFs we discussed. Please call/text me back at {user_phone}.',
  AUTO_PDFS_EMAIL:
    '<div>Hi {contact_first_name},</div> <div><br/></div><div>This is {user_name} with eXp Realty. Here are the links to the PDFs we discussed:</div>',
  AUTO_IMAGES_TEXT:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here are the link to the Images we discussed. Please call/text me back at {user_phone}.',
  AUTO_IMAGES_TEXT1:
    'Hi {contact_first_name}, \n\nThis is {user_name} with eXp Realty. Here are the link to the Images we discussed. Please call/text me back at {user_phone}.',
  AUTO_IMAGES_EMAIL:
    '<div>Hi {contact_first_name},</div> <div><br/></div><div>This is {user_name} with eXp Realty. Here are the links to the Images we discussed:</div>'
};

export const NoteQuillEditor = {
  toolbar: {
    container: [['bold', 'italic', 'underline', 'strike'], ['link']]
  }
};

export const QuillEditor = {
  toolbar: {
    container: [
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: 1 }, { header: 2 }],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image']
    ]
  },
  table: false,
  'better-table': {
    operationMenu: {
      items: {
        unmergeCells: {
          text: 'Another unmerge cells name'
        }
      },
      color: {
        colors: ['green', 'red', 'yellow', 'blue', 'white'],
        text: 'Background Colors:'
      }
    }
  },
  blotFormatter: {}
};

export const COLORS = [
  ['#f6c5be', '#ef9f93', '#e66550', '#cc3a21', '#ac2c17', '#822212'],
  ['#fee6c7', '#fdd6a2', '#fcbc6c', '#eaa040', '#cf8933', '#a46a20'],
  ['#fef1d1', '#fce8b3', '#fcda83', '#f2c960', '#d5ae4a', '#aa8832'],
  ['#b9e4d0', '#89d3b2', '#44b984', '#279e60', '#1e804b', '#156239'],
  ['#c6f3de', '#a0eac9', '#68dfa9', '#3dc789', '#2a9c68', '#1b764d'],
  ['#c9daf8', '#a4c2f4', '#6d9eeb', '#3d78d8', '#275bac', '#1c4587'],
  ['#e4d7f5', '#d0bcf1', '#b694e8', '#8e63cd', '#653d9b', '#41236d'],
  ['#fcdee8', '#fbc8d8', '#f7a7c0', '#e07798', '#b65775', '#83334c']
];

export const LABEL_COLORS = [
  '#0000ff',
  '#ffcc00',
  '#f5325b',
  '#00916e',
  '#dae0f2',
  '#86bbd8',
  '#f26419',
  '#0d5c63'
];

export const DialogSettings = {
  CONTACT: {
    width: '98vw',
    maxWidth: '600px',
    disableClose: true
  },
  JOIN_TEAM: {
    width: '98vw',
    maxWidth: '600px',
    disableClose: true
  },
  INVITE_TEAM: {
    width: '98vw',
    maxWidth: '600px',
    maxHeight: 'calc(65vh + 114px)',
    disableClose: true
  },
  TASK: {
    width: '98vw',
    maxWidth: '394px',
    disableClose: true
  },
  NOTE: {
    width: '98vw',
    maxWidth: '394px',
    disableClose: true
  },
  AUTOMATION: {
    width: '98vw',
    maxWidth: '394px',
    minHeight: '300px',
    disableClose: true
  },
  ASSISTANT: {
    width: '98vw',
    maxWidth: '394px',
    disableClose: true
  },
  UPLOAD: {
    width: '98vw',
    maxWidth: '840px',
    disableClose: true
  },
  CONFIRM: {
    position: { top: '100px' },
    width: '98vw',
    maxWidth: '400px',
    disableClose: true
  },
  ALERT: {
    width: '98vw',
    maxWidth: '380px'
  }
};

export const BulkActions = {
  Tasks: [
    {
      label: 'Edit tasks',
      loadingLabel: 'Editing...',
      type: 'button',
      icon: 'i-edit',
      command: 'edit',
      loading: false
    },
    {
      label: 'Complete tasks',
      loadingLabel: 'Completing...',
      type: 'button',
      icon: 'i-check',
      command: 'complete',
      loading: false
    },
    {
      label: 'Delete tasks',
      loadingLabel: 'Deleting...',
      type: 'button',
      icon: 'i-trash',
      command: 'delete',
      loading: false
    },
    {
      spliter: true,
      label: 'Select all',
      loadingLabel: 'Selecting...',
      type: 'button',
      command: 'select',
      loading: false
    },
    {
      label: 'Deselect',
      loadingLabel: 'Deselecting...',
      type: 'button',
      command: 'deselect',
      loading: false
    }
  ],
  Contacts: [
    {
      label: 'Add tasks',
      type: 'button',
      icon: 'i-task',
      command: 'add_task',
      loading: false
    },
    {
      label: 'Send messages',
      type: 'button',
      icon: 'i-message',
      command: 'message',
      loading: false
    },
    {
      spliter: true,
      label: 'Select all',
      type: 'button',
      command: 'select',
      loading: false
    },
    {
      label: 'Edit',
      type: 'button',
      icon: 'i-edit',
      command: 'edit',
      loading: false
    },
    {
      label: 'Delete',
      type: 'button',
      icon: 'i-trash',
      command: 'delete',
      loading: false
    },
    {
      label: 'Add notes',
      type: 'button',
      icon: 'i-template',
      command: 'add_note',
      loading: false
    },
    {
      label: 'Add automation',
      type: 'button',
      icon: 'i-automation',
      command: 'automation',
      loading: false
    },
    {
      label: 'Download',
      type: 'button',
      icon: 'i-download',
      command: 'download',
      loading: false
    },
    {
      label: 'Deselect',
      type: 'button',
      command: 'deselect',
      loading: false
    }
  ],
  Materials: [
    {
      label: 'Send via e-mail',
      type: 'button',
      icon: 'i-message',
      command: 'email',
      loading: false
    },
    {
      label: 'Send via SMS',
      type: 'button',
      icon: 'i-sms-sent',
      command: 'text',
      loading: false
    },
    {
      label: 'Lead Capture',
      type: 'toggle',
      status: false,
      command: 'lead_capture',
      loading: false
    },
    {
      label: 'Delete',
      type: 'button',
      icon: 'i-trash',
      command: 'delete',
      loading: false
    },
    {
      spliter: true,
      label: 'Select all',
      type: 'button',
      command: 'select',
      loading: false
    },
    {
      label: 'Deselect',
      type: 'button',
      command: 'deselect',
      loading: false
    }
  ],
  Compaigns: [],
  CompaignContacts: [],
  BulkMailng: [],
  TeamMember: [
    {
      label: 'Bulk status set',
      type: 'dropdown',
      items: [
        {
          class: 'c-green',
          label: 'Editor',
          command: 'set_editor'
        },
        {
          class: 'c-azure',
          label: 'Viewer',
          command: 'set_viewer'
        }
      ]
    },
    {
      label: 'Remove member',
      type: 'button',
      icon: 'i-trash',
      command: 'delete',
      loading: false
    },
    {
      spliter: true,
      label: 'Select all',
      type: 'button',
      command: 'select',
      loading: false
    },
    {
      label: 'Deselect',
      type: 'button',
      command: 'deselect',
      loading: false
    }
  ]
};

export const ContactPageSize = 50;

export const Labels = [
  {
    id: '',
    text: 'No Label'
  },
  {
    id: 'New',
    text: 'New'
  },
  {
    id: 'Cold',
    text: 'Cold'
  },
  {
    id: 'Warm',
    text: 'Warm'
  },
  {
    id: 'Hot',
    text: 'Hot'
  },
  {
    id: 'Team',
    text: 'Team'
  },
  {
    id: 'Trash',
    text: 'Trash'
  },
  {
    id: 'Appt set',
    text: 'Appt set'
  },
  {
    id: 'Appt Missed',
    text: 'Appt Missed'
  },
  {
    id: 'Lead',
    text: 'Lead'
  }
];

export const TeamLabel = '5f16d58d0af09220208b6e0b';
export const TaskStatus = {
  ALL: 'all',
  TODO: 'to_do',
  COMPLETED: 'completed'
};
export const UnlayerThemeId = 6121;
export const ImportSelectableColumn = ['notes', 'tags'];
