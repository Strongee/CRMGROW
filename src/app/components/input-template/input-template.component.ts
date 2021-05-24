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
import { Subject, ReplaySubject, Subscription } from 'rxjs';
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
import * as _ from 'lodash';
import { searchReg } from 'src/app/helper';
import { UserService } from '../../services/user.service';

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
  @Input('hasNewLink') hasNewLink = true;

  @Input() id: string = '';
  @Output() idChange = new EventEmitter<string>();
  @Input() template: Template;
  @Output() templateChange = new EventEmitter<Template>();

  formControl: FormControl = new FormControl();
  inputControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('selector') selector: MatSelect;

  protected _onDestroy = new Subject<void>();
  searching = false;
  search = '';
  filteredResults: ReplaySubject<Template[]> = new ReplaySubject<Template[]>(1);

  constructor(
    private templateService: TemplatesService,
    private userService: UserService
  ) {
    this.templateService.loadAll();
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
          return this.templateService.templates$;
        })
      )
      .subscribe(
        (data) => {
          data.subscribe((templates) => {
            const res = _.filter(templates, (e) => {
              if (this.type) {
                if (
                  e.type === this.type &&
                  (searchReg(e.title, this.search) ||
                    searchReg(e.subject, this.search) ||
                    searchReg(e.content, this.search))
                ) {
                  return true;
                }
              } else {
                if (
                  searchReg(e.title, this.search) ||
                  searchReg(e.subject, this.search) ||
                  searchReg(e.content, this.search)
                ) {
                  return true;
                }
              }
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
        this.templateChange.emit(val);
        this.idChange.emit(val._id);
      }
    });

    // Init the Form Control with Two-bind Modal
    if (this.template) {
      this.formControl.setValue(this.template);
    }
    this.templateService.templates$.subscribe((templates) => {
      if (this.type) {
        const filtered = templates.filter((e) => e.type === this.type);
        this.filteredResults.next(filtered);
      } else {
        this.filteredResults.next(templates);
      }

      if (this.id) {
        const template = _.find(templates, (e) => {
          return this.id === e._id;
        });
        template && this.formControl.setValue(template);
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
}
