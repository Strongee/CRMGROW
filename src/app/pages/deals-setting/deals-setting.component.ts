import { Component, OnInit } from '@angular/core';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialog } from '@angular/material/dialog';
import { DealStage } from 'src/app/models/deal-stage.model';
import { DealStageCreateComponent } from 'src/app/components/deal-stage-create/deal-stage-create.component';
import { DealStageDeleteComponent } from 'src/app/components/deal-stage-delete/deal-stage-delete.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-deals-setting',
  templateUrl: './deals-setting.component.html',
  styleUrls: ['./deals-setting.component.scss']
})
export class DealsSettingComponent implements OnInit {
  stages: any[] = [];
  changeOrderSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    public dealsService: DealsService,
    private toastr: ToastrService
  ) {
    this.dealsService.getStage(true);
  }

  ngOnInit(): void {
    this.dealsService.stages$.subscribe((res) => {
      this.stages = res;
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    const stageOrder = {};
    this.stages.forEach((e, index) => {
      stageOrder[e._id] = index;
    });

    this.changeOrderSubscription && this.changeOrderSubscription.unsubscribe();
    this.changeOrderSubscription = this.dealsService
      .changeStageOrder(stageOrder)
      .subscribe((res) => {});
  }

  moveDelete(id: string): void {
    const idx = this.stages.findIndex((item) => item._id === id);
    if (idx >= 0) {
      if (this.stages[idx].deals && this.stages[idx].deals.length > 0) {
        if (this.stages.length > 1) {
          // move deals and delete stage
          this.dialog
            .open(DealStageDeleteComponent, {
              position: { top: '100px' },
              width: '100vw',
              maxWidth: '550px',
              disableClose: true,
              data: {
                deleteId: id
              }
            })
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                this.stages.some((e, index) => {
                  if (e._id === id) {
                    this.stages.splice(index, 1);
                  }
                });
              }
            });
        } else {
          // confirm delete deals and then delete stage
          const dialog = this.dialog.open(ConfirmComponent, {
            data: {
              title: 'Delete deal(s)',
              message: 'Are you sure to delete the deals in this stage?',
              confirmLabel: 'Delete'
            }
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.toastr.success('Deal Stage successfully deleted.');
              this.dealsService.deleteStage(id, null).subscribe((response) => {
                if (response) {
                  this.stages.splice(idx, 1);
                }
              });
            }
          });
        }
      } else {
        this.dealsService.deleteStage(id, null).subscribe((res) => {
          if (res) {
            this.toastr.success('Deal Stage successfully deleted.');
            this.stages.splice(idx, 1);
          }
        });
      }
    }
  }

  addStage(): void {
    this.dialog
      .open(DealStageCreateComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          priority: this.stages.length
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.toastr.success('Deal Stage successfully created.');
          this.dealsService.createStage$(new DealStage().deserialize(res));
        }
      });
  }
}
