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
  @Input('automation') automation = null;
  @Output() onSelect = new EventEmitter();

  formControl: FormControl = new FormControl();
  inputControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('selector') selector: MatSelect;

  protected _onDestroy = new Subject<void>();
  searching = false;
  filteredResults: ReplaySubject<Automation[]> = new ReplaySubject<
    Automation[]
  >(1);

  constructor(private automationService: AutomationService) {}

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        filter((search) => !!search),
        takeUntil(this._onDestroy),
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        map((search) => {
          return this.automationService.search(search);
        })
      )
      .subscribe(
        (api) => {
          api.subscribe((res) => {
            this.searching = false;
            this.filteredResults.next(res);
          });
        },
        () => {
          this.searching = false;
        }
      );
    this.formControl.valueChanges.subscribe((val) => {
      this.onSelect.emit(val);
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
}
