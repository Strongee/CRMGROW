import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UploadContactsComponent } from 'src/app/components/upload-contacts/upload-contacts.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
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
  searchOption: SearchOption;
  searchStr = '';

  selection = new SelectionModel<Contact>(true, []);
  pageSelection = new SelectionModel<Contact>(true, []);

  tags = [];
  constructor(
    public router: Router,
    public storeService: StoreService,
    public contactService: ContactService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.storeService.pageContacts$.subscribe((contacts) => {
      this.pageSelection = _.intersectionBy(
        contacts,
        this.selection.selected,
        '_id'
      );
    });

    this.contactService.searchOption$.subscribe((option: SearchOption) => {
      this.searchOption = option;
      this.load();
    });

    this.contactService.searchStr$.subscribe((str) => {
      this.searchStr = str;
      this.load();
    });
  }
  /**
   * Load the contacts: Advanced Search, Normal Search, API Call
   */
  load(): void {
    if (this.searchOption.isEmpty()) {
      if (this.searchStr) {
        // Call Normal Search
        this.contactService.normalSearch(this.searchStr);
      } else {
        // Call Normal Load
        this.contactService.load(0);
      }
    } else {
      this.contactService.advancedSearch(this.searchStr);
    }
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
      this.contactService.pageIndex.next(newPage);
    } else {
      if (this.searchOption.isEmpty() || !this.searchStr) {
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

  masterToggle(): void {
    // toggle the page selection
  }
  isAllSelected(): boolean {
    return this.pageSelection.selected.length === this.pageSize.id;
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

  
}
