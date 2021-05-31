import { CountryISO } from 'ngx-intl-tel-input';

export const CONTACT_SORT_OPTIONS = {
  alpha_down: { dir: true, field: 'name', name: 'alpha_down' },
  alpha_up: { dir: false, field: 'name', name: 'alpha_up' },
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
  CountryISO.Switzerland,
  CountryISO.PuertoRico
];
export const COUNTRY_CODES = {
  USA: 'US',
  CAN: 'CA',
  GBR: 'GB',
  ZAF: 'ZA'
};

export const ROUTE_PAGE = {
  '/home': 'Dashboard',
  '/task': 'Dashboard',
  '/activities': 'Dashboard',
  '/contacts': 'Contacts',
  '/deals': 'Deals',
  '/materials': 'Materials',
  '/autoflow': 'Automations',
  '/settings/tag-manager': 'Tag manager',
  '/teams': 'Teams',
  '/automations': 'Automations',
  '/templates': 'Templates'
};

export const COUNTRIES = [
  {
    code: 'US',
    name: 'United States'
  },
  {
    code: 'CA',
    name: 'Canada'
  },
  {
    code: 'AU',
    name: 'Australia'
  },
  {
    code: 'FR',
    name: 'France'
  },
  {
    code: 'DE',
    name: 'Germany'
  },
  {
    code: 'IN',
    name: 'India'
  },
  {
    code: 'IT',
    name: 'Italy'
  },
  {
    code: 'MX',
    name: 'Mexico'
  },
  {
    code: 'PT',
    name: 'Portugal'
  },
  {
    code: 'PR',
    name: 'Puerto Rico'
  },
  {
    code: 'ZA',
    name: 'South Africa'
  },
  {
    code: 'ES',
    name: 'Spain'
  },
  {
    code: 'CH',
    name: 'Switzerland'
  },
  {
    code: 'UK',
    name: 'United Kingdom'
  },
  {
    code: 'HK',
    name: 'Hong Kong'
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
    'Wyoming',
    'District of Columbia'
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
  ],
  AU: [
    'New South Wales',
    'Queensland',
    'South Australia',
    'Tasmania',
    'Victoria',
    'Western Australia',
    'Australian Capital Territory',
    'Northern Territory'
  ],
  FR: [
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Brittany',
    'Centre-Val de Loire',
    'Corsica',
    'French Guiana',
    'Alsace-Champagne-Ardenne-Lorraine',
    'Guadeloupe',
    'Nord-Pas-de-Calais-Picardie',
    'Île-de-France',
    'Martinique',
    'Mayotte',
    'Normandy',
    'Aquitaine-Limousin-Poitou-Charentes',
    'Languedoc-Roussillon-Midi-Pyrénées',
    'Pays de la Loire',
    'Provence-Alpes-Cote d’Azur',
    'Réunion',
    'Guyane'
  ],
  DE: [
    'Baden-Württemberg',
    'BaBavaria',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hesse',
    'Lower Saxony',
    'Mecklenburg-Vorpommern',
    'North Rhine-Westphalia',
    'Rhineland-Palatinate',
    'Saarland',
    'Saxony',
    'Saxony-Anhalt',
    'Schleswig-Holstein',
    'Thuringia'
  ],
  IN: [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ],
  IT: [
    'Abruzzo',
    'Aosta Valley',
    'Apulia',
    'Basilicata',
    'Calabria',
    'Campania',
    'Emilia-Romagna',
    'Friuli Venezia Giulia',
    'Lazio',
    'Liguria',
    'Lombardy',
    'Marche',
    'Molise',
    'Piedmont',
    'Sardinia',
    'Sicily',
    'Trentino-South Tyrol',
    'Tuscany',
    'Umbria',
    'Veneto'
  ],
  MX: [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Mexico City',
    'Coahuila',
    'Colima',
    'Durango',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'México',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas'
  ],
  PT: [
    'Alcobaça',
    'Alenquer',
    'Arganil',
    'Aveiro',
    'Avis',
    'Barcelos',
    'Beja',
    'Braga',
    'Bragança',
    'Castelo Branco',
    'Cinco Vilas',
    'Coimbra',
    'Crato',
    'Elvas',
    'Faro',
    'Feira',
    'Guarda',
    'Guimarães',
    'Lagos',
    'Lamego',
    'Leiria',
    'Linhares',
    'Lisboa',
    'Miranda',
    'Moncorvo',
    'Ourique',
    'Ourém',
    'Penafiel',
    'Pinhel',
    'Portalegre',
    'Porto',
    'Ribatejo',
    'Santarém',
    'Setúbal',
    'Tavira',
    'Tomar',
    'Torres Vedras',
    'Trancoso',
    'Valença',
    'Viana',
    'Vila Real',
    'Vila Viçosa',
    'Viseu',
    'Évora'
  ],
  PR: [
    'Arecibo',
    'Barceloneta',
    'Camuy',
    'Dorado',
    'Florida',
    'Hatillo',
    'Manatí',
    'Toa Alta',
    'Vega Alta',
    'Vega Baja',
    'Bayamón',
    'Carolina',
    'Cataño',
    'Guaynabo',
    'San Juan',
    'Toa Baja',
    'Trujillo Alto',
    'Caguas',
    'Canóvanas',
    'Ceiba',
    'Culebra',
    'Fajardo',
    'Gurabo',
    'Humacao',
    'Juncos',
    'Las Piedras',
    'Loíza',
    'Luquillo',
    'Maunabo',
    'Naguabo',
    'Río Grande',
    'San Lorenzo',
    'Yabucoa',
    'Vieques',
    'Adjuntas',
    'Aguas Buenas',
    'Aibonito',
    'Barranquitas',
    'Cayey',
    'Ciales',
    'Cidra',
    'Comerío',
    'Corozal',
    'Jayuya',
    'Morovis',
    'Naranjito',
    'Orocovis',
    'Utuado',
    'Arroyo',
    'Caja de Muertos',
    'Coamo',
    'Guayama',
    'Guayanilla',
    'Juana Díaz',
    'Patillas',
    'Peñuelas',
    'Ponce',
    'Salinas',
    'Santa Isabel',
    'Villalba',
    'Aguada',
    'Aguadilla',
    'Añasco',
    'Cabo Rojo',
    'Guánica',
    'Hormigueros',
    'Isabela',
    'Lajas',
    'Lares',
    'Las Marías',
    'Maricao',
    'Mayagüez',
    'Moca',
    'Mona',
    'Quebradillas',
    'Rincón',
    'Sabana Grande',
    'San Germán',
    'San Sebastián',
    'Yauco'
  ],
  ZA: [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape'
  ],
  ES: [
    'Andalusia',
    'Catalonia',
    'Community of Madrid',
    'Valencian Community',
    'Galicia',
    'Castile and León',
    'Basque Country',
    'Castilla-La Mancha',
    'Canary Islands',
    'Region of Murcia',
    'Aragon',
    'Extremadura',
    'Balearic Islands',
    'Principality of Asturias',
    'Chartered Community of Navarre',
    'Cantabria',
    'La Rioja'
  ],
  CH: [],
  UK: ['England', 'Northern Ireland', 'Scotland', 'Wales'],
  HK: []
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
  },
  {
    country: 'UK',
    timezones: [
      {
        country: 'UK',
        name: 'London Time',
        zone: '+00:00',
        tz_name: 'Europe/London',
        standard: '+00:00',
        daylight: '+01:00'
      },
      {
        country: 'UK',
        name: 'Gibraltar Time',
        zone: '+01:00',
        tz_name: 'Europe/Gibraltar',
        standard: '+01:00',
        daylight: '+02:00'
      },
      {
        country: 'UK',
        name: 'Anguilla Time',
        zone: '-04:00',
        tz_name: 'America/Anguilla',
        standard: '-04:00',
        daylight: '-04:00'
      },
      {
        country: 'UK',
        name: 'Grand Turk Time',
        zone: '-05:00',
        tz_name: 'America/Grand_Turk',
        standard: '-05:00',
        daylight: '-04:00'
      },
      {
        country: 'UK',
        name: 'Falkland Islands Time',
        zone: '-03:00',
        tz_name: 'Antarctica/Rothera',
        standard: '-03:00',
        daylight: '-03:00'
      },
      {
        country: 'UK',
        name: 'Bermuda Time',
        zone: '-04:00',
        tz_name: 'Atlantic/Bermuda',
        standard: '-04:00',
        daylight: '-03:00'
      },
      {
        country: 'UK',
        name: 'South Georgia Time',
        zone: '-02:00',
        tz_name: 'Atlantic/South_Georgia',
        standard: '-02:00',
        daylight: '-02:00'
      },
      {
        country: 'UK',
        name: 'Saint Helena Time',
        zone: '+00:00',
        tz_name: 'Atlantic/St_Helena',
        standard: '+00:00',
        daylight: '+00:00'
      },
      {
        country: 'UK',
        name: 'British Indian Ocean Territory Time',
        zone: '+06:00',
        tz_name: 'Indian/Chagos',
        standard: '+06:00',
        daylight: '+06:00'
      },
      {
        country: 'UK',
        name: 'Pitcairn Islands Time',
        zone: '-08:00',
        tz_name: 'Pacific/Pitcairn',
        standard: '-08:00',
        daylight: '-08:00'
      }
    ]
  },
  {
    country: 'AU',
    timezones: [
      {
        country: 'AU',
        name: 'Australian Western Standard Time',
        zone: '+08:00',
        tz_name: 'Australia/Perth',
        standard: '+08:00',
        daylight: '+08:00'
      },
      {
        country: 'AU',
        name: 'Australian Central Standard Time',
        zone: '+09:30',
        tz_name: 'Australia/Darwin',
        standard: '+09:30',
        daylight: '+09:30'
      },
      {
        country: 'AU',
        name: 'Australian Eastern Standard Time',
        zone: '+10:00',
        tz_name: 'Australia/Sydney',
        standard: '+10:00',
        daylight: '+10:00'
      },
      {
        country: 'AU',
        name: 'Australian Central Time',
        zone: '+09:30',
        tz_name: 'Australia/Broken_Hill',
        standard: '+09:30',
        daylight: '+10:30'
      },
      {
        country: 'AU',
        name: 'Australian Eastern Time',
        zone: '+10:00',
        tz_name: 'Australia/Hobart',
        standard: '+10:00',
        daylight: '+11:00'
      }
    ]
  },
  {
    country: 'HK',
    timezones: [
      {
        country: 'HK',
        name: 'Hong Kong Time',
        zone: '+08:00',
        tz_name: 'Asia/Hong_Kong',
        standard: '+08:00',
        daylight: '+08:00'
      }
    ]
  },
  {
    country: 'DE',
    timezones: [
      {
        country: 'DE',
        name: 'Germany Time',
        zone: '+01:00',
        tz_name: 'Europe/Berlin',
        standard: '+01:00',
        daylight: '+02:00'
      }
    ]
  },
  {
    country: 'IN',
    timezones: [
      {
        country: 'IN',
        name: 'India Standard Time',
        zone: '+05:30',
        tz_name: 'Asia/Kolkata',
        standard: '+05:30',
        daylight: '+05:30'
      }
    ]
  },
  {
    country: 'IT',
    timezones: [
      {
        country: 'IT',
        name: 'Central European Summer Time',
        zone: '+01:00',
        tz_name: 'Europe/Rome',
        standard: '+01:00',
        daylight: '+01:00'
      }
    ]
  },
  {
    country: 'PT',
    timezones: [
      {
        country: 'PT',
        name: 'Western European Summer Time',
        zone: '+00:00',
        tz_name: 'Europe/Lisbon',
        standard: '+00:00',
        daylight: '+01:00'
      }
    ]
  },
  {
    country: 'PR',
    timezones: [
      {
        country: 'PR',
        name: 'Atlantic Standard Time',
        zone: '-04:00',
        tz_name: 'America/Puerto_Rico',
        standard: '-04:00',
        daylight: '-04:00'
      }
    ]
  },
  {
    country: 'ES',
    timezones: [
      {
        country: 'ES',
        name: 'Spain Time',
        zone: '+01:00',
        tz_name: 'Europe/Madrid',
        standard: '+01:00',
        daylight: '+02:00'
      }
    ]
  },
  {
    country: 'CH',
    timezones: [
      {
        country: 'CH',
        name: 'Switzerland Time',
        zone: '+01:00',
        tz_name: 'Europe/Zurich',
        standard: '+01:00',
        daylight: '+02:00'
      }
    ]
  },
  {
    country: 'ZA',
    timezones: [
      {
        country: 'ZA',
        name: 'South African Standard Time',
        zone: '+02:00',
        tz_name: 'Africa/Johannesburg',
        standard: '+02:00',
        daylight: '+02:00'
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
    value: 'DAILY',
    label: 'Daily'
  },
  {
    value: 'WEEKLY',
    label: 'Weekly'
  },
  {
    value: 'MONTHLY',
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
  email: 'Send email',
  send_email_video: 'Send Video Email',
  send_text_video: 'Send Video Text',
  send_email_pdf: 'Send PDF Email',
  send_text_pdf: 'Send PDF Text',
  send_email_image: 'Send Image Email',
  send_text_image: 'Send Image Text',
  follow_up: 'Task',
  update_follow_up: 'Update Task',
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
  DEAL: {
    width: '100vw',
    maxWidth: '600px',
    disableClose: true
  },
  NOTE: {
    width: '98vw',
    maxWidth: '540px',
    disableClose: true
  },
  AUTOMATION_ACTION: {
    minHeight: '300px',
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
      label: 'New Task',
      type: 'button',
      icon: 'i-task',
      command: 'add_task',
      loading: false
    },
    {
      label: 'New Email',
      type: 'button',
      icon: 'i-message',
      command: 'message',
      loading: false
    },
    {
      label: 'New Text',
      type: 'button',
      icon: 'i-sms-sent',
      command: 'text',
      loading: false
    },
    {
      label: 'New Call',
      type: 'button',
      icon: 'i-phone',
      command: 'call',
      loading: false
    },
    {
      label: 'New Note',
      type: 'button',
      icon: 'i-notes',
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
      label: 'Edit',
      type: 'button',
      icon: 'i-edit',
      command: 'edit',
      loading: false
    },
    {
      label: 'Download',
      type: 'button',
      icon: 'i-download',
      command: 'download',
      loading: false,
      loadingLabel: 'Downloading'
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
    },
    {
      label: 'Delete',
      type: 'button',
      icon: 'i-trash',
      command: 'delete',
      loading: false
    }
  ],
  TeamContacts: [
    {
      label: 'New Task',
      type: 'button',
      icon: 'i-task',
      command: 'add_task',
      loading: false
    },
    {
      label: 'New Email',
      type: 'button',
      icon: 'i-message',
      command: 'message',
      loading: false
    },
    {
      label: 'New Note',
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
      loading: false,
      loadingLabel: 'Downloading'
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
  Materials: [
    {
      label: 'Send via Email',
      type: 'button',
      icon: 'i-message',
      command: 'email',
      loading: false
    },
    {
      label: 'Send via Text',
      type: 'button',
      icon: 'i-sms-sent',
      command: 'text',
      loading: false
    },
    {
      label: 'Edit Template',
      type: 'button',
      icon: 'i-template',
      command: 'template',
      loading: false
    },
    {
      label: 'Capture',
      type: 'toggle',
      status: false,
      command: 'lead_capture',
      loading: false
    },
    {
      label: 'Move To',
      type: 'button',
      icon: 'i-folder',
      command: 'folder',
      loading: false
    },
    {
      label: 'Deselect',
      type: 'button',
      command: 'deselect',
      loading: false
    },
    {
      label: 'Delete',
      type: 'button',
      icon: 'i-trash',
      command: 'delete',
      loading: false
    }
  ],
  Folders: [
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
      label: 'Deselect',
      type: 'button',
      command: 'deselect',
      loading: false
    }
  ],
  TeamMaterials: [
    {
      label: 'Send via email',
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
      label: 'Capture',
      type: 'toggle',
      status: false,
      command: 'lead_capture',
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

export const AUTOMATION_ICONS = {
  FOLLOWUP: '../../../assets/img/automations/follow_up.svg',
  UPDATE_FOLLOWUP: '../../../assets/img/follow-step.png',
  CREATE_NOTE: '../../../assets/img/automations/create_note.svg',
  SEND_EMAIL: '../../../assets/img/automations/send_email.svg',
  SEND_VIDEO_EMAIL: '../../../assets/img/automations/send_video_email.svg',
  SEND_VIDEO_TEXT: '../../../assets/img/automations/send_video_text.svg',
  SEND_PDF_EMAIL: '../../../assets/img/automations/send_pdf_email.svg',
  SEND_PDF_TEXT: '../../../assets/img/automations/send_pdf_text.svg',
  SEND_IMAGE_EMAIL: '../../../assets/img/automations/send_image_email.svg',
  SEND_IMAGE_TEXT: '../../../assets/img/automations/send_image_text.svg',
  UPDATE_CONTACT: '../../../assets/img/automations/update_contact.svg',
  WATCHED_VIDEO: '../../../assets/img/automations/watched_video.svg',
  WATCHED_PDF: '../../../assets/img/automations/watched_pdf.svg',
  WATCHED_IMAGE: '../../../assets/img/watch_image.png',
  OPENED_EMAIL: '../../../assets/img/automations/opened_email.svg'
};

export const PACKAGE_LEVEL = {
  LITE: {
    package: 'LITE'
  },
  PRO: {
    package: 'PRO'
  },
  ELITE: {
    package: 'ELITE'
  },
  CUSTOM: {
    package: 'CUSTOM'
  }
};

export const DIAL_LEVEL = {
  lite: {
    package: 'lite',
    price: 40
  },
  pro: {
    package: 'pro',
    price: 60
  },
  elite: {
    package: 'elite',
    price: 100
  }
};

export const STRIPE_KEY = 'pk_live_p0mahSVHjPHiknXx0iEEta8400Gn8n3onx';
// export const STRIPE_KEY = 'pk_test_Fiq3VFU3LvZBSJpKGtD0paMK0005Q6E2Q2';

export const CANCEL_ACCOUNT_REASON = [
  'Switching to a competetor',
  'Dont have the budget',
  'Couldn’t get it working',
  'Missing features',
  'Customer support',
  'Another reason'
];

export const CHUNK_SIZE = 15;
