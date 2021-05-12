import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from 'src/app/services/store.service';
import { DealsService } from 'src/app/services/deals.service';
import { Deal } from 'src/app/models/deal.model';
import { Contact } from 'src/app/models/contact.model';
import { TabItem } from 'src/app/utils/data.types';
import { MatDialog } from '@angular/material/dialog';
import { CalendarDialogComponent } from 'src/app/components/calendar-dialog/calendar-dialog.component';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import {
  CALENDAR_DURATION,
  DialogSettings,
  PACKAGE_LEVEL,
  ROUTE_PAGE
} from 'src/app/constants/variable.constants';
import { SendEmailComponent } from 'src/app/components/send-email/send-email.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { DealEditComponent } from 'src/app/components/deal-edit/deal-edit.component';
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
import * as moment from 'moment';
import { Location } from '@angular/common';
import { JoinCallRequestComponent } from 'src/app/components/join-call-request/join-call-request.component';
import { AppointmentService } from 'src/app/services/appointment.service';
import { NotifyComponent } from 'src/app/components/notify/notify.component';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { getCurrentTimezone } from 'src/app/helper';
import { DetailActivity } from 'src/app/models/activityDetail.model';
import { FormControl } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { SendBulkTextComponent } from 'src/app/components/send-bulk-text/send-bulk-text.component';
import { ToastrService } from 'ngx-toastr';
import { DetailErrorComponent } from 'src/app/components/detail-error/detail-error.component';
import { AdditionalFieldsComponent } from '../../components/additional-fields/additional-fields.component';
import { AdditionalEditComponent } from '../../components/additional-edit/additional-edit.component';
import { getUserLevel } from '../../utils/functions';

@Component({
  selector: 'app-deals-detail',
  templateUrl: './deals-detail.component.html',
  styleUrls: ['./deals-detail.component.scss']
})
export class DealsDetailComponent implements OnInit {
  timezone;
  dealId;
  deal = {
    main: new Deal(),
    activities: [],
    contacts: []
  };
  stages: any[] = [];
  selectedStage;
  selectedStageId = '';
  tabs: TabItem[] = [
    { icon: '', label: 'Activity', id: 'all' },
    { icon: '', label: 'Notes', id: 'notes' },
    { icon: '', label: 'Emails', id: 'emails' },
    { icon: '', label: 'Texts', id: 'texts' },
    { icon: '', label: 'Appointments', id: 'appointments' },
    // { icon: '', label: 'Group Calls', id: 'team_calls' },
    { icon: '', label: 'Tasks', id: 'follow_ups' }
  ];
  tab: TabItem = this.tabs[0];
  activityType: TabItem = this.tabs[0];
  timeSorts = [
    { label: 'All', id: 'all' },
    { label: 'Overdue', id: 'overdue' },
    { label: 'Today', id: 'today' },
    { label: 'Tomorrow', id: 'tomorrow' },
    { label: 'This week', id: 'this_week' },
    { label: 'Next Week', id: 'next_week' }
  ];
  selectedTimeSort = this.timeSorts[0];
  durations = CALENDAR_DURATION;
  dealPanel = true;
  contactsPanel = true;

  activityCount = {
    notes: 0,
    emails: 0,
    texts: 0,
    appointments: 0,
    team_calls: 0,
    follow_ups: 0
  };
  notes = [];
  emails = [];
  texts = [];
  appointments = [];
  groupCalls = [];
  tasks = [];

  activities: DetailActivity[] = [];
  timelines = [];
  showingDetails = [];
  showingTimelines = [];
  groupActions = {};
  details = {};
  detailData = {};
  sendActions = {};

  editors = {};

  profileSubscription: Subscription;
  stageLoadSubscription: Subscription;
  loadSubscription: Subscription;
  activitySubscription: Subscription;
  noteSubscription: Subscription;
  emailSubscription: Subscription;
  textSubscription: Subscription;
  appointmentSubscription: Subscription;
  groupCallSubscription: Subscription;
  taskSubscription: Subscription;
  dealSubscription: Subscription;
  teamsLoadSubscription: Subscription;
  updateSubscription: Subscription;

  titleEditable = false;
  dealTitle = '';
  saving = false;
  saveSubscription: Subscription;
  packageLevel = '';
  disableTabs = [];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    public dealsService: DealsService,
    private noteService: NoteService,
    private taskService: TaskService,
    private appointmentService: AppointmentService,
    private teamService: TeamService,
    private handlerService: HandlerService,
    private toast: ToastrService,
    private location: Location,
    private element: ElementRef
  ) {
    this.appointmentService.loadCalendars(false);
    this.teamService.loadAll(true);

    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
        this.packageLevel = user.package_level;
        if (getUserLevel(this.packageLevel) === PACKAGE_LEVEL.lite.package) {
          this.disableTabs = [
            { icon: '', label: 'Appointments', id: 'appointments' }
          ];
        }
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
    });

    this.stageLoadSubscription = this.dealsService.stages$.subscribe((res) => {
      this.stages = res;
      this.changeSelectedStage();
    });

    this.teamsLoadSubscription && this.teamsLoadSubscription.unsubscribe();
    this.teamsLoadSubscription = this.teamService.teams$.subscribe((teams) => {
      teams.forEach((team) => {
        if (team.editors && team.editors.length) {
          team.editors.forEach((e) => {
            this.editors[e._id] = new User().deserialize(e);
          });
        }
      });
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    if (id) {
      this.dealId = id;
      this.loadSubscription && this.loadSubscription.unsubscribe();
      this.loadSubscription = this.dealsService.getDeal(id).subscribe((res) => {
        if (res) {
          this.deal = res;
          this.deal.contacts = (res.contacts || []).map((e) =>
            new Contact().deserialize(e)
          );
          if (this.deal.main.deal_stage) {
            this.selectedStageId = this.deal.main.deal_stage;
            this.changeSelectedStage();
          }
        }
      });
      this.loadActivity();
    }
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.stageLoadSubscription && this.stageLoadSubscription.unsubscribe();
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.teamsLoadSubscription && this.teamsLoadSubscription.unsubscribe();
  }

  getUserLevel(): string {
    return getUserLevel(this.packageLevel);
  }

  changeSelectedStage(): void {
    this.stages.some((e) => {
      if (e._id === this.selectedStageId) {
        this.selectedStage = e;
      }
    });
  }

  backPage(): void {
    this.handlerService.goBack('/deals');
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
          const activities = [];
          let last_activity;
          let contact_activity;
          res.forEach((e) => {
            if (e.type === 'deals') {
              const activity = e;
              if (
                last_activity &&
                last_activity.type === 'deals' &&
                ((last_activity.content.indexOf('added') !== -1 &&
                  e.content.indexOf('added') !== -1) ||
                  (last_activity.content.indexOf('removed') !== -1 &&
                    e.content.indexOf('removed') !== -1))
              ) {
                contact_activity.contact_details.push(
                  new Contact().deserialize(e.activity_detail)
                );
              } else {
                activity.contact_details = [
                  new Contact().deserialize(e.activity_detail)
                ];
                contact_activity = activity;
                activities.push(e);
              }
            } else {
              activities.push(e);
            }
            last_activity = { type: e.type, content: e.content };
          });
          this.activities = activities.sort((a, b) => {
            return new Date(a.created_at) > new Date(b.created_at) ? -1 : 1;
          });
          this.arrangeActivity();
        }
      });
  }

  groupActivities(): void {
    this.groupActions = {};
    this.timelines = [];
    this.details = {};
    this.activities.forEach((e) => {
      const group = this.generateUniqueId(e);
      if (this.groupActions[group]) {
        this.groupActions[group].push(e);
      } else {
        e.group_id = group;
        this.groupActions[group] = [e];
        this.timelines.push(e);
      }
    });
  }

  generateUniqueId(activity: DetailActivity): string {
    if (!activity.activity_detail) {
      if (activity.type === 'follow_ups' && activity.follow_ups) {
        return activity.follow_ups;
      }
      return activity._id;
    }
    let material_id;
    switch (activity.type) {
      case 'video_trackers':
      case 'pdf_trackers':
      case 'image_trackers':
      case 'email_trackers':
        const material_type = activity.type.split('_')[0];
        material_id = activity.activity_detail[material_type];
        if (material_id instanceof Array) {
          material_id = material_id[0];
        }
        let activity_id = activity.activity_detail['activity'];
        if (activity_id instanceof Array) {
          activity_id = activity_id[0];
        }
        return `${material_id}_${activity_id}`;
      case 'videos':
      case 'pdfs':
      case 'images':
      case 'emails':
        material_id = activity.activity_detail['_id'];
        if (activity.type !== 'emails') {
          activity.activity_detail['content'] = activity.content;
          activity.activity_detail['subject'] = activity.subject;
        }
        this.details[material_id] = activity.activity_detail;
        const group_id = `${material_id}_${activity._id}`;
        this.detailData[group_id] = activity.activity_detail;
        this.detailData[group_id]['data_type'] = activity.type;
        this.detailData[group_id]['group_id'] = group_id;
        this.detailData[group_id]['emails'] = activity.emails;
        return group_id;
      case 'texts':
        return activity._id;
      default:
        const detailKey = activity.activity_detail['_id'];
        if (!this.detailData[detailKey]) {
          this.detailData[detailKey] = activity.activity_detail;
        } else {
          if (
            new Date(activity.activity_detail.updated_at) >
            new Date(this.detailData[detailKey].updated_at)
          ) {
            this.detailData[detailKey] = activity.activity_detail;
          }
        }
        this.detailData[detailKey]['data_type'] = activity.type;
        return detailKey;
    }
  }

  openAppointmentDlg(): void {
    const calendars = this.appointmentService.calendars.getValue();
    if (!calendars || !calendars.length) {
      this.dialog.open(DetailErrorComponent, {
        width: '98vw',
        maxWidth: '420px',
        data: {
          errorCode: 407
        }
      });
      return;
    }

    this.dialog
      .open(CalendarDialogComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '600px',
        maxHeight: '700px',
        data: {
          deal: this.dealId,
          contacts: this.deal.contacts
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.addLatestActivity(2);
        }
      });
  }

  openGroupCallDlg(): void {
    this.dialog
      .open(JoinCallRequestComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '530px',
        data: {
          deal: this.dealId,
          contacts: this.deal.contacts
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.addLatestActivity(2);
        }
      });
  }

  openSendEmail(): void {
    this.dialog
      .open(SendEmailComponent, {
        position: {
          bottom: '0px',
          right: '0px'
        },
        panelClass: 'send-email',
        backdropClass: 'cdk-send-email',
        disableClose: false,
        data: {
          deal: this.dealId,
          contacts: this.deal.contacts
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.addLatestActivity(2);
        }
      });
  }

  openSendText(): void {
    const contacts = [];
    this.deal.contacts.forEach((e) => {
      if (e.cell_phone) {
        contacts.push(e);
      }
    });
    if (!contacts.length) {
      this.toast.error(
        '',
        `You can't message as any contacts of this deal don't have cell phone number.`
      );
      return;
    }
    this.dialog
      .open(SendBulkTextComponent, {
        position: {
          bottom: '0px',
          right: '0px'
        },
        width: '96vw',
        maxWidth: '600px',
        panelClass: 'full-panel',
        backdropClass: 'cdk-full-panel-bg',
        disableClose: false,
        data: {
          deal: this.dealId,
          contacts: contacts
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.addLatestActivity(2);
        }
      });
  }

  openTaskDlg(): void {
    this.dialog
      .open(TaskCreateComponent, {
        ...DialogSettings.TASK,
        data: {
          contacts: this.deal.contacts,
          deal: this.dealId
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.addLatestActivity(2);
        }
      });
  }

  openNoteDlg(): void {
    this.dialog
      .open(NoteCreateComponent, {
        ...DialogSettings.NOTE,
        data: {
          deal: this.dealId,
          contacts: this.deal.contacts
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.addLatestActivity(2);
        }
      });
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
          this.selectedStageId = this.deal.main.deal_stage;
          this.changeSelectedStage();
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
      this.deal.main.deal_stage = stage._id;
      this.selectedStageId = stage._id;
      this.changeSelectedStage();
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
          this.addLatestActivity(res.data.length + 1);
        }
      });
  }

  removeContact(contact: Contact): void {
    this.dialog
      .open(ConfirmComponent, {
        position: { top: '100px' },
        data: {
          title: 'Delete Contact',
          message: 'Are you sure you want to remove contact from this deal?',
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
                this.addLatestActivity(2);
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
              this.backPage();
            }
          });
        }
      });
  }

  changeTab(tab: TabItem): void {
    this.tab = tab;

    if (this.tab.id !== 'all') {
      this.showingDetails = [];
      this.sendActions = {};
      const dataType = tab.id;
      if (tab.id === 'follow_ups') {
        this.selectedTimeSort = this.timeSorts[0];
      }
      const details = Object.values(this.detailData);
      details.forEach((e) => {
        if (dataType === 'emails') {
          if (e['data_type'] === 'emails') {
            this.showingDetails.push(e);
            if (this.sendActions[e['_id']]) {
              this.sendActions[e['_id']] = [
                ...this.sendActions[e['_id']],
                ...this.groupActions[e['group_id']]
              ];
            } else {
              this.sendActions[e['_id']] = this.groupActions[e['group_id']];
            }
          }
          if (
            e['data_type'] === 'videos' ||
            e['data_type'] === 'pdfs' ||
            e['data_type'] === 'images'
          ) {
            if (e['emails']) {
              if (this.sendActions[e['emails']]) {
                this.sendActions[e['emails']] = [
                  ...this.sendActions[e['emails']],
                  ...this.groupActions[e['group_id']]
                ];
              } else {
                this.sendActions[e['emails']] = this.groupActions[
                  e['group_id']
                ];
              }
            } else {
              this.showingDetails.push(e);
              this.sendActions[e['group_id']] = this.groupActions[
                e['group_id']
              ];
            }
          }
        } else if (e['data_type'] === dataType) {
          this.showingDetails.push(e);
        }
      });
      this.showingDetails = this.showingDetails.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
  }
  changeActivityTypes(tab: TabItem): void {
    this.activityType = tab;

    this.showingTimelines = this.timelines.filter((e) => {
      if (tab.id === 'all') {
        return true;
      }
      return tab.id === e.type;
    });
  }
  changeSort(timeSort: any): void {
    this.changeTab(this.tab);
    let today;
    let weekDay;
    this.selectedTimeSort = timeSort;
    if (this.timezone.tz_name) {
      today = moment().tz(this.timezone.tz_name).startOf('day');
      weekDay = moment().tz(this.timezone.tz_name).startOf('week');
    } else {
      today = moment().utcOffset(this.timezone.zone).startOf('day');
      weekDay = moment().utcOffset(this.timezone.zone).startOf('week');
    }
    let start_date = new Date();
    let end_date = new Date();
    switch (this.selectedTimeSort.id) {
      case 'overdue':
        end_date = today.format();
        this.showingDetails = this.showingDetails.filter(
          (detail) => detail.due_date < end_date && !detail.status
        );
        break;
      case 'today':
        start_date = today.format();
        end_date = today.add('day', 1).format();
        this.showingDetails = this.showingDetails.filter(
          (detail) => detail.due_date > start_date && detail.due_date < end_date
        );
        break;
      case 'tomorrow':
        start_date = today.add('day', 1).format();
        end_date = today.add('day', 2).format();
        this.showingDetails = this.showingDetails.filter(
          (detail) => detail.due_date > start_date && detail.due_date < end_date
        );
        break;
      case 'this_week':
        start_date = weekDay.format();
        end_date = weekDay.add('week', 1).format();
        this.showingDetails = this.showingDetails.filter(
          (detail) => detail.due_date > start_date && detail.due_date < end_date
        );
        break;
      case 'next_week':
        start_date = weekDay.add('week', 1).format();
        end_date = weekDay.add('week', 2).format();
        this.showingDetails = this.showingDetails.filter(
          (detail) => detail.due_date > start_date && detail.due_date < end_date
        );
        break;
    }
  }

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
    if (!activity || !activity.activity_detail) {
      return;
    }
    const data = {
      note: activity.activity_detail,
      type: 'deal',
      deal_name: this.deal.main.title
    };
    this.dialog
      .open(NoteEditComponent, {
        width: '98vw',
        maxWidth: '394px',
        data
      })
      .afterClosed()
      .subscribe((note) => {
        if (note) {
          activity.activity_detail = note;
          if (this.detailData && this.detailData[note._id]) {
            this.detailData[note._id].content = note.content;
          }
          this.changeTab(this.tab);
        }
      });
  }

  updateNoteDetail(detail: any): void {
    if (!detail) {
      return;
    }
    const data = {
      note: detail,
      type: 'deal',
      deal_name: this.deal.main.title
    };
    this.dialog
      .open(NoteEditComponent, {
        width: '98vw',
        maxWidth: '394px',
        data
      })
      .afterClosed()
      .subscribe((note) => {
        if (note) {
          detail.content = note.content;
          this.activities.some((e) => {
            if (e.type !== 'notes') {
              return;
            }
            if (e.activity_detail && e.activity_detail._id === detail._id) {
              e.activity_detail.content = note.content;
              return true;
            }
          });
          this.arrangeActivity();
          if (this.detailData && this.detailData[note._id]) {
            this.detailData[note._id].content = note.content;
          }
          this.changeTab(this.tab);
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
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.dealsService
            .removeNote({ note: activity.activity_detail._id })
            .subscribe((res) => {
              if (res) {
                delete this.detailData[activity.activity_detail._id];
                _.pullAllBy(
                  this.showingDetails,
                  { _id: activity.activity_detail._id },
                  '_id'
                );
                this.activities.forEach((e) => {
                  const detail = e.activity_detail;
                  if (detail && detail._id === activity.activity_detail._id) {
                    delete e.activity_detail;
                  }
                });
                this.arrangeActivity();
              }
            });
        }
      });
  }
  deleteNoteDetail(detail: any): void {
    this.dialog
      .open(ConfirmComponent, {
        position: { top: '100px' },
        data: {
          title: 'Delete Note',
          message: 'Are you sure to delete the note?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.dealsService
            .removeNote({ note: detail._id })
            .subscribe((res) => {
              if (res) {
                this.activities.forEach((e) => {
                  if (e.type !== 'notes') {
                    return;
                  }
                  if (
                    e.activity_detail &&
                    e.activity_detail._id === detail._id
                  ) {
                    e.activity_detail = null;
                    return true;
                  }
                });
                this.arrangeActivity();
                delete this.detailData[detail._id];
                this.changeTab(this.tab);
              }
            });
        }
      });
  }

  editTask(activity: any, isReal: boolean = false): void {
    let data;
    if (isReal) {
      data = {
        ...activity
      };
    } else {
      if (!activity || !activity.activity_detail) {
        return;
      }
      data = {
        ...activity.activity_detail
      };
    }

    this.dialog
      .open(TaskEditComponent, {
        width: '98vw',
        maxWidth: '394px',
        data: {
          type: 'deal',
          deal: this.deal.main._id,
          task: new TaskDetail().deserialize(data)
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res['status']) {
          this.addLatestActivity(3);
        }
        // Update Activity
      });
  }

  completeTask(activity: any, isReal: boolean = false): void {
    let data;
    if (isReal) {
      data = {
        ...activity
      };
    } else {
      if (!activity || !activity.activity_detail) {
        return;
      }
      data = {
        ...activity.activity_detail
      };
    }

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
          this.dealsService
            .completeFollowUp({
              followup: data._id,
              deal: this.deal.main._id,
              status: 1
            })
            .subscribe((status) => {
              if (status) {
                this.addLatestActivity(2);
              }
            });
        }
      });
  }

  archiveTask(activity: any, isReal: boolean = false): void {
    let taskId;
    if (isReal) {
      taskId = activity._id;
    } else {
      taskId = activity.activity_detail._id;
    }
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Delete Task',
          message: 'Are you sure to delete the task?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.dealsService
            .removeFollowUp({ followup: taskId })
            .subscribe((status) => {
              if (status) {
                delete this.detailData[taskId];
                _.pullAllBy(this.showingDetails, { _id: taskId }, '_id');
                this.activities.forEach((e) => {
                  const detail = e.activity_detail;
                  if (detail && detail._id === taskId) {
                    delete e.activity_detail;
                  }
                });
                this.arrangeActivity();
              }
            });
        }
      });
  }

  editGroupCall(): void {}

  removeGroupCall(): void {}

  editAppointment(activity: any, isReal: boolean = false): void {
    let data;
    if (isReal) {
      data = {
        ...activity
      };
    } else {
      if (!activity || !activity.activity_detail) {
        return;
      }
      data = {
        ...activity.activity_detail
      };
    }

    const _formattedEvent = {
      appointment: data._id,
      title: data.title,
      start: new Date(data.due_start),
      end: new Date(data.due_end),
      meta: {
        contacts: data.contacts,
        calendar_id: data.calendar_id,
        description: data.description,
        location: data.location,
        type: data.type,
        guests: data.guests,
        event_id: data.event_id,
        recurrence: data.recurrence,
        recurrence_id: data.recurrence_id,
        is_organizer: data.is_organizer,
        organizer: data.organizer
      }
    };

    this.dialog
      .open(CalendarDialogComponent, {
        width: '98vw',
        maxWidth: '600px',
        data: {
          deal: this.deal.main._id,
          event: _formattedEvent
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.addLatestActivity(3);
        }
      });
  }

  removeAppointment(activity: any, isReal: boolean = false): void {
    let data;
    if (isReal) {
      data = {
        ...activity
      };
    } else {
      if (!activity || !activity.activity_detail) {
        return;
      }
      data = {
        ...activity.activity_detail
      };
    }

    const _formattedEvent = {
      appointment: data._id,
      title: data.title,
      start: new Date(data.due_start),
      end: new Date(data.due_end),
      meta: {
        contacts: data.contacts,
        calendar_id: data.calendar_id,
        description: data.description,
        location: data.location,
        type: data.type,
        guests: data.guests,
        event_id: data.event_id,
        recurrence: data.recurrence,
        recurrence_id: data.recurrence_id,
        is_organizer: data.is_organizer,
        organizer: data.organizer
      }
    };

    const calendars = this.appointmentService.subCalendars.getValue();
    const currentCalendar = calendars[_formattedEvent.meta.calendar_id];
    if (!currentCalendar) {
      // OPEN ALERT & CLOSE OVERLAY
      return;
    }
    const connected_email = currentCalendar.account;

    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Delete Appointment',
          message: 'Are you sure to delete the appointment?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.dealsService
            .removeAppointment({
              connected_email,
              recurrence_id: _formattedEvent.meta.recurrence_id,
              event_id: _formattedEvent.meta.event_id,
              calendar_id: _formattedEvent.meta.calendar_id
            })
            .subscribe((status) => {});
        }
      });
  }

  arrangeActivity(): void {
    this.activityCount = {
      notes: 0,
      emails: 0,
      texts: 0,
      appointments: 0,
      team_calls: 0,
      follow_ups: 0
    };
    for (const activity of this.activities) {
      this.activityCount[activity.type]++;
    }
    this.groupActivities();
    this.changeActivityTypes(this.activityType);
  }

  addLatestActivity(count: number): void {
    this.activitySubscription = this.dealsService
      .getActivity({ deal: this.dealId, count: count })
      .subscribe((res) => {
        if (res) {
          const activities = [...this.activities, ...res]
            .filter((e) => {
              return e.type !== 'deals';
            })
            .sort((a, b) => {
              return new Date(a.created_at) > new Date(b.created_at) ? -1 : 1;
            });
          this.activities = _.uniqBy(activities, '_id');
          this.arrangeActivity();
          this.changeTab(this.tab);
        }
      });
  }

  /**
   * Focus the cursor to the editor
   * @param formControl: Input Form Control
   */
  focusTitle(): void {
    this.titleEditable = true;
    this.dealTitle = this.deal.main.title;
    setTimeout(() => {
      if (this.element.nativeElement.querySelector('.title-input')) {
        this.element.nativeElement.querySelector('.title-input').focus();
      }
    }, 200);
  }
  checkAndSave(event): void {
    if (event.keyCode === 13) {
      if (this.deal.main.title === this.dealTitle) {
        this.titleEditable = false;
        return;
      }
      this.saving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.saveSubscription = this.dealsService
        .editDeal(this.dealId, {
          title: this.dealTitle,
          deal_stage: this.deal.main.deal_stage
        })
        .subscribe((res) => {
          this.saving = false;
          if (res) {
            this.deal.main.title = this.dealTitle;
            this.titleEditable = false;
          }
        });
    }
  }

  getPrevPage(): string {
    if (!this.handlerService.previousUrl) {
      return 'to Deals';
    }
    for (const route in ROUTE_PAGE) {
      if (this.handlerService.previousUrl === route) {
        return 'to ' + ROUTE_PAGE[route];
      }
    }
    return '';
  }
  /**************************************
   * Appointment Activity Relative Functions
   **************************************/
  getTime(start: any, end: any): any {
    const start_hour = new Date(start).getHours();
    const end_hour = new Date(end).getHours();
    const start_minute = new Date(start).getMinutes();
    const end_minute = new Date(end).getMinutes();
    const duration = end_hour - start_hour + (end_minute - start_minute) / 60;
    const durationTime = this.durations.filter(
      (time) => time.value == duration
    );
    if (durationTime) {
      return durationTime[0].text;
    }
  }

  convertContent(content = ''): any {
    const htmlContent = content.split('<div>');
    let convertString = '';
    htmlContent.forEach((html) => {
      if (html.indexOf('material-object') !== -1) {
        convertString = convertString + html.match('<a(.*)a>')[0];
      }
    });
    return convertString;
  }

  editAdditional($event): void {
    if ($event) {
      $event.stopPropagation();
      $event.preventDefault();
    }
    this.dialog
      .open(AdditionalEditComponent, {
        width: '98vw',
        maxWidth: '600px',
        data: {
          type: 'deal',
          deal: {
            ...this.deal.main
          }
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.toast.success('Successfully updated additional information.');
          this.deal.main.additional_field = {};
          for (const field of res) {
            this.deal.main.additional_field[field.name] = field.value;
          }
        }
      });
  }

  addAdditionalFields(): void {
    this.dialog
      .open(AdditionalFieldsComponent, {
        maxWidth: '480px',
        width: '96vw',
        disableClose: true,
        data: {
          additional_field: { ...this.deal.main.additional_field }
        }
      })
      .afterClosed()
      .subscribe((res) => {
        const init_additional_field = {
          ...this.deal.main.additional_field
        };

        if (res) {
          this.deal.main.additional_field = { ...res };
          this.updateSubscription = this.dealsService
            .editDeal(this.deal.main._id, this.deal.main)
            .subscribe((deal) => {
              if (deal) {
                console.log('update deal ========>', deal);
              }
            });
        } else {
          this.deal.main.additional_field = { ...init_additional_field };
        }
      });
  }
}
