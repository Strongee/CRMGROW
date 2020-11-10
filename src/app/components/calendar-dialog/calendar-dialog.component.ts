import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  TIMES,
  CALENDAR_DURATION,
  RECURRING_TYPE
} from 'src/app/constants/variable.constants';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { QuillEditorComponent } from 'ngx-quill';
import { FileUploader } from 'ng2-file-upload';
import { QuillEditor } from '../../constants/variable.constants';
import { UserService } from '../../services/user.service';
import { FileService } from '../../services/file.service';
import { HelperService } from '../../services/helper.service';
import { ContactService } from 'src/app/services/contact.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
import { Subscription } from 'rxjs';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-calendar-dialog',
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss']
})
export class CalendarDialogComponent implements OnInit {
  submitted = false;
  due_time = '12:00:00.000';
  due_date = {
    year: '',
    month: '',
    day: ''
  };
  selectedDateTime;
  minDate: any;
  event = {
    title: '',
    due_start: '',
    due_end: '',
    guests: [],
    contacts: [],
    calendar_id: '',
    location: '',
    description: '',
    event_id: '',
    recurrence: '',
    recurrence_id: '',
    remove_contacts: [],
    is_organizer: false
  };
  duration = 0.5;
  contacts = [];
  changeMode = 'create';
  isRepeat = false;
  isLoading = false;
  isUser = false;
  times = TIMES;
  calendar_durations = CALENDAR_DURATION;
  recurrings = RECURRING_TYPE;

  quillEditorRef: { getModule: (arg0: string) => any; getSelection: () => any };
  config = QuillEditor;
  focusEditor = '';

  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<CalendarDialogComponent>,
    private fileService: FileService,
    private userService: UserService,
    private toast: ToastrService,
    private appointmentService: AppointmentService,
    private helperService: HelperService,
    private contactService: ContactService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      if (this.data.user) {
        this.isUser = this.data.user;
        this.contacts = [...this.contacts, this.data.contact];
      }
      if (this.data.start_date) {
        this.due_date.year = this.data.start_date.getFullYear();
        this.due_date.month = this.data.start_date.getMonth() + 1;
        this.due_date.day = this.data.start_date.getDate();
        if (this.data.type != 'month') {
          let hour: string, minute: string;
          if (this.data.start_date.getHours().toString().length == 1) {
            hour = `0${this.data.start_date.getHours()}`;
          } else {
            hour = this.data.start_date.getHours();
          }
          if (this.data.start_date.getMinutes().toString().length == 1) {
            minute = `0${this.data.start_date.getMinutes()}`;
          } else {
            minute = this.data.start_date.getMinutes();
          }
          this.due_time = `${hour}:${minute}:00.000`;
        }
      }
      if (this.data.event) {
        this.event.title = this.data.event.title;
        this.event.location = this.data.event.meta.location;
        this.event.description = this.data.event.meta.description;
        this.event.recurrence = this.data.event.meta.recurrence;
        this.event.recurrence_id = this.data.event.meta.recurrence_id;
        this.event.contacts = this.data.event.meta.contacts;
        this.event.calendar_id = this.data.event.meta.calendar_id;
        this.event.is_organizer = this.data.event.meta.is_organizer;
        this.event.guests = this.data.event.meta.guests;
        if (this.data.event.meta.guests.length > 0) {
          this.data.event.meta.guests.forEach(
            (guest: { email: any; response: any }) => {
              this.contactService
                .getNormalSearch(guest.email)
                .subscribe((res) => {
                  if (res['status'] == true) {
                    if (res['data'].contacts.length > 0) {
                      res['data'].contacts[0].email_status = guest.response;
                      this.contacts = [
                        ...this.contacts,
                        res['data'].contacts[0]
                      ];
                    } else {
                      const firstname = res['data'].search.split('@')[0];
                      const contacts = {
                        first_name: firstname,
                        email: res['data'].search,
                        isNew: true,
                        email_status: guest.response
                      };
                      this.contacts = [...this.contacts, contacts];
                    }
                  }
                });
            }
          );
        }
        if (this.event.is_organizer) {
          this.isUser = this.event.is_organizer;
        }
        this.due_date.year = this.data.event.start.getFullYear();
        this.due_date.month = this.data.event.start.getMonth() + 1;
        this.due_date.day = this.data.event.start.getDate();
        const due_date = moment(
          this.due_date.year +
            '-' +
            this.due_date.month +
            '-' +
            this.due_date.day +
            ' ' +
            this.due_time
        ).format();
        const duration = moment(due_date)
          .add(this.duration * 60, 'minutes')
          .format();
        this.event.due_start = due_date;
        this.event.due_end = duration;
        let hour, minute;
        if (this.data.event.start.getHours().toString().length == 1) {
          hour = `0${this.data.event.start.getHours()}`;
        } else {
          hour = this.data.event.start.getHours();
        }
        if (this.data.event.start.getMinutes().toString().length == 1) {
          minute = `0${this.data.event.start.getMinutes()}`;
        } else {
          minute = this.data.event.start.getMinutes();
        }
        this.due_time = `${hour}:${minute}:00.000`;
        const start_hour = this.data.event.start.getHours();
        const end_hour = this.data.event.end.getHours();
        const start_minute = this.data.event.start.getMinutes();
        const end_minute = this.data.event.end.getMinutes();
        this.duration =
          end_hour - start_hour + (end_minute - start_minute) / 60;
        this.event.event_id = this.data.event.meta.event_id;
        if (this.data.event.meta.event_id) {
          this.changeMode = 'update';
        }
      }
    }
  }

  update(): void {}

  create(): void {
    this.isLoading = true;
    this.event.contacts = [];
    this.event.guests = [];
    const due_date = moment(
      this.due_date.year +
        '-' +
        this.due_date.month +
        '-' +
        this.due_date.day +
        ' ' +
        this.due_time
    ).format();
    const duration = moment(due_date)
      .add(this.duration * 60, 'minutes')
      .format();
    this.event.due_start = due_date;
    this.event.due_end = duration;
    if (this.contacts.length > 0) {
      this.contacts.forEach((contact) => {
        if (contact._id) {
          const data = {
            email: contact.email,
            _id: contact._id
          };
          this.event.contacts.push(data);
        }
        this.event.guests.push(contact.email);
      });
    }
    this.appointmentService.createEvents(this.event).subscribe(
      (res) => {
        if (res['status'] == true) {
          this.isLoading = false;
          const data = {
            event_id: res['event_id']
          };
          this.toast.success('New Event is created successfully');
          this.dialogRef.close(data);
        }
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  getDateTime(): any {
    // if (this.date.day) {
    //   return (
    //     this.date.year +
    //     '-' +
    //     this.date.month +
    //     '-' +
    //     this.date.day +
    //     ' ' +
    //     this.time.hour +
    //     ':' +
    //     this.time.minute
    //   );
    // }
    // return (
    //   this.date.year +
    //   '-' +
    //   this.date.month +
    //   '-' +
    //   this.minDate.day +
    //   ' ' +
    //   this.time.hour +
    //   ':' +
    //   this.time.minute
    // );
  }

  handleAddressChange(evt: any): void {
    this.event.location = evt.formatted_address;
  }

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

  setRepeatEvent(): void {
    this.isRepeat = !this.isRepeat;
  }
}
