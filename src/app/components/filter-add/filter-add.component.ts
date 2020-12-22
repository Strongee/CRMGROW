import { Component, Inject, OnInit } from '@angular/core';
import { LabelService } from '../../services/label.service';
import { SearchOption } from 'src/app/models/searchOption.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-filter-add',
  templateUrl: './filter-add.component.html',
  styleUrls: ['./filter-add.component.scss']
})
export class FilterAddComponent implements OnInit {
  submitted = false;
  saving = false;
  filterName = '';
  filterCount = 0;
  selectedLabels = [];
  selectedAction = '';
  selectedMaterial = [];
  searchOption: SearchOption = new SearchOption();

  constructor(
    public labelService: LabelService,
    private dialogRef: MatDialogRef<FilterAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.searchOption = this.data.searchOption;
    this.labelService.getLabels().subscribe((res) => {
      if (res) {
        this.searchOption.labelCondition.forEach((selectLabel) => {
          res.forEach((label) => {
            if (label._id == selectLabel) {
              this.selectedLabels.push(label);
            }
          });
        });
      }
    });
    if (this.searchOption.materialCondition.not_sent_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'No material sent';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.not_sent_image.material
      );
    }
    if (this.searchOption.materialCondition.not_sent_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'No material sent';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.not_sent_pdf.material
      );
    }
    if (this.searchOption.materialCondition.not_sent_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'No material sent';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.not_sent_video.material
      );
    }
    if (this.searchOption.materialCondition.not_watched_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material not viewed';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.not_watched_image.material
      );
    }
    if (this.searchOption.materialCondition.not_watched_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material not viewed';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.not_watched_pdf.material
      );
    }
    if (this.searchOption.materialCondition.not_watched_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material not viewed';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.not_watched_video.material
      );
    }
    if (this.searchOption.materialCondition.sent_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material sent';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.sent_image.material
      );
    }
    if (this.searchOption.materialCondition.sent_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material sent';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.sent_pdf.material
      );
    }
    if (this.searchOption.materialCondition.sent_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material sent';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.sent_video.material
      );
    }
    if (this.searchOption.materialCondition.watched_image.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material reviewed';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.watched_image.material
      );
    }
    if (this.searchOption.materialCondition.watched_pdf.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material reviewed';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.watched_pdf.material
      );
    }
    if (this.searchOption.materialCondition.watched_video.flag == true) {
      this.filterCount++;
      this.selectedAction = 'Material reviewed';
      this.selectedMaterial.push(
        this.searchOption.materialCondition.watched_video.material
      );
    }
    if (this.searchOption.activityCondition.length) {
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
    if (this.selectedMaterial[0].type) {
      if (this.selectedMaterial[0].type === 'application/pdf') {
        return 'PDF';
      } else if (this.selectedMaterial[0].type.includes('image')) {
        return 'Image';
      }
    }
    return 'Video';
  }

  saveFilter(): void {
    this.dialogRef.close(this.filterName);
  }
}
