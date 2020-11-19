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
  DefaultMessage,
  ActionName
} from 'src/app/constants/variable.constants';
import { MaterialService } from 'src/app/services/material.service';
import { Subscription } from 'rxjs';
import { TemplatesService } from 'src/app/services/templates.service';
import { FormControl } from '@angular/forms';
import { FileService } from 'src/app/services/file.service';
import { QuillEditorComponent } from 'ngx-quill';
import { LabelService } from 'src/app/services/label.service';
import { LabelComponent } from '../label/label.component';
import { UserService } from '../../services/user.service';
import {Task} from "../../models/task.model";

@Component({
  selector: 'app-action-edit',
  templateUrl: './action-edit.component.html',
  styleUrls: ['./action-edit.component.scss']
})
export class ActionEditComponent implements OnInit {
  category;
  type = '';
  action = {};
  submitted = false;

  materials = [];
  materialsLoading = false;
  materialsError = ''; // Load Error
  materialError = ''; // Select Error

  templateLoadingSubscription: Subscription;
  isProcessing = true;
  templates;
  templateLoadError = '';
  myControl = new FormControl();
  selectedTemplate = { subject: '', content: '' };

  due_date = {};
  due_time = '12:00:00.000';
  due_duration = 1;
  times = TIMES;
  followDueOption = 'date';

  // Contact Update
  contactUpdateOption = 'update_label';
  labels = [];
  labelsLoading = false;
  labelsLoadError = '';
  commandLabel = ''; // Label
  commandTags = []; // Tags

  mediaType = '';
  materialType = '';
  material;

  default = {
    sms: '',
    email: ''
  };

  periodOption = 'gap';
  parentId = false;

  plan_time = { day: 0, hour: 0, min: 0 };

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  currentUser;

  error = '';

  selectedFollow: any;
  followUpdateOption = 'update_follow_up';
  updateFollowDueOption = 'date';
  update_due_date = {};
  update_due_time = '12:00:00.000';
  update_due_duration = 0;
  task = new Task();

  constructor(
    private dialogRef: MatDialogRef<ActionEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private materialService: MaterialService,
    private templateService: TemplatesService,
    private userService: UserService,
    private fileService: FileService,
    private dialog: MatDialog,
    private labelService: LabelService
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
    this.getLabels();
    if (this.data.action.type.indexOf('email') !== -1) {
      this.mediaType = 'email';
    } else {
      this.mediaType = 'text';
    }
    if (this.data.action.type.indexOf('video') !== -1) {
      this.materialType = 'video';
      this.material = this.data.action.video;
    }
    if (this.data.action.type.indexOf('pdf') !== -1) {
      this.materialType = 'pdf';
      this.material = this.data.action.pdf;
    }
    if (this.data.action.type.indexOf('image') !== -1) {
      this.materialType = 'image';
      this.material = this.data.action.image;
    }
    if (this.data.action.type === 'follow_up') {
      console.log("automation data =============>", this.data);
      this.task.type = this.data.action.task_type;
      if (this.data.action.due_duration) {
        this.due_duration = this.data.action.due_duration;
        this.followDueOption = 'delay';
      } else if (this.data.action.due_date) {
        this.followDueOption = 'date';
        let timezone = this.currentUser.time_zone;
        timezone.replace(':', '.');
        timezone = parseFloat(timezone);
        const date = new Date(this.data.action.due_date);
        var utc = date.getTime() + date.getTimezoneOffset() * 60000;
        var nd = new Date(utc + 3600000 * timezone);
        this.due_date = {
          year: nd.getFullYear(),
          month: nd.getMonth() + 1,
          day: nd.getDate()
        };
        const hour = nd.getHours();
        const min = nd.getMinutes();
        const hour_s = hour < 10 ? '0' + hour : hour;
        const min_s = min < 10 ? '0' + min : min;
        const time = `${hour_s}:${min_s}:00.000`;
        this.times.some((e) => {
          if (e.id === time) {
            this.due_time = e.id;
            return true;
          }
        });
      }
    }
    if (this.data.action.type === 'update_contact') {
      this.contactUpdateOption = this.data.action.command;
      if (this.contactUpdateOption === 'update_label') {
        this.commandLabel = this.data.action.content;
      } else {
        this.commandTags = this.data.action.content;
      }
    }

    if (this.data.action.type === 'update_follow_up') {
      this.task.type = this.data.action.task_type;
      if (this.data.action.due_date) {
        this.updateFollowDueOption = 'update_due_date';
        let timezone = this.currentUser.time_zone;
        timezone.replace(':', '.');
        timezone = parseFloat(timezone);
        const date = new Date(this.data.action.due_date);
        var utc = date.getTime() + date.getTimezoneOffset() * 60000;
        var nd = new Date(utc + 3600000 * timezone);
        this.update_due_date = {
          year: nd.getFullYear(),
          month: nd.getMonth() + 1,
          day: nd.getDate()
        };
        const hour = nd.getHours();
        const min = nd.getMinutes();
        const hour_s = hour < 10 ? '0' + hour : hour;
        const min_s = min < 10 ? '0' + min : min;
        const time = `${hour_s}:${min_s}:00.000`;
        this.times.some((e) => {
          if (e.id === time) {
            this.update_due_time = e.id;
            return true;
          }
        });
      } else if (typeof this.data.action.due_duration === 'undefined') {
        this.updateFollowDueOption = 'no_update';
      } else {
        this.updateFollowDueOption = 'update_due_duration';
        this.update_due_duration = this.data.action.due_duration;
      }
      if (this.data.follows && this.data.follows.length) {
        this.data.follows.some((e) => {
          if (e.id === this.data.action.ref_id) {
            this.selectedFollow = e;
            return true;
          }
        });
      }
      this.followUpdateOption = this.data.action.command;
    }

    this.type = this.data.action.type;
    this.parentId = this.data.action.parent_id;

    this.action = { ...this.data.action };

    if (
      !(
        this.action['period'] === '0.17' ||
        this.action['period'] === '0.5' ||
        this.action['period'] === '1' ||
        this.action['period'] === '6' ||
        this.action['period'] === '12' ||
        this.action['period'] === '24' ||
        this.action['period'] === '48' ||
        this.action['period'] === '72' ||
        this.action['period'] === '168' ||
        this.action['period'] === '336' ||
        this.action['period'] === '0'
      )
    ) {
      let period = this.action['period'];
      this.plan_time['day'] = Math.floor(period / 24);
      period = period % 24;
      const min = period - Math.floor(period);
      this.plan_time['min'] = parseFloat(min.toFixed(2));
      this.plan_time['hour'] = Math.floor(period);
      this.action['period'] = 'custom_date';
    }

    if (this.materialType) {
      this.loadMaterials();
    }
    if (this.mediaType) {
      this.loadTemplates();
    }

  }

  loadMaterials(): void {
    if (this.materialType === 'video') {
      this.loadVideos();
    }
    if (this.materialType === 'pdf') {
      this.loadPdfs();
    }
    if (this.materialType === 'image') {
      this.loadImages();
    }
  }

  loadVideos(): void {
    this.materialsLoading = true;
    this.materialsError = '';
    this.materialService.loadVideosImpl().subscribe(
      (res) => {
        this.materials = res;
        this.materialsLoading = false;
      },
      (err) => {
        this.materialsLoading = false;
      }
    );
  }

  loadPdfs(): void {
    this.materialsLoading = true;
    this.materialsError = '';
    this.materialService.loadPdfsImpl().subscribe(
      (res) => {
        this.materialsLoading = false;
        this.materials = res;
      },
      (err) => {
        this.materialsLoading = false;
      }
    );
  }

  loadImages(): void {
    this.materialsLoading = true;
    this.materialsError = '';
    this.materialService.loadImagesImpl().subscribe(
      (res) => {
        this.materialsLoading = false;
        this.materials = res;
      },
      (err) => {
        this.materialsLoading = false;
      }
    );
  }

  getLabels(): void {
    this.labelsLoading = true;
    this.labelService.getLabels().subscribe(
      async (res: any) => {
        this.labels = res.sort((a, b) => {
          return a.priority - b.priority;
        });
        this.labels.unshift({
          _id: '',
          color: 'ghostwhite',
          font_color: 'gray',
          name: 'No Label'
        });
        this.labelsLoading = false;
      },
      (err) => {
        this.labelsLoading = false;
      }
    );
  }
  getLabelById(id): any {
    let retVal = { color: 'white', font_color: 'black' };
    let i;
    for (i = 0; i < this.labels.length; i++) {
      if (this.labels[i]._id === id) {
        retVal = this.labels[i];
      }
    }
    return retVal;
  }
  changeLabel(label): void {
    if (label !== 'createlabel') {
      this.commandLabel = label;
      if (this.commandLabel) {
        this.error = '';
      }
    } else {
      this.openLabelDialog();
    }
  }
  openLabelDialog(): void {
    this.dialog
      .open(LabelComponent, {
        position: { top: '5vh' },
        width: '96vw',
        maxWidth: '500px'
      })
      .afterClosed()
      .subscribe((res) => {
        this.getLabels();
      });
  }

  removeError(): void {
    this.error = '';
  }

  toggleMaterial(material): void {
    if (material) {
      if (material._id !== this.material._id) {
        this.material = material;
      } else {
        this.material = undefined;
      }
    }
  }

  updateAction(): void {
    let period = this.action['period'];
    if (!this.action['condition'] && this.action['period'] === 'custom_date') {
      period =
        this.plan_time['day'] * 24 +
        this.plan_time['hour'] * 1 +
        this.plan_time['min'] * 1;
      if (!period) {
        return;
      }
    }
    if (
      this.type === 'send_email_video' ||
      this.type === 'send_text_video' ||
      this.type === 'send_email_pdf' ||
      this.type === 'send_text_pdf' ||
      this.type === 'send_email_image' ||
      this.type === 'send_text_image'
    ) {
      if (!this.material['_id']) {
        this.materialError = `Please select ${this.materialType}  to send.`;
        return;
      } else {
        this.action[this.materialType] = this.material;
      }
      console.log("update ============>", this.material, this.materialType, this.action);
    }
    if (this.type === 'follow_up') {
      if (this.followDueOption === 'date') {
        const time_zone = this.currentUser.time_zone;
        const due_date = new Date(
          `${this.due_date['year']}-${this.numPad(
            this.due_date['month']
          )}-${this.numPad(this.due_date['day'])}T${this.due_time}${time_zone}`
        );
        this.dialogRef.close({
          ...this.action,
          task_type: this.task.type,
          due_date: due_date,
          period,
          due_duration: undefined
        });
      } else {
        this.dialogRef.close({
          ...this.action,
          task_type: this.task.type,
          due_duration: this.due_duration,
          period,
          due_date: undefined
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
        console.log('Update', {
          ...this.action,
          type: this.type,
          period,
          command,
          content
        });
        this.dialogRef.close({
          ...this.action,
          type: this.type,
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
            due_duration: undefined,
            due_date: undefined,
            period,
            command: 'update_follow_up',
            ref_id: this.selectedFollow.id
          });
        } else if (this.updateFollowDueOption === 'update_due_date') {
          const time_zone = this.currentUser.time_zone;
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
            due_date: due_date,
            period,
            command: 'update_follow_up',
            ref_id: this.selectedFollow.id
          });
        } else {
          this.dialogRef.close({
            ...this.action,
            type: this.type,
            task_type: this.task.type,
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
          period,
          command: 'complete_follow_up',
          ref_id: this.selectedFollow.id
        });
      }
      return;
    }
    this.dialogRef.close({ ...this.action, period });
  }

  loadTemplates(): any {
    if (this.mediaType) {
      this.templateLoadingSubscription &&
        this.templateLoadingSubscription.unsubscribe();
      this.isProcessing = true;
      this.templateLoadingSubscription = this.templateService
        .search('', { type: this.mediaType })
        .subscribe(
          (res) => {
            this.isProcessing = false;
            this.templates = res;
            this.selectedTemplate = { subject: '', content: '' };
            this.templates.some((e) => {
              const defaultTemplate =
                this.mediaType === 'email'
                  ? this.default['email']
                  : this.default['sms'];
              if (e._id === defaultTemplate) {
                this.selectedTemplate = { ...e, _id: undefined };
                return true;
              }
            });
          },
          (err) => {
            this.isProcessing = false;
          }
        );
    }
  }

  displayFn(template): any {
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
    if (this.selectedFollow.due_duration) {
      this.update_due_duration = this.selectedFollow.due_duration;
      this.updateFollowDueOption = 'delay';
    } else if (this.selectedFollow.due_date) {
      this.updateFollowDueOption = 'date';
      let timezone = this.currentUser.time_zone;
      timezone.replace(':', '.');
      timezone = parseFloat(timezone);
      const date = new Date(this.selectedFollow.due_date);
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const nd = new Date(utc + 3600000 * timezone);
      this.update_due_date = {
        year: nd.getFullYear(),
        month: nd.getMonth() + 1,
        day: nd.getDate()
      };
      const hour = nd.getHours();
      const min = nd.getMinutes();
      const hour_s = hour < 10 ? '0' + hour : hour;
      const min_s = min < 10 ? '0' + min : min;
      const time = `${hour_s}:${min_s}:00.000`;
      this.times.some((e) => {
        if (e.id === time) {
          this.update_due_time = e.id;
          return true;
        }
      });
    }
  }

  setMessage(): void {
    this.action['subject'] = this.selectedTemplate.subject;
    this.action['content'] = this.selectedTemplate.content;
  }

  selectTemplate(event): void {
    this.selectedTemplate = event;
    this.action['subject'] = this.selectedTemplate.subject;
    this.action['content'] = this.selectedTemplate.content;
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
  insertSubjectValue(value, field): void {
    let subject = this.action['subject'];
    subject =
      subject.substr(0, this.subjectCursorStart) +
      value +
      subject.substr(
        this.subjectCursorEnd,
        subject.length - this.subjectCursorEnd
      );
    this.subjectCursorStart = this.subjectCursorStart + value.length;
    this.subjectCursorEnd = this.subjectCursorStart;
    field.focus();
    this.action['subject'] = subject;
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
    let smsContent = this.action['content'];
    smsContent =
      smsContent.substr(0, this.smsContentCursorStart) +
      value +
      smsContent.substr(
        this.smsContentCursorEnd,
        smsContent.length - this.smsContentCursorEnd
      );
    this.smsContentCursorStart = this.smsContentCursorStart + value.length;
    this.smsContentCursorEnd = this.smsContentCursorStart;
    field.focus();
    this.action['content'] = smsContent;
  }

  insertEmailContentValue(value): void {
    const range = this.quillEditorRef.getSelection();
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

  NoLimitActions = ['note', 'follow_up', 'update_contact', 'update_follow_up'];

  config = QuillEditor;
  quillEditorRef;
  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
  }
  initImageHandler = () => {
    const imageInput = document.createElement('input');
    imageInput.setAttribute('type', 'file');
    imageInput.setAttribute('accept', 'image/*');
    imageInput.classList.add('ql-image');

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.fileService.attachImage(file).subscribe((res) => {
          this.insertImageToEditor(res['url']);
        });
      }
    });
    imageInput.click();
  };
  insertImageToEditor(url): void {
    const range = this.quillEditorRef.getSelection();
    // const img = `<img src="${url}" alt="attached-image-${new Date().toISOString()}"/>`;
    // this.quillEditorRef.clipboard.dangerouslyPasteHTML(range.index, img);
    this.emailEditor.quillEditor.insertEmbed(range.index, `image`, url, 'user');
    this.emailEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }

  numPad(num): any {
    if (num < 10) {
      return '0' + num;
    }
    return num + '';
  }

  ActionName = ActionName;

  minDate;
  days = Array(29).fill(0);
  hours = Array(23).fill(0);
}
