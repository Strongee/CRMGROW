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
    this.contactService.load(0);
    this.storeService.pageContacts$.subscribe((contacts) => {
      this.pageSelection = _.intersectionBy(
        contacts,
        this.selection.selected,
        '_id'
      );
    });

    this.contactService.pageIndex$.subscribe((page) => {
      // Search Option Check
      // if option is advanced search, filter the current result
      // if option is normal search, filter the current result
      // if option is empty, call load api
    });

    this.contactService.searchOption$.subscribe((option) => {
      // if search option is normal, call normal search
      // if search is empty, call page load api
      // if search is advanced, call advanced search
    });
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

  changePageSize(type: any): void {
    this.pageSize = type;
  }
}
