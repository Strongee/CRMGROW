import { Component, OnInit } from '@angular/core';
import { LabelService } from '../../services/label.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { create } from 'domain';
import { COLORS } from 'src/app/constants/variable.constants';
import { Label } from 'src/app/models/label.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-manage-label',
  templateUrl: './manage-label.component.html',
  styleUrls: ['./manage-label.component.scss']
})
export class ManageLabelComponent implements OnInit {
  loading = false;
  color;
  editItem: Label = new Label().deserialize({
    color: '#000',
    name: 'Default color'
  });
  labelName = '';
  labelsLength = 3;
  constructor(private dialog: MatDialog, public labelService: LabelService) {}

  ngOnInit(): void {}

  saveLabel(): void {
    console.log('edit label ==========>', this.editItem);
    if (this.editItem) {
      const updateLabel = {
        ...this.editItem,
        color: this.color,
        name: this.labelName
      };
      this.labelService
        .updateLabel(this.editItem._id, updateLabel)
        .subscribe((res) => {
          if (res) {
            console.log('updated label ========>', res);
          }
        });
    } else {
      const createLabel = {
        color: this.color,
        name: this.labelName,
        font_color: 'black'
      };
      this.labelService
        .createLabel({
          ...createLabel,
          priority: (this.labelsLength + 1) * 1000
        })
        .subscribe((res) => {
          if (res) {
            console.log('updated label ========>', res);
          }
        });
    }
  }

  editLabel(label): void {
    this.editItem = label;
    this.labelName = label.name;
    this.color = this.editItem.color === '#FFF' ? '#000' : this.editItem.color;
  }

  removeLabel(label): void {
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        message: 'Are you sure to remove the label?',
        cancelLabel: 'No',
        confirmLabel: 'Remove'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.labelService.deleteLabel(label._id).subscribe((response) => {
          let i;
          // for (i = label.priority / 100; i < this.labels.length; i++) {
          //   const lb = this.labels[i];
          //   const tmp = lb;
          //   tmp['priority'] = lb.priority - 100;
          //   this.labelService
          //     .updateLabel(lb._id, tmp)
          //     .subscribe((result) => {});
          // }
        });
      }
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    this.labelService.changeOrder(event.previousIndex, event.currentIndex);
  }

  handleChange(evt): void {}

  COLORS = COLORS;
}
