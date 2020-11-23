import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TeamService } from 'src/app/services/team.service';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TeamEditComponent } from '../../components/team-edit/team-edit.component';
import { TeamDeleteComponent } from '../../components/team-delete/team-delete.component';
import { JoinCallRequestComponent } from '../../components/join-call-request/join-call-request.component';
import { CallRequestConfirmComponent } from '../../components/call-request-confirm/call-request-confirm.component';
import { CallRequestCancelComponent } from '../../components/call-request-cancel/call-request-cancel.component';
import { JoinTeamComponent } from 'src/app/components/join-team/join-team.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { CalendarDialogComponent } from '../../components/calendar-dialog/calendar-dialog.component';
import * as moment from 'moment';
import { CallRequestScheduledComponent } from '../../components/call-request-scheduled/call-request-scheduled.component';
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

  inquiriesData: any[] = [];
  pageInquiriesData: any[] = [];
  totalInquiries: any;
  inquiriesCount: any;
  currentInquiriesPage: any = 1;
  inquiriesCurrentPage;
  inquiriesSubscription;
  isInquiryLoading = false;
  isInquiryTableLoading = false;

  plannedData: any[] = [];
  pagePlannedData: any[] = [];
  totalPlanned: any;
  plannedCount: any;
  currentPlannedPage: any = 1;
  plannedCurrentPage;
  plannedSubscription;
  isPlannedLoading = false;
  isPlannedTableLoading = false;

  finishedData: any[] = [];
  pageFinishedData: any[] = [];
  totalFinished: any;
  finishedCount: any;
  currentFinishedPage: any = 1;
  finishedCurrentPage;
  finishedSubscription;
  isFinishedLoading = false;
  isFinishedTableLoading = false;

  inquiryCreateHandleSubscription;
  inquiryUpdateHandleSubscription;

  plannedCreateHandleSubscription;
  plannedUpdateHandleSubscription;

  finishedCreateHandleSubscription;
  finishedUpdateHandleSubscription;

  isLeader = false;

  inquiryExpanded = true;
  plannedExpanded = true;
  finishedExpanded = true;

  isAcceptInviting = false;
  isDeclineInviting = false;

  constructor(
    private teamService: TeamService,
    private dialog: MatDialog,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isInquiryLoading = true;
    this.isPlannedLoading = true;
    this.isFinishedLoading = true;
    this.userService.profile$.subscribe((res) => {
      this.currentUser = res;
      this.userId = res._id;
      this.load();
      this.initSignalHandlers();
      this.loadInquiriesPage(1);
      this.loadPlannedPage(1);
      this.loadFinishedPage(1);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const callId = this.route.snapshot.params.id;
      if (callId) {
        this.teamService.getInquiry(callId).subscribe((res) => {
          const inquiry = res;
          if (inquiry) {
            this.changeTab(this.tabs[1]);
            this.confirmRequest(inquiry);
          }
        });
      }
    }, 2000);
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

  loadInquiriesPage(page): void {
    let skip = 0;
    if (page) {
      this.inquiriesCurrentPage = page;
      skip = (page - 1) * 8;
    } else {
      this.inquiriesCurrentPage = 1;
      skip = 0;
    }

    this.isInquiryTableLoading = true;
    this.inquiriesSubscription && this.inquiriesSubscription.unsubscribe();
    this.inquiriesSubscription = this.teamService
      .getPageInquiries(skip)
      .subscribe(
        (res) => {
          this.isInquiryLoading = false;
          this.isInquiryTableLoading = false;
          this.inquiriesData = res.data;
          this.pageInquiriesData = res.data;
          this.totalInquiries = res.total;
          this.inquiriesCount = res.total;
        },
        (err) => {
          this.isInquiryTableLoading = false;
        }
      );
  }

  loadPlannedPage(page): void {
    let skip = 0;
    if (page) {
      this.plannedCurrentPage = page;
      skip = (page - 1) * 8;
    } else {
      this.plannedCurrentPage = 1;
      skip = 0;
    }

    this.isPlannedTableLoading = true;
    this.plannedSubscription && this.plannedSubscription.unsubscribe();
    this.plannedSubscription = this.teamService.getPagePlanned(skip).subscribe(
      (res) => {
        this.isPlannedLoading = false;
        this.isPlannedTableLoading = false;
        this.plannedData = res.data;
        this.pagePlannedData = res.data;
        this.totalPlanned = res.total;
        this.plannedCount = res.total;
      },
      (err) => {
        this.isPlannedTableLoading = false;
      }
    );
  }

  loadFinishedPage(page): void {
    let skip = 0;
    if (page) {
      this.finishedCurrentPage = page;
      skip = (page - 1) * 8;
    } else {
      this.finishedCurrentPage = 1;
      skip = 0;
    }

    this.isFinishedTableLoading = true;
    this.finishedSubscription && this.finishedSubscription.unsubscribe();
    this.finishedSubscription = this.teamService
      .getPageFinished(skip)
      .subscribe(
        (res) => {
          this.isFinishedLoading = false;
          this.isFinishedTableLoading = false;
          this.finishedData = res.data;
          this.pageFinishedData = res.data;
          this.totalFinished = res.total;
          this.finishedCount = res.total;
        },
        (err) => {
          this.isFinishedTableLoading = false;
        }
      );
  }

  setPageInquiries(page): void {
    this.loadInquiriesPage(page);
    const start = (page - 1) * 8;
    const end = page * 8;
    this.pageInquiriesData = this.inquiriesData.slice(start, end);
    this.currentInquiriesPage = page;
  }

  setPagePlanned(page): void {
    this.loadPlannedPage(page);
    const start = (page - 1) * 8;
    const end = page * 8;
    this.pagePlannedData = this.pagePlannedData.slice(start, end);
    this.currentPlannedPage = page;
  }

  setPageFinished(page): void {
    this.loadFinishedPage(page);
    const start = (page - 1) * 8;
    const end = page * 8;
    this.pageFinishedData = this.finishedData.slice(start, end);
    this.currentFinishedPage = page;
  }

  initSignalHandlers(): void {
    // Add activity
    // this.inquiryCreateHandleSubscription = this.signalService
    //   .inquiryCreateHandle()
    //   .subscribe((res) => {
    //     this.totalInquiries++;
    //     this.inquiriesCount++;
    //     this.loadInquiriesPage(this.currentInquiriesPage);
    //   });
    //
    // // Update Contact Handle
    // this.inquiryUpdateHandleSubscription = this.signalService
    //   .inquiryUpdateHandle()
    //   .subscribe((res) => {
    //     this.inquiriesData.forEach((inquiry) => {
    //       if (inquiry._id == res.inquiry_id) {
    //         this.totalInquiries--;
    //         this.inquiriesCount--;
    //         this.loadInquiriesPage(this.currentInquiriesPage);
    //
    //         if (res.status == 'planned') {
    //           this.totalPlanned++;
    //           this.plannedCount++;
    //           const last_page = Math.floor(this.totalPlanned / 8);
    //           this.loadPlannedPage(last_page);
    //         } else if (res.status == 'finished' || res.status == 'canceled') {
    //           this.totalFinished++;
    //           this.finishedCount++;
    //           const last_page = Math.floor(this.totalFinished / 8);
    //           this.loadFinishedPage(last_page);
    //         }
    //       }
    //     });
    //   });
    //
    // // Add activity
    // this.plannedCreateHandleSubscription = this.signalService
    //   .plannedCreateHandle()
    //   .subscribe((res) => {
    //     this.totalPlanned++;
    //     this.plannedCount++;
    //     this.loadPlannedPage(this.currentPlannedPage);
    //   });
    //
    // // Update Contact Handle
    // this.plannedUpdateHandleSubscription = this.signalService
    //   .plannedUpdateHandle()
    //   .subscribe((res) => {
    //     this.plannedData.forEach((plan) => {
    //       if (plan._id == res.plan_id) {
    //         this.totalPlanned--;
    //         this.plannedCount--;
    //         this.loadPlannedPage(this.currentPlannedPage);
    //
    //         if (res.status != 'deleted') {
    //           this.totalFinished++;
    //           this.finishedCount++;
    //           const last_page = Math.floor(this.totalFinished / 8);
    //           this.loadFinishedPage(last_page);
    //         }
    //       }
    //     });
    //   });
    //
    // this.finishedCreateHandleSubscription = this.signalService
    //   .finishedCreateHandle()
    //   .subscribe((res) => {
    //     this.totalFinished++;
    //     this.finishedCount++;
    //     this.loadFinishedPage(this.currentFinishedPage);
    //   });
    //
    // // Update Contact Handle
    // this.finishedUpdateHandleSubscription = this.signalService
    //   .finishedUpdateHandle()
    //   .subscribe((res) => {
    //     this.loadFinishedPage(this.currentFinishedPage);
    //   });
  }

  finishedInquiry(inquiry): void {
    this.isInquiryTableLoading = true;
    inquiry.status = 'finished';
    this.teamService.updateCall(inquiry._id, inquiry).subscribe(
      (res) => {
        this.isInquiryTableLoading = false;
        if (res) {
          const result = {
            inquiry_id: inquiry._id,
            status: 'finished'
          };
          this.loadInquiriesPage(this.currentInquiriesPage);
          this.loadFinishedPage(this.currentFinishedPage);
        }
      },
      (error) => {
        this.isInquiryTableLoading = false;
      }
    );
  }

  deleteInquiry(inquiry): void {
    this.isInquiryTableLoading = true;
    inquiry.status = 'deleted';
    this.teamService.deleteCall(inquiry._id).subscribe(
      (res) => {
        this.isInquiryTableLoading = false;
        if (res) {
          const result = {
            inquiry_id: inquiry._id,
            status: 'canceled'
          };
          this.loadInquiriesPage(this.currentInquiriesPage);
          // this.signalService.inquiryUpdateSignal(result)
        }
      },
      (error) => {
        this.isInquiryTableLoading = false;
      }
    );
  }

  cancelInquiry(inquiry): void {
    this.isInquiryTableLoading = true;
    inquiry.status = 'canceled';
    this.teamService.updateCall(inquiry._id, inquiry).subscribe(
      (res) => {
        this.isInquiryTableLoading = false;
        if (res) {
          const result = {
            inquiry_id: inquiry._id,
            status: 'canceled'
          };

          this.dialog
            .open(CallRequestCancelComponent, {
              width: '96vw',
              maxWidth: '600px',
              height: 'auto',
              disableClose: true,
              data: {
                data: inquiry
              }
            })
            .afterClosed()
            .subscribe((response) => {
              this.loadInquiriesPage(this.currentInquiriesPage);
              this.loadFinishedPage(this.currentFinishedPage);
            });

          this.loadInquiriesPage(this.currentInquiriesPage);
          this.loadFinishedPage(this.currentFinishedPage);
          // this.signalService.inquiryUpdateSignal(result)
        }
      },
      (error) => {
        this.isInquiryTableLoading = false;
      }
    );
  }

  finishedPlan(plan): void {
    this.isPlannedTableLoading = true;
    plan.status = 'finished';
    this.teamService.updateCall(plan._id, plan).subscribe(
      (res) => {
        this.isPlannedTableLoading = false;
        if (res) {
          const result = {
            plan_id: plan._id,
            status: 'finished'
          };
          this.loadPlannedPage(this.currentPlannedPage);
          this.loadFinishedPage(this.currentFinishedPage);
          // this.signalService.plannedUpdateSignal(result)
        }
      },
      (error) => {
        this.isPlannedTableLoading = false;
      }
    );
  }

  cancelPlan(plan): void {
    this.isPlannedTableLoading = true;
    plan.status = 'canceled';
    this.teamService.updateCall(plan._id, plan).subscribe(
      (res) => {
        this.isPlannedTableLoading = false;
        if (res) {
          const result = {
            plan_id: plan._id,
            status: 'canceled'
          };
          this.loadPlannedPage(this.currentPlannedPage);
          this.loadFinishedPage(this.currentFinishedPage)
          // this.signalService.plannedUpdateSignal(result);
        }
      },
      (error) => {
        this.isPlannedTableLoading = false;
      }
    );
  }

  deletePlan(plan): void {
    this.isPlannedTableLoading = true;
    plan.status = 'deleted';
    this.teamService.deleteCall(plan._id).subscribe(
      (res) => {
        this.isPlannedTableLoading = false;
        if (res) {
          const result = {
            plan_id: plan._id,
            status: 'deleted'
          };
          this.loadPlannedPage(this.currentPlannedPage);
          // this.signalService.inquiryUpdateSignal(result);
        }
      },
      (error) => {
        this.isPlannedTableLoading = false;
      }
    );
  }

  deleteFinished(finished): void {
    this.isFinishedTableLoading = true;
    finished.status = 'deleted';
    this.teamService.deleteCall(finished._id).subscribe(
      (res) => {
        this.isPlannedTableLoading = false;
        if (res) {
          const result = {
            finished_id: finished._id,
            status: 'deleted'
          };
          this.loadFinishedPage(this.currentFinishedPage);
          // this.signalService.inquiryUpdateSignal(result);
        }
      },
      (error) => {
        this.isFinishedTableLoading = false;
      }
    );
  }

  selectCall(inquiry): void {
    this.isLeader = this.userId === inquiry.leader._id;
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

  joinForm(): void {
    this.dialog.open(JoinTeamComponent, DialogSettings.JOIN_TEAM);
  }

  getDuration(duration): string {
    if (duration === 60) {
      return '1 hour';
    }
    return `${duration} mins`;
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
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

  declineInvitation(team): void {

  }

  confirmRequest(inquiry): void {
    this.location.replaceState('/teams/call/' + inquiry._id);
    const status = inquiry.status;
    this.dialog
      .open(CallRequestConfirmComponent, {
        width: '96vw',
        maxWidth: '600px',
        height: 'auto',
        disableClose: true,
        data: {
          inquiry
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.data.status === 'planned') {
            this.loadInquiriesPage(this.currentInquiriesPage);
            this.loadPlannedPage(this.currentPlannedPage);
          } else if (res.data.status === 'canceled') {
            if (status === 'pending') {
              this.dialog
                .open(CallRequestCancelComponent, {
                  width: '96vw',
                  maxWidth: '600px',
                  height: 'auto',
                  disableClose: true,
                  data: {
                    data: inquiry
                  }
                })
                .afterClosed()
                .subscribe((response) => {
                  this.loadInquiriesPage(this.currentInquiriesPage);
                  this.loadFinishedPage(this.currentFinishedPage);
                });
            }
            this.loadInquiriesPage(this.currentInquiriesPage);
            this.loadFinishedPage(this.currentFinishedPage);
          }
        }
        this.location.replaceState('/teams');
      });
  }
  scheduleCall(plan): void {
    this.location.replaceState('/teams/call/' + plan._id);
    const status = plan.status;
    this.dialog
      .open(CallRequestScheduledComponent, {
        width: '96vw',
        maxWidth: '600px',
        height: 'auto',
        disableClose: true,
        data: {
          plan
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.data.status === 'canceled') {
            if (status === 'pending') {
              this.dialog
                .open(CallRequestCancelComponent, {
                  width: '96vw',
                  maxWidth: '600px',
                  height: 'auto',
                  disableClose: true,
                  data: {
                    date: plan
                  }
                })
                .afterClosed()
                .subscribe((response) => {
                  this.loadPlannedPage(this.currentInquiriesPage);
                  this.loadFinishedPage(this.currentFinishedPage);
                });
            }
            this.loadPlannedPage(this.currentInquiriesPage);
            this.loadFinishedPage(this.currentFinishedPage);
          }
        }
        this.location.replaceState('/teams');
      });
  }
  joinCallRequest(): void {
    this.dialog
      .open(JoinCallRequestComponent, {
        width: '96vw',
        maxWidth: '500px',
        height: 'auto',
        disableClose: true,
        data: {
          teams: this.teams
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.loadInquiriesPage(this.currentInquiriesPage);
        }
      });
  }

  changeExpanded(accordionType): void {
    if (accordionType === 'inquiry') {
      this.inquiryExpanded = !this.inquiryExpanded;
    } else if (accordionType === 'planned') {
      this.plannedExpanded = !this.plannedExpanded;
    } else if (accordionType === 'finished') {
      this.finishedExpanded = !this.finishedExpanded;
    }
  }
  editGroupCall(plan): void {}
  addToCalendar(plan): void {
    this.router.navigate(['/calendar']);
    const startDate = new Date(plan.proposed_at[plan.proposed_at.length - 1]);
    const endDate = moment(startDate).add(plan.duration, 'm').toISOString();
    const calendarData = {
      title: plan.subject,
      start: startDate,
      end: new Date(endDate),
      meta: {
        contacts: plan.contacts,
        description: plan.description,
        guests: plan.guests,
        is_organizer: plan.user._id === this.userId
      }
    };
    this.dialog.open(CalendarDialogComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '600px',
      data: {
        event: calendarData
      }
    });
  }
}
