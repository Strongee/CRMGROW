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

@Component({
  selector: 'app-automation-assign',
  templateUrl: './automation-assign.component.html',
  styleUrls: ['./automation-assign.component.scss']
})
export class AutomationAssignComponent implements OnInit, OnDestroy {

  selectedAutomation: any;

  contacts: any[] = [];

  submitted = false;

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
    let automation = this.selectedAutomation._id;
    let contacts = [];
    this.contacts.forEach((e) => {
      contacts.push(e._id);
    });

    this.automationService.bulkAssign(contacts, automation).subscribe(
      (res) => {
        this.dialogRef.close({ status: true });
        this.toastr.success("Automation is assigned to selected contacts successfully.")
      },
      (err) => {
        this.dialogRef.close({ status: true });
      }
    );
  }
}
