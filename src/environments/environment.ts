// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // api: 'https://app.crmgrow.com/api/',
  // api: 'http://192.168.1.62:3000/api/',
  api: 'http://localhost:3000/api/',
  server: 'http://localhost:3000',
  website: 'http://localhost:3000',
  ClientId: {
    Google:
      '630484366982-m6e66b06vlo0g6ebg9h2q5t7nrk2rimr.apps.googleusercontent.com',
    Outlook: '495c34a1-c12c-4932-b134-7f3c3ec491d6'
  },
  RedirectUri: {
    Outlook: 'http://localhost:4200/login'
  },
  API_KEY: {
    Youtube: 'AIzaSyDnuZGQ1pP5Wr-z1yIk8DQKmN1MJfjK5wc',
    Notification:
      'BE_FojfPS_0FbZGafCaHBpaZldJ91dkeXA6zGtQiM3R4A0oNOW76ejjEA2bRqAomwbIqGbCDsEjK_1VyCX_496o'
  },
  THIRD_PARTY: {
    GTM_ID: 'GTM-W55F6VL'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
