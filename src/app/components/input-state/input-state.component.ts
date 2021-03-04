import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { REGIONS } from 'src/app/constants/variable.constants';
import * as _ from 'lodash';

@Component({
  selector: 'app-input-state',
  templateUrl: './input-state.component.html',
  styleUrls: ['./input-state.component.scss']
})
export class InputStateComponent implements OnInit {
  @Input('selectedRegions') selectedRegions: string[] = [];
  @Input('selectedCountries') selectedCountries: string[] = [];
  @Output() onSelect = new EventEmitter();

  COUNTRY_REGIONS = REGIONS;
  formControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('auto') autoComplete: MatAutocomplete;

  constructor() {}

  ngOnInit(): void {}

  remove(region: string): void {
    _.remove(this.selectedRegions, (e) => {
      return e === region;
    });
    this.onSelect.emit();
  }

  onSelectOption(evt: MatAutocompleteSelectedEvent): void {
    const region = evt.option.value;
    const index = _.findIndex(this.selectedRegions, function (e) {
      return e === region;
    });
    if (index === -1) {
      this.selectedRegions.push(region);
    }
    this.inputField.nativeElement.value = '';
    this.formControl.setValue(null);
    this.onSelect.emit();
  }
}
