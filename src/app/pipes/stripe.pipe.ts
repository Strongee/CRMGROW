import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripe'
})
export class StripePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value) {
      return value.replace(/<.*?>/g, '');
    } else {
      return '';
    }
  }
}
