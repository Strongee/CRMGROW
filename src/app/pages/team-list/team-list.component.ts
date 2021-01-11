import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TeamService } from '../../services/team.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { TeamEditComponent } from '../../components/team-edit/team-edit.component';
import { TeamDeleteComponent } from '../../components/team-delete/team-delete.component';
import { TeamCreateComponent } from '../../components/team-create/team-create.component';
import { JoinTeamComponent } from '../../components/join-team/join-team.component';
import { DialogSettings, STATUS } from '../../constants/variable.constants';
import * as _ from 'lodash';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
  STATUS = STATUS;

  userId = '';
  currentUser: User;
  hasOwnTeam = false;

  isAcceptInviting = false;
  isDeclineInviting = false;

  constructor(
    public teamService: TeamService,
    private dialog: MatDialog,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userService.profile$.subscribe((res) => {
      this.userId = res._id;
      this.currentUser = res;
    });
    this.load();
  }

  load(): void {
    this.teamService.loadAll(true);
    this.teamService.loadInvites(true);
    this.teamService.teams$.subscribe((res) => {
      if (res && res.length) {
        for (const team of res) {
          if (team.owner && team.owner.length) {
            this.hasOwnTeam = true;
          }
        }
      }
    });
  }

  status(team: Team): any {
    let index;
    if (team.owner.length) {
      index = team.owner.filter((item) => item._id === this.userId).length;
      if (index > 0) {
        return 'Owner';
      }
    }
    if (team.editors.length) {
      index = team.editors.filter((item) => item._id === this.userId).length;
      if (index > 0) {
        return 'Editor';
      }
    }
    if (team.members.length) {
      index = team.members.filter((item) => item._id === this.userId).length;
      if (index > 0) {
        return 'Viewer';
      }
    }
  }

  editTeam(team: Team): void {
    this.dialog
      .open(TeamEditComponent, {
        width: '96vw',
        maxWidth: '600px',
        disableClose: true,
        data: {
          team
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.teamService.updateTeam$(
            team._id,
            new Team().deserialize({ name: res.name })
          );
        }
      });
  }

  deleteTeam(team: Team): void {
    this.dialog
      .open(TeamDeleteComponent, {
        data: {
          team
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.teamService.deleteTeam$(team._id);
        }
      });
  }

  leaveTeam(team): void {
    this.dialog
      .open(ConfirmComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          title: 'Leave Team',
          message: 'Are you sure to leave this team?',
          cancelLabel: 'No',
          confirmLabel: 'Leave'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const newMembers = [];
          const newEditors = [];
          team.members.forEach((e) => {
            if (e._id !== this.userId) {
              newMembers.push(e._id);
            }
          });
          if (team.editors && team.editors.length) {
            team.editors.forEach((e) => {
              if (e !== this.userId) {
                newEditors.push(e._id);
              }
            });
          }
          this.teamService
            .updateTeam(team._id, { members: newMembers, editors: newEditors })
            .subscribe(
              (response) => {
                this.teamService.loadAll(true);
                this.toastr.success('You left the team successfully.');
              },
              (err) => {}
            );
        }
      });
  }

  openForm(): void {
    this.dialog
      .open(TeamCreateComponent, {
        width: '96vw',
        maxWidth: '600px',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const userId = this.userId;
          const user_name = this.currentUser.user_name;
          const picture_profile = this.currentUser.picture_profile;
          const team = {
            ...res,
            owner: [{ _id: userId, user_name, picture_profile }],
            own: true
          };
          this.teamService.createTeam$(new Team().deserialize(team));
        }
      });
  }

  joinForm(): void {
    this.dialog.open(JoinTeamComponent, DialogSettings.JOIN_TEAM);
  }

  acceptInvitation(team: Team): void {
    this.isAcceptInviting = true;
    this.teamService.acceptInvitation(team._id).subscribe((res) => {
      this.isAcceptInviting = false;
      team.invites.some((e, index) => {
        if (e === this.userId) {
          team.invites.splice(index, 1);
          return true;
        }
      });
      team.members.push(this.userId);
      this.teamService.updateTeam$(team._id, team);
      this.teamService.loadInvites(true);
      this.teamService.loadAll(true);
    });
  }

  declineInvitation(team): void {
    this.isDeclineInviting = true;
    this.teamService.declineInvitation(team._id).subscribe((res) => {
      this.isDeclineInviting = false;
      team.invites.some((e, index) => {
        if (e === this.userId) {
          team.invites.splice(index, 1);
          return true;
        }
      });
      this.teamService.updateTeam$(team._id, team);
      this.teamService.loadInvites(true);
      this.teamService.loadAll(true);
    });
  }
}
