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
import { DialogSettings } from '../../constants/variable.constants';
import * as _ from 'lodash';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
  loading = true;
  isLoading = false;
  teamsCount = 0;
  loadSubscription: Subscription;
  loadInviteSubscription: Subscription;
  invitedTeams: any[] = [];
  currentUser: any;
  userId = '';
  ownTeams: any[] = [];
  anotherTeams: any[] = [];
  teams: any[] = [];

  isAcceptInviting = false;
  isDeclineInviting = false;

  constructor(
    private teamService: TeamService,
    private dialog: MatDialog,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit(): void {
    this.userService.profile$.subscribe((res) => {
      this.currentUser = res;
      this.userId = res._id;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.spinner.show('sp5');
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.teamService.loadAll().subscribe((res) => {
      this.loading = false;
      this.spinner.hide('sp5');
      res.forEach((e) => {
        const team = {
          ...e
        };
        if (team.owner.length === 1) {
          if (team.owner[0]._id === this.userId) {
            this.ownTeams.push({ ...team, own: true });
          } else {
            this.anotherTeams.push(team);
          }
        } else {
          const index = _.findIndex(team.owner, { _id: this.userId });
          if (index !== -1) {
            this.ownTeams.push({ ...team, own: true });
          } else {
            this.anotherTeams.push(team);
          }
        }
        this.teams = [...this.ownTeams, ...this.anotherTeams];
      });
    });
    this.loadInviteSubscription = this.teamService
      .loadInvitedStatus()
      .subscribe((res) => {
        this.invitedTeams = res;
      });
  }

  status(team): any {
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

  editTeam(team): void {
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
          this.ownTeams.some((e) => {
            if (e._id === team._id) {
              e.name = res.name;
              return true;
            }
          });
          this.teams = [...this.ownTeams, ...this.anotherTeams];
        }
      });
  }

  deleteTeam(team): void {
    this.dialog
      .open(TeamDeleteComponent, {
        data: {
          team
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.ownTeams.some((e, index) => {
            if (e._id === team._id) {
              this.ownTeams.splice(index, 1);
              return true;
            }
          });
          this.teams = [...this.ownTeams, ...this.anotherTeams];
        }
      });
  }

  leaveTeam(team): void {}

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
          this.ownTeams.push(team);
          this.teams.push(team);
        }
      });
  }

  joinForm(): void {
    this.dialog.open(JoinTeamComponent, DialogSettings.JOIN_TEAM);
  }

  acceptInvitation(team): void {
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
      this.anotherTeams.push(team);
      this.teams = [...this.ownTeams, ...this.anotherTeams];
      _.remove(this.invitedTeams, (e) => {
        return e._id === team._id;
      });
    });
  }

  declineInvitation(team): void {}
}
