import { Component, OnInit, ViewChild } from '@angular/core';
import {
  TIMES,
  CALENDAR_DURATION,
  RECURRING_TYPE,
  QuillEditor
} from 'src/app/constants/variable.constants';
import { MatDialog } from '@angular/material/dialog';
import { QuillEditorComponent } from 'ngx-quill';
import { FileService } from '../../services/file.service';
import { ContactService } from 'src/app/services/contact.service';
import { OverlayService } from 'src/app/services/overlay.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarRecurringDialogComponent } from '../calendar-recurring-dialog/calendar-recurring-dialog.component';
import { Contact } from 'src/app/models/contact.model';
import * as moment from 'moment';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-calendar-overlay',
  templateUrl: './calendar-overlay.component.html',
  styleUrls: ['./calendar-overlay.component.scss']
})
export class CalendarOverlayComponent implements OnInit {
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
  contacts: Contact[] = [];
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
    private dialog: MatDialog,
    private fileService: FileService,
    private toast: ToastrService,
    private appointmentService: AppointmentService,
    private contactService: ContactService,
    private overlayService: OverlayService
  ) {}

  ngOnInit(): void {}

  update(): void {
    this.isLoading = true;
    this.selectedDateTime = moment(
      this.due_date.year + '-' + this.due_date.month + '-' + this.due_date.day
    ).format('YYYY-MM-DD');
    const duration = moment(this.selectedDateTime)
      .add(this.duration * 60, 'minutes')
      .format();
    this.event.due_start = this.selectedDateTime;
    this.event.due_end = duration;
    if (this.contacts.length > 0) {
      this.event.contacts.forEach((eventContact) => {
        this.contacts.forEach((selectContact) => {
          if (Object.values(selectContact).indexOf(eventContact._id) == -1) {
            this.event.remove_contacts.push(eventContact._id);
          }
        });
      });
      this.event.contacts = [];
      this.event.guests = [];
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
    if (this.event.recurrence_id) {
      this.dialog
        .open(CalendarRecurringDialogComponent, {
          position: { top: '40vh' },
          width: '100vw',
          maxWidth: '320px',
          disableClose: true
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            if (res.type == 'own') {
              delete this.event['recurrence_id'];
            }
            this.appointmentService
              .updateEvents(this.event, this.event.event_id)
              .subscribe(
                (res) => {
                  if (res['status'] == true) {
                    this.isLoading = false;
                    const data = {
                      recurrence_id: this.event.recurrence_id
                    };
                    this.toast.success('Event is updated successfully');
                    // this.dialogRef.close(data);
                  }
                },
                (err) => {
                  this.isLoading = false;
                  // this.dialogRef.close();
                }
              );
          } else {
            this.isLoading = false;
          }
        });
    } else {
      delete this.event['recurrence_id'];
      this.appointmentService
        .updateEvents(this.event, this.event.event_id)
        .subscribe(
          (res) => {
            if (res['status'] == true) {
              this.isLoading = false;
              const data = {
                recurrence_id: this.event.recurrence_id
              };
              this.toast.success('Event is updated successfully');
              // this.dialogRef.close(data);
            }
          },
          (err) => {
            this.isLoading = false;
            // this.dialogRef.close();
          }
        );
    }
  }

  create(): void {
    this.isLoading = true;
    this.event.contacts = [];
    this.event.guests = [];
    const date = moment(
      this.due_date.year +
        '-' +
        this.due_date.month +
        '-' +
        this.due_date.day +
        ' ' +
        this.due_time
    ).format();
    const duration = moment(date)
      .add(this.duration * 60, 'minutes')
      .format();
    this.event.due_start = date;
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
          // this.dialogRef.close(data);
        }
      },
      (error) => {
        this.isLoading = false;
      }
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
    this.selectedDateTime = moment(this.getDateTime()).format('YYYY-MM-DD');
    close();
  }

  overlayClose(): void {
    this.overlayService.close(null);
  }

  handleAddressChange(evt: any): void {
    this.event.location = evt.formatted_address;
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

  setRepeatEvent(): void {
    this.isRepeat = !this.isRepeat;
  }
}
