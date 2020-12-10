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
  newLabel: Label = new Label().deserialize({
    color: '#000',
    name: ''
  });
  labelLength = 0;
  constructor(private dialog: MatDialog, public labelService: LabelService) {}

  ngOnInit(): void {
    this.labelService.labels$.subscribe((labels) => {
      this.labelLength = 0;
      labels.forEach((e) => {
        if (e.role !== 'admin') {
          this.labelLength++;
        }
      });
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
          this.newLabel.color = res;
        }
      });
  }

  saveLabel(): void {
    this.labelService
      .createLabel(
        this.newLabel.deserialize({ priority: (this.labelLength + 1) * 1000 })
      )
      .subscribe((newLabel) => {
        if (newLabel) {
          this.labelService.create$(newLabel);
          this.newLabel = new Label().deserialize({
            color: '#000',
            name: ''
          });
        }
      });
  }

  editLabel(label: Label): void {
    this.dialog.open(LabelEditComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '400px',
      maxHeight: '400px',
      data: label
    });
  }

  removeLabel(label: Label): void {
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        message: 'Are you sure to remove the label?',
        cancelLabel: 'No',
        confirmLabel: 'Remove'
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.labelService.deleteLabel(label._id).subscribe((status) => {
          if (status) {
            this.labelService.delete$(label._id);
          }
        });
      }
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    this.labelService.changeOrder(event.previousIndex, event.currentIndex);
  }
}
