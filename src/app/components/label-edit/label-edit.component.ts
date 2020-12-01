import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Label } from 'src/app/models/label.model';
import { LABEL_COLORS } from 'src/app/constants/variable.constants';
import { LabelEditColorComponent } from '../label-edit-color/label-edit-color.component';

@Component({
  selector: 'app-label-edit',
  templateUrl: './label-edit.component.html',
  styleUrls: ['./label-edit.component.scss']
})
export class LabelEditComponent implements OnInit {
  label: Label = new Label();
  labelColors = LABEL_COLORS;
  selectedColor = '';
  submitted = false;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<LabelEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.label = this.data.label;
  }

  ngOnInit(): void {}

  addColor(): void {
    this.dialog
      .open(LabelEditColorComponent, {
        position: { top: '400px' },
        width: '100vw',
        maxWidth: '400px',
        maxHeight: '400px'
      })
      .afterClosed()
      .subscribe((res) => {
        this.labelColors.forEach((label) => {
          if (label.type == 'custom') {
            label.color = res;
          }
        });
      });
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.label.color = color;
  }

  editLabel(): void {
    this.dialogRef.close(this.label);
  }
}
