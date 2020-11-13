import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-field-delete',
  templateUrl: './custom-field-delete.component.html',
  styleUrls: ['./custom-field-delete.component.scss']
})
export class CustomFieldDeleteComponent implements OnInit {
  field;

  constructor(
    private dialogRef: MatDialogRef<CustomFieldDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.field = this.data.field;
  }

  ngOnInit(): void {}

  deleteField(): void {
    this.dialogRef.close(true);
  }
}
