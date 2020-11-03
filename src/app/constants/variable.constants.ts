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
