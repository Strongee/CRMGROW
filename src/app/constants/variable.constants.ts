export const TIMEZONE = [
  {
    country: 'US',
    timezones: [
      {
        country: 'US',
        name: 'EDT (Eastern Daylight Time: UTC -04)',
        zone: '-04:00'
      },
      {
        country: 'US',
        name: 'CDT (Central Daylight Time: UTC -05)',
        zone: '-05:00'
      },
      {
        country: 'US',
        name: 'MDT (Mountain Daylight Time: UTC -06)',
        zone: '-06:00'
      },
      {
        country: 'US',
        name: 'PDT (Pacific Daylight Time: UTC -07)',
        zone: '-07:00'
      },
      {
        country: 'US',
        name: 'ADT (Alaska Daylight Time: UTC -08)',
        zone: '-08:00'
      },
      {
        country: 'US',
        name: 'HST (Hawaii Standard Time: UTC -10)',
        zone: '-10:00'
      }
    ]
  },
  {
    country: 'CA',
    timezones: [
      {
        country: 'CA',
        name: 'PST (Pacific Standard Time: UTC -08)',
        zone: '-08:00'
      },
      {
        country: 'CA',
        name: 'MST (Mountain Standard Time: UTC -07)',
        zone: '-07:00'
      },
      {
        country: 'CA',
        name: 'CST (Central Standard Time: UTC -06)',
        zone: '-06:00'
      },
      {
        country: 'CA',
        name: 'EST (Eastern Standard Time: UTC -05)',
        zone: '-05:00'
      },
      {
        country: 'CA',
        name: 'AST (Atlantic Standard Time: UTC -04)',
        zone: '-04:00'
      },
      {
        country: 'CA',
        name: 'NST (Newfoundland Standard Time: UTC -03:30)',
        zone: '-03:30'
      }
    ]
  }
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

export const ContactPageSize = 50;

export const CALL_REQUEST_DURATION = [
  '15 mins',
  '30 mins',
  '45 mins',
  '1 hour'
];

export const NoteQuillEditor = {
  toolbar: {
    container: [['bold', 'italic', 'underline', 'strike'], ['link']]
  }
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

export const REMINDER = [
  { id: '10', text: '10 min' },
  { id: '20', text: '20 min' },
  { id: '30', text: '30 min' },
  { id: '40', text: '40 min' },
  { id: '50', text: '50 min' },
  { id: '60', text: '1 hour' }
];

export const DELAY = [
  { id: '', text: 'Immediately' },
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

export const COMPANIES = ['eXp Realty'];

export const MONTH = [
  { id: '1', text: 'January' },
  { id: '2', text: 'February' },
  { id: '3', text: 'March' },
  { id: '4', text: 'April' },
  { id: '5', text: 'May' },
  { id: '6', text: 'June' },
  { id: '7', text: 'July' },
  { id: '8', text: 'Augus' },
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
  imageResize: true
};

export const INVOICES = [
  {
    number: 'CRMgrow #124577',
    payment_date: '16.06.2020',
    issue_date: '02.06.2020',
    gross: '$ 5000'
  },
  {
    number: 'CRMgrow #163346',
    payment_date: '08.07.2020',
    issue_date: '22.06.2020',
    gross: '$ 6000'
  },
  {
    number: 'CRMgrow 02/06/2020',
    payment_date: '16.06.2020',
    issue_date: '22.06.2020',
    gross: '$ 6000'
  }
];

export const DialogSettings = {
  CONTACT: {
    width: '98vw',
    maxWidth: '600px'
  },
  JOIN_TEAM: {
    width: '98vw',
    maxWidth: '600px'
  },
  INVITE_TEAM: {
    width: '98vw',
    maxWidth: '600px',
    height: 'calc(65vh + 114px)'
  },
  TASK: {
    width: '98vw',
    maxWidth: '394px'
  }
};

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
