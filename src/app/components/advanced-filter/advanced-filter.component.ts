import { Component, OnInit } from '@angular/core';
import { LabelService } from '../../services/label.service';
import { SelectionModel } from '@angular/cdk/collections';
import { COUNTRIES } from '../../constants/variable.constants';
import { SearchOption } from 'src/app/models/searchOption.model';
import { UserService } from '../../services/user.service';
import { ContactService } from 'src/app/services/contact.service';

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

  selectedMaterialActions = new SelectionModel<any>(true, []);
  selectedActivities = new SelectionModel<any>(true, []);
  searchOption: SearchOption = new SearchOption();
  constructor(
    public labelService: LabelService,
    public contactService: ContactService,
    public userService: UserService
  ) {
    this.searchOption = this.contactService.searchOption.getValue();
  }

  ngOnInit(): void {

    this.userService.profile$.subscribe((res) => {
    });

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
        count: 1
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

  applyFilters(): void {}

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
}
