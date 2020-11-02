import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CampaignAddContactComponent } from '../../components/campaign-add-contact/campaign-add-contact.component';

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
    this.location.replaceState('/campaign/' + this.tabUrls[this.selectedTab]);
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
          console.log("response contacts =============>", res);
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
      });
  }

  importCSV(): void {
    // this.file.nativeElement.click();
  }

  readFile(evt): void {
    // const file = evt.target.files[0];
    // if (!file) {
    //   return false;
    // }
    // if (!file.name.toLowerCase().endsWith('.csv')) {
    //   this.dialog.open(NotifyComponent, {
    //     width: '300px',
    //     data: {
    //       message: 'Please select the CSV file.'
    //     }
    //   });
    //   return false;
    // }
    // const fileReader = new FileReader();
    // fileReader.onload = (e) => {
    //   const text = fileReader.result + '';
    //   this.papa.parse(text, {
    //     skipEmptyLines: true,
    //     complete: (results, file) => {
    //       this.csvColumns = results.data[0];
    //       this.csvLines = results.data.slice(1);
    //       this.dataText = this.papa.unparse(this.csvLines);
    //
    //       const firstNameIndex = this.csvColumns.indexOf('first_name');
    //       const lastNameIndex = this.csvColumns.indexOf('last_name');
    //       const emailIndex = this.csvColumns.indexOf('email');
    //       const phoneIndex = this.csvColumns.indexOf('phone');
    //
    //       for (let i = 0; i < this.csvLines.length; i++) {
    //         const cvsLine = this.csvLines[i];
    //         const contact = {
    //           first_name: cvsLine[firstNameIndex],
    //           last_name: cvsLine[lastNameIndex],
    //           email: cvsLine[emailIndex],
    //           cell_phone: cvsLine[phoneIndex]
    //         };
    //         const isExist = this.contacts.filter(
    //           (item) => item.email == contact.email
    //         ).length;
    //         if (!isExist) this.contacts.push(contact);
    //       }
    //     }
    //   });
    // };
    // fileReader.readAsText(evt.target.files[0]);
  }

  bulkImport(): void {
    // this.dialog
    //   .open(CampaignAddBulkContactComponent, {
    //     width: '80vw',
    //     maxWidth: '80vw',
    //     height: 'auto',
    //     disableClose: true
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (res) {
    //       const contacts = res.contacts;
    //       for (let i = 0; i < contacts.length; i++) {
    //         if (this.contacts.length) {
    //           const isExist = this.contacts.filter(
    //             (contact) => contact.email == contacts[i].email
    //           ).length;
    //           if (!isExist) {
    //             this.contacts.push(contacts[i]);
    //           }
    //         } else {
    //           this.contacts.push(contacts[i]);
    //         }
    //       }
    //     }
    //   });
  }
}
