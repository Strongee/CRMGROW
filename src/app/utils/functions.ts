import * as _ from 'lodash';

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/gim;
  if (email == '' || !re.test(email)) {
    return false;
  }
  return true;
}

export function sortStringArray(
  array: any[],
  field: string,
  ascending = true
): any[] {
  if (array.length > 0) {
    const searchDirection = ascending ? 'asc' : 'desc';
    if (field == 'title') {
      array = _.orderBy(
        array,
        [(array) => array?.title.toLowerCase()],
        [searchDirection]
      );
    } else {
      array = _.orderBy(array, [field], [searchDirection]);
    }
    return array;
  }
  return [];
}

export function sortDateArray(
  array: any[],
  field: string,
  ascending = true
): any[] {
  if (array.length > 0) {
    const searchDirection = ascending ? 'asc' : 'desc';
    array = _.orderBy(array, (o) => new Date(o[field]), [searchDirection]);
    return array;
  }
  return [];
}
