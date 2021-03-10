import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/models/user.model';
import { TeamService } from 'src/app/services/team.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invite-team',
  templateUrl: './invite-team.component.html',
  styleUrls: ['./invite-team.component.scss']
})
export class InviteTeamComponent implements OnInit {
  newMembers: User[] = [];
  oldMembers: User[] = [];
  teamLink = '';
  teamId = '';

  inviteSubscription: Subscription;
  inviting = false;
  resentSubscription: Subscription[];
  resendingMembers: string[] = []; // user id | referral emails
  cancelSubscription: Subscription[];
  cancelingMembers: string[] = []; // userid | referral email

  constructor(
    private dialogRef: MatDialogRef<InviteTeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService
  ) {
    if (this.data._id) {
      this.teamId = this.data._id;
    }
    if (this.data.teamLink) {
      this.teamLink = this.data.teamLink;
    }
    if (this.data.invites) {
      this.data.invites.forEach((e) => {
        this.oldMembers.push(new User().deserialize(e));
      });
    }
    if (this.data.referrals) {
      this.data.referrals.forEach((e) => {
        if (e && e.email) {
          const email = e.email;
          const user_name = e.user_name ? e.user_name : email.split('@')[0];
          this.oldMembers.push(
            new User().deserialize({
              email,
              user_name
            })
          );
        }
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
    const positionInOld = _.findIndex(this.oldMembers, searchQ);
    if (positionInOld !== -1) {
      return;
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
   * Check if the current user is resending
   * @param member : Confirm User
   */
  isResending(member: User): boolean {
    const identifier = member._id || member.email;
    const position = this.resendingMembers.indexOf(identifier);
    if (position !== -1) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Check if the current user is canceling
   * @param member
   */
  isCanceling(member: User): boolean {
    const identifier = member._id || member.email;
    const position = this.cancelingMembers.indexOf(identifier);
    if (position !== -1) {
      return true;
    } else {
      return false;
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
      const invitations = [];
      const referrals = [];
      const invitationIds = [];
      const referralEmails = [];
      this.newMembers.forEach((e) => {
        if (e._id) {
          invitationIds.push(e._id);
          invitations.push(e);
        } else {
          referralEmails.push(e.email);
          referrals.push(e);
        }
      });
      this.inviting = true;
      this.inviteSubscription = this.teamService
        .inviteUsers(this.teamId, invitationIds, referrals)
        .subscribe(
          () => {
            this.inviting = false;
            this.dialogRef.close({
              invitations,
              referrals
            });
          },
          () => {
            this.inviting = false;
          }
        );
    }
  }
}
