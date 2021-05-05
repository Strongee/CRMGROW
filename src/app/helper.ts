import * as Quill from 'quill';
const InlineBlock = Quill.import('blots/inline');
const Embed = Quill.import('blots/embed');
const BlockEmbed = Quill.import('blots/block/embed');
const Delta = Quill.import('delta');
const Parchment = Quill.import('parchment');
const Block = Quill.import('blots/block');
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

export const numPad = (num) => {
  if (num < 10) {
    return '0' + num;
  }
  return num + '';
};

export const TelFormat = {
  numericOnly: true,
  blocks: [0, 3, 3, 4],
  delimiters: ['(', ') ', '-']
};

export const ByteToSize = (bytes, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const AppendArray = (arr1, arr2) => {
  if (!(arr1 && arr1.length)) {
    return arr2;
  } else if (!(arr2 && arr2.length)) {
    return arr1;
  } else {
    return arr1.concat(arr2);
  }
};

export const PullArray = (arr1, arr2) => {
  if (!arr1 || !arr1.length) {
    return [];
  } else if (!arr2 || !arr2.length) {
    return arr1;
  } else {
    const diff = [];
    arr1.forEach((e) => {
      if (arr2.indexOf(e) === -1) {
        diff.push(e);
      }
    });
    return diff;
  }
};

export const promptForFiles = (): Promise<FileList> => {
  return new Promise<FileList>((resolve, reject) => {
    // make file input element in memory
    const fileInput: HTMLInputElement = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    // fileInput['capture'] = 'camera';
    fileInput.addEventListener('error', (event) => {
      reject(event.error);
    });
    fileInput.addEventListener('change', (event) => {
      resolve(fileInput.files);
    });
    // prompt for video file
    fileInput.click();
  });
};

export const listToTree = (list) => {
  const map = {},
    roots = [];
  let node, i;
  for (i = 0; i < list.length; i += 1) {
    map[list[i].ref] = i; // initialize the map
    list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.parent_ref !== '0') {
      if (
        list[map[node.parent_ref]] &&
        list[map[node.parent_ref]]['status'] === 'disabled'
      ) {
        node['status'] = 'disabled';
      }
      list[map[node.parent_ref]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

export const rebuildListToTree = (list) => {
  const map = {};
  const roots = [];
  let root = null;
  for (const node of list) {
    map[node.ref] = node;
    node.children = [];
  }

  for (const node of list) {
    if (node.parent_ref !== '0') {
      const parent = map[node.parent_ref];
      if (parent) {
        if (parent.status === 'disabled') {
          node.status = 'disabled';
        }
        parent.children.push(node);
      }
    } else {
      root = node;
    }
  }

  if (root === null) {
    return roots;
  }

  for (const node of list) {
    const parent = map[node.parent_ref];
    const isCompleted = !isUncompleted(node);
    if (parent && isCompleted) {
      const index = parent.children.indexOf(node.ref);
      if (index >= 0) {
        parent.children.splice(index, 1);
      }
    }
  }

  while (true) {
    // if (root.children.length == 1) {
    //   const child = root.children[0];
    //   if (root.status === 'completed' && child.status === 'completed')
    //     root = child;
    //   else
    //     break;
    // }
    // else
    //   break;
    if (root.status === 'completed') {
      let nextChild = null;
      for (const child of root.children) {
        if (child.status === 'completed') {
          nextChild = child;
        }
      }
      if (nextChild) {
        root = nextChild;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (isUncompleted(root)) {
    roots.push(root);
  }

  return roots;
};

function isUncompleted(node): any {
  if (node.status === 'active' || node.status === 'pending') {
    return true;
  }

  for (const child of node.children) {
    if (isUncompleted(child) === true) {
      return true;
    }
  }
  return false;
}
export const loadBase64 = (file: Blob): Promise<any> => {
  const fileReader = new FileReader();
  return new Promise<any>((resolve, reject) => {
    fileReader.addEventListener('error', reject);
    fileReader.addEventListener('load', () => {
      resolve(fileReader.result);
    });
    fileReader.readAsDataURL(file);
  });
};

export class SignatureBlot extends Embed {
  static blotName = 'emailSignature';
  static tagName = 'div';
  static className = 'email-signature';
  static create(data) {
    const node = super.create(data.value);
    node.setAttribute('data-value', data.value);
    node.innerHTML = data.value;
    return node;
  }

  static value(domNode) {
    return domNode.getAttribute('data-value');
  }
}
export class MaterialBlot extends Embed {
  static tagName = 'a';
  static className = 'material-object';
  static blotName = 'materialLink';
  static create(data) {
    if (!data || !data._id || !data.preview) {
      return;
    }
    const node = super.create();
    node.setAttribute('href', data._id);
    node.setAttribute('contenteditable', false);
    const img = document.createElement('img');
    img.setAttribute('src', data.preview);
    img.alt = 'Preview image went something wrong. Please click here';
    img.width = 320;
    img.height = 176;
    node.appendChild(img);
    return node;
  }
  static value(domNode) {
    const _id = domNode.getAttribute('href');
    let preview = '';
    const previewImg = domNode.querySelector('img');
    if (previewImg) {
      preview = previewImg.src;
    }
    return {
      _id,
      preview
    };
  }
}
Quill.register(MaterialBlot, true);
Block.tagName = 'DIV';
// Quill.register(SignatureBlot, true);
Quill.register(Block, true);

export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

export function toString(value: any): string {
  return value !== undefined && value !== null ? `${value}` : '';
}

export function getValueInRange(value: number, max: number, min = 0): number {
  return Math.max(Math.min(value, max), min);
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

export function isInteger(value: any): value is number {
  return (
    typeof value === 'number' && isFinite(value) && Math.floor(value) === value
  );
}

export function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}

export function padNumber(value: number): any {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}

export function regExpEscape(text): any {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function hasClassName(element: any, className: string): boolean {
  return (
    element &&
    element.className &&
    element.className.split &&
    element.className.split(/\s+/).indexOf(className) >= 0
  );
}

if (typeof Element !== 'undefined' && !Element.prototype.closest) {
  // Polyfill for ie10+

  if (!Element.prototype.matches) {
    // IE uses the non-standard name: msMatchesSelector
    Element.prototype.matches =
      (Element.prototype as any).msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  Element.prototype.closest = function (s: string) {
    let el = this;
    if (!document.documentElement.contains(el)) {
      return null;
    }
    do {
      if (el.matches(s)) {
        return el;
      }
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

export function closest(element: HTMLElement, selector): HTMLElement {
  if (!selector) {
    return null;
  }

  return element.closest(selector);
}

export function adjustPhoneNumber(str): any {
  const result = str.replace(/[^0-9]/g, '');
  if (str[0] === '+') {
    return `+${result}`;
  } else {
    return result;
  }
}

export function validateEmail(email): any {
  const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/gim;
  if (email === '' || !re.test(email)) {
    return false;
  }
  return true;
}
export function getCurrentTimezone(): string {
  const oft = new Date().getTimezoneOffset();
  const offset = Math.abs(oft);
  const hour = Math.floor(offset / 60);
  const min = offset % 60;
  const symbol = oft > 0 ? '-' : '+';
  const hour_s = numPad(hour);
  const min_s = numPad(min);
  return symbol + hour_s + ':' + min_s;
}

export function offsetToTz(oft: number): string {
  const offset = Math.abs(oft);
  const hour = Math.floor(offset / 60);
  const min = offset % 60;
  const symbol = oft > 0 ? '-' : '+';
  const hour_s = numPad(hour);
  const min_s = numPad(min);
  return symbol + hour_s + ':' + min_s;
}

/**
 * Convert the time to specific timezone string
 * @param date : Date Object (year, month, day)
 * @param time : time String (hh:mm:ss.mmm)
 * @param timezone : timezone object(tz_name, zone)
 */
export function convertTimetoTz(
  date: any,
  time: string,
  timezone: any
): string {
  let dateTime = '';
  if (timezone.tz_name) {
    const dateStr = `${date.year}-${date.month}-${date.day} ${time}`;
    dateTime = moment.tz(dateStr, timezone.tz_name).format();
  } else {
    dateTime = `${date.year}-${numPad(date.month)}-${numPad(date.day)}T${time}${
      timezone.zone
    }`;
  }
  return dateTime;
}

export function convertTimetoObj(dateTime: string, timezone: any): any {
  try {
    let date = moment(dateTime);
    if (timezone.tz_name) {
      date = date.tz(timezone.tz_name);
    } else {
      date = date.utcOffset(timezone.zone);
    }
    const year = date.get('year');
    const month = date.get('month') + 1;
    const day = date.get('date');
    const hour = date.get('hour');
    const min = date.get('minute');
    const sec = date.get('second');
    return {
      year,
      month,
      day,
      time: `${numPad(hour)}:${numPad(min)}:${numPad(sec)}.000`
    };
  } catch (err) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      time: '00:00:00.000'
    };
  }
}

export function searchReg(content: string, target: string): boolean {
  const words = _.uniqBy(
    target.split(' ').sort((a, b) => (a.length > b.length ? -1 : 1)),
    (e) => e.toLowerCase()
  );
  const reg = new RegExp(words.join('|'), 'gi');
  if (!target || !words.length) {
    return true;
  }
  if (
    _.uniqBy(content.match(reg), (e) => e.toLowerCase()).length === words.length
  ) {
    return true;
  }
  return false;
}
