import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { ContactActivity } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';

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
  ACTIVITY_ICONS = {};
  SORT_TYPES = [
    { id: 'alpha_down', label: 'Alphabetical down' },
    { id: 'alpha_up', label: 'Alphabetical up' },
    { id: 'last_added', label: 'Last added' },
    { id: 'last_active', label: 'Recent active' }
  ];
  PAGE_COUNTS = [
    { id: 'alpha_down', label: 'Alphabetical down' },
    { id: 'alpha_up', label: 'Alphabetical up' },
    { id: 'last_added', label: 'Last added' },
    { id: 'last_active', label: 'Recent active' }
  ];

  sortType = this.SORT_TYPES[0];
  pageSize = this.PAGE_COUNTS[0];
  selection = new SelectionModel<ContactActivity>(true, []);
  constructor(
    public storeService: StoreService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.contactService.load(0);
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
    return true;
  }

  openFilter(): void {}
  importContacts(): void {}
}
