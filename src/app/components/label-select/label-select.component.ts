import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
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
  @Input('value') value = '';
  @Input('type') type = '';
  @Input('defaultLabel') defaultLabel = 'No Label';

  @ViewChild('selector') selector: MatSelect;
  @ViewChild('auto') autoComplete: MatAutocomplete;
  @ViewChild('inputField') trigger: ElementRef;

  formControl: FormControl = new FormControl();
  constructor(public labelService: LabelService) {}

  ngOnInit(): void {
    this.labelService.labels$.subscribe((res) => {
      const value = _.find(res, (e) => e._id === this.value);
      this.formControl.setValue(value);
    });

    this.formControl.valueChanges.subscribe((value) => {});
  }

  onChangeLabel(event: MatAutocompleteSelectedEvent): void {}

  ngAfterViewInit(): void {}

  focusField(): void {
    this.trigger.nativeElement.focus();
  }

  /**
   * Open Manage Label Panel
   */
  openManageLabel(): void {
    this.labelService.manageLabel.next(true);
  }
}
