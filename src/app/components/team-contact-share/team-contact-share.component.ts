import {Component, Inject, OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import {TeamService} from "../../services/team.service";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-team-contact-share',
  templateUrl: './team-contact-share.component.html',
  styleUrls: ['./team-contact-share.component.scss']
})
export class TeamContactShareComponent implements OnInit {

  team: any;
  contacts: any[] = [];

  submitted = false;
  contactOverflow = false;
  loading = false;
  userId;

  constructor(
    private dialogRef: MatDialogRef<TeamContactShareComponent>,
    private teamService: TeamService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.team = this.data.team;
      this.userService.profile$.subscribe((res) => {
        if (res) {
          this.userId = res._id;
        }
      });
    }
  }

  shareContacts(): void {
    this.submitted = true;
    if (!this.team || !this.contacts.length) {
      return;
    }
    this.loading = true;
    const contacts = [];
    this.contacts.forEach((e) => {
      contacts.push(e._id);
    });

    this.teamService
      .shareContacts(this.userId, contacts)
      .subscribe((res) => {
        if (res) {
          console.log("shared contacts ====================>", res);
        }
      });
  }

  addContacts(contact): any {
    if (this.contacts.length === 15) {
      this.contactOverflow = true;
      return;
    } else if (contact && this.contacts.length < 15) {
      const index = this.contacts.findIndex((item) => item._id === contact._id);
      if (index < 0) {
        this.contacts.push(contact);
      }
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
