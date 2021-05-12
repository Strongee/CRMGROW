import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
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
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

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

  activityCounts = {
    notes: 0,
    emails: 0,
    texts: 0,
    appointments: 0,
    group_calls: 0,
    follow_ups: 0
  };
  notes = [];
  emails = [];
  texts = [];
  appointments = [];
  groupCalls = [];
  tasks = [];

  activities: DetailActivity[] = [];
  mainTimelines = [];
  showingDetails = [];
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

  data = {
    materials: [],
    notes: [],
    emails: [],
    texts: [],
    appointments: [],
    tasks: []
  };
  dataObj = {
    materials: {},
    notes: {},
    emails: {},
    texts: {},
    appointments: {},
    tasks: {}
  };
  materialMediaSending = {};
  materialSendingType = {};
  groups = [];
  dGroups = [];
  showingMax = 4;
  loadingAppointment = false;
  loadedAppointments = {};
  selectedAppointment;

  overlayRef: OverlayRef;
  templatePortal: TemplatePortal;
  appointmentLoadSubscription: Subscription;
  @ViewChild('appointmentPortalContent') appointmentPortalContent: TemplateRef<
    unknown
  >;

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
    private element: ElementRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
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
          this.activities = res['activity'].map((e) =>
            new DetailActivity().deserialize(e)
          );
          this.details = res['details'];
          this.data.materials = [];
          this.data.notes = [];
          this.data.emails = [];
          this.data.texts = [];
          this.data.appointments = [];
          this.data.tasks = [];
          this.dataObj.materials = {};
          this.dataObj.notes = {};
          this.dataObj.emails = {};
          this.dataObj.texts = {};
          this.dataObj.appointments = {};
          this.dataObj.tasks = {};
          this.materialMediaSending = {};
          this.materialSendingType = {};
          this.data.materials = this.details['materials'] || [];
          this.data.notes = this.details['notes'] || [];
          this.data.emails = this.details['emails'] || [];
          this.data.texts = this.details['texts'] || [];
          this.data.appointments = this.details['appointments'] || [];
          this.data.tasks = this.details['tasks'] || [];
          for (let i = 0; i < this.activities.length; i++) {
            const e = this.activities[i];
            if (e.emails && e.emails.length) {
              this.materialMediaSending[e._id] = {
                type: 'emails',
                id: e.emails
              };
              continue;
            }
            if (e.texts && e.texts.length) {
              this.materialMediaSending[e._id] = { type: 'texts', id: e.texts };
              continue;
            }
            if (
              e.type === 'videos' ||
              e.type === 'images' ||
              e.type === 'pdfs'
            ) {
              if (e.content.indexOf('email') !== -1) {
                this.materialSendingType[e._id] = 'emails';
              } else {
                this.materialSendingType[e._id] = 'texts';
              }
              continue;
            }
          }
          this.groupActivities();
          this.arrangeActivity();
        }
        for (const key in this.data) {
          if (key !== 'materials') {
            this.data[key].forEach((e) => {
              this.dataObj[key][e._id] = e;
            });
          } else {
            this.data[key].forEach((e) => {
              e.material_type = 'video';
              if (e.type) {
                if (e.type.indexOf('pdf') !== -1) {
                  e.material_type = 'pdf';
                } else if (e.type.indexOf('image') !== -1) {
                  e.material_type = 'image';
                }
              }
              this.dataObj[key][e._id] = e;
            });
          }
        }

        if (this.tab.id !== 'all') {
          this.changeTab(this.tab);
        }
      });
  }

  groupActivities(): void {
    this.groupActions = {};
    this.mainTimelines = [];
    this.groups = [];
    for (let i = this.activities.length - 1; i >= 0; i--) {
      const e = this.activities[i];
      if (e.type.indexOf('tracker') !== -1) {
        e.activity = e[e.type].activity;
      }
      const groupData = this.generateUniqueId(e);
      if (!groupData) {
        continue;
      }
      const { type, group, media, material } = groupData;
      if (this.groupActions[group]) {
        this.groupActions[group].push(e);
      } else {
        e.group_id = group;
        this.groupActions[group] = [e];
        this.groups.push({ type, group, media, material });
      }
    }
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].type === 'emails' || this.groups[i].type === 'texts') {
        const latest = this.groupActions[this.groups[i]['group']][0];
        if (
          latest.type === 'videos' ||
          latest.type === 'pdfs' ||
          latest.type === 'images'
        ) {
          const activity = this.groupActions[this.groups[i]['group']].filter(
            (e) => e.type === 'emails' || e.type === 'texts'
          )[0];
          this.mainTimelines.push(activity);
        } else {
          this.mainTimelines.push(latest);
        }
      } else {
        this.mainTimelines.push(this.groupActions[this.groups[i]['group']][0]);
      }
    }
  }

  generateUniqueId(activity: DetailActivity): any {
    const trackerActivityTypes = {
      video_trackers: 'videos',
      pdf_trackers: 'pdfs',
      image_trackers: 'images'
    };
    switch (activity.type) {
      case 'emails':
      case 'texts':
      case 'notes':
      case 'appointments':
      case 'follow_ups':
      case 'deals':
        return {
          type: activity.type,
          group: activity[activity.type]
        };
      case 'video_trackers':
      case 'pdf_trackers':
      case 'image_trackers':
        if (this.materialMediaSending[activity.activity]) {
          return {
            type: this.materialMediaSending[activity.activity].type,
            group: this.materialMediaSending[activity.activity].id
          };
        } else {
          return {
            type: trackerActivityTypes[activity.type],
            group: activity.activity,
            material: activity[trackerActivityTypes[activity.type]],
            media: this.materialSendingType[activity.activity]
          };
        }
      case 'email_trackers':
        return {
          type: 'emails',
          group: activity.emails
        };
      case 'text_trackers':
        return {
          type: 'texts',
          group: activity.texts
        };
      case 'videos':
      case 'pdfs':
      case 'images':
        if (activity.emails && activity.emails.length) {
          return {
            type: 'emails',
            group: activity.emails
          };
        }
        if (activity.texts && activity.texts.length) {
          return {
            type: 'texts',
            group: activity.texts
          };
        }
        const media = activity.content.indexOf('email') ? 'emails' : 'texts';
        return {
          type: activity.type,
          group: activity._id,
          media,
          material: activity[activity.type]
        };
    }
  }

  showMoreDetail(group_id): void {
    if (this.dGroups.length >= this.showingMax) {
      this.dGroups.shift();
    }
    this.dGroups.push(group_id);
  }
  hideMoreDetail(group_id): void {
    const pos = this.dGroups.indexOf(group_id);
    if (pos !== -1) {
      this.dGroups.splice(pos, 1);
    }
  }

  loadDetailAppointment(event): void {
    if (!event.meta.event_id) {
      const loadedEvent = { ...event };
      this.selectedAppointment = loadedEvent;
      return;
    }
    const calendars = this.appointmentService.subCalendars.getValue();
    const currentCalendar = calendars[event.meta.calendar_id];
    if (!currentCalendar) {
      return;
    }
    const connected_email = currentCalendar.account;
    this.loadingAppointment = true;
    this.appointmentLoadSubscription &&
      this.appointmentLoadSubscription.unsubscribe();
    this.appointmentLoadSubscription = this.appointmentService
      .getEvent({
        connected_email,
        event_id: event.meta.event_id,
        calendar_id: event.meta.calendar_id
      })
      .subscribe((res) => {
        this.loadingAppointment = false;
        const loadedEvent = { ...event };
        loadedEvent.meta.is_organizer = res.organizer.self;
        loadedEvent.meta.organizer = res.organizer.email;
        loadedEvent.meta.guests = res.attendees || [];
        loadedEvent.meta.guests.forEach((e) => {
          e.response = e.responseStatus;
        });
        this.loadedAppointments[event.meta.event_id] = loadedEvent;
        this.selectedAppointment = loadedEvent;
      });
  }

  openDetailEvent(detail, event): void {
    const _formattedEvent = {
      title: detail.title,
      start: new Date(detail.due_start),
      end: new Date(detail.due_end),
      meta: {
        contacts: detail.contacts,
        calendar_id: detail.calendar_id,
        description: detail.description,
        location: detail.location,
        type: detail.type,
        guests: detail.guests,
        event_id: detail.event_id,
        recurrence: detail.recurrence,
        recurrence_id: detail.recurrence_id,
        is_organizer: detail.is_organizer,
        organizer: detail.organizer
      }
    };
    const oldAppointmentId = this.selectedAppointment
      ? this.selectedAppointment['meta']['event_id']
      : '';
    this.selectedAppointment = _formattedEvent;
    const newAppointmentId = this.selectedAppointment
      ? this.selectedAppointment['meta']['event_id']
      : '';
    const originX = event.clientX;
    const originY = event.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const size = {
      maxWidth: '360px',
      minWidth: '300px',
      maxHeight: 410,
      minHeight: 320
    };
    const positionStrategy = this.overlay.position().global();
    if (screenW - originX > 380) {
      positionStrategy.left(originX + 'px');
    } else if (originX > 380) {
      positionStrategy.left(originX - 380 + 'px');
    } else if (screenW - originX > 320) {
      positionStrategy.left(originX + 'px');
    } else {
      positionStrategy.centerHorizontally();
    }

    if (screenH < 440) {
      positionStrategy.centerVertically();
    } else if (originY < 220) {
      positionStrategy.top('10px');
    } else if (screenH - originY < 220) {
      positionStrategy.top(screenH - 430 + 'px');
    } else {
      positionStrategy.top(originY - 220 + 'px');
    }
    size['height'] = 'unset';
    this.templatePortal = new TemplatePortal(
      this.appointmentPortalContent,
      this.viewContainerRef
    );

    if (
      !this.loadedAppointments[newAppointmentId] &&
      newAppointmentId != oldAppointmentId
    ) {
      this.loadDetailAppointment(this.selectedAppointment);
    } else {
      if (this.loadedAppointments[newAppointmentId]) {
        this.selectedAppointment = this.loadedAppointments[newAppointmentId];
      }
    }

    if (this.overlayRef) {
      if (this.overlayRef.hasAttached()) {
        this.overlayRef.detach();
      }
      this.overlayRef.updatePositionStrategy(positionStrategy);
      this.overlayRef.updateSize(size);
      this.overlayRef.attach(this.templatePortal);
    } else {
      this.overlayRef = this.overlay.create({
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy,
        ...size
      });
      this.overlayRef.outsidePointerEvents().subscribe((evt) => {
        this.selectedAppointment = null;
        this.overlayRef.detach();
        return;
      });
      this.overlayRef.attach(this.templatePortal);
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
      if (tab.id === 'notes') {
        this.showingDetails = [...this.data.notes];
        return;
      }
      if (tab.id === 'appointments') {
        this.showingDetails = [...this.data.appointments];
        return;
      }
      if (tab.id === 'follow_ups') {
        this.showingDetails = [...this.data.tasks];
        return;
      }
      if (tab.id === 'emails') {
        this.activities.forEach((e) => {
          if (
            (e.type === 'videos' || e.type === 'pdfs' || e.type === 'images') &&
            (!e.emails || !e.emails.length) &&
            (!e.texts || !e.texts.length)
          ) {
            if (e.content.indexOf('email') !== -1) {
              this.showingDetails.push({
                ...this.dataObj.materials[e[e.type]],
                activity_id: e._id,
                data_type: e.type,
                send_time: e.updated_at
              });
            }
          }
        });
        this.data.emails.forEach((e) => {
          this.showingDetails.push({
            ...e,
            data_type: 'emails',
            send_time: e.updated_at
          });
        });
        this.showingDetails.sort((a, b) =>
          a.send_time > b.send_time ? -1 : 1
        );
        return;
      }
      if (tab.id === 'texts') {
        this.activities.forEach((e) => {
          if (
            (e.type === 'videos' || e.type === 'pdfs' || e.type === 'images') &&
            (!e.emails || !e.emails.length) &&
            (!e.texts || !e.texts.length)
          ) {
            if (
              e.content.indexOf('sms') !== -1 ||
              e.content.indexOf('text') !== -1
            ) {
              this.showingDetails.push({
                ...this.dataObj.materials[e[e.type]],
                activity_id: e._id,
                data_type: e.type,
                send_time: e.updated_at
              });
            }
          }
        });
        this.data.texts.forEach((e) => {
          this.showingDetails.push({
            ...e,
            data_type: 'texts',
            send_time: e.updated_at
          });
        });
        this.showingDetails.sort((a, b) =>
          a.send_time > b.send_time ? -1 : 1
        );
        return;
      }
    }
  }
  changeActivityTypes(tab: TabItem): void {
    this.activityType = tab;

    // this.showingTimelines = this.timelines.filter((e) => {
    //   if (tab.id === 'all') {
    //     return true;
    //   }
    //   return tab.id === e.type;
    // });
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
    this.activityCounts = {
      notes: 0,
      emails: 0,
      texts: 0,
      appointments: 0,
      group_calls: 0,
      follow_ups: 0
    };
    if (this.mainTimelines.length > 0) {
      this.mainTimelines.forEach((activity) => {
        if (activity.type == 'notes') {
          this.activityCounts.notes++;
        }
        if (
          activity.type == 'emails' ||
          activity.type == 'email_trackers' ||
          activity.type == 'videos' ||
          activity.type == 'video_trackers' ||
          activity.type == 'pdfs' ||
          activity.type == 'pdf_trackers' ||
          activity.type == 'images' ||
          activity.type == 'image_trackers'
        ) {
          this.activityCounts.emails++;
        }
        if (activity.type == 'texts') {
          this.activityCounts.texts++;
        }
        if (activity.type == 'appointments') {
          this.activityCounts.appointments++;
        }
        if (activity.type == 'team_calls') {
          this.activityCounts.group_calls++;
        }
        if (activity.type == 'follow_ups') {
          this.activityCounts.follow_ups++;
        }
      });
    }
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

  removeActivity(activity): void {}
}
