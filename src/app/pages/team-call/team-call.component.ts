import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallRequestCancelComponent } from '../../components/call-request-cancel/call-request-cancel.component';
import { CallRequestConfirmComponent } from '../../components/call-request-confirm/call-request-confirm.component';
import { CallRequestScheduledComponent } from '../../components/call-request-scheduled/call-request-scheduled.component';
import { JoinCallRequestComponent } from '../../components/join-call-request/join-call-request.component';
import * as moment from 'moment';
import { CalendarDialogComponent } from '../../components/calendar-dialog/calendar-dialog.component';
import { Subscription } from 'rxjs';

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

  openCall(call): void {}

  edit(call): void {}

  delete(call): void {}

  complete(call): void {}

  decline(call): void {}

  cancel(call): void {}

  finishedInquiry(inquiry): void {
    inquiry.status = 'finished';
    this.teamService.updateCall(inquiry._id, inquiry).subscribe(
      (res) => {
        if (res) {
          const result = {
            inquiry_id: inquiry._id,
            status: 'finished'
          };
          // this.loadInquiriesPage(this.currentInquiriesPage);
          // this.loadFinishedPage(this.currentFinishedPage);
        }
      },
      (error) => {}
    );
  }

  deleteInquiry(inquiry): void {
    inquiry.status = 'deleted';
    this.teamService.deleteCall(inquiry._id).subscribe(
      (res) => {
        if (res) {
          const result = {
            inquiry_id: inquiry._id,
            status: 'canceled'
          };
          // this.loadInquiriesPage(this.currentInquiriesPage);
          // this.signalService.inquiryUpdateSignal(result)
        }
      },
      (error) => {}
    );
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

  finishedPlan(plan): void {
    plan.status = 'finished';
    this.teamService.updateCall(plan._id, plan).subscribe(
      (res) => {
        if (res) {
          const result = {
            plan_id: plan._id,
            status: 'finished'
          };
          // this.loadPlannedPage(this.currentPlannedPage);
          // this.loadFinishedPage(this.currentFinishedPage);
          // this.signalService.plannedUpdateSignal(result)
        }
      },
      (error) => {}
    );
  }

  cancelPlan(plan): void {
    plan.status = 'canceled';
    this.teamService.updateCall(plan._id, plan).subscribe(
      (res) => {
        if (res) {
          const result = {
            plan_id: plan._id,
            status: 'canceled'
          };
          // this.loadPlannedPage(this.currentPlannedPage);
          // this.loadFinishedPage(this.currentFinishedPage);
          // this.signalService.plannedUpdateSignal(result);
        }
      },
      (error) => {}
    );
  }

  deletePlan(plan): void {
    plan.status = 'deleted';
    this.teamService.deleteCall(plan._id).subscribe(
      (res) => {
        if (res) {
          const result = {
            plan_id: plan._id,
            status: 'deleted'
          };
          // this.loadPlannedPage(this.currentPlannedPage);
          // this.signalService.inquiryUpdateSignal(result);
        }
      },
      (error) => {}
    );
  }

  deleteFinished(finished): void {
    finished.status = 'deleted';
    this.teamService.deleteCall(finished._id).subscribe(
      (res) => {
        if (res) {
          const result = {
            finished_id: finished._id,
            status: 'deleted'
          };
          // this.loadFinishedPage(this.currentFinishedPage);
          // this.signalService.inquiryUpdateSignal(result);
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
