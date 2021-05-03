import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TeamService } from '../../services/team.service';
import { ContactService } from '../../services/contact.service';
import { UserService } from '../../services/user.service';

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
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.contact = this.data.contact;
    }
    const profile = this.userService.profile.getValue();
    if (profile) {
      this.userId = profile._id;
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

      // remove yourself from members.
      const index = this.members.findIndex((item) => item._id === this.userId);
      if (index >= 0) {
        this.members.splice(index, 1);
      }

      this.changeDetectorRef.detectChanges();
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
      .shareContacts(this.selectedTeam._id, this.selectedMember._id, [
        this.contact
      ])
      .subscribe((res) => {
        this.loading = false;
        if (res) {
          if (res.status) {
            this.toastr.success(
              `This contact is successfully shared to ${this.selectedMember.user_name} of ${this.selectedTeam.name}.`
            );
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
