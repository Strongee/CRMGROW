import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  AfterContentChecked,
  ElementRef
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { TIMES, ActionName } from 'src/app/constants/variable.constants';
import { MaterialService } from 'src/app/services/material.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { FileService } from 'src/app/services/file.service';
import { LabelService } from 'src/app/services/label.service';
import { UserService } from '../../services/user.service';
import { Task } from '../../models/task.model';
import { HtmlEditorComponent } from 'src/app/components/html-editor/html-editor.component';
import * as moment from 'moment';
import * as _ from 'lodash';
import { searchReg } from 'src/app/helper';
import { Template } from 'src/app/models/template.model';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-action-edit',
  templateUrl: './action-edit.component.html',
  styleUrls: ['./action-edit.component.scss']
})
export class ActionEditComponent implements OnInit, AfterContentChecked {
  category;
  type = '';
  action;
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
  selectedTemplate: Template = new Template();

  due_date = {
    year: '',
    month: '',
    day: ''
  };
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
  selectedTags = [];

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

  @ViewChild('editor') htmlEditor: HtmlEditorComponent;
  @ViewChild('searchInput') searchField: ElementRef;
  currentUser;

  error = '';

  selectedFollow: any;
  followUpdateOption = 'update_follow_up';
  updateFollowDueOption = 'date';
  update_due_date = {
    year: '',
    month: '',
    day: ''
  };
  update_due_time = '12:00:00.000';
  selectedDate = '';
  update_due_duration = 0;
  task = new Task();

  searchStr = '';
  filterMaterials = [];

  loadSubscription: Subscription;
  profileSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<ActionEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private materialService: MaterialService,
    private userService: UserService,
    private fileService: FileService,
    private dialog: MatDialog,
    private labelService: LabelService,
    public storeService: StoreService
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

    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((res) => {
      this.currentUser = res;
    });
  }

  ngOnInit(): void {
    this.materialService.loadMaterial(false);
    this.materialsLoading = true;
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
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        const nd = new Date(utc + 3600000 * timezone);
        this.due_date = {
          year: nd.getFullYear().toString(),
          month: (nd.getMonth() + 1).toString(),
          day: nd.getDate().toString()
        };
        this.setDateTime();
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
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        const nd = new Date(utc + 3600000 * timezone);
        this.update_due_date = {
          year: nd.getFullYear().toString(),
          month: (nd.getMonth() + 1).toString(),
          day: nd.getDate().toString()
        };
        this.setUpdateDateTime();
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

    const _SELF = this;
    setTimeout(() => {
      _SELF.action = { ..._SELF.data.action };
      if (_SELF.htmlEditor && _SELF.action.content) {
        _SELF.htmlEditor.setValue(_SELF.action.content);
      }
      if (_SELF.searchField) {
        _SELF.searchField.nativeElement.blur();
      }
    }, 300);

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
      this.loadSubscription = this.storeService.materials$.subscribe(
        (materials) => {
          if (materials.length > 0) {
            this.materialsLoading = false;
            const material = materials.filter(
              (item) => item.material_type == this.materialType
            );
            this.materials = material;
            this.filterMaterials = material;
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.loadSubscription && this.loadSubscription.unsubscribe();
  }

  ngAfterContentChecked(): void {}

  removeError(): void {
    this.error = '';
  }

  toggleMaterial(material): void {
    if (this.material && this.material._id) {
      if (material) {
        if (material._id !== this.material._id) {
          this.material = material;
        }
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
      if (!period && this.type !== 'note') {
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
    }
    if (this.type === 'follow_up') {
      if (this.followDueOption === 'date') {
        const time_zone = this.currentUser.time_zone;
        if (
          this.due_date.year !== '' &&
          this.due_date.month !== '' &&
          this.due_date.day !== ''
        ) {
          const due_date = new Date(
            `${this.due_date['year']}-${this.numPad(
              this.due_date['month']
            )}-${this.numPad(this.due_date['day'])}T${
              this.due_time
            }${time_zone}`
          );
          this.dialogRef.close({
            ...this.action,
            task_type: this.task.type,
            due_date: due_date,
            period,
            due_duration: undefined
          });
        }
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
          if (
            this.update_due_date.year !== '' &&
            this.update_due_date.month !== '' &&
            this.update_due_date.day !== ''
          ) {
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
              due_duration: undefined,
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
            due_date: undefined,
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
    if (this.type === 'note') {
      if (!this.action['content']) {
        return;
      }
    }

    this.dialogRef.close({ ...this.action, period });
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
        year: nd.getFullYear().toString(),
        month: (nd.getMonth() + 1).toString(),
        day: nd.getDate().toString()
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

  selectTemplate(event: Template): void {
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

  insertEmailContentValue(value: string): void {
    this.htmlEditor.insertEmailContentValue(value);
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
    this.htmlEditor.setValue(this.action['content']);
  }

  NoLimitActions = ['note', 'follow_up', 'update_contact', 'update_follow_up'];

  numPad(num): any {
    if (num < 10) {
      return '0' + num;
    }
    return num + '';
  }

  getDateTime(): any {
    if (this.due_date && this.due_date['day'] !== '') {
      return (
        this.due_date['year'] +
        '-' +
        this.due_date['month'] +
        '-' +
        this.due_date['day']
      );
    }
  }

  setDateTime(): void {
    this.selectedDate = moment(this.getDateTime()).format('YYYY-MM-DD');
    close();
  }

  getUpdateDateTime(): any {
    if (this.update_due_date && this.update_due_date['day'] !== '') {
      return (
        this.update_due_date['year'] +
        '-' +
        this.update_due_date['month'] +
        '-' +
        this.update_due_date['day']
      );
    }
  }

  setUpdateDateTime(): void {
    this.selectedDate = moment(this.getUpdateDateTime()).format('YYYY-MM-DD');
    close();
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.filter();
  }

  filter(): void {
    this.filterMaterials = this.materials.filter((item) => {
      return searchReg(item.title, this.searchStr);
    });
  }

  isMaterialSetting(): any {
    if (
      this.type === 'send_email_video' ||
      this.type === 'send_text_video' ||
      this.type === 'send_email_pdf' ||
      this.type === 'send_text_pdf' ||
      this.type === 'send_email_image' ||
      this.type === 'send_text_image'
    ) {
      return true;
    } else {
      return false;
    }
  }

  getMaterialType(material: any): string {
    if (material.type) {
      if (material.type === 'application/pdf') {
        return 'pdf';
      } else if (material.type.includes('image')) {
        return 'image';
      }
    }
    return 'video';
  }

  onChangeTemplate(template: Template): void {
    this.action['subject'] = template.subject;
  }

  ActionName = ActionName;

  minDate;
  days = Array(29).fill(0);
  hours = Array(23).fill(0);
}
