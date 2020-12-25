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
import { ContactService } from 'src/app/services/contact.service';
import { Subject, ReplaySubject } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { MatSelect } from '@angular/material/select';
import {
  filter,
  tap,
  takeUntil,
  debounceTime,
  map,
  distinctUntilChanged
} from 'rxjs/operators';

@Component({
  selector: 'app-select-contact',
  templateUrl: './select-contact.component.html',
  styleUrls: ['./select-contact.component.scss']
})
export class SelectContactComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input('resultItem') resultItemTemplate: TemplateRef<HTMLElement>;
  @Input('placeholder') placeholder = 'Search contact';
  @Input('formPlaceholder') formPlaceholder = 'Search contacts';
  @Input('mustField') mustField = '';
  @Input()
  public set contact(val: string) {
    if (!val) {
      this.formControl.setValue(null, { emitEvent: false });
    }
  }
  @Output() onSelect = new EventEmitter();

  formControl: FormControl = new FormControl();
  inputControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('selector') selector: MatSelect;

  protected _onDestroy = new Subject<void>();
  searching = false;
  filteredResults: ReplaySubject<Contact[]> = new ReplaySubject<Contact[]>(1);

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        filter((search) => !!search),
        takeUntil(this._onDestroy),
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        map((search) => {
          return this.contactService.easySearch(search);
        })
      )
      .subscribe(
        (api) => {
          api.subscribe((res) => {
            this.searching = false;
            if (this.mustField) {
              const data = [];
              res.map((e) => {
                if (e[this.mustField]) {
                  data.push(e);
                }
              });
              this.filteredResults.next(data);
            } else {
              this.filteredResults.next(res);
            }
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

  cancelSelect(): void {
    this.formControl.setValue(null, { emitEvent: false });
  }
}
