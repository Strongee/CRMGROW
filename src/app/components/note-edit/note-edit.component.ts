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

  constructor(
    private dialogRef: MatDialogRef<NoteEditComponent>,
    private noteService: NoteService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.note = this.data.note.activity_detail;
  }

  ngOnInit(): void {}

  update(): void {
    this.saving = true;
    this.noteService.update(this.note._id, this.note).subscribe((res) => {
      if (res == true) {
        this.saving = false;
        this.dialogRef.close();
      }
    });
  }
}
