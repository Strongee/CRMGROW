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
  MatAutocomplete
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
import { ContactService } from 'src/app/services/contact.service';
import * as _ from 'lodash';
import { validateEmail } from 'src/app/utils/functions';
import { Contact } from 'src/app/models/contact.model';
const phone = require('phone');

@Component({
  selector: 'app-input-contacts',
  templateUrl: './input-contacts.component.html',
  styleUrls: ['./input-contacts.component.scss']
})
export class InputContactsComponent implements OnInit {
  separatorKeyCodes: number[] = [ENTER, COMMA];
  keyword = '';
  searching = false;
  addOnBlur = false;

  @Input('placeholder') placeholder = 'Add Contacts';
  @Input('display') display = 'email'; // Which field is enabled when display the item.
  @Input('material') material: any = null;
  @Input('onlySubscriber') onlySubscriber = true;
  @Input('onlyFromSearch') onlyFromSearch = false;
  @Input('selectedContacts') selectedContacts: Contact[] = [];
  @Output() onSelect = new EventEmitter();

  formControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('auto') autoComplete: MatAutocomplete;

  protected _onDestroy = new Subject<void>();

  filteredResults: ReplaySubject<Contact[]> = new ReplaySubject<Contact[]>(1);

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        filter((search) => {
          if (typeof search === 'string') {
            if (search) {
              return true;
            } else if (this.material && this.material['_id']) {
              return true;
            }
            return false;
          } else {
            return false;
          }
        }),
        takeUntil(this._onDestroy),
        debounceTime(200),
        distinctUntilChanged(),
        tap((search) => {
          this.searching = true;
          this.keyword = search;
        }),
        map((search) => {
          if (search) {
            return this.contactService.easySearch(search);
          } else {
            return this.contactService.latestContacts(this.material['_id']);
          }
        })
      )
      .subscribe((request: Observable<any[]>) => {
        request.subscribe(
          (res: any) => {
            this.searching = false;
            if (this.keyword) {
              if (res.length) {
                this.filteredResults.next(res);
              } else {
                if (!this.onlyFromSearch) {
                  if (this.display === 'email' && validateEmail(this.keyword)) {
                    const first_name = this.keyword.split('@')[0];
                    const email = this.keyword;
                    this.filteredResults.next([
                      new Contact().deserialize({
                        first_name,
                        email
                      })
                    ]);
                  }
                  if (this.display === 'cell_phone') {
                    const cell_phone = phone(this.keyword)[0];
                    if (cell_phone) {
                      this.filteredResults.next([
                        new Contact().deserialize({
                          first_name: cell_phone,
                          cell_phone
                        })
                      ]);
                    }
                  }
                }
              }
            } else {
              const searchedContacts = [];
              const searchedContactIds = [];
              res.forEach((activity) => {
                if (!activity || !activity.contacts) {
                  return;
                }
                const contact = activity.contacts[0];
                if (searchedContactIds.indexOf(contact._id) === -1) {
                  searchedContactIds.push(contact._id);
                  searchedContacts.push(contact);
                }
              });
              this.filteredResults.next(
                searchedContacts.map((data) => new Contact().deserialize(data))
              );
            }
          },
          (error) => {
            this.searching = false;
          }
        );
      });
  }

  getMaterialLatestContact(): void {
    this.contactService
      .latestContacts(this.material['_id'])
      .subscribe((res) => {
        const searchedContacts = [];
        const searchedContactIds = [];
        res.forEach((activity) => {
          const contact = activity.contacts[0];
          if (searchedContactIds.indexOf(contact._id) === -1) {
            searchedContactIds.push(contact._id);
            searchedContacts.push(contact);
          }
        });
        this.filteredResults.next(searchedContacts);
      });
  }

  remove(contact: Contact): void {
    _.remove(this.selectedContacts, (e) => {
      if (contact._id) {
        return e._id === contact._id;
      } else if (this.display === 'email') {
        return e.email === contact.email;
      } else if (this.display === 'cell_phone') {
        return e.cell_phone === contact.cell_phone;
      }
    });
  }

  onSelectOption(evt: MatAutocompleteSelectedEvent): void {
    const contact = evt.option.value;
    let index;
    if (this.onlySubscriber) {
      if (contact.tags && contact.tags.indexOf('unsubscribed') !== -1) {
        return;
      }
    }
    if (this.display === 'email' && !contact.email) {
      return;
    }
    if (this.display === 'cell_phone' && !contact.cell_phone) {
      return;
    }
    if (contact._id) {
      index = _.findIndex(this.selectedContacts, function (e) {
        return e._id == contact._id;
      });
    } else {
      index = _.findIndex(this.selectedContacts, (e) => {
        if (this.display === 'email') {
          return e.email == contact.email;
        } else if (this.display === 'cell_phone') {
          return e.cell_phone === contact.cell_phone;
        }
      });
    }
    if (index === -1) {
      if (contact instanceof Contact) {
        this.selectedContacts.push(contact);
        this.onSelect.emit();
      } else {
        this.selectedContacts.push(new Contact().deserialize(contact));
        this.onSelect.emit();
      }
    }
    this.inputField.nativeElement.value = '';
    this.formControl.setValue(null);
    this.keyword = '';
  }
}
