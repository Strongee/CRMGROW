import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contact } from 'src/app/models/contact.model';
import { Note } from 'src/app/models/note.model';

@Component({
  selector: 'app-note-create',
  templateUrl: './note-create.component.html',
  styleUrls: ['./note-create.component.scss']
})
export class NoteCreateComponent implements OnInit {
  isSelected = false;
  contacts: Contact[] = [];
  note: Note = new Note();
  constructor(
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

  submit(): void {}
}
