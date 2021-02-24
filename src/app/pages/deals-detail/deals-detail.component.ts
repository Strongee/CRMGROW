import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from 'src/app/services/store.service';
import { DealsService } from 'src/app/services/deals.service';
import { Deal } from 'src/app/models/deal.model';
import { Contact } from 'src/app/models/contact.model';
import { TabItem } from 'src/app/utils/data.types';
import { MatDialog } from '@angular/material/dialog';
import { CalendarDialogComponent } from 'src/app/components/calendar-dialog/calendar-dialog.component';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { SendEmailComponent } from 'src/app/components/send-email/send-email.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { DealCreateComponent } from 'src/app/components/deal-create/deal-create.component';
import { DealEditComponent } from 'src/app/components/deal-edit/deal-edit.component';
import { DetailActivity } from '../../models/activityDetail.model';
import { Subscription } from 'rxjs';
import { NoteEditComponent } from '../../components/note-edit/note-edit.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { NoteService } from '../../services/note.service';
import { TaskEditComponent } from '../../components/task-edit/task-edit.component';
import { TaskDetail } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { HandlerService } from '../../services/handler.service';
import { DealContactComponent } from 'src/app/components/deal-contact/deal-contact.component';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { JoinCallRequestComponent } from 'src/app/components/join-call-request/join-call-request.component';
import { AppointmentService } from 'src/app/services/appointment.service';
import { NotifyComponent } from 'src/app/components/notify/notify.component';
import { TeamService } from 'src/app/services/team.service';
@Component({
  selector: 'app-deals-detail',
  templateUrl: './deals-detail.component.html',
  styleUrls: ['./deals-detail.component.scss']
})
export class DealsDetailComponent implements OnInit {
  deal = {
    main: new Deal(),
    activities: [],
    contacts: []
  };
  dealId;
  stages: any[] = [];
  selectedStage = '';
  selectedStageId = '';
  dealPanel = true;
  contactsPanel = true;
  tabs: TabItem[] = [
    { icon: '', label: 'Activity', id: 'all' },
    { icon: '', label: 'Notes', id: 'notes' },
    { icon: '', label: 'Emails', id: 'emails' },
    { icon: '', label: 'Texts', id: 'texts' },
    { icon: '', label: 'Appointments', id: 'appointments' },
    { icon: '', label: 'Group Calls', id: 'group_calls' },
    { icon: '', label: 'Tasks', id: 'follow_ups' }
  ];
  action: TabItem = this.tabs[0];
  noteActivity = 0;
  emailActivity = 0;
  textActivity = 0;
  appointmentActivity = 0;
  groupCallActivity = 0;
  taskActivity = 0;
  dealActivity = 0;
  notes = [];
  emails = [];
  texts = [];
  appointments = [];
  groupCalls = [];
  tasks = [];
  activities = [];

  activitySubscription: Subscription;
  noteSubscription: Subscription;
  emailSubscription: Subscription;
  textSubscription: Subscription;
  appointmentSubscription: Subscription;
  groupCallSubscription: Subscription;
  taskSubscription: Subscription;
  dealSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    public dealsService: DealsService,
    private noteService: NoteService,
    private taskService: TaskService,
    private appointmentService: AppointmentService,
    private teamService: TeamService,
    private handlerService: HandlerService,
    private storeService: StoreService,
    private location: Location
  ) {
    this.dealsService.getStage(true);

    this.teamService.loadAll(true);
    this.appointmentService.loadCalendars(false);
    // this.profileSubscription && this.profileSubscription.unsubscribe();
    // this.profileSubscription = this.userService.profile$.subscribe((user) => {
    //   try {
    //     this.timezone = JSON.parse(user.time_zone_info);
    //   } catch (err) {
    //     const timezone = getCurrentTimezone();
    //     this.timezone = { zone: user.time_zone || timezone };
    //   }
    //   this.checkSharable();
    // });

    // this.teamSubscription && this.teamSubscription.unsubscribe();
    // this.teamSubscription = this.teamService.teams$.subscribe(() => {
    //   this.checkSharable();
    // });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    if (id) {
      this.dealId = id;
      this.dealsService.getDeal(id).subscribe((res) => {
        if (res) {
          this.deal = res;
          this.deal.contacts = (res.contacts || []).map((e) =>
            new Contact().deserialize(e)
          );
          if (this.deal.main.deal_stage) {
            this.getStage(this.deal.main.deal_stage);
          }
        }
      });
      // this.loadNotes();
      this.loadActivity();
      // this.loadEmails();
    }
  }

  loadNotes(): void {
    this.noteSubscription && this.noteSubscription.unsubscribe();
    this.noteSubscription = this.dealsService
      .getNotes({ deal: this.dealId })
      .subscribe((res) => {
        if (res) {
          this.notes = res;
        }
      });
  }

  loadEmails(): void {
    this.emailSubscription && this.emailSubscription.unsubscribe();
    this.emailSubscription = this.dealsService
      .getEmails({ deal: this.dealId })
      .subscribe((res) => {
        if (res) {
          this.emails = res;
        }
      });
  }

  loadActivity(): void {
    this.activitySubscription && this.activitySubscription.unsubscribe();
    this.activitySubscription = this.dealsService
      .getActivity({ deal: this.dealId })
      .subscribe((res) => {
        if (res) {
          this.activities = res;
          for (const activity of this.activities) {
            if (activity.type === 'notes') {
              this.noteActivity++;
            } else if (activity.type === 'emails') {
              this.emailActivity++;
            } else if (activity.type === 'follow_ups') {
              this.taskActivity++;
            }
          }
          console.log('activity =============>', this.activities);
        }
      });
  }

  getStage(id: string): void {
    this.dealsService.stages$.subscribe((res) => {
      this.stages = res;
      if (this.stages.length) {
        this.stages.forEach((stage) => {
          console.log("get stage ========>", stage._id, id);
          if (stage._id == id) {
            this.selectedStage = stage.title;
            this.selectedStageId = stage._id;
          }
        });
      }
    });
  }

  backTasks(): void {
    this.router.navigate(['./deals']);
  }

  editDeal(): void {
    this.dealPanel = !this.dealPanel;
    this.dialog
      .open(DealEditComponent, {
        position: { top: '60px' },
        width: '100vw',
        maxWidth: '420px',
        disableClose: true,
        data: {
          type: 'deal',
          deal: this.deal.main
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.deal.main = { ...this.deal.main, ...res };
          this.getStage(this.deal.main.deal_stage);
        }
      });
  }

  moveDeal(stage): void {
    const data = {
      deal_id: this.dealId,
      position: stage.deals.length,
      deal_stage_id: stage._id
    };
    this.dealsService.moveDeal(data).subscribe((res) => {
      this.dealsService.getStage(true);
    });
  }

  contactDetail(contact: any): void {
    this.router.navigate([`contacts/${contact._id}`]);
  }

  addContact(): void {
    this.contactsPanel = !this.contactsPanel;
    this.dialog
      .open(DealContactComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          deal: this.dealId
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.data && res.data.length) {
          this.deal.contacts = _.unionWith(
            this.deal.contacts,
            res.data,
            _.isEqual
          );
        }
      });
  }

  removeContact(contact: Contact): void {
    this.dialog
      .open(ConfirmComponent, {
        position: { top: '100px' },
        data: {
          title: 'Delete Contact',
          message: 'Are you sure to delete this contact?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Confirm'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.dealsService
            .updateContact(this.dealId, 'remove', [contact._id])
            .subscribe((status) => {
              if (status) {
                _.pullAllBy(this.deal.contacts, [{ _id: contact._id }], '_id');
              }
            });
        }
      });
  }

  removeDeal(): void {
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Delete Deal',
          message: 'Are you sure to delete this deal?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Confirm'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.dealsService.deleteDeal(this.dealId).subscribe((status) => {
            if (status) {
              this.location.back();
            }
          });
        }
      });
  }

  changeTab(tab: TabItem): void {
    this.action = tab;
  }

  openAppointmentDlg(): void {
    const calendars = this.appointmentService.calendars.getValue();
    if (!calendars || !calendars.length) {
      this.dialog.open(NotifyComponent, {
        ...DialogSettings.ALERT,
        data: {
          title: 'Calendar',
          message:
            'You did not connected with your calendars. Please connect with your calendar.'
        }
      });
      return;
    }

    this.dialog.open(CalendarDialogComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '600px',
      maxHeight: '700px',
      data: {
        deal: this.dealId,
        contacts: this.deal.contacts
      }
    });
  }

  openGroupCallDlg(): void {
    this.dialog.open(JoinCallRequestComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '530px',
      data: {
        deal: this.dealId,
        contacts: this.deal.contacts
      }
    });
  }

  openSendEmail(): void {
    this.dialog.open(SendEmailComponent, {
      position: {
        bottom: '0px',
        right: '0px'
      },
      width: '100vw',
      panelClass: 'send-email',
      backdropClass: 'cdk-send-email',
      disableClose: false,
      data: {
        deal: this.dealId,
        contacts: this.deal.contacts
      }
    });
  }

  openTaskDlg(): void {
    this.dialog.open(TaskCreateComponent, {
      ...DialogSettings.TASK,
      data: {
        contacts: this.deal.contacts,
        deal: this.dealId
      }
    });
  }

  openNoteDlg(): void {
    this.dialog.open(NoteCreateComponent, {
      ...DialogSettings.NOTE,
      data: {
        deal: this.dealId,
        contacts: this.deal.contacts
      }
    });
  }

  deleteDealDlg(): void {}

  showDetail(event: any): void {
    const target: HTMLElement = event.target as HTMLElement;
    const parent: HTMLElement = target.closest(
      '.main-history-item'
    ) as HTMLElement;
    if (parent) {
      parent.classList.add('expanded');
    }
  }
  hideDetail(event: any): void {
    const target: HTMLElement = event.target as HTMLElement;
    const parent: HTMLElement = target.closest(
      '.main-history-item'
    ) as HTMLElement;
    if (parent) {
      parent.classList.remove('expanded');
    }
  }

  updateNote(activity: any): void {
    let contact_name = '';
    if (this.deal.contacts && this.deal.contacts.length) {
      contact_name = this.deal.contacts[0].fullName;
      if (this.deal.contacts.length > 1) {
        contact_name += ` +${this.deal.contacts.length - 1}`;
      }
    }

    this.dialog
      .open(NoteEditComponent, {
        width: '98vw',
        maxWidth: '394px',
        data: {
          type: 'deal',
          note: activity,
          contact_name
        }
      })
      .afterClosed()
      .subscribe((note) => {
        if (note) {
          activity.activity_detail[0] = note;
        }
      });
  }

  deleteNote(activity: any): void {
    this.dialog
      .open(ConfirmComponent, {
        position: { top: '100px' },
        data: {
          title: 'Delete Note',
          message: 'Are you sure to delete the note?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Confirm'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.noteService
            .delete(activity.activity_detail[0]._id)
            .subscribe((res) => {
              if (res) {
                const index = this.activities.findIndex(
                  (item) =>
                    item.activity_detail[0]._id ===
                    activity.activity_detail[0]._id
                );
                if (index >= 0) {
                  this.activities[index].activity_detail = null;
                }
              }
            });
        }
      });
  }

  editTask(activity: any): void {
    if (!activity || !activity.activity_detail.length) {
      return;
    }
    const data = {
      ...activity.activity_detail[0],
      contacts: { _id: this.deal.contacts }
    };

    this.dialog
      .open(TaskEditComponent, {
        width: '98vw',
        maxWidth: '394px',
        data: {
          type: 'deal',
          task: new TaskDetail().deserialize(data)
        }
      })
      .afterClosed()
      .subscribe((res) => {
        console.log(res);
      });
  }

  completeTask(activity: any): void {
    this.dialog
      .open(ConfirmComponent, {
        position: { top: '100px' },
        data: {
          title: 'Complete Task',
          message: 'Are you sure to complete the task?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Complete'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.taskService
            .complete(activity.activity_detail._id)
            .subscribe((res) => {
              if (res) {
                this.handlerService.updateTasks$(
                  [activity.activity_detail._id],
                  { status: 1 }
                );
                this.handlerService.registerActivity$(res);
              }
            });
        }
      });
  }

  archiveTask(activity: any): void {
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Archive Task',
          message: 'Are you sure to archive the task?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Confirm'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.taskService
            .archive([activity.activity_detail._id])
            .subscribe((status) => {
              if (status) {
                this.handlerService.archiveTask$(activity.activity_detail._id);
              }
            });
        }
      });
  }
}
