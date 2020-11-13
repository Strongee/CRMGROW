import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-tag-delete',
  templateUrl: './tag-delete.component.html',
  styleUrls: ['./tag-delete.component.scss']
})
export class TagDeleteComponent implements OnInit {
  tagName = '';
  saving = false;

  constructor(
    private dialogRef: MatDialogRef<TagDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tagService: TagService
  ) {
    this.tagName = this.data.tagName;
  }

  ngOnInit(): void {}

  deleteField(): void {
    this.saving = true;
    this.tagService.tagDelete(this.tagName).subscribe(
      (res) => {
        if (res['status'] == true) {
          this.saving = false;
          this.dialogRef.close(this.tagName);
        }
      },
      (err) => {
        this.saving = false;
      }
    );
  }
}
