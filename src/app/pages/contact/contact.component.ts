import { Location } from '@angular/common';
import {
  Component,
  OnInit,
  ViewContainerRef,
  OnDestroy,
  ElementRef,
  ViewChild,
  TemplateRef,
  HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Contact, ContactDetail } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';
import { OverlayService } from 'src/app/services/overlay.service';
import { DetailActivity } from 'src/app/models/activityDetail.model';
import { MatDialog } from '@angular/material/dialog';
import { ContactMergeComponent } from 'src/app/components/contact-merge/contact-merge.component';
import { Automation } from 'src/app/models/automation.model';
import {
  ActionName,
  DialogSettings,
  CALENDAR_DURATION,
  STATUS,
  ROUTE_PAGE
} from 'src/app/constants/variable.constants';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { getCurrentTimezone, listToTree } from 'src/app/helper';
import { AutomationShowFullComponent } from 'src/app/components/automation-show-full/automation-show-full.component';
import { CalendarDialogComponent } from 'src/app/components/calendar-dialog/calendar-dialog.component';
import { JoinCallRequestComponent } from 'src/app/components/join-call-request/join-call-request.component';
import { TabItem } from 'src/app/utils/data.types';
import { Task, TaskDetail } from 'src/app/models/task.model';
import { NoteService } from 'src/app/services/note.service';
import { DealsService } from 'src/app/services/deals.service';
import { TaskService } from 'src/app/services/task.service';
import { HandlerService } from 'src/app/services/handler.service';
import * as _ from 'lodash';
import { SendEmailComponent } from 'src/app/components/send-email/send-email.component';
import { ContactEditComponent } from 'src/app/components/contact-edit/contact-edit.component';
import { AdditionalEditComponent } from 'src/app/components/additional-edit/additional-edit.component';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { NoteEditComponent } from 'src/app/components/note-edit/note-edit.component';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { AutomationService } from 'src/app/services/automation.service';
import { Subscription } from 'rxjs';
import { ContactShareComponent } from '../../components/contact-share/contact-share.component';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import { TeamService } from 'src/app/services/team.service';
import { NotifyComponent } from 'src/app/components/notify/notify.component';
import { AppointmentService } from 'src/app/services/appointment.service';
import { DealCreateComponent } from 'src/app/components/deal-create/deal-create.component';
import { ToastrService } from 'ngx-toastr';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { SendTextComponent } from 'src/app/components/send-text/send-text.component';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user.model';
import { AdditionalFieldsComponent } from 'src/app/components/additional-fields/additional-fields.component';
import { TemplatePortal } from '@angular/cdk/portal';
import { Note } from 'src/app/models/note.model';
import { DetailErrorComponent } from 'src/app/components/detail-error/detail-error.component';
import { Deal } from 'src/app/models/deal.model';
import {
  startCampaign,
  addCallStartedListener,
  addCallEndedListener,
  addClosedListener
} from '@wavv/dialer';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  SITE = environment.front;
  STATUS = STATUS;
  tabs: TabItem[] = [
    { icon: '', label: 'Activity', id: 'all' },
    { icon: '', label: 'Notes', id: 'note' },
    { icon: '', label: 'Emails', id: 'email' },
    { icon: '', label: 'Texts', id: 'text' },
    { icon: '', label: 'Appointments', id: 'appointment' },
    // { icon: '', label: 'Group Calls', id: 'group_call' },
    { icon: '', label: 'Tasks', id: 'follow_up' },
    { icon: '', label: 'Deals', id: 'deal' }
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

  userId = '';
  _id = '';
  contact: ContactDetail = new ContactDetail();
  selectedContact: Contact = new Contact();
  groupActions = {};
  mainTimelines: DetailActivity[] = [];
  showingDetails = [];

  activityCounts = {
    note: 0,
    email: 0,
    text: 0,
    appointment: 0,
    group_call: 0,
    follow_up: 0,
    deal: 0
  };
  editors = {};
  timezone;

  // Automation
  selectedAutomation: Automation;
  ActionName = ActionName;
  treeControl = new NestedTreeControl<any>((node) => node.children);
  allDataSource = new MatTreeNestedDataSource<any>();
  dataSource = new MatTreeNestedDataSource<any>();
  hasChild = (_: number, node: any) =>
    !!node.children && node.children.length > 0;
  durations = CALENDAR_DURATION;
  canceling = false;
  assigning = false;
  cancelSubscription: Subscription;
  assignSubscription: Subscription;

  // Share Calendar
  sharable: boolean = false;
  hasCalendar: false;

  // Subscriptions & Related Contacts Load
  profileSubscription: Subscription;
  teamSubscription: Subscription;
  updateSubscription: Subscription;
  loadingContact = false;
  detailContacts = [];
  loadContactSubscription: Subscription;

  // Contact Id Route & Additional Field
  routeChangeSubscription: Subscription;
  garbageSubscription: Subscription;
  lead_fields: any[] = [];

  // Name Update
  nameEditable = false;
  contactFirstName = '';
  contactLastName = '';
  activeFieldName = '';
  saving = false;
  saveSubscription: Subscription;

  // Overlay for Appointment & Group Call
  @ViewChild('appointmentPortalContent') appointmentPortalContent: TemplateRef<
    unknown
  >;
  @ViewChild('groupCallPortalContent') groupCallPortalContent: TemplateRef<
    unknown
  >;
  overlayRef: OverlayRef;
  templatePortal: TemplatePortal;
  event: any;
  overlayCloseSubscription: Subscription;
  selectedAppointment;
  selectedGroupCall;
  loadedAppointments = {};
  loadedGroupCalls = {};
  loadingAppointment = false;
  loadingGroupCall = false;
  appointmentLoadSubscription: Subscription;
  appointmentUpdateSubscription: Subscription;
  groupCallLoadSubscription: Subscription;

  data = {
    materials: [],
    notes: [],
    emails: [],
    texts: [],
    appointments: [],
    tasks: [],
    deals: [],
    users: []
  };
  dataObj = {
    materials: {},
    notes: {},
    emails: {},
    texts: {},
    appointments: {},
    tasks: {},
    deals: {},
    users: {}
  };
  materialMediaSending = {}; // video_send_activity: email_id || text_id
  materialSendingType = {}; // material_send_activity: media_type
  groups = []; // detail information about group
  dGroups = []; // group ID Array to display detail data
  showingMax = 4; // Max Limit to show the detail data
  isPackageAutomation = true;
  isPackageGroupEmail = true;
  isPackageText = true;
  disableTabs = [];

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public contactService: ContactService,
    public userService: UserService,
    private noteService: NoteService,
    private taskService: TaskService,
    private storeService: StoreService,
    private overlayService: OverlayService,
    private handlerService: HandlerService,
    private dealsService: DealsService,
    private automationService: AutomationService,
    private appointmentService: AppointmentService,
    private teamService: TeamService,
    private viewContainerRef: ViewContainerRef,
    private toastr: ToastrService,
    private element: ElementRef,
    private overlay: Overlay
  ) {
    this.teamService.loadAll(false);
    this.appointmentService.loadCalendars(false);
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
        this.isPackageAutomation = user.automation_info?.is_enabled;
        this.isPackageGroupEmail = user.email_info?.mass_enable;
        this.isPackageText = user.text_info?.is_enabled;
        this.disableTabs = [];
        if (!this.isPackageAutomation) {
          this.disableTabs.push({
            icon: '',
            label: 'Appointments',
            id: 'appointment'
          });
          const index = this.tabs.findIndex(
            (item) => item.id === 'appointment'
          );
          if (index >= 0) {
            this.tabs.splice(index, 1);
          }
        }
        if (!this.isPackageText) {
          this.disableTabs.push({ icon: '', label: 'Texts', id: 'text' });
          const index = this.tabs.findIndex((item) => item.id === 'text');
          if (index >= 0) {
            this.tabs.splice(index, 1);
          }
        }
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
      this.checkSharable();

      this.userId = user._id;
    });

    this.teamSubscription && this.teamSubscription.unsubscribe();
    this.teamSubscription = this.teamService.teams$.subscribe((teams) => {
      this.checkSharable();

      teams.forEach((team) => {
        if (team.editors && team.editors.length) {
          team.editors.forEach((e) => {
            this.editors[e._id] = new User().deserialize(e);
          });
        }
      });
    });

    this.routeChangeSubscription = this.route.params.subscribe((params) => {
      if (this._id !== params['id']) {
        this.contact = new ContactDetail();
        this.selectedContact = new ContactDetail();

        this.clearContact();
        this._id = params['id'];
        this.loadContact(this._id);
      }
    });

    this.appointmentUpdateSubscription &&
      this.appointmentUpdateSubscription.unsubscribe();
    this.appointmentUpdateSubscription = this.appointmentService.updateCommand$.subscribe(
      (data) => {
        if (data) {
          if (data.command === 'delete') {
            const deleteEventId = data.data.recurrence_id || data.data.event_id;
            // remove from activity list && detail data
            let idToDelete;
            for (const key in this.dataObj.appointments) {
              if (this.dataObj.appointments[key].event_id == deleteEventId) {
                idToDelete = key;
                delete this.dataObj.appointments[key];
              }
            }
            this.data.appointments = Object.values(this.dataObj.appointments);
            this.changeTab(this.tab);
            const deleteActivityIds = [];
            this.mainTimelines.some((e) => {
              if (e.appointments === idToDelete) {
                deleteActivityIds.push(e._id);
                return true;
              }
              return false;
            });
            if (deleteActivityIds.length) {
              this.contactService.deleteContactActivity(deleteActivityIds);
            }
          } else if (data.command === 'update') {
            const event = data.data;
            const eventId = event.recurrence_id || event.event_id;
            delete this.loadedAppointments[eventId];
            this.contactService.addLatestActivity(3);
          } else if (data.command === 'accept') {
            const acceptData = data.data;
            const acceptEventId =
              acceptData.recurrence_id || acceptData.event_id;
            delete this.loadedAppointments[acceptEventId];
          } else if (data.command === 'decline') {
            const declineData = data.data;
            const declineEventId =
              declineData.recurrence_id || declineData.event_id;
            delete this.loadedAppointments[declineEventId];
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.storeService.selectedContact$.subscribe((contact) => {
      this.contact = contact;
      this.selectedContact = new Contact().deserialize({ ...contact });

      delete this.selectedContact['activity'];
      delete this.selectedContact['automation'];
      delete this.selectedContact['time_lines'];
      delete this.selectedContact['next'];
      delete this.selectedContact['prev'];
      delete this.selectedContact['details'];

      this.data.materials = [];
      this.data.notes = [];
      this.data.emails = [];
      this.data.texts = [];
      this.data.appointments = [];
      this.data.tasks = [];
      this.data.deals = [];
      this.data.users = [];
      this.dataObj.materials = {};
      this.dataObj.notes = {};
      this.dataObj.emails = {};
      this.dataObj.texts = {};
      this.dataObj.appointments = {};
      this.dataObj.tasks = {};
      this.dataObj.deals = {};
      this.dataObj.users = {};

      if (contact._id && contact.details) {
        this.data.materials = contact.details.materials || [];
        this.data.notes = contact.details.notes || [];
        this.data.emails = contact.details.emails || [];
        this.data.texts = contact.details.texts || [];
        this.data.appointments = contact.details.appointments || [];
        this.data.tasks = contact.details.tasks || [];
        this.data.deals = contact.details.deals || [];
        this.data.users = contact.details.users || [];

        this.materialMediaSending = {};
        this.materialSendingType = {};
        contact.activity.forEach((e) => {
          if (e.emails && e.emails.length) {
            this.materialMediaSending[e._id] = { type: 'emails', id: e.emails };
            return;
          }
          if (e.texts && e.texts.length) {
            this.materialMediaSending[e._id] = { type: 'texts', id: e.texts };
            return;
          }
          if (e.type === 'videos' || e.type === 'images' || e.type === 'pdfs') {
            if (e.content.indexOf('email') !== -1) {
              this.materialSendingType[e._id] = 'emails';
            } else {
              this.materialSendingType[e._id] = 'texts';
            }
            return;
          }
        });

        this.groupActivities();
        this.getActivityCount();
        this.timeLineArrangement();
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

    this.handlerService.pageName.next('detail');
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (_garbage) => {
        this.lead_fields = _garbage.additional_fields.map((e) => e.name);
      }
    );
  }

  // ngAfterViewInit(): void {
  //   const signature =
  //     'q6Oggy7to8EEgSyJTwvinjslHitdRjuC76UEtw8kxyGRDAlF1ogg3hc4WzW2vnzc';
  //   const payload = {
  //     userId: '704e070acb0761ed0382211136fdd457'
  //   };
  //   const issuer = 'k8d8BvqFWV9rSTwZyGed64Dc0SbjSQ6D';
  //   const token = jwt.sign(payload, signature, { issuer, expiresIn: 3600 });

  //   init(token);
  // }

  ngOnDestroy(): void {
    this.handlerService.pageName.next('');
    this.storeService.selectedContact.next(new ContactDetail());

    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.teamSubscription && this.teamSubscription.unsubscribe();
    this.routeChangeSubscription && this.routeChangeSubscription.unsubscribe();
    this.garbageSubscription && this.garbageSubscription.unsubscribe();

    this.contactService.contactConversation.next(null);
  }

  /**
   * Load Contact Detail information
   * @param _id: Contact id to load
   */
  loadContact(_id: string): void {
    this.contactService.read(_id);
  }

  clearContact(): void {
    this.groupActions = {};
    this.mainTimelines = [];
    this.showingDetails = [];
    this.activityCounts = {
      note: 0,
      email: 0,
      text: 0,
      appointment: 0,
      group_call: 0,
      follow_up: 0,
      deal: 0
    };
  }

  /**
   * Group Activities
   */
  groupActivities(): void {
    this.groupActions = {};
    this.mainTimelines = [];
    this.groups = [];
    for (let i = this.contact.activity.length - 1; i >= 0; i--) {
      const e = this.contact.activity[i];
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

  getActivityCount(): void {
    this.activityCounts = {
      note: 0,
      email: 0,
      text: 0,
      appointment: 0,
      group_call: 0,
      follow_up: 0,
      deal: 0
    };
    if (this.mainTimelines.length > 0) {
      this.mainTimelines.forEach((activity) => {
        if (activity.type == 'notes') {
          this.activityCounts.note++;
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
          this.activityCounts.email++;
        }
        if (activity.type == 'texts') {
          this.activityCounts.text++;
        }
        if (activity.type == 'appointments') {
          this.activityCounts.appointment++;
        }
        if (activity.type == 'team_calls') {
          this.activityCounts.group_call++;
        }
        if (activity.type == 'follow_ups') {
          this.activityCounts.follow_up++;
        }
        if (activity.type == 'deals') {
          this.activityCounts.deal++;
        }
      });
    }
  }

  /**
   * Generate the unique group id that the activity would be included
   * @param activity : Activity Detail Information
   */
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
      case 'users':
        return {
          type: 'users',
          group: activity.users
        };
      case 'contacts':
        return {
          type: 'contacts',
          group: activity.contacts
        };
    }
    // if (!activity.activity_detail) {
    //   if (activity.type === 'follow_ups' && activity.follow_ups) {
    //     return activity.follow_ups;
    //   }
    //   return activity._id;
    // }
    // let material_id;
    // switch (activity.type) {
    //   case 'video_trackers':
    //   case 'pdf_trackers':
    //   case 'image_trackers':
    //   case 'email_trackers':
    //     const material_type = activity.type.split('_')[0];
    //     material_id = activity.activity_detail[material_type];
    //     if (material_id instanceof Array) {
    //       material_id = material_id[0];
    //     }
    //     let activity_id = activity.activity_detail['activity'];
    //     if (activity_id instanceof Array) {
    //       activity_id = activity_id[0];
    //     }
    //     return `${material_id}_${activity_id}`;
    //   case 'videos':
    //   case 'pdfs':
    //   case 'images':
    //   case 'emails':
    //     material_id = activity.activity_detail['_id'];
    //     if (activity.type !== 'emails') {
    //       activity.activity_detail['content'] = activity.content;
    //       activity.activity_detail['subject'] = activity.subject;
    //       activity.activity_detail['updated_at'] = activity.updated_at;
    //       this.sentHistory[activity._id] = material_id;
    //     }
    //     const group_id = `${material_id}_${activity._id}`;
    //     this.detailData[group_id] = activity.activity_detail;
    //     this.detailData[group_id]['data_type'] = activity.type;
    //     this.detailData[group_id]['group_id'] = group_id;
    //     this.detailData[group_id]['emails'] = activity.emails;
    //     this.detailData[group_id]['texts'] = activity.texts;
    //     return group_id;
    //   case 'texts':
    //     material_id = activity.activity_detail['_id'];
    //     const text_group_id = `${material_id}_${activity._id}`;
    //     this.detailData[text_group_id] = activity.activity_detail;
    //     this.detailData[text_group_id]['data_type'] = activity.type;
    //     this.detailData[text_group_id]['group_id'] = text_group_id;
    //     this.detailData[text_group_id]['emails'] = activity.emails;
    //     this.detailData[text_group_id]['texts'] = activity.texts;
    //     if (activity.content.indexOf('sent') !== -1) {
    //       this.detailData[text_group_id]['sent'] = true;
    //     }
    //     return text_group_id;
    //   default:
    //     const detailKey = activity.activity_detail['_id'];
    //     this.detailData[detailKey] = activity.activity_detail;
    //     this.detailData[detailKey]['data_type'] = activity.type;
    //     return detailKey;
    // }
  }

  /**
   * Go to Contact List Page
   */
  goToBack(): void {
    // this.location.back();
    if (this.contact._id && this.nameEditable) {
      this.checkAndSave();
    }
    this.handlerService.goBack('/contacts');
  }

  /**
   * Load Previous Contact Detail Information
   */
  prevContact(): void {}

  /**
   * Load Next Contact Detail Information
   */
  nextContact(): void {}

  /**
   * Delete the current contact
   */
  deleteContact(): void {
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Delete contact',
          message: 'Are you sure to delete this contact?',
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.contactService
            .bulkDelete([this.contact._id])
            .subscribe((status) => {
              if (!status) {
                return;
              }
              this.storeService.selectedContact.next(new ContactDetail());
              this.goToBack();
            });
        }
      });
  }

  openCall(): void {
    const contacts = [
      {
        contactId: '704e070acb0761ed0382211136fdd457',
        numbers: [this.contact.cell_phone],
        name: this.contact.fullName
      }
    ];
    startCampaign({ contacts })
      .then(() => {
        const sideBar = document.querySelector('.sidebar') as HTMLElement;
        const mainPage = document.querySelector('.page') as HTMLElement;
        sideBar.style.paddingTop = '105px';
        mainPage.style.paddingTop = '118px';
      })
      .catch((err) => {
        console.log('Failed to start campaign', err);
      });
    addClosedListener(() => {
      const sideBar = document.querySelector('.sidebar') as HTMLElement;
      const mainPage = document.querySelector('.page') as HTMLElement;
      sideBar.style.paddingTop = '50px';
      mainPage.style.paddingTop = '63px';
    });
  }

  /**
   * Open dialog to merge
   */
  openMergeContactDlg(): void {
    this.dialog
      .open(ContactMergeComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '700px',
        data: {
          contact: this.selectedContact
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.handlerService.reload$();
        }
      });
  }

  /**
   * Open the Campagin Dialog to assign the curent contact to the compaign list.
   */
  openCampaignAssignDlg(): void {}

  /**
   * Open the Contact Edit Dialog
   */
  editContacts(type: string, evt: any): void {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.dialog
      .open(ContactEditComponent, {
        width: '98vw',
        maxWidth: '600px',
        disableClose: true,
        data: {
          contact: {
            ...this.selectedContact
          },
          type: type
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (type == 'main') {
            this.toastr.success('Successfully updated contact details.');
          } else {
            this.toastr.success(
              'Successfully updated secondary contact details'
            );
          }
          for (const key in res) {
            this.contact[key] = res[key];
            this.selectedContact[key] = res[key];
          }
        }
      });
  }

  editAdditional(event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.dialog
      .open(AdditionalEditComponent, {
        width: '98vw',
        maxWidth: '600px',
        data: {
          contact: {
            ...this.selectedContact
          }
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.toastr.success('Successfully updated additional information.');
          for (const key in res) {
            this.contact[key] = res[key];
            this.selectedContact[key] = res[key];
          }
        }
      });
  }

  /**
   * Share Contact to Team
   */
  shareContact(): void {}

  /**
   * Open dialog to create new group call
   */
  openGroupCallDlg(): void {
    const contact = new Contact().deserialize({
      _id: this.contact._id,
      first_name: this.contact.first_name,
      last_name: this.contact.last_name,
      email: this.contact.email,
      cell_phone: this.contact.cell_phone
    });

    this.dialog
      .open(JoinCallRequestComponent, {
        width: '98vw',
        maxWidth: '530px',
        height: 'auto',
        disableClose: true,
        data: {
          contacts: [contact]
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.contactService.addLatestActivity(4);
        }
      });
  }

  /**
   * Open Dialog to create new appointment
   */
  openAppointmentDlg(): void {
    // Check Calendars
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

    const contact = new Contact().deserialize({
      _id: this.contact._id,
      first_name: this.contact.first_name,
      last_name: this.contact.last_name,
      email: this.contact.email,
      cell_phone: this.contact.cell_phone
    });

    this.dialog
      .open(CalendarDialogComponent, {
        width: '100vw',
        maxWidth: '600px',
        maxHeight: '700px',
        data: {
          contacts: [contact]
        }
      })
      .afterClosed()
      .subscribe((event) => {
        if (event) {
          this.contactService.addLatestActivity(4);
        }
      });
  }

  /**
   * Open Dialog to create new task
   */
  openTaskDlg(): void {
    this.dialog.open(TaskCreateComponent, {
      ...DialogSettings.TASK,
      data: {
        contacts: [this.selectedContact]
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
        contact: this.contact
      }
    });
  }

  openSendText(): void {
    this.dialog.open(SendTextComponent, {
      position: {
        bottom: '0px',
        right: '0px'
      },
      width: '100vw',
      panelClass: 'send-email',
      backdropClass: 'cdk-send-email',
      disableClose: false,
      data: {
        type: 'single',
        contact: this.contact
      }
    });
  }

  openDealDlg(): void {
    const contact = new Contact().deserialize({
      _id: this.contact._id,
      first_name: this.contact.first_name,
      last_name: this.contact.last_name,
      email: this.contact.email,
      cell_phone: this.contact.cell_phone
    });

    this.dialog
      .open(DealCreateComponent, {
        width: '100vw',
        maxWidth: '600px',
        disableClose: true,
        data: {
          contact
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.contactService.addLatestActivity(4);
        }
      });
  }

  checkSharable(): void {
    const userId = this.userService.profile.getValue()._id;
    const teams = this.teamService.teams.getValue();
    if (!teams || !teams.length) {
      this.sharable = false;
      return;
    }
    let isValid = false;
    teams.some((e) => {
      if (e.isActive(userId)) {
        isValid = true;
        return true;
      }
    });
    if (isValid) {
      this.sharable = true;
      return;
    }
  }

  openShareContactDlg(): void {
    if (this.sharable) {
      this.dialog.open(ContactShareComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          contact: this.contact
        }
      });
    } else {
      this.dialog.open(NotifyComponent, {
        ...DialogSettings.ALERT,
        data: {
          title: 'Share Contact',
          message: 'You have no active teams.'
        }
      });
    }
  }
  /**************************************
   * Timeline Actions
   **************************************/
  changeTab(tab: TabItem): void {
    this.tab = tab;

    if (this.tab.id !== 'all') {
      this.showingDetails = [];
      if (tab.id === 'note') {
        this.showingDetails = [...this.data.notes];
        this.showingDetails.sort((a, b) => {
          if (new Date(a.updated_at + '') < new Date(b.updated_at + '')) {
            return 1;
          }
          return -1;
        });
        return;
      }
      if (tab.id === 'appointment') {
        this.showingDetails = [...this.data.appointments];
        this.showingDetails.sort((a, b) => {
          if (new Date(a.updated_at + '') < new Date(b.updated_at + '')) {
            return 1;
          }
          return -1;
        });
        return;
      }
      if (tab.id === 'follow_up') {
        this.showingDetails = [...this.data.tasks];
        this.showingDetails.sort((a, b) => {
          if (new Date(a.updated_at + '') < new Date(b.updated_at + '')) {
            return 1;
          }
          return -1;
        });
        return;
      }
      if (tab.id === 'deal') {
        this.showingDetails = [...this.data.deals];
        this.showingDetails.sort((a, b) => {
          if (new Date(a.updated_at + '') < new Date(b.updated_at + '')) {
            return 1;
          }
          return -1;
        });
        return;
      }
      if (tab.id === 'email') {
        this.contact.activity.forEach((e) => {
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
      if (tab.id === 'text') {
        this.contact.activity.forEach((e) => {
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

  changeActivityTypes(type: TabItem): void {
    this.activityType = type;
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

  showDetail(event: any): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const parent: HTMLElement = <HTMLElement>(
      target.closest('.main-history-item')
    );
    if (parent) {
      parent.classList.add('expanded');
    }
  }
  hideDetail(event: any): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const parent: HTMLElement = <HTMLElement>(
      target.closest('.main-history-item')
    );
    if (parent) {
      parent.classList.remove('expanded');
    }
  }

  editTask(activity: any): void {
    const data = {
      ...activity,
      contact: { _id: this.contact._id }
    };

    this.dialog.open(TaskEditComponent, {
      width: '98vw',
      maxWidth: '394px',
      data: {
        task: new TaskDetail().deserialize(data)
      }
    });
  }

  completeTask(activity: any): void {
    const taskId = activity._id;
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
          this.taskService.complete(taskId).subscribe((res) => {
            if (res) {
              this.handlerService.updateTasks$([taskId], { status: 1 });
              this.handlerService.updateTaskInDetail$(res);
            }
          });
        }
      });
  }

  archiveTask(activity: any): void {
    const taskId = activity._id;
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
          this.taskService.archive([taskId]).subscribe((status) => {
            if (status) {
              this.deleteTaskFromTasksArray(taskId);
              this.contactService.deleteContactActivityByDetail(
                taskId,
                'follow_ups'
              );
              this.changeTab(this.tab);
            }
          });
        }
      });
  }
  deleteTaskFromTasksArray(_id: string): void {
    _.remove(this.data.tasks, (e) => e._id === _id);
    delete this.dataObj.tasks[_id];
    this.handlerService.updateContactRelated$('tasks', this.data.tasks);
  }

  /**
   * Create Note
   */
  openNoteDlg(): void {
    this.dialog.open(NoteCreateComponent, {
      ...DialogSettings.NOTE,
      data: {
        contacts: [this.selectedContact]
      }
    });
  }
  /**
   * Edit the Note Content
   * @param detail : Note Detail
   */
  updateNoteDetail(detail: any): void {
    if (!detail) {
      return;
    }
    const data = {
      note: detail,
      contact: { _id: this.contact._id },
      contact_name: this.contact.fullName
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
          this.mainTimelines.some((e) => {
            if (e.type !== 'notes') {
              return;
            }
            if (e.activity_detail && e.activity_detail._id === detail._id) {
              e.activity_detail.content = note.content;
              return true;
            }
          });
          // Update the Notes Array with new content
          this.updateNotesArray(detail._id, note.content);
          this.changeTab(this.tab);
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
          confirmLabel: 'Confirm'
        }
      })
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.noteService.delete(detail._id).subscribe((res) => {
            if (res) {
              // this.mainTimelines.some((e) => {
              //   if (e.type !== 'notes') {
              //     return;
              //   }
              //   if (e.activity_detail && e.activity_detail._id === detail._id) {
              //     e.activity_detail = null;
              //     return true;
              //   }
              // });
              // Remove the note from notes array
              this.deleteNoteFromNotesArray(detail._id);
              this.contactService.deleteContactActivityByDetail(
                detail._id,
                'notes'
              );
              this.changeTab(this.tab);
            }
          });
        }
      });
  }

  updateNotesArray(_id: string, content: string): void {
    this.data.notes.some((e) => {
      if (e._id === _id) {
        e.content = content;
      }
    });
  }
  deleteNoteFromNotesArray(_id: string): void {
    _.remove(this.data.notes, (e) => e._id === _id);
    delete this.dataObj.notes[_id];
    this.handlerService.updateContactRelated$('notes', this.data.notes);
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
    if (durationTime && durationTime.length) {
      return durationTime[0].text;
    } else {
      return '';
    }
  }

  /*****************************************
   * Automation Select & Display
   *****************************************/
  /**
   * Select Automation To assign
   * @param evt :Automation
   */
  selectAutomation(evt: Automation): void {
    this.selectedAutomation = evt;
  }
  timeLineArrangement(): any {
    this.allDataSource = new MatTreeNestedDataSource<any>();
    if (!this.contact['time_lines'] || this.contact['time_lines'].length == 0) {
      return;
    }
    this.allDataSource.data = listToTree(this.contact['time_lines']);
    let root = null;
    if (this.allDataSource.data?.length == 0) {
      return;
    }
    if (this.allDataSource.data[0]?.status == 'completed') {
      root = JSON.parse(JSON.stringify(this.allDataSource.data[0]));
    } else {
      return;
    }
    while (true) {
      if (root.children[0]?.status == 'completed') {
        root = root.children[0];
      } else if (root.children[1]?.status == 'completed') {
        root = root.children[1];
      } else break;
    }

    for (const firstChild of root.children)
      for (const secondChild of firstChild.children) secondChild.children = [];

    this.dataSource = new MatTreeNestedDataSource<any>();
    this.dataSource.data.push(root);
  }
  showFullAutomation(): void {
    this.dialog.open(AutomationShowFullComponent, {
      position: { top: '100px' },
      width: '98vw',
      maxWidth: '700px',
      height: 'calc(65vh + 70px)',
      data: {
        id: this.contact.automation._id,
        automation: this.contact.automation,
        automations: this.contact.time_lines
      }
    });
  }
  easyView(node: any, origin: any, content: any): void {
    this.overlayService.open(
      origin,
      content,
      this.viewContainerRef,
      'automation',
      {
        data: node
      }
    );
  }
  assignAutomation(): void {
    if (!this.selectedAutomation) {
      return;
    }
    if (this.allDataSource.data.length) {
      this.dialog
        .open(ConfirmComponent, {
          maxWidth: '400px',
          width: '96vw',
          data: {
            title: 'Reassign new automation',
            message:
              'Are you sure to stop the current automation and start new automation?',
            cancelLabel: 'Cancel',
            confirmLabel: 'Assign'
          }
        })
        .afterClosed()
        .subscribe((status) => {
          if (status) {
            this.assigning = true;
            // this.assignSubscription && this.assignSubscription.unsubscribe();
            this.automationService
              .reAssign(this.contact._id, this.selectedAutomation._id)
              .subscribe((status) => {
                this.assigning = false;
                if (status) {
                  this.handlerService.reload$();
                }
              });
          }
        });
    } else {
      this.assigning = true;
      this.assignSubscription && this.assignSubscription.unsubscribe();
      this.automationService
        .bulkAssign([this.contact._id], this.selectedAutomation._id)
        .subscribe((status) => {
          this.assigning = false;
          if (status) {
            this.handlerService.reload$();
          }
        });
    }
  }
  closeAutomation(): void {
    if (!this.allDataSource.data.length) {
      return;
    }
    this.dialog
      .open(ConfirmComponent, {
        maxWidth: '400px',
        width: '96vw',
        data: {
          title: 'Unassign automation',
          message: 'Are you sure to stop the automation?',
          cancelLabel: 'Cancel',
          confirmLabel: 'Unassign'
        }
      })
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.canceling = true;
          this.cancelSubscription && this.cancelSubscription.unsubscribe();
          this.automationService
            .unAssign(this.contact._id)
            .subscribe((status) => {
              this.canceling = false;
              if (status) {
                this.handlerService.reload$();
              }
            });
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
          additional_field: { ...this.contact.additional_field },
          lead_fields: this.lead_fields
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          // Save the additional fields
          const original_additional_field = {
            ...this.contact.additional_field
          };
          this.contact.additional_field = { ...res };
          this.updateSubscription = this.contactService
            .updateContact(this.contact._id, { additional_field: { ...res } })
            .subscribe((res) => {
              if (res) {
                // Keep the value
              } else {
                this.contact.additional_field = original_additional_field;
              }
            });
        }
      });
  }

  getPrevPage(): string {
    if (!this.handlerService.previousUrl) {
      return 'to Contacts';
    }
    if (this.handlerService.previousUrl.includes('/materials/analytics/')) {
      return 'to Material Analytics';
    }
    for (const route in ROUTE_PAGE) {
      if (this.handlerService.previousUrl === route) {
        return 'to ' + ROUTE_PAGE[route];
      }
    }
    return '';
  }

  changeLabel(event: string): void {
    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.updateSubscription = this.contactService
      .bulkUpdate([this.contact._id], { label: event }, {})
      .subscribe((status) => {
        if (status) {
          this.handlerService.bulkContactUpdate$(
            [this.contact._id],
            { label: event },
            {}
          );
        }
      });
  }

  /******************************************************
   * ****************************************************
   * Name Change Function
   * ****************************************************
   ******************************************************/
  focusName(): void {
    this.nameEditable = true;
    this.contactFirstName = this.contact.first_name;
    this.contactLastName = this.contact.last_name;
    setTimeout(() => {
      if (this.element.nativeElement.querySelector('.first-name-input')) {
        this.element.nativeElement.querySelector('.first-name-input').focus();
      }
    }, 200);
  }
  checkBlurName(event): void {
    if (event.keyCode === 13) {
      this.checkAndSave();
    }
  }
  focusNameField(field: string): void {
    this.activeFieldName = field;
  }
  checkNameFields(field): void {
    setTimeout(() => {
      if (this.activeFieldName != field) {
        return;
      } else {
        this.activeFieldName = '';
        this.checkAndSave();
      }
    }, 200);
  }
  checkAndSave(): void {
    if (
      this.contact.first_name === this.contactFirstName &&
      this.contact.last_name === this.contactLastName
    ) {
      this.nameEditable = false;
      return;
    }
    if (!this.contact._id) {
      return;
    }
    this.saving = true;
    this.saveSubscription && this.saveSubscription.unsubscribe();
    this.saveSubscription = this.contactService
      .updateContact(this.contact._id, {
        first_name: this.contactFirstName,
        last_name: this.contactLastName
      })
      .subscribe((res) => {
        this.saving = false;
        if (res) {
          this.contact.first_name = this.contactFirstName;
          this.contact.last_name = this.contactLastName;
          this.nameEditable = false;
        }
      });
  }

  loadContacts(ids: string[]): void {
    if (ids && ids.length >= 0) {
      this.loadingContact = true;
      this.loadContactSubscription &&
        this.loadContactSubscription.unsubscribe();
      this.loadContactSubscription = this.contactService
        .getContactsByIds(ids)
        .subscribe((contacts) => {
          this.loadingContact = false;
          if (contacts) {
            this.detailContacts = contacts;
          }
        });
    }
  }

  reloadLatest(): void {
    this.contactService.addLatestActivity(24);
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
        loadedEvent.meta.is_organizer = res.is_organizer;
        loadedEvent.meta.organizer = res.organizer;
        loadedEvent.meta.guests = res.guests || [];
        if (res.recurrence) {
          loadedEvent.meta.recurrence = res.recurrence;
        } else {
          delete loadedEvent.meta.recurrence_id;
        }
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
        this.selectedGroupCall = null;
        this.overlayRef.detach();
        return;
      });
      this.overlayRef.attach(this.templatePortal);
    }
  }

  closeOverlay(event): void {
    this.overlayRef.detach();
  }

  isDisableTab(tabItem): boolean {
    const index = this.disableTabs.findIndex((item) => item.id === tabItem.id);
    return index >= 0;
  }

  isUrl(str): boolean {
    let url = '';
    if (str && str.startsWith('http')) {
      url = str;
    } else {
      url = 'http://' + str;
    }
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(url);
  }

  ICONS = {
    follow_up: '../../assets/img/automations/follow_up.svg',
    update_follow_up:
      'https://app.crmgrow.com/assets/img/icons/follow-step.png',
    note: '../../assets/img/automations/create_note.svg',
    email: '../../assets/img/automations/send_email.svg',
    send_email_video: '../../assets/img/automations/send_video_email.svg',
    send_text_video: '../../assets/img/automations/send_video_text.svg',
    send_email_pdf: '../../assets/img/automations/send_pdf_email.svg',
    send_text_pdf: '../../assets/img/automations/send_pdf_text.svg',
    send_email_image: '../../assets/img/automations/send_image_email.svg',
    send_text_image: 'https://app.crmgrow.com/assets/img/icons/image_sms.png',
    update_contact:
      'https://app.crmgrow.com/assets/img/icons/update_contact.png'
  };

  /** =================== OLD FUNCTIONS ===============
  getSessionIndex(i: number, activities: any[]): string {
    const notTrackers = activities.filter((e) => {
      if (e.activity_detail && e.activity_detail.type === 'watch') {
        return false;
      } else {
        return true;
      }
    });
    return `#${activities.length - notTrackers.length - i}`;
  }

  convertContent(content = ''): any {
    const dom = document.createElement('div');
    dom.innerHTML = content;
    const materials = dom.querySelectorAll('.material-object');
    let convertString = '';
    materials.forEach((material) => {
      const url = material.getAttribute('href');
      const id = url.replace(
        new RegExp(
          environment.website +
            '/video1/|' +
            environment.website +
            '/pdf1/|' +
            environment.website +
            '/image1/',
          'gi'
        ),
        ''
      );
      convertString += material.outerHTML;
    });
    if (materials.length === 1) {
      const material = this.details[this.sentHistory[activityIds[0]]];
      convertString += `<div class="title">${
        material ? material.title : ''
      }</div><div class="description">${
        material ? material.description : ''
      }</div>`;
      convertString = `<div class="single-material-send">${convertString}</div>`;
    }
    return convertString;
  }

  convertTextContent(content = ''): string {
    const videoReg = new RegExp(
      environment.website + '/video1/' + '([0-9a-zA-Z]{24})',
      'gi'
    );
    const imageReg = new RegExp(
      environment.website + '/image1/' + '([0-9a-zA-Z]{24})',
      'gi'
    );
    const pdfReg = new RegExp(
      environment.website + '/pdf1/' + '([0-9a-zA-Z]{24})',
      'gi'
    );
    const videoLinks = content.match(videoReg) || [];
    const imageLinks = content.match(imageReg) || [];
    const pdfLinks = content.match(pdfReg) || [];
    const activityIds = [];
    const materials = [...videoLinks, ...imageLinks, ...pdfLinks];
    materials.forEach((material) => {
      const id = material.replace(
        new RegExp(
          environment.website +
            '/video1/|' +
            environment.website +
            '/pdf1/|' +
            environment.website +
            '/image1/',
          'gi'
        ),
        ''
      );
      activityIds.push(id);
    });
    let resultHTML = content;
    activityIds.forEach((activity) => {
      const material = this.details[this.sentHistory[activity]];
      if (material) {
        let prefix = 'video?video=';
        let activityPrefix = 'video1';
        if (material.type && material.type.indexOf('pdf') !== -1) {
          prefix = 'pdf?pdf=';
          activityPrefix = 'pdf1';
        }
        if (material.type && material.type.indexOf('image') !== -1) {
          prefix = 'image?image=';
          activityPrefix = 'image1';
        }
        const link = `<a target="_blank" href="${environment.website}/${prefix}${material._id}&user=${this.userId}" class="material-thumbnail"><img src="${material.preview}"></a>`;
        const originalLink = `${environment.website}/${activityPrefix}/${activity}`;
        resultHTML = resultHTML.replace(originalLink, link);
      }
    });
    if (activityIds.length) {
      return resultHTML;
    }
    return resultHTML;
  }

  getVideoBadge(activity): string {
    let hasThumbed = false;
    let finishedCount = 0;
    const material = this.dataObj.materials[activity.videos];
    if (material) {
      this.groupActions[activity.group_id].forEach((e) => {
        if (!e.activity_detail) {
          return;
        }
        if (e.activity_detail.type === 'thumbs up') {
          hasThumbed = true;
          return;
        }
        if (
          e.activity_detail.type === 'watch' &&
          e.activity_detail.duration &&
          e.activity_detail.duration / material.duration > 0.97
        ) {
          finishedCount++;
        }
      });
    }
    if (hasThumbed || finishedCount) {
      let html = `<div class="c-blue font-weight-bold">${material?.title}</div>`;
      if (hasThumbed) {
        html += '<div class="i-icon i-like bgc-blue thumb-icon mx-1"></div>';
      }
      if (finishedCount) {
        html += `<div class="full-badge text-center f-3 font-weight-bold ml-auto">${finishedCount}</div><div class="c-blue font-weight-bold f-5">Video finished!</div>`;
      }
      return html;
    } else {
      return `<div class="font-weight-bold">${material?.title}</div>`;
    }
  }

  getPdfImageBadge(activity): string {
    let hasThumbed = false;
    const material = this.dataObj.materials[activity.videos];
    this.groupActions[activity.group_id].some((e) => {
      if (!e.activity_detail) {
        return;
      }
      if (e.activity_detail.type === 'thumbs up') {
        hasThumbed = true;
        return true;
      }
    });
    if (hasThumbed) {
      let html = `<div class="c-blue font-weight-bold">${material?.title}</div>`;
      if (hasThumbed) {
        html += '<div class="i-icon i-like bgc-blue thumb-icon mx-1"></div>';
      }
      return html;
    } else {
      return `<div class="font-weight-bold">${material?.title}</div>`;
    }
  }
  */

  /** =================== Get Detail Data Count Function ===============
  detailCounts = {
    notes: 0,
    emails: 0,
    texts: 0,
    appointments: 0,
    team_calls: 0,
    follow_ups: 0,
    deals: 0
  };

  getDetailCounts(): void {
    this.detailCounts = {
      notes: 0,
      emails: 0,
      texts: 0,
      appointments: 0,
      team_calls: 0,
      follow_ups: 0,
      deals: 0
    };
    const details = Object.values(this.detailData);
    details.forEach((e) => {
      switch (e['data_type']) {
        case 'emails':
          this.detailCounts['emails']++;
          break;
        case 'videos':
        case 'pdfs':
        case 'images':
          if (!e['emails']) {
            this.detailCounts['emails']++;
          }
          break;
        default:
          this.detailCounts[e['data_type']]++;
      }
    });
    this.tabs[1]['badge'] = this.detailCounts['notes'];
    this.tabs[2]['badge'] = this.detailCounts['emails'];
    this.tabs[3]['badge'] = this.detailCounts['texts'];
    this.tabs[4]['badge'] = this.detailCounts['appointments'];
    // this.tabs[5]['badge'] = this.detailCounts['team_calls'];
    this.tabs[5]['badge'] = this.detailCounts['follow_ups'];
    this.tabs[6]['badge'] = this.detailCounts['deals'];
  } */

  /** ============================= Group Call Open Overlay Function ========================
  openGroupCall(detail, event): void {
    const oldCallId = this.selectedGroupCall
      ? this.selectedGroupCall['_id']
      : '';
    this.selectedGroupCall = detail;
    const newCallId = this.selectedGroupCall
      ? this.selectedGroupCall['_id']
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
      this.groupCallPortalContent,
      this.viewContainerRef
    );

    if (!this.loadedGroupCalls[newCallId] && newCallId != oldCallId) {
      this.loadDetailGroupCall(newCallId);
    } else {
      if (this.loadedGroupCalls[newCallId]) {
        this.selectedGroupCall = this.loadedGroupCalls[newCallId];
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
        this.overlayRef.detach();
        return;
      });
      this.overlayRef.attach(this.templatePortal);
    }
    return;
  }

  loadDetailGroupCall(id: string): void {
    this.loadingGroupCall = true;
    this.groupCallLoadSubscription &&
      this.groupCallLoadSubscription.unsubscribe();
    this.groupCallLoadSubscription = this.teamService
      .getCallById(id)
      .subscribe((call) => {
        this.loadingGroupCall = false;
        if (call.contacts && call.contacts.length) {
          const contacts = [];
          call.contacts.forEach((e) => {
            contacts.push(new Contact().deserialize(e));
          });
          call.contacts = contacts;
        }
        if (call.leader) {
          call.leader = new User().deserialize(call.leader);
        }
        this.loadedGroupCalls[id] = call;
        this.selectedGroupCall = call;
      });
  }
   */
}
