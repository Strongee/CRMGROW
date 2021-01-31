import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AutomationService } from 'src/app/services/automation.service';
import { ToastrService } from 'ngx-toastr';
import { SelectContactComponent } from '../select-contact/select-contact.component';

@Component({
  selector: 'app-automation-assign',
  templateUrl: './automation-assign.component.html',
  styleUrls: ['./automation-assign.component.scss']
})
export class AutomationAssignComponent implements OnInit, OnDestroy {
  selectedAutomation: any;

  contacts: any[] = [];

  submitted = false;
  contactOverflow = false;
  loading = false;

  @ViewChild('contactSelector') contactSelector: SelectContactComponent;

  constructor(
    private dialogRef: MatDialogRef<AutomationAssignComponent>,
    private automationService: AutomationService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.selectedAutomation = this.data.automation;
    }
  }

  ngOnDestroy(): void {}

  assignAutomation(): void {
    this.submitted = true;
    if (!this.selectedAutomation || !this.contacts.length) {
      return;
    }
    this.loading = true;
    const automation = this.selectedAutomation._id;
    const contacts = [];
    this.contacts.forEach((e) => {
      contacts.push(e._id);
    });

    this.automationService.bulkAssign(contacts, automation).subscribe(
      (res) => {
        this.loading = false;
        if (res) {
          this.dialogRef.close({ status: true });
          this.toastr.success(
            'Automation is assigned to selected contacts successfully.'
          );
        }
        console.log("assign automation ============>", res);
        this.dialogRef.close(res);
      },
      (err) => {
        console.log("assign error ==========>", err);
        this.loading = false;
        this.dialogRef.close({ status: false });
      }
    );
  }

  addContacts(contact): any {
    if (this.contacts.length >= 15) {
      this.contactOverflow = true;
      this.contactSelector.clear();
      return;
    } else if (contact && this.contacts.length < 15) {
      const index = this.contacts.findIndex((item) => item._id === contact._id);
      if (index < 0) {
        this.contacts.push(contact);
      }
      this.contactSelector.clear();
    }
  }

  removeContact(contact): void {
    const index = this.contacts.findIndex((item) => item._id === contact._id);
    if (index >= 0) {
      this.contacts.splice(index, 1);
      this.contactOverflow = false;
    }
  }
}
