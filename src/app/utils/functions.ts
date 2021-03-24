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
    array = _.orderBy(array, [field], [searchDirection]);
    return array;
  }
  return [];
}

export function sortRoleArray(array: any[], ascending = true): any[] {
  if (array.length > 0) {
    let order;
    if (ascending) {
      order = { admin: 1, own: 2, team: 3, shared: 4 };
    } else {
      order = { own: 1, team: 2, shared: 3, admin: 4 };
    }
    array = _.sortBy(array, function (element) {
      if (element.role) {
        return order[element.role];
      } else {
        return order['own'];
      }
    });
    return array;
  }
}

export function sortMaterialRoleArray(array: any[], ascending = true): any[] {
  if (array.length > 0) {
    let order;
    if (ascending) {
      order = { Admin: 1, Me: 2, User: 3, Unknown: 4 };
    } else {
      order = { Me: 1, Admin: 2, User: 3, Unknown: 4 };
    }
    array = _.sortBy(array, function (element) {
      if (
        element.owner == 'Admin' ||
        element.owner == 'Me' ||
        element.owner == 'Unknown'
      ) {
        return order[element.owner];
      } else {
        return order['User'];
      }
    });
    return array;
  }
}

export function sortTypeArray(array: any[], ascending = true): any[] {
  if (array.length > 0) {
    let order;
    if (ascending) {
      order = { folder: 1, video: 2, pdf: 3, image: 4 };
    } else {
      order = { image: 1, pdf: 2, video: 3, folder: 4 };
    }
    array = _.sortBy(array, function (element) {
      return order[element.material_type];
    });
    return array;
  }
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
