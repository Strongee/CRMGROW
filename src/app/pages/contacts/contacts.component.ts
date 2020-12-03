import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UploadContactsComponent } from 'src/app/components/upload-contacts/upload-contacts.component';
import { BulkActions, DialogSettings, STATUS } from 'src/app/constants/variable.constants';
import { Contact, ContactActivity } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';
import * as _ from 'lodash';
import { SearchOption } from 'src/app/models/searchOption.model';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  STATUS = STATUS;
  ACTIONS = BulkActions.Contacts;
  DISPLAY_COLUMNS = [
    'select',
    'contact_name',
    'contact_label',
    'activity',
    'contact_tags',
    'contact_email',
    'contact_phone'
  ];
  SORT_TYPES = [
    { id: 'alpha_down', label: 'Alphabetical down' },
    { id: 'alpha_up', label: 'Alphabetical up' },
    { id: 'last_added', label: 'Last added' },
    { id: 'last_active', label: 'Recent active' }
  ];
  PAGE_COUNTS = [
    { id: 8, label: '8' },
    { id: 10, label: '10' },
    { id: 25, label: '25' },
    { id: 50, label: '50' }
  ];

  sortType = this.SORT_TYPES[0];
  pageSize = this.PAGE_COUNTS[3];
  page = 1;
  searchOption: SearchOption = new SearchOption();
  searchStr = '';

  selection: Contact[] = [];
  pageSelection: Contact[] = [];
  pageContacts: ContactActivity[] = [];

  tags = [];
  constructor(
    public router: Router,
    public storeService: StoreService,
    public contactService: ContactService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.storeService.pageContacts$.subscribe((contacts) => {
      if (!this.searchStr && this.searchOption.isEmpty()) {
        this.pageContacts = contacts;
      } else {
        this.pageContacts = contacts.slice(0, this.pageSize.id);
      }
      this.pageSelection = [];
      this.selection = [];
      // this.pageSelection = _.intersectionBy(this.selection, contacts, '_id');
    });

    this.contactService.searchOption$.subscribe((option: SearchOption) => {
      this.searchOption = option;
      this.load();
    });
    this.contactService.searchStr$.subscribe((str: string) => {
      this.searchStr = str;
      this.load();
    });
  }
  /**
   * Load the contacts: Advanced Search, Normal Search, API Call
   */
  load(): void {
    this.page = 0;
  }
  /**
   * Load the page contacts
   * @param page : Page Number to load
   */
  changePage(page: number): void {
    this.page = page;
    if (!this.searchStr && this.searchOption.isEmpty()) {
      let skip = (page - 1) * this.pageSize.id;
      skip = skip < 0 ? 0 : skip;
      this.contactService.load(skip);
    }
  }
  /**
   * Change the Page Size
   * @param type : Page size information element ({id: size of page, label: label to show UI})
   */
  changePageSize(type: any): void {
    const currentSize = this.pageSize.id;
    this.pageSize = type;
    // Check with the Prev Page Size
    if (currentSize < this.pageSize.id) {
      const loaded = this.page * currentSize;
      const newPage = Math.floor(loaded / this.pageSize.id) + 1;
      this.changePage(newPage);
    } else {
      if (this.searchOption.isEmpty() && !this.searchStr) {
        this.contactService.resizePage(this.pageSize.id);
      }
    }
  }
  /**
   * Change the sort column and dir
   * @param type: Sort Type
   */
  changeSort(type: any): void {
    this.sortType = type;
  }

  toggle(contact: ContactActivity): void {
    const selectedContact = contact.mainInfo;
    const toggledSelection = _.xorBy(
      this.pageSelection,
      [selectedContact],
      '_id'
    );
    this.pageSelection = toggledSelection;
  }
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.pageSelection = [];
      return;
    }
    this.pageContacts.forEach((e) => {
      if (!this.isSelected(e)) {
        this.pageSelection.push(e.mainInfo);
      }
    });
  }
  isSelected(contact: ContactActivity): boolean {
    return _.findIndex(this.pageSelection, contact.mainInfo, '_id') !== -1;
  }
  isAllSelected(): boolean {
    return this.pageSelection.length === this.pageSize.id;
  }

  openFilter(): void {}
  importContacts(): void {
    this.dialog.open(UploadContactsComponent, DialogSettings.UPLOAD);
  }

  /**
   * Open the contact detail page
   * @param contact : contact
   */
  openContact(contact: ContactActivity): void {
    this.router.navigate([`contacts/${contact._id}`]);
  }
  /**
   * Run the bulk action
   * @param event Bulk Action Command
   */
  doAction(event: any): void {
    switch (event.command) {
      case 'deselect':
        this.pageSelection = [];
        this.selection = [];
        break;
      case 'select':
        break;
      case 'automation':
        break;
      case 'delete':
        break;
      case 'edit':
        break;
      case 'download':
        break;
      case 'message':
        break;
      case 'add_note':
        break;
      case 'add_task':
        break;
    }
  }
}
