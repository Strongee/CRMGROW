import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { Note } from 'src/app/models/note.model';
import { HandlerService } from 'src/app/services/handler.service';
import { NoteService } from 'src/app/services/note.service';
import { StoreService } from 'src/app/services/store.service';

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

  constructor(
    private noteService: NoteService,
    private handlerService: HandlerService,
    private dialogRef: MatDialogRef<NoteCreateComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    if (this.data && this.data.contacts) {
      this.isSelected = true;
      this.contacts = this.data.contacts;
    }
  }

  ngOnInit(): void {}

  selectContact(event: Contact): void {
    this.contacts = [event];
  }

  submit(): void {
    if (!this.contacts.length) {
      return;
    }
    this.saving = true;
    const ids = [];
    this.contacts.forEach((e) => {
      ids.push(e._id);
    });
    const data = {
      contacts: ids,
      title: this.note.title,
      content: this.note.content
    };
    this.saveSubscription && this.saveSubscription.unsubscribe();
    this.saveSubscription = this.noteService
      .bulkCreate(data)
      .subscribe((res) => {
        this.saving = false;
        this.handlerService.activityAdd$(ids, 'note');
        this.dialogRef.close();
      });
  }
}
