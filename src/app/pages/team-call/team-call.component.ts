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
  loading = true;
  isLoading = false;
  currentUser: any;
  userId = '';
  teams: any[] = [];

  inquiriesData: any[] = [];
  pageInquiriesData: any[] = [];
  totalInquiries: any;
  inquiriesCount: any;
  currentInquiriesPage: any = 1;
  inquiriesCurrentPage;
  inquiriesSubscription: Subscription;
  isInquiryLoading = false;
  isInquiryTableLoading = false;

  plannedData: any[] = [];
  pagePlannedData: any[] = [];
  totalPlanned: any;
  plannedCount: any;
  currentPlannedPage: any = 1;
  plannedCurrentPage;
  plannedSubscription: Subscription;
  isPlannedLoading = false;
  isPlannedTableLoading = false;

  finishedData: any[] = [];
  pageFinishedData: any[] = [];
  totalFinished: any;
  finishedCount: any;
  currentFinishedPage: any = 1;
  finishedCurrentPage;
  finishedSubscription: Subscription;
  isFinishedLoading = false;
  isFinishedTableLoading = false;

  isLeader = false;

  inquiryExpanded = true;
  plannedExpanded = true;
  finishedExpanded = true;

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
    });
    this.loadInquiriesPage(1);
    this.loadPlannedPage(1);
    this.loadFinishedPage(1);
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
    this.inquiriesSubscription && this.inquiriesSubscription.unsubscribe();
    this.plannedSubscription && this.plannedSubscription.unsubscribe();
    this.finishedSubscription && this.finishedSubscription.unsubscribe();
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
        this.plannedData = res;
        this.pagePlannedData = res;
        this.totalPlanned = res.length;
        this.plannedCount = res.length;
        // this.plannedData = res.data;
        // this.pagePlannedData = res.data;
        // this.totalPlanned = res.total;
        // this.plannedCount = res.total;
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
          this.loadFinishedPage(this.currentFinishedPage);
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
                    data: plan
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
