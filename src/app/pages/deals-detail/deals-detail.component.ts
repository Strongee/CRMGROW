import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Contact } from 'src/app/models/contact.model';
import { Task } from 'src/app/models/task.model';
import { Note } from 'src/app/models/note.model';
import { ActivityDetail } from 'src/app/models/activityDetail.model';
import { TabItem } from 'src/app/utils/data.types';
import {
  TIMES,
  REPEAT_DURATIONS,
  QuillEditor
} from 'src/app/constants/variable.constants';
import { FileService } from '../../services/file.service';
import { NoteService } from 'src/app/services/note.service';
import { TaskService } from 'src/app/services/task.service';
import { StoreService } from 'src/app/services/store.service';
import * as moment from 'moment';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-deals-detail',
  templateUrl: './deals-detail.component.html',
  styleUrls: ['./deals-detail.component.scss']
})
export class DealsDetailComponent implements OnInit {
  stages = [
    'New lead - Working',
    '50% Commited',
    'Opportunity Fully Presented',
    'ICA Completed',
    'Join Company'
  ];
  contacts: Contact[] = [];
  leaderContacts: Contact[] = [];
  teamContacts: Contact[] = [];

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
  REPEAT_DURATIONS = REPEAT_DURATIONS;
  tabs: TabItem[] = [
    { icon: '', label: 'Send Email', id: 'send_email' },
    { icon: '', label: 'Send Text', id: 'send_text' },
    { icon: '', label: 'Note', id: 'note' },
    { icon: '', label: 'Add new task', id: 'add_task' }
  ];
  action: TabItem = this.tabs[0];
  mainTimelines: ActivityDetail[] = [];
  _id = '';
  activeHistory = 'all';

  task: Task = new Task();
  due_date = {
    year: '',
    month: '',
    day: ''
  };
  selectedDateTime;
  minDate: any;
  due_time = '12:00:00.000';
  times = TIMES;
  taskSaving = false;
  emailSubmitted = false;
  note: Note = new Note();
  noteSaving = false;

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

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private router: Router,
    private fileService: FileService,
    private noteService: NoteService,
    private taskService: TaskService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {}

  backTasks(): void {
    this.router.navigate(['./deals']);
  }

  sendEmail(): void {}

  createTask(): void {
    this.taskSaving = true;
    this.taskService
      .create({ ...this.task, contact: this._id })
      .subscribe((res) => {
        this.taskSaving = false;
        // this.storeService.registerActivity$(res);
        // this.storeService.activityAdd$([this._id], 'task');
      });
  }

  createNote(): void {
    this.noteSaving = true;
    this.noteService
      .create({ ...this.note, contact: this._id })
      .subscribe((res) => {
        this.noteSaving = false;
        // this.storeService.registerActivity$(res);
        // this.storeService.activityAdd$([this._id], 'note');
      });
  }

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
        this.fileService.attachImage(file).then((res) => {
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
}
