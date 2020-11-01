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
