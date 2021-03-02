import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import {
  ACTION_CAT,
  TIMES,
  QuillEditor,
  DefaultMessage, AUTOMATION_ICONS
} from 'src/app/constants/variable.constants';
import { MaterialService } from 'src/app/services/material.service';
import { Subscription } from 'rxjs';
import { TemplatesService } from '../../services/templates.service';
import { FormControl } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { FileService } from 'src/app/services/file.service';
import { QuillEditorComponent } from 'ngx-quill';
import { LabelService } from 'src/app/services/label.service';
import { TabItem } from '../../utils/data.types';
import { Task } from '../../models/task.model';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import * as moment from 'moment';

@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.scss']
})
export class ActionDialogComponent implements OnInit {
  stepIndex = 1; // ACTION DEFINE STEP | 1: Action List View, 2: Action Detail Setting
  type = ''; // ACTION TYPE
  category; // ACTION CATEGORY
  action = {}; // ACTION CONTENT
  submitted = false; // SUBMITTING FALSE
  conditionAction; // Condition Case Action corresponds the prev action
  material_type = '';

  videos = [];
  videosLoading = false;
  videosLoadError = '';

  pdfs = [];
  pdfsLoading = false;
  pdfsLoadError = '';

  images = [];
  imagesLoading = false;
  imagesLoadError = '';

  materialError = '';

  templateLoadingSubscription: Subscription;
  isProcessing = true;
  templates;
  templateLoadError = '';
  myControl = new FormControl();
  selectedTemplate = { subject: '', content: '' };

  // Follow Create
  due_date = {
    year: '',
    month: '',
    day: ''
  };
  due_time = '12:00:00.000';
  due_duration = 1;
  times = TIMES;
  followDueOption = 'date';
  plan_time = { day: 0, hour: 0, min: 0 };

  // Contact Update
  contactUpdateOption = 'update_label';
  labels = [];
  labelsLoading = false;
  labelsLoadError = '';
  commandLabel = ''; // Label
  commandTags = []; // Tags

  mediaType = '';
  materialType = '';

  default = {
    sms: '',
    email: ''
  };

  // periodOption = 'gap'
  // condPeriodOption = 'limit';

  currentUser;
  task = new Task();

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  error = '';

  selectedFollow: any;
  followUpdateOption = 'no_update';
  updateFollowDueOption = 'date';
  update_due_date = {
    year: '',
    month: '',
    day: ''
  };
  update_due_time = '12:00:00.000';
  update_due_duration = 0;
  selectedDate = '';

  searchStr = '';
  filterVideos = [];
  filterPdfs = [];
  filterImages = [];

  constructor(
    private dialogRef: MatDialogRef<ActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private materialService: MaterialService,
    private userService: UserService,
    private fileService: FileService
  ) {
    this.userService.garbage$.subscribe((res) => {
      const garbage = res;
      const cannedTemplate = garbage && garbage.canned_message;
      this.default.email = cannedTemplate && cannedTemplate.email;
      this.default.sms = cannedTemplate && cannedTemplate.sms;

      const current = new Date();
      this.minDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate()
      };
    });

    this.userService.profile$.subscribe((res) => {
      this.currentUser = res;
    });
  }

  ngOnInit(): void {
    // Enable the corresponding the condition option
    if (
      this.data.currentAction === 'send_text_video' ||
      this.data.currentAction === 'send_email_video'
    ) {
      this.conditionAction = 'watched_video';
    }
    if (
      this.data.currentAction === 'send_text_pdf' ||
      this.data.currentAction === 'send_email_pdf'
    ) {
      this.conditionAction = 'watched_pdf';
    }
    if (
      this.data.currentAction === 'send_text_image' ||
      this.data.currentAction === 'send_email_image'
    ) {
      this.conditionAction = 'watched_image';
    }
    if (this.data.currentAction === 'email') {
      this.conditionAction = 'opened_email';
    }
    // this.loadTemplates()
    // if(!(this.data.action.condition && this.data.editFlag)) {
    //   this.action['period'] = "";
    // }
    // if(this.data.action.category === 'START') {
    //   this.action['period'] = 0
    // }
  }

  removeError(): void {
    this.error = '';
  }

  fillContent(action): void {
    this.stepIndex++;
    if (this.type !== action.type) {
      this.submitted = false;
      this.type = action.type;
      this.category = action.category;

      this.action['content'] = '';
      this.action['video'] = {};
      this.action['pdf'] = {};
      this.action['image'] = {};
      this.action['content'] = '';
      this.action['subject'] = '';
    }
    if (this.type === 'update_follow_up') {
      this.selectedFollow = undefined;
      this.followUpdateOption = 'update_follow_up';
      this.updateFollowDueOption = 'no_update';
      this.update_due_time = '12:00:00.000';
      this.update_due_duration = 0;
      this.setUpdateDateTime();
    }
    if (
      (action.type === 'send_text_material' ||
        action.type === 'send_email_material') &&
      !this.videos.length &&
      !this.pdfs.length &&
      !this.images.length
    ) {
      if (action.type === 'send_text_material') {
        this.type = 'send_text_video';
        this.material_type = 'text';
      } else {
        this.type = 'send_email_video';
        this.material_type = 'email';
      }
      this.loadVideos();
      this.loadPdfs();
      this.loadImages();
    }

    this.loadTemplates();
  }

  loadVideos(): void {
    this.videosLoading = true;
    this.videosLoadError = '';
    this.materialService.loadVideosImpl().subscribe(
      (res) => {
        this.videosLoading = false;
        this.videos = res;
        this.filterVideos = res;
      },
      (err) => {
        this.videosLoading = false;
      }
    );
  }

  loadPdfs(): void {
    this.pdfsLoading = true;
    this.pdfsLoadError = '';
    this.materialService.loadPdfsImpl().subscribe(
      (res) => {
        this.pdfsLoading = false;
        this.pdfs = res;
        this.filterPdfs = res;
      },
      (err) => {
        this.pdfsLoading = false;
      }
    );
  }

  loadImages(): void {
    this.imagesLoading = true;
    this.imagesLoadError = '';
    this.materialService.loadImagesImpl().subscribe(
      (res) => {
        this.imagesLoading = false;
        this.images = res;
        this.filterImages = res;
      },
      (err) => {
        this.imagesLoading = false;
        if (err.status === 400) {
          this.imagesLoadError = 'Error is occured in image loading.';
        }
        if (err.status === 500) {
          this.imagesLoadError = 'Server Error is occured in image Loading.';
        }
      }
    );
  }

  toggleVideo(video): void {
    this.action['video'] = video;
    this.materialError = '';
  }

  togglePdf(pdf): void {
    this.action['pdf'] = pdf;
    this.materialError = '';
  }

  toggleImage(image): void {
    this.action['image'] = image;
    this.materialError = '';
  }

  prevStep(): void {
    this.stepIndex--;
    this.materialError = '';
  }

  decideCaseAction(action_type): void {
    this.dialogRef.close({ category: ACTION_CAT.CONDITION, ...action_type });
  }

  decideAction(): void {
    let period = this.action['period'] || 0;
    if (this.action['period'] == 'custom_date') {
      period =
        this.plan_time['day'] * 24 +
        this.plan_time['hour'] * 1 +
        this.plan_time['min'] * 1;
      if (!period) {
        return;
      }
    }

    if (this.type === 'send_email_video' || this.type === 'send_text_video') {
      if (!this.action['video']['_id']) {
        this.materialError = 'Please select Video to send.';
        return;
      }
    }

    if (this.type === 'send_email_pdf' || this.type === 'send_text_pdf') {
      if (!this.action['pdf']['_id']) {
        this.materialError = 'Please select PDF to send.';
        return;
      }
    }

    if (this.type === 'send_email_image' || this.type === 'send_text_image') {
      if (!this.action['image']['_id']) {
        this.materialError = 'Please select Image to send.';
        return;
      }
    }
    if (this.type === 'follow_up') {
      if (this.followDueOption === 'date') {
        const time_zone = this.currentUser.time_zone;

        if (this.due_date.year !== '' && this.due_date.month !== '' && this.due_date.day !== '') {
          const due_date = new Date(
            `${this.due_date['year']}-${this.numPad(
              this.due_date['month']
            )}-${this.numPad(this.due_date['day'])}T${this.due_time}${time_zone}`
          );
          this.dialogRef.close({
            ...this.action,
            type: this.type,
            task_type: this.task.type,
            category: this.category,
            due_date: due_date,
            period
          });
        }
      } else {
        this.dialogRef.close({
          ...this.action,
          type: this.type,
          task_type: this.task.type,
          category: this.category,
          due_duration: this.due_duration,
          period
        });
      }
      return;
    }
    if (this.type === 'update_contact') {
      let command;
      let content;
      if (this.contactUpdateOption === 'update_label') {
        command = 'update_label';
        content = this.commandLabel;
        if (!content) {
          this.error = 'Please select the label for contact.';
        }
      } else if (this.contactUpdateOption === 'push_tag') {
        command = 'push_tag';
        content = this.commandTags;
        if (!this.commandTags.length) {
          this.error = 'Please select the tags to insert.';
        }
      } else if (this.contactUpdateOption === 'pull_tag') {
        command = 'pull_tag';
        content = this.commandTags;
        if (!this.commandTags.length) {
          this.error = 'Please select the tags to remove.';
        }
      }
      if (this.error) {
        return;
      } else {
        this.dialogRef.close({
          type: this.type,
          category: this.category,
          period,
          command,
          content
        });
        return;
      }
    }
    if (this.type === 'update_follow_up') {
      if (this.followUpdateOption === 'update_follow_up') {
        if (this.updateFollowDueOption === 'no_update') {
          this.dialogRef.close({
            ...this.action,
            type: this.type,
            task_type: this.task.type,
            category: this.category,
            due_duration: undefined,
            due_date: undefined,
            period,
            command: 'update_follow_up',
            ref_id: this.selectedFollow.id
          });
        } else if (this.updateFollowDueOption === 'update_due_date') {
          const time_zone = this.currentUser.time_zone;
          if (this.update_due_date.year !== '' && this.update_due_date.month !== '' && this.update_due_date.day !== '') {
            const due_date = new Date(
              `${this.update_due_date['year']}-${this.numPad(
                this.update_due_date['month']
              )}-${this.numPad(this.update_due_date['day'])}T${
                this.update_due_time
              }${time_zone}`
            );
            this.dialogRef.close({
              ...this.action,
              type: this.type,
              task_type: this.task.type,
              category: this.category,
              due_date: due_date,
              period,
              command: 'update_follow_up',
              ref_id: this.selectedFollow.id
            });
          }
        } else {
          this.dialogRef.close({
            ...this.action,
            type: this.type,
            task_type: this.task.type,
            category: this.category,
            due_duration: this.update_due_duration || 0,
            period,
            command: 'update_follow_up',
            ref_id: this.selectedFollow.id
          });
        }
      } else {
        this.dialogRef.close({
          ...this.action,
          type: this.type,
          task_type: this.task.type,
          category: this.category,
          period,
          command: 'complete_follow_up',
          ref_id: this.selectedFollow.id
        });
      }
      return;
    } else {
      this.dialogRef.close({
        ...this.action,
        type: this.type,
        category: this.category,
        period
      });
    }
  }

  loadTemplates(): any {
    switch (this.type) {
      case 'send_text_video':
        this.mediaType = 'text';
        this.materialType = 'video';
        break;
      case 'send_email_video':
        this.mediaType = 'email';
        this.materialType = 'video';
        break;
      case 'send_text_pdf':
        this.mediaType = 'text';
        this.materialType = 'pdf';
        break;
      case 'send_email_pdf':
        this.mediaType = 'email';
        this.materialType = 'pdf';
        break;
      case 'send_text_image':
        this.mediaType = 'text';
        this.materialType = 'image';
        break;
      case 'send_email_image':
        this.mediaType = 'email';
        this.materialType = 'image';
        break;
      case 'send_email':
        this.mediaType = 'email';
        this.materialType = '';
        break;
      default:
        this.mediaType = '';
        this.materialType = '';
        break;
    }
  }

  displayFn(template): string {
    if (template) {
      if (!template._id) {
        return '';
      }
      return template.title;
    }

    return '';
  }

  selectFollow(event): void {
    this.action['content'] = this.selectedFollow.content;
    this.updateFollowDueOption = 'no_update';
  }

  initMessage(): any {
    if (
      this.mediaType === 'email' &&
      (this.selectedTemplate.subject || this.selectedTemplate.content)
    ) {
      this.setMessage();
      return;
    }
    if (
      this.mediaType === 'text' &&
      (this.selectedTemplate.subject || this.selectedTemplate.content)
    ) {
      this.setMessage();
      return;
    }
    if (this.materialType) {
      if (this.mediaType === 'email') {
        // Set the subject and content
        if (this.materialType === 'video') {
          this.action['subject'] = 'Video: {video_title}';
          this.action['content'] = this.autoFill(
            DefaultMessage.AUTO_VIDEO_EMAIL
          );
        } else if (this.materialType === 'pdf') {
          this.action['subject'] = 'PDF: {pdf_title}';
          this.action['content'] = this.autoFill(DefaultMessage.AUTO_PDF_EMAIL);
        } else if (this.materialType === 'image') {
          this.action['subject'] = 'Image: {image_title}';
          this.action['content'] = this.autoFill(
            DefaultMessage.AUTO_IMAGES_EMAIL
          );
        }
      } else {
        // Set only content
        if (this.materialType === 'video') {
          this.action['content'] = this.autoFill(
            DefaultMessage.AUTO_VIDEO_TEXT1
          );
        } else if (this.materialType === 'pdf') {
          this.action['content'] = this.autoFill(DefaultMessage.AUTO_PDF_TEXT1);
        } else if (this.materialType === 'image') {
          this.action['content'] = this.autoFill(
            DefaultMessage.AUTO_IMAGE_TEXT1
          );
        }
      }
    }
  }
  autoFill(text): void {
    let result = text;
    const user_name = this.currentUser.user_name;
    const user_phone = this.currentUser.cell_phone;
    const user_email = this.currentUser.email;
    result = result.replace(/{user_name}/g, user_name || '');
    result = result.replace(/{user_phone}/g, user_phone || '');
    result = result.replace(/{user_email}/g, user_email || '');

    return result;
  }

  setMessage(): void {
    this.action['subject'] = this.selectedTemplate.subject;
    this.action['content'] = this.selectedTemplate.content;
  }

  selectTemplate(event): void {
    this.selectedTemplate = event;
    this.action['subject'] = this.selectedTemplate.subject;
    this.action['content'] = this.selectedTemplate.content;
    if (this.action['content'] && this.htmlEditor) {
      this.htmlEditor.setValue(this.action['content']);
    }
  }

  /**=======================================================
   *
   * Subject Field
   *
   ========================================================*/
  subjectCursorStart = 0;
  subjectCursorEnd = 0;
  subject = '';
  /**
   *
   * @param field : Input text field of the subject
   */
  getSubjectCursorPost(field): void {
    if (field.selectionStart || field.selectionStart === '0') {
      this.subjectCursorStart = field.selectionStart;
    }
    if (field.selectionEnd || field.selectionEnd === '0') {
      this.subjectCursorEnd = field.selectionEnd;
    }
  }

  insertEmailContentValue(value: string): void {
    this.htmlEditor.insertEmailContentValue(value);
  }

  insertSubjectValue(value, field): void {
    let subject = this.action['subject'] || '';
    subject =
      subject.substr(0, this.subjectCursorStart) +
      value +
      subject.substr(
        this.subjectCursorEnd,
        subject.length - this.subjectCursorEnd
      );
    this.action['subject'] = subject;
    this.subjectCursorStart = this.subjectCursorStart + value.length;
    this.subjectCursorEnd = this.subjectCursorStart;
    field.focus();
  }
  smsContentCursorStart = 0;
  smsContentCursorEnd = 0;
  smsContent = '';

  getSmsContentCursor(field): void {
    if (field.selectionStart || field.selectionStart === '0') {
      this.smsContentCursorStart = field.selectionStart;
    }
    if (field.selectionEnd || field.selectionEnd === '0') {
      this.smsContentCursorEnd = field.selectionEnd;
    }
  }

  insertSmsContentValue(value, field): void {
    let smsContent = this.action['content'] || '';
    smsContent =
      smsContent.substr(0, this.smsContentCursorStart) +
      value +
      smsContent.substr(
        this.smsContentCursorEnd,
        smsContent.length - this.smsContentCursorEnd
      );
    this.action['content'] = smsContent;
    this.smsContentCursorStart = this.smsContentCursorStart + value.length;
    this.smsContentCursorEnd = this.smsContentCursorStart;
    field.focus();
  }

  DisplayActions = [
    {
      type: 'follow_up',
      title: 'Follow Up',
      description: '',
      icon: AUTOMATION_ICONS.FOLLOWUP,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'update_follow_up',
      title: 'Update Follow up',
      description: '',
      icon: AUTOMATION_ICONS.UPDATE_FOLLOWUP,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'note',
      title: 'Create Note',
      description: '',
      icon: AUTOMATION_ICONS.CREATE_NOTE,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'email',
      title: 'Send E-mail',
      description: '',
      icon: AUTOMATION_ICONS.SEND_EMAIL,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_email_material',
      title: 'Send Material E-mail',
      description: '',
      icon: AUTOMATION_ICONS.SEND_VIDEO_EMAIL,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_text_material',
      title: 'Send Material Text',
      description: '',
      icon: AUTOMATION_ICONS.SEND_VIDEO_TEXT,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'update_contact',
      title: 'Contact Update',
      description: '',
      icon: AUTOMATION_ICONS.UPDATE_CONTACT,
      category: ACTION_CAT.NORMAL
    }
  ];

  ActionTypes = [
    {
      type: 'follow_up',
      title: 'Follow Up',
      description: '',
      icon: AUTOMATION_ICONS.FOLLOWUP,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'update_follow_up',
      title: 'Update Follow up',
      description: '',
      icon: AUTOMATION_ICONS.UPDATE_FOLLOWUP,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'note',
      title: 'Create Note',
      description: '',
      icon: AUTOMATION_ICONS.CREATE_NOTE,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'email',
      title: 'Send E-mail',
      description: '',
      icon: AUTOMATION_ICONS.SEND_EMAIL,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_email_video',
      title: 'Send Video E-mail',
      description: '',
      icon: AUTOMATION_ICONS.SEND_VIDEO_EMAIL,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_text_video',
      title: 'Send Video Text',
      description: '',
      icon: AUTOMATION_ICONS.SEND_VIDEO_TEXT,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_email_pdf',
      title: 'Send PDF E-mail',
      description: '',
      icon: AUTOMATION_ICONS.SEND_PDF_EMAIL,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_text_pdf',
      title: 'Send PDF Text',
      description: '',
      icon: AUTOMATION_ICONS.SEND_PDF_TEXT,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_email_image',
      title: 'Send Image E-mail',
      description: '',
      icon: AUTOMATION_ICONS.SEND_IMAGE_EMAIL,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'send_text_image',
      title: 'Send Image Text',
      description: '',
      icon: AUTOMATION_ICONS.SEND_IMAGE_TEXT,
      category: ACTION_CAT.NORMAL
    },
    {
      type: 'update_contact',
      title: 'Contact Update',
      description: '',
      icon: AUTOMATION_ICONS.UPDATE_CONTACT,
      category: ACTION_CAT.NORMAL
    }
  ];

  ConditionActionTypes = [
    {
      type: 'watched_video',
      title: 'Material Review Check',
      description: '',
      icon: AUTOMATION_ICONS.WATCHED_VIDEO,
      category: ACTION_CAT.CONDITION
    },
    {
      type: 'watched_pdf',
      title: 'Material Review Check',
      description: '',
      icon: AUTOMATION_ICONS.WATCHED_PDF,
      category: ACTION_CAT.CONDITION
    },
    {
      type: 'watched_image',
      title: 'Material Review Check',
      description: '',
      icon: AUTOMATION_ICONS.WATCHED_IMAGE,
      category: ACTION_CAT.CONDITION
    },
    {
      type: 'opened_email',
      title: 'Email Open Check',
      description: '',
      icon: AUTOMATION_ICONS.OPENED_EMAIL,
      category: ACTION_CAT.CONDITION
    }
  ];

  ActivityName = {
    note: 'Note',
    follow_up: 'Follow up',
    email: 'Email',
    send_email_video: 'Video Email',
    send_text_video: 'Video Text',
    send_email_pdf: 'PDF Email',
    send_text_pdf: 'PDF Text',
    send_email_image: 'Image Email',
    send_text_image: 'Image Text',
    watched_video: 'Video Watching',
    watched_image: 'Image Watching',
    watched_pdf: 'PDF Watching',
    update_contact: 'Contact update activity',
    update_follow_up: 'Update Follow up'
  };

  NoLimitActions = ['note', 'follow_up', 'update_contact', 'update_follow_up'];

  numPad(num): any {
    if (num < 10) {
      return '0' + num;
    }
    return num + '';
  }

  changeTab(tab: TabItem): void {
    this.clearSearchStr();
    this.selectedTab = tab;
    if (this.material_type === 'email') {
      if (tab.id === 'videos') {
        this.type = 'send_email_video';
      } else if (tab.id === 'pdfs') {
        this.type = 'send_email_pdf';
      } else if (tab.id === 'images') {
        this.type = 'send_email_image';
      }
    } else if (this.material_type === 'text') {
      if (tab.id === 'videos') {
        this.type = 'send_text_video';
      } else if (tab.id === 'pdfs') {
        this.type = 'send_text_pdf';
      } else if (tab.id === 'images') {
        this.type = 'send_text_image';
      }
    }
  }

  getDateTime(): any {
    if (this.due_date.day !== '') {
      return (
        this.due_date.year + '-' + this.due_date.month + '-' + this.due_date.day
      );
    }
  }

  setDateTime(): void {
    this.selectedDate = moment(this.getDateTime()).format('YYYY-MM-DD');
    close();
  }

  getUpdateDateTime(): any {
    if (this.update_due_date.day !== '') {
      return (
        this.update_due_date.year +
        '-' +
        this.update_due_date.month +
        '-' +
        this.update_due_date.day
      );
    }
  }

  setUpdateDateTime(): void {
    this.selectedDate = moment(this.getUpdateDateTime()).format('YYYY-MM-DD');
    close();
  }

  changeCommandLabel($event): void {
    this.commandLabel = $event;
    this.error = '';
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.filter();
  }

  filter(): void {
    const reg = new RegExp(this.searchStr, 'gi');
    this.filterVideos = this.videos.filter((video) => {
      if (!reg.test(video.title)) {
        return false;
      }
      return true;
    });
    this.filterPdfs = this.pdfs.filter((pdf) => {
      if (!reg.test(pdf.title)) {
        return false;
      }
      return true;
    });
    this.filterImages = this.images.filter((image) => {
      if (!reg.test(image.title)) {
        return false;
      }
      return true;
    });
  }

  minDate;
  days = Array(29).fill(0);
  hours = Array(23).fill(0);

  tabs: TabItem[] = [
    { icon: 'i-icon i-video', label: 'VIDEO', id: 'videos' },
    { icon: 'i-icon i-pdf', label: 'PDF', id: 'pdfs' },
    { icon: 'i-icon i-notification', label: 'IMAGE', id: 'images' }
  ];
  selectedTab: TabItem = this.tabs[0];
}
