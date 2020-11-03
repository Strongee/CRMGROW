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
import { TemplatesService } from 'src/app/services/templates.service';
import { Template } from 'src/app/models/template.model';

@Component({
  selector: 'app-input-template',
  templateUrl: './input-template.component.html',
  styleUrls: ['./input-template.component.scss']
})
export class InputTemplateComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input('resultItem') resultItemTemplate: TemplateRef<HTMLElement>;
  @Input('placeholder') placeholder = 'Search template';
  @Input('formPlaceholder') formPlaceholder = 'Search templates';
  @Input('automation') automation = null;
  @Input('type') type = ''; // 'email' | 'text'
  @Output() onSelect = new EventEmitter();

  formControl: FormControl = new FormControl();
  inputControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('selector') selector: MatSelect;

  protected _onDestroy = new Subject<void>();
  searching = false;
  filteredResults: ReplaySubject<Template[]> = new ReplaySubject<Template[]>(1);

  constructor(private templateService: TemplatesService) {}

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        filter((search) => !!search),
        takeUntil(this._onDestroy),
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        map((search) => {
          return this.templateService.search(search, { type: this.type });
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
