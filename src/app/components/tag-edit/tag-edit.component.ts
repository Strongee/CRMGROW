import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit {
  tagName = '';
  submitted = false;
  constructor(
    private dialogRef: MatDialogRef<TagEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    this.tagName = this.data.tagName;
  }

  updateTag(): void {
    this.tagService
      .tagUpdate(this.data.tagName, this.tagName)
      .subscribe((res) => {
        if (res['status'] == true) {
          this.dialogRef.close(this.tagName);
        }
      });
  }
}
