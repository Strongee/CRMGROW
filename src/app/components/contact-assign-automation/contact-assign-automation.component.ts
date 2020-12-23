import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactService } from '../../services/contact.service';
import { AutomationService } from '../../services/automation.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-assign-automation',
  templateUrl: './contact-assign-automation.component.html',
  styleUrls: ['./contact-assign-automation.component.scss']
})
export class ContactAssignAutomationComponent implements OnInit {
  contactsLoading = false;
  contactsSubscription: Subscription;
  addSubscription: Subscription;
  contacts = [];
  submitted = false;
  selectedAutomation: any;
  adding = false;

  constructor(
    private dialogRef: MatDialogRef<ContactAssignAutomationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private contactService: ContactService,
    private httpClient: HttpClient,
    private automationService: AutomationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.contacts && this.data.contacts.length) {
      this.loadContacts();
    }
  }

  loadContacts(): void {
    this.contactsLoading = true;
    this.contactsSubscription && this.contactsSubscription.unsubscribe();
    this.contactsSubscription = this.contactService
      .getContactsByIds(this.data.contacts)
      .subscribe(
        (res) => {
          console.log("selected contacts ============>", res);
          this.contactsLoading = false;
          this.contacts = res;
        },
        (err) => {
          this.contactsLoading = false;
        }
      );
  }

  selectAutomation($event): void {
    this.selectedAutomation = $event;
  }

  addAutomation(): void {
    this.submitted = true;
    if (!this.selectedAutomation || !this.contacts.length) {
      return;
    }
    const automation = this.selectedAutomation._id;
    const contacts = [];
    this.contacts.forEach((e) => {
      contacts.push(e._id);
    });

    this.adding = true;
    this.addSubscription && this.addSubscription.unsubscribe();
    this.automationService.bulkAssign(contacts, automation).subscribe(
      (res) => {
        this.adding = false;
        this.dialogRef.close({ status: true });
        this.toastr.success(
          'Automation is assigned to selected contacts successfully.'
        );
      },
      (err) => {
        this.dialogRef.close({ status: true });
        this.adding = false;
      }
    );
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
}
