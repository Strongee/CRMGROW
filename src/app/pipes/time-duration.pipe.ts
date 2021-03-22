import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDuration'
})
export class TimeDurationPipe implements PipeTransform {
  transform(value: string, ...args: any): unknown {
    let input = 0;
    try {
      input = parseInt(value);
    } catch (err) {
      return '';
    }
    if (isNaN(input)) {
      return '';
    }
    if (input < 0) {
      input = 0;
    }
    const dateObj = new Date(input);
    const hours = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    const timeString = hours + ':' + minutes + ':' + seconds;
    return timeString;
  }
}
