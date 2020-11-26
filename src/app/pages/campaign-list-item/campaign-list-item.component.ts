import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CampaignAddContactComponent } from '../../components/campaign-add-contact/campaign-add-contact.component';
import { UploadContactsComponent } from '../../components/upload-contacts/upload-contacts.component';
import { MailListService } from '../../services/maillist.service';
import { ActivatedRoute } from '@angular/router';
import { ActionItem } from '../../utils/data.types';

@Component({
  selector: 'app-campaign-list-item',
  templateUrl: './campaign-list-item.component.html',
  styleUrls: ['./campaign-list-item.component.scss']
})
export class CampaignListItemComponent implements OnInit {
  public csvLines = [];
  private dataText = '';
  selectedCSVColumn;
  selectedCSVColumnIndex;

  isLoading = false;
  isTableChanging = false;
  contacts: any[] = [];
  currentContactPage = 1;
  contactCount;
  selectedContacts = new SelectionModel<any>(true, []);
  selected = 1;
  csvColumns = [];

  @Input('id') id: string;
  constructor(
    private location: Location,
    private dialog: MatDialog,
    private mailListService: MailListService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.isLoading = true;
    this.mailListService.get(this.id).subscribe(
      (res) => {
        this.contacts = res['contacts'];
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
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

  deslectAllPage(): void {
    this.contacts.forEach((e) => {
      if (this.selectedContacts.isSelected(e._id)) {
        this.selectedContacts.deselect(e._id);
      }
    });
  }

  isSelectedPage(): any {
    if (this.contacts.length) {
      for (let i = 0; i < this.contacts.length; i++) {
        const e = this.contacts[i];
        if (!this.selectedContacts.isSelected(e._id)) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
    return false;
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
          if (contacts.length) {
            this.mailListService
              .addContacts(this.id, contacts)
              .subscribe((response) => {
                if (response.length) {
                  for (let i = 0; i < response.length; i++) {
                    this.contacts.push(response[i]);
                  }
                }
              });
          }
        }
      });
  }

  addUniqueContacts(contacts): void {
    for (let i = 0; i < contacts.length; i++) {
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
        maxWidth: '768px',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const csvContacts = res.data;
          this.addUniqueContacts(csvContacts);
        }
      });
  }

  bulkImport(): void {}

  doAction(action: any): void {
    if (action.label === 'Select All') {
      this.selectAllPage();
    } else if (action.label === 'Deselect') {
      this.deslectAllPage();
    } else if (action.label === 'Remove') {
      const removeContacts = [];
      this.contacts.forEach((e) => {
        if (this.selectedContacts.isSelected(e._id)) {
          removeContacts.push(e);
        }
      });

      if (removeContacts) {
        this.isTableChanging = true;
        this.mailListService.removeContacts(this.id, removeContacts).subscribe((res) => {
            if (res) {
              removeContacts.forEach((contact) => {
                const index = this.contacts.findIndex(
                  (item) => item._id === contact._id
                );
                this.contacts.splice(index, 1);
              });
              this.isTableChanging = false;
            }
          },
          (error) => {
            this.isTableChanging = false;
          });
      }
    }
  }

  actions: ActionItem[] = [
    {
      icon: 'i-trash',
      label: 'Remove',
      type: 'button'
    },
    {
      spliter: true,
      label: 'Select All',
      type: 'button'
    },
    {
      label: 'Deselect',
      type: 'button'
    }
  ];
}
