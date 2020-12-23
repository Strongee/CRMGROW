import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LabelService } from '../../services/label.service';
import { SelectionModel } from '@angular/cdk/collections';
import { COUNTRIES } from '../../constants/variable.constants';
import { SearchOption } from 'src/app/models/searchOption.model';
import { UserService } from '../../services/user.service';
import { ContactService } from 'src/app/services/contact.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterAddComponent } from '../filter-add/filter-add.component';
import { MaterialShareComponent } from '../material-share/material-share.component';

@Component({
  selector: 'app-advanced-filter',
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss']
})
export class AdvancedFilterComponent implements OnInit {
  loading = false;
  submitted = false;
  selectedSavedFilter;
  savedFilters = [];
  searchString = '';
  status = 'clear';
  materialActions = [];
  COUNTRIES = COUNTRIES;
  searchCountry = '';
  searchState = '';
  searchCity = '';
  searchZipCode = '';
  searchSource = '';
  searchCompany = '';
  searchTag = '';
  activities = [];
  fromDate = '';
  toDate = '';
  brokerages = [];
  sources = [];

  selectedMaterialActions = '';
  selectedMaterial = [];
  searchOption: SearchOption = new SearchOption();

  @Output() onClose = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    public labelService: LabelService,
    public contactService: ContactService,
    public userService: UserService
  ) {
    this.searchOption = this.contactService.searchOption.getValue();
  }

  ngOnInit(): void {
    this.savedFilters.push('Default');
    this.savedFilters.push('Hot leads with 1 material sent');
    this.savedFilters.push('Last month best contacts');
    this.savedFilters.push('Filter 1 test');
    this.savedFilters.push('Filter 3 test');
    this.savedFilters.push('Filter 2 test');
    this.selectedSavedFilter = this.savedFilters[0];

    this.materialActions = [
      {
        _id: 1,
        title: 'Material sent',
        count: 0
      },
      {
        _id: 2,
        title: 'No material sent',
        count: 0
      },
      {
        _id: 3,
        title: 'Material reviewed',
        count: 0
      },
      {
        _id: 4,
        title: 'Material not viewed',
        count: 0
      }
    ];

    this.activities = [
      {
        _id: 1,
        title: 'Just added'
      },
      {
        _id: 2,
        title: 'Added note'
      },
      {
        _id: 3,
        title: 'Task added'
      },
      {
        _id: 4,
        title: 'Watched material'
      },
      {
        _id: 5,
        title: 'Log phone call'
      },
      {
        _id: 6,
        title: 'Opened email'
      },
      {
        _id: 7,
        title: 'Sent video'
      },
      {
        _id: 8,
        title: 'Link clicked'
      },
      {
        _id: 9,
        title: 'Sent PDF'
      },
      {
        _id: 10,
        title: 'Watched video'
      },
      {
        _id: 11,
        title: 'Sent image'
      },
      {
        _id: 12,
        title: 'Reviewed PDF'
      },
      {
        _id: 13,
        title: 'Sent email'
      },
      {
        _id: 14,
        title: 'Reviewed image'
      }
    ];
  }

  /**
   * Update the Search Str Subject in Contact Service.
   * @param str : string to search
   */
  updateSearchStr(str: string): void {
    this.contactService.searchStr.next(str);
  }

  updateFilter(): void {
    this.contactService.searchOption.next(this.searchOption);
  }

  clearAllFilters(): void {
    this.selectedMaterial = [];
    this.selectedMaterialActions = '';
    this.materialActions.forEach((action) => {
      action.count = 0;
    });
    this.searchOption = new SearchOption();
    this.contactService.searchOption.next(this.searchOption);
  }

  clearLabel(): void {
    this.searchOption.includeLabel = true;
    this.searchOption.labelCondition = [];
    this.contactService.searchOption.next(this.searchOption);
  }

  applyFilters(): void {}

  saveFilters(): void {
    this.dialog
      .open(FilterAddComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '600px',
        data: {
          searchOption: this.searchOption,
          material: this.selectedMaterial
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.savedFilters.push(res);
        }
      });
  }

  selectMaterialAction(title: string): void {
    this.selectedMaterialActions = title;
  }

  selectMaterial(): void {
    this.dialog
      .open(MaterialShareComponent, {
        width: '96vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          type: 'filter'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.selectedMaterial = [];
          this.selectedMaterial = [...this.selectedMaterial, ...res];
          this.materialActions.forEach((action) => {
            action.count = 0;
            if (action.title == this.selectedMaterialActions) {
              action.count = res.length;
            }
          });
          if (this.selectedMaterial[0].type.startsWith('video')) {
            switch (this.selectedMaterialActions) {
              case 'Material sent':
                this.searchOption.materialCondition.sent_video.flag = true;
                this.searchOption.materialCondition.sent_video.material = this.selectedMaterial[0]._id;
                break;
              case 'No material sent':
                this.searchOption.materialCondition.not_sent_video.flag = true;
                this.searchOption.materialCondition.not_sent_video.material = this.selectedMaterial[0]._id;
                break;
              case 'Material reviewed':
                this.searchOption.materialCondition.watched_video.flag = true;
                this.searchOption.materialCondition.watched_video.material = this.selectedMaterial[0]._id;
                break;
              case 'Material not reviewed':
                this.searchOption.materialCondition.not_watched_video.flag = true;
                this.searchOption.materialCondition.not_watched_video.material = this.selectedMaterial[0]._id;
                break;
            }
          }
          if (this.selectedMaterial[0].type.endsWith('pdf')) {
            switch (this.selectedMaterialActions) {
              case 'Material sent':
                this.searchOption.materialCondition.sent_pdf.flag = true;
                this.searchOption.materialCondition.sent_pdf.material = this.selectedMaterial[0]._id;
                break;
              case 'No material sent':
                this.searchOption.materialCondition.not_sent_pdf.flag = true;
                this.searchOption.materialCondition.not_sent_pdf.material = this.selectedMaterial[0]._id;
                break;
              case 'Material reviewed':
                this.searchOption.materialCondition.watched_pdf.flag = true;
                this.searchOption.materialCondition.watched_pdf.material = this.selectedMaterial[0]._id;
                break;
              case 'Material not reviewed':
                this.searchOption.materialCondition.not_watched_pdf.flag = true;
                this.searchOption.materialCondition.not_watched_pdf.material = this.selectedMaterial[0]._id;
                break;
            }
          }
          if (this.selectedMaterial[0].type.startsWith('image')) {
            switch (this.selectedMaterialActions) {
              case 'Material sent':
                this.searchOption.materialCondition.sent_image.flag = true;
                this.searchOption.materialCondition.sent_image.material = this.selectedMaterial[0]._id;
                break;
              case 'No material sent':
                this.searchOption.materialCondition.not_sent_image.flag = true;
                this.searchOption.materialCondition.not_sent_image.material = this.selectedMaterial[0]._id;
                break;
              case 'Material reviewed':
                this.searchOption.materialCondition.watched_image.flag = true;
                this.searchOption.materialCondition.watched_image.material = this.selectedMaterial[0]._id;
                break;
              case 'Material not reviewed':
                this.searchOption.materialCondition.not_watched_image.flag = true;
                this.searchOption.materialCondition.not_watched_image.material = this.selectedMaterial[0]._id;
                break;
            }
          }
          this.contactService.searchOption.next(this.searchOption);
        }
      });
  }

  /**
   * Toggle Label for search
   * @param label : Label Id
   */
  toggleLabels(label: string): void {
    const pos = this.searchOption.labelCondition.indexOf(label);
    if (pos !== -1) {
      this.searchOption.labelCondition.splice(pos, 1);
    } else {
      this.searchOption.labelCondition.push(label);
    }
    this.contactService.searchOption.next(this.searchOption);
  }

  toggleActivities(activity: string): void {
    const pos = this.searchOption.activityCondition.indexOf(activity);
    if (pos !== -1) {
      this.searchOption.activityCondition.splice(pos, 1);
    } else {
      this.searchOption.activityCondition.push(activity);
    }
    this.contactService.searchOption.next(this.searchOption);
  }

  toggleInclude(type: string): void {
    switch (type) {
      case 'label':
        this.searchOption.includeLabel = !this.searchOption.includeLabel;
        if (this.searchOption.labelCondition.length) {
          this.contactService.searchOption.next(this.searchOption);
        }
        break;
      case 'source':
        this.searchOption.includeSource = !this.searchOption.includeSource;
        if (this.searchOption.sourceCondition.length) {
          this.contactService.searchOption.next(this.searchOption);
        }
        break;
      case 'brokerage':
        this.searchOption.includeBrokerage = !this.searchOption
          .includeBrokerage;
        if (this.searchOption.brokerageCondition.length) {
          this.contactService.searchOption.next(this.searchOption);
        }
        break;
      case 'tag':
        this.searchOption.includeTag = !this.searchOption.includeTag;
        if (this.searchOption.tagsCondition.length) {
          this.contactService.searchOption.next(this.searchOption);
        }
        break;
    }
  }

  close(): void {
    this.onClose.emit();
  }
}
