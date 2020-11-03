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
