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
  RECURRING_TYPE,
  QuillEditor
} from 'src/app/constants/variable.constants';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { listToTree } from 'src/app/helper';
import { AutomationShowFullComponent } from 'src/app/components/automation-show-full/automation-show-full.component';
import * as moment from 'moment';
import { CalendarDialogComponent } from 'src/app/components/calendar-dialog/calendar-dialog.component';
import { JoinCallRequestComponent } from 'src/app/components/join-call-request/join-call-request.component';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  TYPES = [
    {
      id: 'all',
      label: 'All actions'
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
  contact: ContactDetail = new ContactDetail();
  groupActions = {};

  emailSending = false;
  ccFlag = false;
  bccFlag = false;
  emailContacts: Contact[] = [];
  ccContacts: Contact[] = [];
  bccContacts: Contact[] = [];
  emailSubject = '';
  emailContent = '';
  selectedTemplate = { subject: '', content: '' };
  quillEditorRef: { getModule: (arg0: string) => any; getSelection: () => any };
  config = QuillEditor;
  focusEditor = '';

  taskTypes = [];
  task = {
    subject: '',
    recurrence: ''
  };
  due_date = {
    year: '',
    month: '',
    day: ''
  };
  selectedDateTime;
  minDate: any;
  due_time = '12:00:00.000';
  times = TIMES;
  recurrings = RECURRING_TYPE;
  taskSaving = false;
  isRepeat = false;
  taskSubmitted = false;
  noteSubmitted = false;
  emailSubmitted = false;

  mainTimelines: ActivityDetail[] = [];
  _id = '';
  next: string = null;
  prev: string = null;

  note = {
    title: '',
    content: ''
  };
  noteSaving = false;

  mainAction = 'send_email';
  activeHistory = 'all';

  selectedAutomation: Automation;
  ActionName = ActionName;
  treeControl = new NestedTreeControl<any>((node) => node.children);
  allDataSource = new MatTreeNestedDataSource<any>();
  dataSource = new MatTreeNestedDataSource<any>();
  hasChild = (_: number, node: any) =>
    !!node.children && node.children.length > 0;

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private fileService: FileService,
    private contactService: ContactService,
    private storeService: StoreService,
    private overlayService: OverlayService,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this._id = this.route.snapshot.params['id'];
    this.loadContact(this._id);

    this.storeService.selectedContact$.subscribe((res) => {
      if (res && res._id === this._id) {
        this.contact = res;
        this.groupActivities();
        this.timeLineArrangement();
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
  openMergeContactDlg(): void {}

  /**
   * Open the Campagin Dialog to assign the curent contact to the compaign list.
   */
  openCampaignAssignDlg(): void {}

  /**
   * Open the Contact Edit Dialog
   */
  openEditDlg(): void {}

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
  openTaskDlg(): void {}

  /**
   * Create Note
   */
  createNote(): void {}

  insertEmailContentValue(value: string): void {
    this.emailEditor.quillEditor.focus();
    const range = this.emailEditor.quillEditor.getSelection();
    if (!range) {
      return;
    }
    this.emailEditor.quillEditor.insertText(range.index, value, 'user');
    this.emailEditor.quillEditor.setSelection(
      range.index + value.length,
      0,
      'user'
    );
  }

  sendEmail(): void {}

  toggleTypes(type: string): void {
    const pos = this.taskTypes.indexOf(type);
    if (pos !== -1) {
      this.taskTypes.splice(pos, 1);
    } else {
      this.taskTypes.push(type);
    }
  }

  getDateTime(): any {
    if (this.due_date.day != '') {
      return (
        this.due_date.year + '-' + this.due_date.month + '-' + this.due_date.day
      );
    }
  }

  setDateTime(): void {
    this.selectedDateTime = moment(this.getDateTime()).format('DD.MM.YYYY');
    close();
  }

  setRepeatEvent(): void {
    this.isRepeat = !this.isRepeat;
  }

  contactMerge(contact: any): void {
    this.dialog.open(ContactMergeComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '700px',
      maxHeight: '600px',
      data: {
        contact: contact
      }
    });
  }

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

  selectTemplate(event: any): void {
    this.selectedTemplate = event;
    this.emailSubject = this.selectedTemplate.subject;
    this.emailContent = this.selectedTemplate.content;
  }

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
  }

  initImageHandler = (): void => {
    const imageInput = document.createElement('input');
    imageInput.setAttribute('type', 'file');
    imageInput.setAttribute('accept', 'image/*');
    imageInput.classList.add('ql-image');

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.fileService.attachImage(file).subscribe((res) => {
          this.insertImageToEditor(res.url);
        });
      }
    });
    imageInput.click();
  };

  insertImageToEditor(url: string): void {
    const range = this.quillEditorRef.getSelection();
    // const img = `<img src="${url}" alt="attached-image-${new Date().toISOString()}"/>`;
    // this.quillEditorRef.clipboard.dangerouslyPasteHTML(range.index, img);
    this.emailEditor.quillEditor.insertEmbed(range.index, `image`, url, 'user');
    this.emailEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }
  setFocusField(editorType: string): void {
    this.focusEditor = editorType;
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
