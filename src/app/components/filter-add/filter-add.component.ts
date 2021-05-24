import { Component, Inject, OnInit } from '@angular/core';
import { LabelService } from '../../services/label.service';
import { SearchOption } from 'src/app/models/searchOption.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FilterService } from 'src/app/services/filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-add',
  templateUrl: './filter-add.component.html',
  styleUrls: ['./filter-add.component.scss']
})
export class FilterAddComponent implements OnInit {
  submitted = false;
  saving = false;
  saveSubscription: Subscription;
  filterName = '';
  filterCount = 0;
  selectedLabels = [];
  selectedAction = '';
  selectedMaterial = [];
  searchOption: SearchOption = new SearchOption();
  filterId = '';

  constructor(
    public labelService: LabelService,
    public filterService: FilterService,
    private dialogRef: MatDialogRef<FilterAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.searchOption = this.data.searchOption;
    if (this.data.material && this.data.material.length > 0) {
      this.selectedMaterial.push(this.data.material[0]);
    }
    if (this.data && this.data._id) {
      this.filterId = this.data._id;
      const filters = this.filterService.filters.getValue();
      filters.some((e) => {
        if (e._id === this.filterId) {
          this.filterName = e.title;
          return true;
        }
      });
    }
    this.labelService.getLabels().subscribe((res) => {
      if (res) {
        this.searchOption.labelCondition.forEach((selectLabel) => {
          res.forEach((label) => {
            if (label._id == selectLabel) {
              this.selectedLabels.push(label);
            }
          });
          if (selectLabel == null) {
            this.selectedLabels.push(null);
          }
        });
      }
    });
    if (this.searchOption.materialCondition.not_sent_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'No material sent';
    }
    if (this.searchOption.materialCondition.not_sent_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'No material sent';
    }
    if (this.searchOption.materialCondition.not_sent_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'No material sent';
    }
    if (this.searchOption.materialCondition.not_watched_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material not viewed';
    }
    if (this.searchOption.materialCondition.not_watched_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material not viewed';
    }
    if (this.searchOption.materialCondition.not_watched_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material not viewed';
    }
    if (this.searchOption.materialCondition.sent_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material sent';
    }
    if (this.searchOption.materialCondition.sent_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material sent';
    }
    if (this.searchOption.materialCondition.sent_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material sent';
    }
    if (this.searchOption.materialCondition.watched_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material reviewed';
    }
    if (this.searchOption.materialCondition.watched_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material reviewed';
    }
    if (this.searchOption.materialCondition.watched_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material reviewed';
    }
    if (
      this.searchOption.activityCondition.length ||
      this.searchOption.lastMaterial.send_image.flag ||
      this.searchOption.lastMaterial.watched_pdf.flag ||
      this.searchOption.lastMaterial.watched_image.flag
    ) {
      this.filterCount++;
    }
    if (this.searchOption.brokerageCondition.length) {
      this.filterCount++;
    }
    if (this.searchOption.cityCondition.length) {
      this.filterCount++;
    }
    if (this.searchOption.labelCondition.length) {
      this.filterCount++;
    }
    if (this.searchOption.regionCondition.length) {
      this.filterCount++;
    }
    if (this.searchOption.sourceCondition.length) {
      this.filterCount++;
    }
    if (this.searchOption.tagsCondition.length) {
      this.filterCount++;
    }
    if (this.searchOption.zipcodeCondition != '') {
      this.filterCount++;
    }
    if (this.searchOption.activityStart) {
      this.filterCount++;
    }
    if (this.searchOption.activityEnd) {
      this.filterCount++;
    }
  }

  ngOnInit(): void {}

  getMaterialType(): string {
    if (this.selectedMaterial.length > 0 && this.selectedMaterial[0].type) {
      if (this.selectedMaterial[0].type === 'application/pdf') {
        return 'PDF';
      } else if (this.selectedMaterial[0].type.includes('image')) {
        return 'Image';
      }
    }
    return 'Video';
  }

  saveFilter(): void {
    this.saving = true;
    this.saveSubscription && this.saveSubscription.unsubscribe();
    if (!this.filterId) {
      this.saveSubscription = this.filterService
        .create({
          title: this.filterName,
          content: this.searchOption
        })
        .subscribe((result) => {
          this.saving = false;
          if (result) {
            this.filterService.create$(result);
            this.dialogRef.close();
          }
        });
    } else {
      this.saveSubscription = this.filterService
        .update(this.filterId, {
          title: this.filterName,
          content: this.searchOption
        })
        .subscribe((result) => {
          this.saving = false;
          if (result) {
            this.dialogRef.close();
            this.filterService.update$(this.filterId, {
              title: this.filterName,
              content: this.searchOption
            });
          }
        });
    }
  }

  activityDefine = {
    contacts: 'Justadded',
    notes: 'Added note',
    follow_ups: 'Task added',
    // phone_logs: 'Log phone call',
    email_trackers: 'Opened email',
    videos: 'Sent video',
    pdfs: 'Sent PDF',
    video_trackers: 'Watched video',
    emails: 'Sent email'
  };
}
