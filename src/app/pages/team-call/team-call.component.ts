import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CallRequestCancelComponent } from '../../components/call-request-cancel/call-request-cancel.component';
import { CallRequestConfirmComponent } from '../../components/call-request-confirm/call-request-confirm.component';
import { CallRequestScheduledComponent } from '../../components/call-request-scheduled/call-request-scheduled.component';
import { JoinCallRequestComponent } from '../../components/join-call-request/join-call-request.component';
import * as moment from 'moment';
import { CalendarDialogComponent } from '../../components/calendar-dialog/calendar-dialog.component';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { CallRequestDetailComponent } from 'src/app/components/call-request-detail/call-request-detail.component';
import * as _ from 'lodash';
@Component({
  selector: 'app-team-call',
  templateUrl: './team-call.component.html',
  styleUrls: ['./team-call.component.scss']
})
export class TeamCallComponent implements OnInit, OnDestroy, AfterViewInit {
  TABS: any[] = [
    { id: 'inquiry', label: 'Inquiries' },
    { id: 'sent', label: 'Sent' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'completed', label: 'Completed' },
    { id: 'canceled', label: 'Canceled' },
    { id: 'denied', label: 'Denied' }
  ];
  selectedTab = this.TABS[0];

  currentUser: any;
  userId = '';
  teams: any[] = [];

  pageData: any = {
    inquiry: [],
    sent: [],
    scheduled: [],
    completed: [],
    canceled: [],
    denied: []
  };
  loading: any = {
    inquiry: false,
    sent: false,
    scheduled: false,
    completed: false,
    canceled: false,
    denied: false
  };
  total: any = {
    inquiry: 0,
    sent: 0,
    scheduled: 0,
    completed: 0,
    canceled: 0,
    denied: 0
  };
  page: any = {
    inquiry: 0,
    sent: 0,
    scheduled: 0,
    completed: 0,
    canceled: 0,
    denied: 0
  };
  subscriptions: any = {};

  constructor(
    private teamService: TeamService,
    private dialog: MatDialog,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.profile$.subscribe((res) => {
      this.currentUser = res;
      this.userId = res._id;
    });
    this.TABS.forEach((e) => {
      this.loadPageCalls(e.id, 0);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const callId = this.route.snapshot.params.id;
      if (callId) {
        this.teamService.getInquiry(callId).subscribe((res) => {
          const inquiry = res;
          if (inquiry) {
            this.confirmRequest(inquiry);
          }
        });
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    for (const type in this.subscriptions) {
      this.subscriptions[type] && this.subscriptions[type].unsubscribe();
    }
  }

  changeTab(tab: any): void {
    this.selectedTab = tab;
  }

  loadPageCalls(type: string, page: number): void {
    let skip = 0;
    if (page) {
      this.page[type] = page;
      skip = (page - 1) * 8;
    } else {
      this.page[type] = 1;
      skip = 0;
    }

    this.loading[type] = true;
    this.subscriptions[type] && this.subscriptions[type].unsubscribe();
    this.subscriptions[type] = this.teamService
      .loadTeamCalls(type, skip)
      .subscribe((res) => {
        this.loading[type] = false;
        if (res) {
          this.total[type] = res['total'];
          this.pageData[type] = res['data'];
        }
      });
  }

  changePage(page: number): void {
    this.loadPageCalls(this.selectedTab.id, page);
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
          this.loadPageCalls('sent', this.page['sent']);
        }
      });
  }

  openCall(call): void {
    this.dialog
      .open(CallRequestDetailComponent, {
        width: '98vw',
        maxWidth: '500px',
        height: 'auto',
        data: {
          call
        }
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          const currentTab = this.selectedTab.id;
          if (data.action === 'delete') {
            _.remove(this.pageData[currentTab], (e) => {
              return e._id === call._id;
            });
            this.total[currentTab]--;
          } else if (data.action === 'update') {
            let newTab;
            if (data.data.status === 'finished') {
              newTab = 'completed';
            } else if (data.data.status === 'planned') {
              newTab = 'scheduled';
            } else if (data.data.status === 'declined') {
              newTab = 'denied';
            }
            this.pageData[newTab].unshift({
              ...call,
              ...data.data
            });
            _.remove(this.pageData[currentTab], (e) => {
              return e._id === call._id;
            });
            this.total[currentTab]--;
            this.total[newTab]++;
            if (
              this.pageData[currentTab].length < 5 &&
              this.total[currentTab] > 8
            ) {
              this.loadPageCalls(currentTab, this.page[currentTab]);
            }
          }
        }
      });
  }

  edit(call): void {}

  complete(call): void {}

  delete(call): void {
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Delete group call',
          message: 'Are you sure to delete this group call?',
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((answer) => {
        if (answer) {
          const currentTab = this.selectedTab.id;
          this.teamService.deleteCall(call._id).subscribe((status) => {
            if (status) {
              _.remove(this.pageData[currentTab], (e) => {
                return e._id === call._id;
              });
              this.total[currentTab]--;
              if (
                this.pageData[currentTab].length < 5 &&
                this.total[currentTab] > 8
              ) {
                this.loadPageCalls(currentTab, this.page[currentTab]);
              }
            }
          });
        }
      });
  }

  decline(call): void {
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Decline group call',
          message: 'Are you sure to decline this group call?',
          confirmLabel: 'Decline'
        }
      })
      .afterClosed()
      .subscribe((answer) => {
        if (answer) {
          this.teamService
            .updateCall(call._id, { status: 'declined' })
            .subscribe((status) => {
              if (status) {
                this.pageData['denied'].unshift({
                  ...call,
                  status: 'declined'
                });
                _.remove(this.pageData['inquiry'], (e) => {
                  return e._id === call._id;
                });
                this.total['inquiry']--;
                this.total['denied']++;
                if (
                  this.pageData['inquiry'].length < 5 &&
                  this.total['inquiry'] > 8
                ) {
                  this.loadPageCalls('inquiry', this.page['inquiry']);
                }
              }
            });
        }
      });
  }

  cancel(call): void {
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Cancel group call',
          message: 'Are you sure to cancel this group call?',
          confirmLabel: 'Cancel'
        }
      })
      .afterClosed()
      .subscribe((answer) => {
        if (answer) {
          const currentTab = this.selectedTab.id;
          this.teamService
            .updateCall(call._id, { status: 'canceled' })
            .subscribe((status) => {
              if (status) {
                this.pageData['canceled'].unshift({
                  ...call,
                  status: 'canceled'
                });
                _.remove(this.pageData[currentTab], (e) => {
                  return e._id === call._id;
                });
                this.total[currentTab]--;
                this.total['canceled']++;
                if (
                  this.pageData[currentTab].length < 5 &&
                  this.total[currentTab] > 8
                ) {
                  this.loadPageCalls(currentTab, this.page[currentTab]);
                }
              }
            });
        }
      });
  }

  cancelInquiry(inquiry): void {
    inquiry.status = 'canceled';
    this.teamService.updateCall(inquiry._id, inquiry).subscribe(
      (res) => {
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
              // this.loadInquiriesPage(this.currentInquiriesPage);
              // this.loadFinishedPage(this.currentFinishedPage);
            });

          // this.loadInquiriesPage(this.currentInquiriesPage);
          // this.loadFinishedPage(this.currentFinishedPage);
          // this.signalService.inquiryUpdateSignal(result)
        }
      },
      (error) => {}
    );
  }

  getDuration(duration): string {
    if (duration === 60) {
      return '1 hour';
    }
    return `${duration} mins`;
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
            // this.loadInquiriesPage(this.currentInquiriesPage);
            // this.loadPlannedPage(this.currentPlannedPage);
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
                  // this.loadInquiriesPage(this.currentInquiriesPage);
                  // this.loadFinishedPage(this.currentFinishedPage);
                });
            }
            // this.loadInquiriesPage(this.currentInquiriesPage);
            // this.loadFinishedPage(this.currentFinishedPage);
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
                    data: plan
                  }
                })
                .afterClosed()
                .subscribe((response) => {
                  // this.loadPlannedPage(this.currentInquiriesPage);
                  // this.loadFinishedPage(this.currentFinishedPage);
                });
            }
            // this.loadPlannedPage(this.currentInquiriesPage);
            // this.loadFinishedPage(this.currentFinishedPage);
          }
        }
        this.location.replaceState('/teams');
      });
  }
  editGroupCall(plan): void {}
  addToCalendar(plan): void {
    this.router.navigate(['/calendar']);
    const startDate = new Date(plan.confirmed_at);
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
