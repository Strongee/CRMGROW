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
    private handlerService: HandlerService,
    private storeService: StoreService
  ) {
    this.dealsService.getStage(true);
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
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '600px',
        disableClose: true,
        data: {
          type: 'deal',
          deal: this.deal
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.deal = res;
          this.dealsService
            .editDeal(this.deal.main._id, this.deal)
            .subscribe((res) => {
              console.log('###', res);
            });
        }
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
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        this.deal.contacts = [...this.deal.contacts, ...res];
        this.dealsService
          .editDeal(this.deal.main._id, this.deal)
          .subscribe((res) => {
            console.log('###', res);
          });
      });
  }

  removeContact(): void {
    this.dialog.open(ConfirmComponent, {
      position: { top: '100px' },
      data: {
        title: 'Delete Contact',
        message: 'Are you sure to delete this contact?',
        cancelLabel: 'Cancel',
        confirmLabel: 'Confirm'
      }
    });
  }

  changeTab(tab: TabItem): void {
    this.action = tab;
  }

  openAppointmentDlg(): void {
    this.dialog.open(CalendarDialogComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '600px',
      maxHeight: '700px',
      data: {
        type: 'deal',
        deal: this.dealId,
        contacts: this.deal.contacts
      }
    });
  }

  openSendEmail(): void {
    this.dialog.open(SendEmailComponent, {
      position: {
        bottom: '50px',
        right: '50px'
      },
      width: '100vw',
      maxWidth: '650px',
      panelClass: 'send-email',
      backdropClass: 'cdk-send-2email',
      disableClose: false,
      data: {
        type: 'deal',
        deal: this.dealId,
        contacts: this.deal.contacts
      }
    });
  }

  openTaskDlg(): void {
    this.dialog.open(TaskCreateComponent, {
      ...DialogSettings.TASK,
      data: {
        type: 'deal',
        contacts: this.deal.contacts,
        deal: this.dealId
      }
    });
  }

  openNoteDlg(): void {
    this.dialog.open(NoteCreateComponent, {
      ...DialogSettings.NOTE,
      data: {
        type: 'deal',
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
