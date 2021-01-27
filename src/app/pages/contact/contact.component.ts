import { Location } from '@angular/common';
import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Contact, ContactDetail } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';
import { OverlayService } from 'src/app/services/overlay.service';
import {
  ActivityDetail,
  DetailActivity
} from 'src/app/models/activityDetail.model';
import { MatDialog } from '@angular/material/dialog';
import { ContactMergeComponent } from 'src/app/components/contact-merge/contact-merge.component';
import { Automation } from 'src/app/models/automation.model';
import {
  ActionName,
  REPEAT_DURATIONS,
  DialogSettings,
  CALENDAR_DURATION
} from 'src/app/constants/variable.constants';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { listToTree } from 'src/app/helper';
import { AutomationShowFullComponent } from 'src/app/components/automation-show-full/automation-show-full.component';
import { CalendarDialogComponent } from 'src/app/components/calendar-dialog/calendar-dialog.component';
import { JoinCallRequestComponent } from 'src/app/components/join-call-request/join-call-request.component';
import { TabItem } from 'src/app/utils/data.types';
import { TaskDetail } from 'src/app/models/task.model';
import { NoteService } from 'src/app/services/note.service';
import { DealsService } from 'src/app/services/deals.service';
import { TaskService } from 'src/app/services/task.service';
import { HandlerService } from 'src/app/services/handler.service';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
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

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  REPEAT_DURATIONS = REPEAT_DURATIONS;
  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  tabs: TabItem[] = [
    { icon: '', label: 'Activity', id: 'all' },
    { icon: '', label: 'Notes', id: 'note' },
    { icon: '', label: 'Emails', id: 'email' },
    { icon: '', label: 'Texts', id: 'text' },
    { icon: '', label: 'Appointments', id: 'appointment' },
    { icon: '', label: 'Group Calls', id: 'group_call' },
    { icon: '', label: 'Tasks', id: 'follow_up' },
    { icon: '', label: 'Deals', id: 'deal' }
  ];
  action: TabItem = this.tabs[0];

  contact: ContactDetail = new ContactDetail();
  selectedContact: Contact = new Contact();
  groupActions = {};
  mainTimelines: DetailActivity[] = [];
  details: any = {};
  _id = '';
  next: string = null;
  prev: string = null;
  activeHistory = 'all';
  mainPanel = true;
  secondPanel = true;
  additionalPanel = true;
  noteActivity = 0;
  emailActivity = 0;
  textActivity = 0;
  appointmentActivity = 0;
  groupCallActivity = 0;
  taskActivity = 0;
  dealActivity = 0;

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

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private contactService: ContactService,
    private noteService: NoteService,
    private taskService: TaskService,
    private storeService: StoreService,
    private overlayService: OverlayService,
    private handlerService: HandlerService,
    private dealsService: DealsService,
    private automationService: AutomationService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.dealsService.getStage(true);
  }

  ngOnInit(): void {
    this._id = this.route.snapshot.params['id'];
    this.loadContact(this._id);

    this.storeService.selectedContact$.subscribe((res) => {
      if (res && res._id === this._id) {
        this.contact = res;
        this.selectedContact = res;
        this.groupActivities();
        this.getActivityCount();
        this.timeLineArrangement();
      } else {
        this.contact = res;
        this.selectedContact = res;
        this.groupActivities();
        this.getActivityCount();
      }
    });
  }

  /**
   * Load Contact Detail information
   * @param _id: Contact id to load
   */
  loadContact(_id: string): void {
    this.contactService.read(_id);
  }

  /**
   * Group Activities
   */
  groupActivities(): void {
    this.groupActions = {};
    this.mainTimelines = [];
    this.details = {};
    for (let i = this.contact.activity.length - 1; i >= 0; i--) {
      const e = this.contact.activity[i];
      const group = this.generateUniqueId(e);
      if (this.groupActions[group]) {
        this.groupActions[group].push(e);
      } else {
        e.group_id = group;
        this.groupActions[group] = [e];
        this.mainTimelines.push(e);
      }
    }
  }

  getActivityCount(): void {
    if (this.contact.activity.length > 0) {
      this.contact.activity.forEach((activity) => {
        if (activity.type == 'notes') {
          this.noteActivity++;
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
          this.emailActivity++;
        }
        if (activity.type == 'texts') {
          this.textActivity++;
        }
        if (activity.type == 'appointments') {
          this.appointmentActivity++;
        }
        if (activity.type == 'group_calls') {
          this.groupCallActivity++;
        }
        if (activity.type == 'follow_ups') {
          this.taskActivity++;
        }
        if (activity.type == 'deals') {
          this.dealActivity++;
        }
      });
    }
  }

  /**
   * Generate the unique group id that the activity would be included
   * @param activity : Activity Detail Information
   */
  generateUniqueId(activity: DetailActivity): string {
    if (!activity.activity_detail) {
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
        return `${material_id}_${activity._id}`;
      case 'texts':
        return activity._id;
      default:
        return activity.activity_detail['_id'];
    }
  }

  /**
   * Go to Contact List Page
   */
  goToBack(): void {
    this.location.back();
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
  deleteContact(): void {}

  /**
   * Open dialog to merge
   */
  openMergeContactDlg(): void {
    this.dialog.open(ContactMergeComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '700px',
      data: {
        contact: this.selectedContact
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
  editContacts(type: string): void {
    if (type == 'main') {
      this.mainPanel = !this.mainPanel;
    } else {
      this.secondPanel = !this.secondPanel;
    }
    this.dialog
      .open(ContactEditComponent, {
        width: '98vw',
        maxWidth: '600px',
        disableClose: true,
        data: {
          contact: this.contact,
          type: type
        }
      })
      .afterClosed()
      .subscribe((id) => {
        if (id) {
          this.loadContact(id);
        }
      });
  }

  editAdditional(): void {
    this.additionalPanel = !this.additionalPanel;
    this.dialog
      .open(AdditionalEditComponent, {
        width: '98vw',
        maxWidth: '600px',
        data: {
          contact: this.contact
        }
      })
      .afterClosed()
      .subscribe((id) => {
        if (id) {
          this.loadContact(id);
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
    this.dialog.open(JoinCallRequestComponent, {
      width: '96vw',
      maxWidth: '500px',
      height: 'auto',
      disableClose: true
    });
  }

  /**
   * Open Dialog to create new appointment
   */
  openAppointmentDlg(): void {
    this.dialog.open(CalendarDialogComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '600px',
      maxHeight: '700px'
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

  insertActivity(activity: DetailActivity): void {
    const group = this.generateUniqueId(activity);
    if (this.groupActions[group]) {
      this.groupActions[group].push(activity);
    } else {
      activity.group_id = group;
      this.groupActions[group] = [activity];
      this.mainTimelines.unshift(activity);
    }
  }
  /**************************************
   * Timeline Actions
   **************************************/
  changeTab(tab: TabItem): void {
    this.action = tab;
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
    if (!activity || !activity.activity_detail) {
      return;
    }
    const data = {
      ...activity.activity_detail,
      contact: { _id: this.contact._id }
    };

    this.dialog
      .open(TaskEditComponent, {
        width: '98vw',
        maxWidth: '394px',
        data: new TaskDetail().deserialize(data)
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

  updateNote(activity: any): void {
    this.dialog
      .open(NoteEditComponent, {
        width: '98vw',
        maxWidth: '394px',
        data: {
          note: activity,
          contact_name: this.contact.fullName
        }
      })
      .afterClosed()
      .subscribe((note) => {
        if (note) {
          activity.activity_detail = note;
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
            .delete(activity.activity_detail._id)
            .subscribe((res) => {
              if (res) {
                this.mainTimelines.some((e, index) => {
                  if (e._id === activity._id) {
                    e.activity_detail = null;
                    return true;
                  }
                });
              }
            });
        }
      });
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

    this.dataSource.data = [];
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
            this.assignSubscription && this.assignSubscription.unsubscribe();
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

  convertContent(content: any): any {
    const htmlContent = content.split('<div>');
    let convertString = '';
    htmlContent.forEach((html) => {
      if (html.indexOf('material-object') !== -1) {
        convertString = convertString + html.match('<a(.*)a>')[0];
      }
    });
    return convertString;
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
}
