import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { User } from 'src/app/models/user.model';
import { TeamService } from 'src/app/services/team.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ToastrService } from 'ngx-toastr';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-invite-team',
  templateUrl: './invite-team.component.html',
  styleUrls: ['./invite-team.component.scss']
})
export class InviteTeamComponent implements OnInit {
  newMembers: User[] = [];
  oldMembers: User[] = [];
  joinLink = '';
  teamId = '';
  team;

  inviteSubscription: Subscription;
  inviting = false;
  resentSubscription: Subscription[];
  resendingMembers: string[] = []; // user id | referral emails
  cancelSubscription: Subscription[];
  cancelingMembers: string[] = []; // userid | referral email
  canceling = false;
  resending = false;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<InviteTeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService,
    private toast: ToastrService,
    private clipboard: Clipboard
  ) {
    if (this.data._id) {
      this.teamId = this.data._id;
      this.team = this.data;
    }
    if (this.data.join_link) {
      this.joinLink = `https://crmgrow.com/invite_ref=${this.data.join_link}`;
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
  resendInvitation(member: User): void {
    if (member) {
      // Send Invitation
      const invitations = [];
      const referrals = [];
      const invitationIds = [];
      const referralEmails = [];
      if (member._id) {
        invitationIds.push(member._id);
        invitations.push(member);
      } else {
        referralEmails.push(member.email);
        referrals.push(member);
      }
      this.resending = true;
      this.inviteSubscription = this.teamService
        .inviteUsers(this.teamId, invitationIds, referrals)
        .subscribe(
          () => {
            this.resending = false;
            this.dialogRef.close();
          },
          () => {
            this.resending = false;
          }
        );
    }
  }

  /**
   * cancel the invitation
   * @param event: User
   */
  cancelInvitation(member: User): void {
    if (member && member._id) {
      this.dialog
        .open(ConfirmComponent, {
          maxWidth: '360px',
          width: '96vw',
          data: {
            title: 'Cancel Invitation',
            message: 'Are you sure to cancel this invitation?',
            cancelLabel: 'No',
            confirmLabel: 'Ok'
          }
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            const newInvites = [];
            this.team.invites.forEach((e) => {
              if (e._id !== member._id) {
                newInvites.push(e._id);
              }
            });
            this.canceling = true;
            this.teamService
              .updateTeam(this.teamId, { invites: newInvites })
              .subscribe(
                (response) => {
                  this.canceling = false;
                  this.team.invites.some((e, index) => {
                    if (e._id === member._id) {
                      this.team.invites.splice(index, 1);
                      return true;
                    }
                  });
                  const searchQ = { _id: member._id };
                  const positionInOld = _.findIndex(this.oldMembers, searchQ);
                  if (positionInOld !== -1) {
                    this.oldMembers.splice(positionInOld, 1);
                  }
                  this.toast.success(
                    'You cancelled the invitation successfully.'
                  );
                },
                (err) => {
                  this.canceling = false;
                }
              );
          }
        });
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

  copyLink(): void {
    this.clipboard.copy(this.joinLink);
    this.toast.success('Copied the link to clipboard');
  }
}
