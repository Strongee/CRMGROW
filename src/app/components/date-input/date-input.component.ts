import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss']
})
export class DateInputComponent implements OnInit {
  @Input() placeholder = 'Select Date';
  @Input() required = true;
  @Input() value = null;
  @Output() valueChange = new EventEmitter();
  @Input() minDate = null;
  @Input() type = '';
  @Input() uiType = 'default';
  @Input() title = '';
  isOpen = false;
  dateInput: FormControl = new FormControl();
  @ViewChild('trigger') triggerElement: CdkOverlayOrigin;

  dateString;
  constructor() {}

  ngOnInit(): void {}

  closeOverlay(event: MouseEvent): void {
    const target = <HTMLInputElement>event.target;
    const triggerEl = <HTMLInputElement>(
      this.triggerElement.elementRef.nativeElement
    );
    if (target === triggerEl) {
      return;
    }
    this.isOpen = false;
    return;
  }

  openOverlay(): void {
    this.isOpen = !this.isOpen;
    const triggerEl = <HTMLInputElement>(
      this.triggerElement.elementRef.nativeElement
    );
    triggerEl.blur();
  }

  changeDate(): void {
    if (this.value) {
      this.dateString =
        this.value.year + '-' + this.value.month + '-' + this.value.day;
    } else {
      this.dateString = '';
    }
    this.valueChange.emit(this.value);
    this.isOpen = false;
  }

  dateFormat(): string {
    if (this.value) {
      return (
        this.MONTHS[this.value.month - 1] +
        ' ' +
        this.value.day +
        ' ' +
        this.value.year
      );
    } else {
      return 'Select date';
    }
  }

  MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
}
