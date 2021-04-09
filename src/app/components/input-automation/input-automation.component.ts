import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  Output,
  EventEmitter,
  AfterViewInit,
  TemplateRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, ReplaySubject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import {
  filter,
  tap,
  takeUntil,
  debounceTime,
  map,
  distinctUntilChanged
} from 'rxjs/operators';
import { AutomationService } from 'src/app/services/automation.service';
import { Automation } from 'src/app/models/automation.model';
import * as _ from 'lodash';
import { searchReg } from 'src/app/helper';

@Component({
  selector: 'app-input-automation',
  templateUrl: './input-automation.component.html',
  styleUrls: ['./input-automation.component.scss']
})
export class InputAutomationComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input('resultItem') resultItemTemplate: TemplateRef<HTMLElement>;
  @Input('placeholder') placeholder = 'Search automation';
  @Input('formPlaceholder') formPlaceholder = 'Search automations';

  @Input() id: string = '';
  @Output() idChange = new EventEmitter<string>();
  @Input() automation: Automation;
  @Output() automationChange = new EventEmitter<Automation>();

  formControl: FormControl = new FormControl();
  inputControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('selector') selector: MatSelect;

  protected _onDestroy = new Subject<void>();
  search = '';
  searching = false;
  filteredResults: ReplaySubject<Automation[]> = new ReplaySubject<
    Automation[]
  >(1);

  constructor(private automationService: AutomationService) {
    this.automationService.loadAll();
  }

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        filter(() => true),
        takeUntil(this._onDestroy),
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        map((search) => {
          this.search = search;
          return this.automationService.automations$;
        })
      )
      .subscribe(
        (data) => {
          data.subscribe((automations) => {
            const res = _.filter(automations, (e) => {
              return searchReg(e.title, this.search);
            });
            this.searching = false;
            this.filteredResults.next(res);
          });
        },
        () => {
          this.searching = false;
        }
      );

    this.formControl.valueChanges.subscribe((val) => {
      if (val && val._id !== this.id) {
        this.automationChange.emit(val);
        this.idChange.emit(val);
      }
    });

    // Init the Form Control with Two-bind Modal
    if (this.automation) {
      this.formControl.setValue(this.automation);
    }
    this.automationService.automations$.subscribe((automations) => {
      this.filteredResults.next(automations);

      if (this.id) {
        const automation = _.find(automations, (e) => {
          return this.id === e._id;
        });
        automation && this.formControl.setValue(automation);
      }
    });
  }

  ngAfterViewInit(): void {
    this.selector._positions = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
      }
    ];
  }

  ngOnDestroy(): void {}

  remove(): void {
    this.formControl.setValue(null, { emitEvent: false });
    this.automationChange.emit(null);
  }
}
