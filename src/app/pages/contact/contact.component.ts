import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Contact, ContactDetail } from 'src/app/models/contact.model';
import { FileService } from '../../services/file.service';
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
  TIMES,
  REPEAT_DURATIONS
} from 'src/app/constants/variable.constants';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { listToTree } from 'src/app/helper';
import { AutomationShowFullComponent } from 'src/app/components/automation-show-full/automation-show-full.component';
import * as moment from 'moment';
import { CalendarDialogComponent } from 'src/app/components/calendar-dialog/calendar-dialog.component';
import { JoinCallRequestComponent } from 'src/app/components/join-call-request/join-call-request.component';
import { TabItem } from 'src/app/utils/data.types';
import { Task } from 'src/app/models/task.model';
import { Note } from 'src/app/models/note.model';
import { NoteService } from 'src/app/services/note.service';
import { TaskService } from 'src/app/services/task.service';
import { HandlerService } from 'src/app/services/handler.service';
import { Template } from 'src/app/models/template.model';
import { MaterialAddComponent } from 'src/app/components/material-add/material-add.component';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import { MaterialService } from 'src/app/services/material.service';
import { HelperService } from 'src/app/services/helper.service';
import * as _ from 'lodash';
import { SendEmailComponent } from 'src/app/components/send-email/send-email.component';
import { ContactEditComponent } from 'src/app/components/contact-edit/contact-edit.component';
import { AdditionalEditComponent } from 'src/app/components/additional-edit/additional-edit.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  TYPES = [
    {
      id: 'all',
      label: 'Activity'
    },
    {
      id: 'note',
      label: 'Notes'
    },
    {
      id: 'message',
      label: 'Messages'
    },
    {
      id: 'appointment',
      label: 'Appointments'
    },
    {
      id: 'group_call',
      label: 'Group Calls'
    },
    {
      id: 'task',
      label: 'Tasks'
    },
    {
      id: 'deal',
      label: 'Deals'
    }
  ];
  REPEAT_DURATIONS = REPEAT_DURATIONS;
  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  tabs: TabItem[] = [
    { icon: '', label: 'Activity', id: 'activity' },
    { icon: '', label: 'Notes', id: 'note' },
    { icon: '', label: 'Messages', id: 'message' },
    { icon: '', label: 'Appointments', id: 'appointment' },
    { icon: '', label: 'Group Calls', id: 'group_call' },
    { icon: '', label: 'Tasks', id: 'task' },
    { icon: '', label: 'Deals', id: 'deal' }
  ];
  action: TabItem = this.tabs[0];

  contact: ContactDetail = new ContactDetail();
  groupActions = {};
  mainTimelines: ActivityDetail[] = [];
  details: any = {};
  _id = '';
  next: string = null;
  prev: string = null;
  activeHistory = 'all';

  task: Task = new Task();
  task_date = {
    year: '',
    month: '',
    day: ''
  };
  schedule_date = {
    year: '',
    month: '',
    day: ''
  };
  scheduleDateTime = '';
  planned = false;
  selectedDateTime;
  minDate: any;
  task_time = '12:00:00.000';
  schedule_time = '12:00:00.000';
  times = TIMES;
  taskSaving = false;

  note: Note = new Note();
  noteSaving = false;

  emailSubmitted = false;
  emailSending = false;
  ccFlag = false;
  bccFlag = false;
  emailContacts: Contact[] = [];
  ccContacts: Contact[] = [];
  bccContacts: Contact[] = [];
  emailSubject = '';
  emailContent = '';
  selectedTemplate: Template = new Template();
  materials = [];

  selectedAutomation: Automation;
  ActionName = ActionName;
  treeControl = new NestedTreeControl<any>((node) => node.children);
  allDataSource = new MatTreeNestedDataSource<any>();
  dataSource = new MatTreeNestedDataSource<any>();
  hasChild = (_: number, node: any) =>
    !!node.children && node.children.length > 0;

  constructor(
    private dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private contactService: ContactService,
    private noteService: NoteService,
    private taskService: TaskService,
    private storeService: StoreService,
    private overlayService: OverlayService,
    private handlerService: HandlerService,
    private viewContainerRef: ViewContainerRef,
    private materialService: MaterialService,
    private helperSerivce: HelperService
  ) {}

  ngOnInit(): void {
    this._id = this.route.snapshot.params['id'];
    this.loadContact(this._id);

    this.storeService.selectedContact$.subscribe((res) => {
      if (res && res._id === this._id) {
        this.contact = res;
        this.groupActivities();
        this.timeLineArrangement();
      } else {
        this.contact = res;
        this.groupActivities();
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

  editContacts(type: string): void {
    this.dialog
      .open(ContactEditComponent, {
        width: '98vw',
        maxWidth: '600px',
        data: {
          contact: this.contact,
          type: type
        }
      })
      .afterClosed()
      .subscribe(() => {
        this.storeService.selectedContact$.subscribe((res) => {
          if (res) {
            this.contact = res;
          }
        });
      });
  }

  editAdditional(): void {
    this.dialog
      .open(AdditionalEditComponent, {
        width: '98vw',
        maxWidth: '600px',
        data: {
          contact: this.contact
        }
      })
      .afterClosed()
      .subscribe(() => {
        this.storeService.selectedContact$.subscribe((res) => {
          if (res) {
            this.contact = res;
          }
        });
      });
  }

  /**
   * Go to Contact List Page
   */
  goToBack(): void {}

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
      maxHeight: '600px',
      data: {
        contact: this.contact
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
  openEditDlg(): void {}

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
  createTask(): void {
    this.taskSaving = true;
    this.taskService
      .create({ ...this.task, contact: this._id })
      .subscribe((res) => {
        this.taskSaving = false;
        this.handlerService.registerActivity$(res);
        this.handlerService.activityAdd$([this._id], 'task');
      });
  }

  openSendEmail(): void {
    this.dialog.open(SendEmailComponent, {
      position: {
        bottom: '50px',
        right: '50px'
      },
      width: '100vw',
      maxWidth: '600px',
      panelClass: 'send-email',
      backdropClass: 'cdk-send-email',
      disableClose: false
    });
  }

  /**
   * Create Note
   */
  createNote(): void {
    this.noteSaving = true;
    this.noteService
      .create({ ...this.note, contact: this._id })
      .subscribe((res) => {
        this.noteSaving = false;
        this.handlerService.registerActivity$(res);
        this.handlerService.activityAdd$([this._id], 'note');
      });
  }

  /************************************
   * Email Sending Panel Relative Functions
   ************************************/
  /**
   * Populate the selected template content
   * @param template : Template
   */
  selectTemplate(template: Template): void {
    this.selectedTemplate = template;
    this.emailSubject = this.selectedTemplate.subject;
    this.emailContent = this.selectedTemplate.content;
    // Attach the Selected Material Content
  }
  getScheduleDateTime(): any {
    if (this.schedule_date.day != '' && this.schedule_time != '') {
      return moment(
        this.schedule_date.year +
          '-' +
          this.schedule_date.month +
          '-' +
          this.schedule_date.day +
          ' ' +
          this.schedule_time
      ).format();
    }
  }

  setScheduleDateTime(): void {
    this.scheduleDateTime = moment(
      this.schedule_date.year +
        '-' +
        this.schedule_date.month +
        '-' +
        this.schedule_date.day +
        ' ' +
        this.schedule_time
    ).format();
    this.planned = true;
  }

  removeSchedule(): void {
    this.planned == false;
    this.scheduleDateTime = '';
  }
  /**
   * Open the Material Select Dialog
   */
  openMaterialsDlg(): void {
    const content = this.emailContent;
    const materials = this.helperSerivce.getMaterials(content);
    this.dialog
      .open(MaterialAddComponent, {
        width: '98vw',
        maxWidth: '500px',
        data: {
          hideMaterials: materials
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials) {
          this.materials = _.intersectionBy(this.materials, materials, '_id');
          this.materials = [...this.materials, ...res.materials];
          for (let i = 0; i < res.materials.length; i++) {
            const material = res.materials[i];
            this.htmlEditor.insertMaterials(material);
          }
        }
      });
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

  /**************************************
   * Task Panel Relative Functions
   **************************************/
  getTaskDateTime(): any {
    if (this.task_date.day != '') {
      return (
        this.task_date.year +
        '-' +
        this.task_date.month +
        '-' +
        this.task_date.day
      );
    }
  }
  setTaskDateTime(): void {
    this.selectedDateTime = moment(this.getTaskDateTime()).format('DD.MM.YYYY');
    close();
  }

  /*****************************************
   * Automation Select & Display
   *****************************************/
  /**
   * Select Automation To assign
   * @param evt :Automation
   */
  selectAutomation(evt: any): void {
    this.selectedAutomation = evt.Automation;
  }
  timeLineArrangement(): void {
    if (!this.contact.time_lines || this.contact.time_lines.length == 0) {
      return;
    }
    this.allDataSource.data = listToTree(this.contact.time_lines);
    let root = null;
    if (this.allDataSource.data?.length == 0) {
      return;
    }
    if (this.allDataSource.data[0]?.status == 'completed') {
      root = this.allDataSource.data[0];
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
      width: '100vw',
      maxWidth: '700px',
      maxHeight: '600px',
      data: {
        automation: this.allDataSource.data
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
  createAutomation(): void {}

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
