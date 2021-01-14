import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { LabelService } from 'src/app/services/label.service';
import { Label } from 'src/app/models/label.model';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import * as _ from 'lodash';
@Component({
  selector: 'app-label-select',
  templateUrl: './label-select.component.html',
  styleUrls: ['./label-select.component.scss']
})
export class LabelSelectComponent implements OnInit, AfterViewInit {
  @Input()
  public set value(val: string) {
    const labels = this.labelService.labels.getValue();
    const selected = _.find(labels, (e) => e._id === val);
    this.label = selected && selected._id ? selected._id : '';
    this.formControl.setValue(selected, { emitEvent: false });
  }
  @Output() valueChange = new EventEmitter();
  @Input('type') type = ''; // form style input
  @Input('defaultLabel') defaultLabel = 'No Label'; // default label input.

  @ViewChild('selector') selector: MatSelect;
  @ViewChild('auto') autoComplete: MatAutocomplete;
  @ViewChild('inputField') trigger: ElementRef;

  label: string = '';
  formControl: FormControl = new FormControl();
  constructor(public labelService: LabelService) {}

  ngOnInit(): void {
    this.labelService.labels$.subscribe((res) => {
      const value = _.find(res, (e) => e._id === this.label);
      this.formControl.setValue(value, { emitEvent: false });
    });

    this.formControl.valueChanges.subscribe((value) => {
      if (value && value._id) {
        this.label = value._id;
        this.valueChange.emit(value._id);
      } else {
        this.label = '';
        this.valueChange.emit('');
      }
    });
  }

  onChangeLabel(event: MatAutocompleteSelectedEvent): void {}

  ngAfterViewInit(): void {}

  focusField(): void {
    this.trigger.nativeElement.focus();
    this.trigger.nativeElement.blur();
  }

  /**
   * Open Manage Label Panel
   */
  openManageLabel(): void {
    this.trigger.nativeElement.blur();
    this.labelService.manageLabel.next(true);
  }
}
