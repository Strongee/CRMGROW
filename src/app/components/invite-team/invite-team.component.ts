import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/models/user.model';
import { TeamService } from 'src/app/services/team.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-invite-team',
  templateUrl: './invite-team.component.html',
  styleUrls: ['./invite-team.component.scss']
})
export class InviteTeamComponent implements OnInit {
  newMembers: User[] = [];
  oldMembers: User[] = [];
  teamLink = '';

  constructor(
    private dialogRef: MatDialogRef<InviteTeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService
  ) {
    if (this.data.teamLink) {
      this.teamLink = this.data.teamLink;
    }
    if (this.data.invitation) {
      this.data.invitation.forEach((e) => {
        this.oldMembers.push(new User().deserialize(e));
      });
    }
    if (this.data.referrals) {
      this.data.referrals.forEach((e) => {
        const email = e;
        const user_name = e.split('@')[0];
        this.oldMembers.push(
          new User().deserialize({
            email,
            user_name
          })
        );
      });
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
  /**
   * add member to the new list
   * @param event: Selected User data
   */
  addMember(event: User): void {
    let searchQ = {};
    if (event._id) {
      searchQ = { _id: event._id };
    } else {
      searchQ = { email: event.email };
    }
    const position = _.findIndex(this.newMembers, searchQ);
    if (position === -1) {
      this.newMembers.push(event);
    }
  }

  /**
   * remove member from the new invitation list
   * @param event: Selected user data
   */
  removeMember(event: User): void {
    let searchQ = {};
    if (event._id) {
      searchQ = { _id: event._id };
    } else {
      searchQ = { email: event.email };
    }
    const position = _.findIndex(this.newMembers, searchQ);
    if (position !== -1) {
      this.newMembers.splice(position, 1);
    }
  }

  /**
   * resend the invitation to the User or Referrals
   * @param event: User
   */
  resendInvitation(event: User): void {
    if (event._id) {
      // Send Invitation
    } else {
      // Send Referral
    }
  }

  /**
   * cancel the invitation
   * @param event: User
   */
  cancelInvitation(event: User): void {
    if (event._id) {
      // Cancel Invitaion
    } else {
      // Cancel Referral
    }
  }

  /**
   * Send Invitation to the new members
   */
  sendInvitation(): void {
    if (!this.newMembers.length) {
      this.dialogRef.close();
      return;
    } else {
      // Send Invitation
    }
  }
}
