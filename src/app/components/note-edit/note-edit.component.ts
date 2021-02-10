import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from 'src/app/models/note.model';
import { NoteService } from 'src/app/services/note.service';

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent implements OnInit {
  saving = false;
  note: Note = new Note();
  contact: string = '';

  constructor(
    private dialogRef: MatDialogRef<NoteEditComponent>,
    private noteService: NoteService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    if (this.data) {
      if (this.data.type === 'deal') {
        this.note = { ...this.note, ...this.data.note.activity_detail[0] };
      } else {
        this.note = { ...this.note, ...this.data.note };
      }
      this.contact = this.data.contact_name;
    }
  }

  ngOnInit(): void {}

  update(): void {
    this.saving = true;
    this.noteService.update(this.note._id, this.note).subscribe((res) => {
      if (res) {
        this.saving = false;
        this.dialogRef.close(this.note);
      }
    });
  }
}
