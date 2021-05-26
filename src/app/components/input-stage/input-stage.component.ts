import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
  MatAutocompleteActivatedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import {
  filter,
  tap,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  map
} from 'rxjs/operators';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { DealsService } from 'src/app/services/deals.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { searchReg } from 'src/app/helper';

interface Stage {
  title: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-input-stage',
  templateUrl: './input-stage.component.html',
  styleUrls: ['./input-stage.component.scss']
})
export class InputStageComponent implements OnInit {
  separatorKeyCodes: number[] = [ENTER, COMMA];
  keyword = '';
  searching = false;
  addOnBlur = false;
  optionsFocused = false;

  @Input('placeholder') placeholder = 'Add Stages';
  @Input('onlyFromSearch') onlyFromSearch = false;
  @Input('selectedStages') selectedStages: string[] = [];
  @Output() onSelect = new EventEmitter();

  formControl: FormControl = new FormControl();
  @ViewChild(MatAutocompleteTrigger) inputField: MatAutocompleteTrigger;
  @ViewChild('inputField') inputFieldRef: ElementRef;
  @ViewChild('auto') autoComplete: MatAutocomplete;

  protected _onDestroy = new Subject<void>();

  filteredResults: ReplaySubject<Stage[]> = new ReplaySubject<Stage[]>(1);

  constructor(private dealsService: DealsService) {
    this.dealsService.getStage();
    this.dealsService.stages$.subscribe((stages) => {
      this.filteredResults.next(stages);
      console.log('filter');
    });
  }

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        filter(() => true),
        takeUntil(this._onDestroy),
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        map((search) => {
          this.keyword = search;
          return this.dealsService.stages$;
        })
      )
      .subscribe(
        (data) => {
          data.subscribe((stages) => {
            const selectedStages = [];
            this.selectedStages.forEach((e) => {
              selectedStages.push({ title: e });
            });
            const remained = _.difference(stages, this.selectedStages);
            const res = _.filter(remained, (e) => {
              if (e.title != -1) {
                return searchReg(e.title, this.keyword);
              }
            });
            this.searching = false;
            if (res.length) {
              this.filteredResults.next(res);
            } else if (this.keyword && !this.onlyFromSearch) {
              this.filteredResults.next([{ title: this.keyword, isNew: true }]);
            }
          });
        },
        () => {
          this.searching = false;
        }
      );
  }

  remove(stage: string): void {
    _.remove(this.selectedStages, (e) => {
      return e === stage;
    });
    this.onSelect.emit();
  }

  /**
   * Select the option from the autocomplete list
   * @param evt : MatAutoCompleteSelectedEvent
   */
  onSelectOption(evt: MatAutocompleteSelectedEvent): void {
    const stage: Stage = evt.option.value;
    const index = _.findIndex(this.selectedStages, function (e) {
      return e === stage;
    });
    if (index === -1) {
      this.selectedStages.push(stage.title);
    }
    this.inputFieldRef.nativeElement.value = '';
    this.optionsFocused = false;
    this.formControl.setValue(null);
    this.keyword = '';
    this.onSelect.emit();
  }

  focusField(): void {
    // Focus The field
    console.log('focus field');
  }

  onActiveOption(event: MatAutocompleteActivatedEvent): void {
    if (event && event.option) {
      this.optionsFocused = true;
    } else {
      this.optionsFocused = false;
    }
  }
  onAdd(event: MatChipInputEvent): void {
    if (this.optionsFocused || !event.value) {
      return;
    }
    const stage: Stage = { title: event.value };
    const index = _.findIndex(this.selectedStages, function (e) {
      return e === stage;
    });
    if (index === -1) {
      this.selectedStages.push(stage.title);
    }
    this.inputField.closePanel();
    this.inputFieldRef.nativeElement.value = '';
    this.optionsFocused = false;
    this.formControl.setValue(null);
    this.keyword = '';
    this.onSelect.emit();
  }
}
