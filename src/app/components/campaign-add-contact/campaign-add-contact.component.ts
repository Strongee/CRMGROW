import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ContactService } from '../../services/contact.service';
import { LabelService } from '../../services/label.service';
import { ContactPageSize } from '../../constants/variable.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-campaign-add-contact',
  templateUrl: './campaign-add-contact.component.html',
  styleUrls: ['./campaign-add-contact.component.scss']
})
export class CampaignAddContactComponent implements OnInit {
  submitted = false;
  isLoading = false;
  adding = false;
  searchedName = '';
  contacts = [];
  pageContacts = [];
  totalContacts = 0;
  contactCount = 0;
  currentPage = 0;
  isSearchedResult = false;
  isSearchLoading = false;
  sortCol = 'name';
  sortDir = true; // true -> 'asc', false -> 'desc'
  labels = [];
  selecting = false;
  searchSubscription: Subscription;
  selectedAddContacts = new SelectionModel<any>(true, []);

  constructor(
    private dialogRef: MatDialogRef<CampaignAddContactComponent>,
    private contactService: ContactService,
    private labelService: LabelService
  ) {}

  ngOnInit(): void {
    this.getLabels();
    this.loadContactPage(1);
  }
  loadContactPage(page): void {
    let skip = 0;
    if (page) {
      this.currentPage = page;
      skip = (page - 1) * 50;
    } else {
      this.currentPage = 1;
      skip = 0;
    }
    this.isLoading = true;
    this.contactService
      .getPageContacts(skip, { field: this.sortCol, dir: this.sortDir })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.contacts = res.contacts;
          this.pageContacts = res.contacts;
          this.contactCount = res.count;
          this.totalContacts = res.count;
          this.isSearchedResult = false;
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }
  setPageContacts(page): void {
    this.loadContactPage(page);
    const start = (page - 1) * 50;
    const end = page * 50;
    this.pageContacts = this.contacts.slice(start, end);
    this.currentPage = page;
  }
  sortSearchedResult(): void {
    const sortGrav = this.sortDir === true ? 1 : -1;
    if (this.sortCol === 'name') {
      this.contacts.sort((a, b) => {
        const aName = ((a.first_name || '') + ' ' + (a.last_name || '')).trim();
        const bName = ((b.first_name || '') + ' ' + (b.last_name || '')).trim();
        if (aName > bName) {
          return 1 * sortGrav;
        } else if (aName === bName) {
          return 0;
        } else {
          return -1 * sortGrav;
        }
      });
    }
    if (this.sortCol === 'updated_at') {
      this.contacts.sort((a, b) => {
        const aDate = new Date(a.last_activity.updated_at + '').getTime();
        const bDate = new Date(b.last_activity.updated_at + '').getTime();
        if (aDate > bDate) {
          return 1 * sortGrav;
        } else if (aDate === bDate) {
          return 0;
        } else {
          return -1 * sortGrav;
        }
      });
    }
  }
  getLabels(): any {
    // this.isLoading = true;
    this.labelService.getLabels().subscribe(async (res: any) => {
      this.labels = res.sort((a, b) => {
        return a.priority - b.priority;
      });
    });
  }
  getLabelById(id): any {
    let retVal = { color: 'white', font_color: 'black' };
    let i;
    for (i = 0; i < this.labels.length; i++) {
      if (this.labels[i]._id === id) {
        retVal = this.labels[i];
      }
    }
    return retVal;
  }
  getAvatarName(contact): any {
    if (contact.first_name && contact.last_name) {
      return contact.first_name[0] + contact.last_name[0];
    } else if (contact.first_name && !contact.last_name) {
      return contact.first_name[0];
    } else if (!contact.first_name && contact.last_name) {
      return contact.last_name[0];
    }
    return 'UC';
  }

  selectAllContact(): void {
    if (this.isSearchedResult) {
      this.contacts.forEach((e) => {
        if (!this.selectedAddContacts.isSelected(e._id)) {
          this.selectedAddContacts.select(e._id);
        }
      });
    } else {
      this.selecting = true;
      this.contactService.selectAll().subscribe(
        (res) => {
          this.selecting = false;
          if (res) {
            res.forEach((e) => {
              if (!this.selectedAddContacts.isSelected(e._id)) {
                this.selectedAddContacts.select(e._id);
              }
            });
          }
        },
        (err) => {
          this.selecting = false;
        }
      );
    }
  }
  clearAllSelected(): void {
    this.selectedAddContacts.clear();
  }
  selectAllPage(): void {
    if (this.isSearchedResult) {
      if (this.isSelectedPage()) {
        this.contacts.forEach((e) => {
          if (this.selectedAddContacts.isSelected(e._id)) {
            this.selectedAddContacts.deselect(e._id);
          }
        });
      } else {
        this.contacts.forEach((e) => {
          if (!this.selectedAddContacts.isSelected(e._id)) {
            this.selectedAddContacts.select(e._id);
          }
        });
      }
    } else {
      if (this.isSelectedPage()) {
        this.pageContacts.forEach((e) => {
          if (this.selectedAddContacts.isSelected(e._id)) {
            this.selectedAddContacts.deselect(e._id);
          }
        });
      } else {
        this.pageContacts.forEach((e) => {
          if (!this.selectedAddContacts.isSelected(e._id)) {
            this.selectedAddContacts.select(e._id);
          }
        });
      }
    }
  }
  isSelectedPage(): any {
    if (this.isSearchedResult) {
      if (this.contacts.length) {
        for (let i = 0; i < this.contacts.length; i++) {
          const e = this.contacts[i];
          if (!this.selectedAddContacts.isSelected(e._id)) {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      if (this.pageContacts.length) {
        for (let i = 0; i < this.pageContacts.length; i++) {
          const e = this.pageContacts[i];
          if (!this.selectedAddContacts.isSelected(e._id)) {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  searchContacts(): void {
    if (this.searchedName === '') {
      this.isSearchedResult = false;
    } else {
      this.isSearchLoading = true;
      const query = {
        activityCondition: [],
        brokerageCondition: [],
        cityCondition: [],
        includeBrokerage: true,
        includeFollowUps: true,
        includeLabel: true,
        includeLastActivity: true,
        includeSource: true,
        includeStage: true,
        includeTag: true,
        labelCondition: [],
        lastMaterial: {
          send_image: {
            flag: false,
            material: ''
          },
          send_pdf: {
            flag: false,
            material: ''
          },
          send_video: {
            flag: false,
            material: ''
          },
          watched_image: {
            flag: false,
            material: ''
          },
          watched_pdf: {
            flag: false,
            material: ''
          },
          watched_video: {
            flag: false,
            material: ''
          }
        },
        materialCondition: {
          not_sent_image: {
            flag: false,
            material: ''
          },
          not_sent_pdf: {
            flag: false,
            material: ''
          },
          not_sent_video: {
            flag: false,
            material: ''
          },
          not_watched_image: {
            flag: false,
            material: ''
          },
          not_watched_pdf: {
            flag: false,
            material: ''
          },
          not_watched_video: {
            flag: false,
            material: ''
          },
          sent_image: {
            flag: false,
            material: ''
          },
          sent_pdf: {
            flag: false,
            material: ''
          },
          sent_video: {
            flag: false,
            material: ''
          },
          watched_image: {
            flag: false,
            material: ''
          },
          watched_pdf: {
            flag: false,
            material: ''
          },
          watched_video: {
            flag: false,
            material: ''
          }
        },
        recruitingStageCondition: [],
        regionCondition: [],
        searchStr: this.searchedName,
        sourceCondition: [],
        tagsCondition: [],
        zipcodeCondition: ''
      };
      this.searchSubscription && this.searchSubscription.unsubscribe();
      // this.searchSubscription = this.contactService.getSearchedContacts(query).subscribe(
      //   (res) => {
      //     this.isLoading = false;
      //     this.contacts = res.data;
      //     this.contactCount = this.contacts.length;
      //     this.contacts = res.data;
      //     this.isSearchedResult = true;
      //     this.isSearchLoading = false;
      //   },
      //   (err) => (this.isLoading = false)
      // );
    }
  }
  addContacts(): void {
    if (!this.selectedAddContacts.selected.length) {
      return;
    }
    this.submitted = true;
    this.adding = true;
    this.contactService
      .getContactsByIds(this.selectedAddContacts.selected)
      .subscribe(
        (res) => {
          // const contacts = [];
          // res.forEach((contact) => {
          //   const item = {
          //     _id: contact._id,
          //     first_name: contact.first_name,
          //     last_name: contact.last_name,
          //     email: contact.email,
          //     cell_phone: contact.cell_phone
          //   };
          //   contacts.push(item);
          // });
          this.submitted = false;
          this.adding = false;
          this.dialogRef.close({ contacts: res });
        },
        (err) => {
          this.submitted = false;
        }
      );
  }
}
