import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CampaignAddContactComponent } from '../../components/campaign-add-contact/campaign-add-contact.component';
import { UploadContactsComponent } from '../../components/upload-contacts/upload-contacts.component';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit {
  public csvLines = [];
  private dataText = '';
  selectedCSVColumn;
  selectedCSVColumnIndex;

  selectedTab = 1;
  tabs = ['List', 'Bulk Mailing'];
  tabUrls = ['list', 'bulk'];
  contacts: any[] = [];
  currentContactPage = 1;
  contactCount;
  selectedContacts = new SelectionModel<any>(true, []);

  csvColumns = [];

  @ViewChild('file') file: any;
  constructor(private location: Location, private dialog: MatDialog) {}

  ngOnInit(): void {}

  changeTab(event): void {
    this.selectedTab = event.index;
    this.location.replaceState('/campaign/' + this.tabUrls[this.selectedTab - 1]);
  }

  selectAllPage(): void {
    if (this.isSelectedPage()) {
      this.contacts.forEach((e) => {
        if (this.selectedContacts.isSelected(e._id)) {
          this.selectedContacts.deselect(e._id);
        }
      });
    } else {
      this.contacts.forEach((e) => {
        if (!this.selectedContacts.isSelected(e._id)) {
          this.selectedContacts.select(e._id);
        }
      });
    }
  }
  isSelectedPage(): any {
    if (this.contacts.length) {
      for (let i = 0; i < this.contacts.length; i++) {
        const e = this.contacts[i];
        if (!this.selectedContacts.isSelected(e._id)) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  }


  addContact(): void {
    this.dialog
      .open(CampaignAddContactComponent, {
        width: '96vw',
        maxWidth: '1280px',
        height: 'auto',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const contacts = res.contacts;
          this.addUniqueContacts(contacts);
        }
      });
  }

  addUniqueContacts(contacts): void {
    for( let i = 0; i < contacts.length; i++ ){
      if (this.contacts.length) {
        const isExist = this.contacts.filter(
          (contact) => contact.email === contacts[i].email
        ).length;
        if (!isExist) {
          this.contacts.push(contacts[i]);
        }
      } else {
        this.contacts.push(contacts[i]);
      }
    }
  }

  importCSV(): void {
    this.dialog
      .open(UploadContactsComponent, {
        width: '100vw',
        maxWidth: '1024px',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        const csvContacts = res.data;
        this.addUniqueContacts(csvContacts);
      });
  }

  bulkImport(): void {}
  addBroadcast(): void {}
}