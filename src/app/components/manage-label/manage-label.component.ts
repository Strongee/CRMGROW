import { Component, OnInit } from '@angular/core';
import { LabelService } from '../../services/label.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { Label } from 'src/app/models/label.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { LabelEditColorComponent } from '../label-edit-color/label-edit-color.component';
import { LabelEditComponent } from '../label-edit/label-edit.component';

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

  editLabel(label: any): void {
    this.dialog
      .open(LabelEditComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        maxHeight: '400px',
        data: {
          label: label
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          label = res;
        }
      });
  }

  editLabelColor(): void {
    this.dialog
      .open(LabelEditColorComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        maxHeight: '400px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.color = res;
        }
      });
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
}
