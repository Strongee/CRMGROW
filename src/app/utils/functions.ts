import * as _ from 'lodash';
import {PACKAGE_LEVEL} from "../constants/variable.constants";

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
    if (field === 'title') {
      array = _.orderBy(
        array,
        [(e) => (e?.title || '').toLowerCase()],
        [searchDirection]
      );
    } else if (field === 'subject') {
      array = _.orderBy(
        array,
        [(e) => (e?.subject || '').toLowerCase()],
        [searchDirection]
      );
    } else if (field === 'contacts') {
      array = _.orderBy(
        array,
        [
          (e) =>
            e.contacts && e.contacts.length > 0
              ? (e.contacts[0].first_name === '' &&
                e.contacts[0].last_name === ''
                  ? 'Unnamed Contact'
                  : e.contacts[0].first_name + ' ' + e.contacts[0].last_name
                ).toLowerCase()
              : ''
        ],
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
    if (field === 'inquired') {
      array = _.orderBy(array, (o) => new Date(o['created_at']), [
        searchDirection
      ]);
    } else if (field === 'proposed') {
      array = _.orderBy(array, (o) => new Date(o['proposed_at'][0]), [
        searchDirection
      ]);
    } else if (field === 'schedule') {
      array = _.orderBy(
        array,
        (o) => (o['confirmed_at'] ? new Date(o['confirmed_at']) : new Date()),
        [searchDirection]
      );
    }
    array = _.orderBy(array, (o) => new Date(o[field]), [searchDirection]);
    return array;
  }
  return [];
}

export function sortObjectArray(
  array: any[],
  field: string,
  ascending = true
): any[] {
  if (array.length > 0) {
    const searchDirection = ascending ? 'asc' : 'desc';
    if (field === 'organizer') {
      array = _.orderBy(
        array,
        [(e) => (e?.user.user_name || '').toLowerCase()],
        [searchDirection]
      );
    } else if (field === 'leader') {
      array = _.orderBy(
        array,
        [(e) => (e?.leader.user_name || '').toLowerCase()],
        [searchDirection]
      );
    } else {
      array = _.orderBy(array, [field], [searchDirection]);
    }
    return array;
  }
  return [];
}

export function getUserLevel(level): string {
  if (level) {
    return level;
  }
  // return PACKAGE_LEVEL.lite.package;
  return PACKAGE_LEVEL.pro.package;
}
