import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DetailActivity } from 'src/app/models/activityDetail.model';
import { Contact } from 'src/app/models/contact.model';
import { Note } from 'src/app/models/note.model';
import { HandlerService } from 'src/app/services/handler.service';
import { NoteService } from 'src/app/services/note.service';
import { DealsService } from '../../services/deals.service';
import { ToastrService } from 'ngx-toastr';
import { isEmptyHtml } from 'src/app/utils/functions';

@Component({
  selector: 'app-note-create',
  templateUrl: './note-create.component.html',
  styleUrls: ['./note-create.component.scss']
})
export class NoteCreateComponent implements OnInit {
  isSelected = false;
  contacts: Contact[] = [];
  note: Note = new Note();
  saving = false;
  saveSubscription: Subscription;
  type = '';
  dealId;

  constructor(
    private noteService: NoteService,
    private handlerService: HandlerService,
    private dealService: DealsService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<NoteCreateComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    if (this.data && this.data.deal) {
      this.type = 'deal';
      this.dealId = this.data.deal;
    }
    if (this.data && this.data.contacts) {
      this.isSelected = true;
      for (const contact of this.data.contacts) {
        this.contacts.push(contact);
      }
    }
  }

  ngOnInit(): void {}

  selectContact(event: Contact): void {
    if (event) {
      this.contacts.push(event);
    }
  }

  removeContact(contact: Contact): void {
    const index = this.contacts.findIndex((item) => item._id === contact._id);
    if (index >= 0) {
      this.contacts.splice(index, 1);
    }
  }

  submit(): void {
    if (!this.contacts.length) {
      return;
    }
    if (!this.note.content || isEmptyHtml(this.note.content)) {
      return;
    }
    const ids = [];
    this.contacts.forEach((e) => {
      ids.push(e._id);
    });
    if (this.type === 'deal') {
      const data = {
        contacts: ids,
        content: this.note.content,
        deal: this.dealId
      };
      this.saving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.saveSubscription = this.dealService
        .addNote(data)
        .subscribe((res) => {
          this.saving = false;
          this.dialogRef.close(res);
        });
    } else {
      if (ids.length > 1) {
        const data = {
          contacts: ids,
          content: this.note.content
        };
        this.saving = true;
        this.saveSubscription && this.saveSubscription.unsubscribe();
        this.saveSubscription = this.noteService
          .bulkCreate(data)
          .subscribe(() => {
            this.saving = false;
            this.toastr.success('Notes successfully added.');
            this.handlerService.activityAdd$(ids, 'note');
            this.dialogRef.close();
          });
      } else {
        const data = {
          contact: ids[0],
          content: this.note.content
        };
        this.saving = true;
        this.saveSubscription && this.saveSubscription.unsubscribe();
        this.saveSubscription = this.noteService
          .create(data)
          .subscribe((res) => {
            this.saving = false;
            if (res) {
              this.toastr.success('Notes successfully added.');
              this.handlerService.activityAdd$(ids, 'note');
              this.handlerService.registerActivity$(res);
              this.dialogRef.close();
            }
          });
      }
    }
  }
}
