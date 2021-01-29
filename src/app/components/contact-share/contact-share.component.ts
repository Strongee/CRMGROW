import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from '../../services/team.service';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-share',
  templateUrl: './contact-share.component.html',
  styleUrls: ['./contact-share.component.scss']
})
export class ContactShareComponent implements OnInit {
  contact;
  submitted = false;
  loading = false;
  userId;
  selectedTeam;
  members = [];
  selectedMember;

  constructor(
    private dialogRef: MatDialogRef<ContactShareComponent>,
    private teamService: TeamService,
    private contactService: ContactService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.contact = this.data.contact;
      console.log("contact ===============>", this.contact);
    }
  }

  selectTeam($event): void {
    if ($event) {
      this.selectedTeam = $event;
      this.members = [];
      for (const owner of this.selectedTeam.owner) {
        this.members.push(owner);
      }
      for (const member of this.selectedTeam.members) {
        this.members.push(member);
      }
    } else {
      this.selectedTeam = null;
      this.members = [];
    }
  }

  selectMember($event): void {
    if ($event) {
      this.selectedMember = $event;
    } else {
      this.selectedMember = null;
    }
  }

  shareContact(): void {
    this.submitted = true;
    if (!this.selectedTeam || !this.selectedMember || !this.contact) {
      return;
    }
    this.loading = true;
    this.contactService
      .shareContacts(this.selectedMember._id, [this.contact])
      .subscribe((res) => {
        this.loading = false;
        if (res) {
          if (res.status) {
            this.dialogRef.close({ data: res.data });
          } else {
            this.toastr.error(res.error, 'Share contacts to team member', {
              timeOut: 3000
            });
            this.dialogRef.close();
          }
        }
      });
  }
}
