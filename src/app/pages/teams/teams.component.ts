import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TeamService } from 'src/app/services/team.service';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TeamEditComponent } from '../../components/team-edit/team-edit.component';
import { TeamDeleteComponent } from '../../components/team-delete/team-delete.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit, AfterViewInit {
  tabs: TabItem[] = [
    { icon: 'i-icon i-teams', label: 'MY TEAMS', id: 'teams' },
    { icon: 'i-icon i-group-call', label: 'GROUP CALLS', id: 'calls' }
  ];
  loading = true;
  isLoading = false;
  teamsCount = 0;
  selectedTab: TabItem = this.tabs[0];
  loadSubscription: Subscription;
  loadInviteSubscription: Subscription;
  invitedTeams: any[] = [];
  currentUser: any;
  userId = '';
  ownTeams: any[] = [];
  anotherTeams: any[] = [];
  teams: any[] = [];
  constructor(
    private teamService: TeamService,
    private dialog: MatDialog,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userService.loadProfile().subscribe((res) => {
      this.currentUser = res;
      this.userId = res._id;
      this.load();
    });
  }
  ngAfterViewInit(): void {}
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
        console.log('teams =================>', this.teams);
      });
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
  }
  editTeam(team): void {
    this.dialog
      .open(TeamEditComponent, {
        width: '96vw',
        maxWidth: '500px',
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
  openForm(): void {}
  joinForm(): void {}
  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }
}
