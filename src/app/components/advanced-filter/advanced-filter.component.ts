import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { LabelService } from '../../services/label.service';
import { COUNTRIES, DialogSettings } from '../../constants/variable.constants';
import {
  SearchOption,
  MaterialCondition
} from 'src/app/models/searchOption.model';
import { UserService } from '../../services/user.service';
import { ContactService } from 'src/app/services/contact.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterAddComponent } from '../filter-add/filter-add.component';
import { NotifyComponent } from '../notify/notify.component';
import { ConfirmComponent } from '../confirm/confirm.component';
import { FilterService } from 'src/app/services/filter.service';
import { Subscription } from 'rxjs';
import { MaterialBrowserComponent } from '../material-browser/material-browser.component';
import { TeamService } from 'src/app/services/team.service';
import { User } from 'src/app/models/user.model';
import { TabItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-advanced-filter',
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss']
})
export class AdvancedFilterComponent implements OnInit, OnDestroy {
  tabs: TabItem[] = [
    { label: 'Normal', id: 'normal', icon: '' },
    { label: 'Team', id: 'team', icon: '' }
  ];
  selectedTab: TabItem = this.tabs[0];

  loading = false;
  submitted = false;
  selectedSavedFilter;
  savedFilters = [];
  searchString = '';
  status = 'clear';
  materialActions = [];
  COUNTRIES = COUNTRIES;
  activities = [];
  fromDate = '';
  toDate = '';
  brokerages = [];
  sources = [];

  selectedMaterialActions = '';
  selectedMaterial = [];
  searchOption: SearchOption = new SearchOption();

  removing = false;
  removeSubscription: Subscription;

  teamSubscription: Subscription;
  teams = [];
  teamMembers = {};
  profileSubscription: Subscription;

  teamOptions = {}; // {team_id: {flag: 1|0|-1, members: User[]}
  isShareWith = false;
  isShareBy = false;

  currentFilterId = '';

  @Output() onClose = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    public labelService: LabelService,
    public contactService: ContactService,
    public userService: UserService,
    private teamService: TeamService,
    private filterService: FilterService
  ) {
    this.searchOption = this.contactService.searchOption.getValue();
    this.teamService.loadAll(false);
  }

  ngOnInit(): void {
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
      // {
      //   _id: 4,
      //   title: 'Log phone call'
      // },
      {
        _id: 5,
        title: 'Opened email'
      },
      {
        _id: 6,
        title: 'Sent video'
      },
      {
        _id: 7,
        title: 'Link clicked'
      },
      {
        _id: 8,
        title: 'Sent PDF'
      },
      {
        _id: 9,
        title: 'Watched video'
      },
      {
        _id: 10,
        title: 'Sent image'
      },
      {
        _id: 11,
        title: 'Reviewed PDF'
      },
      {
        _id: 12,
        title: 'Sent email'
      },
      {
        _id: 13,
        title: 'Reviewed image'
      }
    ];

    this.contactService.searchStr$.subscribe((searchStr) => {
      this.searchOption.str = searchStr;
    });

    this.profileSubscription = this.userService.profile$.subscribe((user) => {
      if (user._id) {
        this.teamSubscription = this.teamService.teams$.subscribe((teams) => {
          this.teams = teams.filter((e) => e.members.length);
          this.teams.forEach((e) => {
            const members = [...e.owner, ...e.members];
            const anotherMembers = members.filter((e) => e._id !== user._id);
            if (anotherMembers.length) {
              this.teamMembers[e._id] = [...anotherMembers];
              this.teamOptions[e._id] = {
                flag: -1,
                members: []
              };
            }
          });

          // this.teamOptions = this.searchOption.teamOptions;
          // if (Object.keys(this.teamOptions).length) {
          //   for (const team_id in this.teamOptions) {
          //     const teamOption = this.teamOptions[team_id];
          //     if (teamOption.members && teamOption.members.length) {
          //       const members = this.teamMembers[team_id].filter(
          //         (e) => teamOption.members.indexOf(e._id) !== -1
          //       );
          //       teamOption.members = members;
          //       if (members.length === this.teamMembers[team_id].length) {
          //         teamOption.flag = 1;
          //       }
          //     }
          //   }
          // }
        });
      }
    });
  }

  ngOnDestroy() {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.teamSubscription && this.teamSubscription.unsubscribe();
  }

  /**
   * Update the Search Str Subject in Contact Service.
   * @param str : string to search
   */
  updateSearchStr(str: string): void {
    this.contactService.searchStr.next(str);
  }
  clearSearchStr(): void {
    this.contactService.searchStr.next('');
  }

  updateFilter(): void {
    this.contactService.searchOption.next(
      new SearchOption().deserialize(this.searchOption)
    );
  }

  clearAllFilters(): void {
    this.currentFilterId = '';
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
    this.contactService.searchOption.next(
      new SearchOption().deserialize(this.searchOption)
    );
  }

  applyFilters(): void {}

  saveFilters(): void {
    const searchOption = this.contactService.searchOption.getValue();
    if (searchOption.isEmpty()) {
      this.dialog.open(NotifyComponent, {
        ...DialogSettings.ALERT,
        data: {
          title: 'Advanced Filter',
          message: 'Please set the filter option at least one.',
          cancelLabel: 'Close'
        }
      });
      return;
    }
    this.dialog.open(FilterAddComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '600px',
      data: {
        searchOption: this.searchOption,
        material: this.selectedMaterial
      }
    });
  }

  selectMaterialAction(title: string): void {
    if (this.selectedMaterialActions == title) {
      this.selectedMaterialActions = '';
      this.selectedMaterial = [];
      this.materialActions.forEach((action) => {
        action.count = 0;
      });
      this.searchOption.materialCondition = new MaterialCondition();
      this.contactService.searchOption.next(
        new SearchOption().deserialize(this.searchOption)
      );
    } else {
      this.selectedMaterialActions = title;
      this.materialActions.forEach((action) => {
        action.count = 0;
      });
      this.searchOption.materialCondition = new MaterialCondition();
      if (title === 'Material sent') {
        this.searchOption.materialCondition.sent_video.flag = true;
        this.searchOption.materialCondition.sent_pdf.flag = true;
        this.searchOption.materialCondition.sent_image.flag = true;
      } else if (title === 'No material sent') {
        this.searchOption.materialCondition.not_sent_video.flag = true;
        this.searchOption.materialCondition.not_sent_pdf.flag = true;
        this.searchOption.materialCondition.not_sent_image.flag = true;
      } else if (title === 'Material reviewed') {
        this.searchOption.materialCondition.watched_video.flag = true;
        this.searchOption.materialCondition.watched_pdf.flag = true;
        this.searchOption.materialCondition.watched_image.flag = true;
      } else if (title === 'Material not reviewed') {
        this.searchOption.materialCondition.not_watched_video.flag = true;
        this.searchOption.materialCondition.not_watched_pdf.flag = true;
        this.searchOption.materialCondition.not_watched_image.flag = true;
      }
      this.contactService.searchOption.next(
        new SearchOption().deserialize(this.searchOption)
      );
    }
  }

  selectMaterial(): void {
    this.dialog
      .open(MaterialBrowserComponent, {
        width: '96vw',
        maxWidth: '940px',
        disableClose: true,
        data: {
          title: 'Select media',
          multiple: false,
          onlyMine: false,
          buttonLabel: 'Select'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials) {
          this.selectedMaterial = [];
          this.selectedMaterial = [...this.selectedMaterial, ...res.materials];
          this.materialActions.forEach((action) => {
            action.count = 0;
            if (action.title == this.selectedMaterialActions) {
              action.count = res.length;
            }
          });
          if (
            this.selectedMaterial[0].material_type &&
            this.selectedMaterial[0].material_type.startsWith('video')
          ) {
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
          if (
            this.selectedMaterial[0].material_type &&
            this.selectedMaterial[0].material_type.startsWith('pdf')
          ) {
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
          if (
            this.selectedMaterial[0].material_type &&
            this.selectedMaterial[0].material_type.startsWith('image')
          ) {
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
          this.contactService.searchOption.next(
            new SearchOption().deserialize(this.searchOption)
          );
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
    this.contactService.searchOption.next(
      new SearchOption().deserialize(this.searchOption)
    );
  }

  toggleActivities(activity: string): void {
    if (
      activity == 'Sent image' ||
      activity == 'Reviewed PDF' ||
      activity == 'Reviewed image'
    ) {
      if (activity == 'Sent image') {
        this.searchOption.lastMaterial.send_image.flag = !this.searchOption
          .lastMaterial.send_image.flag;
      }
      if (activity == 'Reviewed PDF') {
        this.searchOption.lastMaterial.watched_pdf.flag = !this.searchOption
          .lastMaterial.watched_pdf.flag;
      }
      if (activity == 'Reviewed image') {
        this.searchOption.lastMaterial.watched_image.flag = !this.searchOption
          .lastMaterial.watched_image.flag;
      }
      this.contactService.searchOption.next(
        new SearchOption().deserialize(this.searchOption)
      );
    } else {
      const pos = this.searchOption.activityCondition.indexOf(
        this.activityDefine[activity]
      );
      if (pos !== -1) {
        this.searchOption.activityCondition.splice(pos, 1);
      } else {
        this.searchOption.activityCondition.push(this.activityDefine[activity]);
      }
      this.contactService.searchOption.next(
        new SearchOption().deserialize(this.searchOption)
      );
    }
  }

  toggleInclude(type: string): void {
    switch (type) {
      case 'label':
        this.searchOption.includeLabel = !this.searchOption.includeLabel;
        if (this.searchOption.labelCondition.length) {
          this.contactService.searchOption.next(
            new SearchOption().deserialize(this.searchOption)
          );
        }
        break;
      case 'source':
        this.searchOption.includeSource = !this.searchOption.includeSource;
        if (this.searchOption.sourceCondition.length) {
          this.contactService.searchOption.next(
            new SearchOption().deserialize(this.searchOption)
          );
        }
        break;
      case 'brokerage':
        this.searchOption.includeBrokerage = !this.searchOption
          .includeBrokerage;
        if (this.searchOption.brokerageCondition.length) {
          this.contactService.searchOption.next(
            new SearchOption().deserialize(this.searchOption)
          );
        }
        break;
      case 'tag':
        this.searchOption.includeTag = !this.searchOption.includeTag;
        if (this.searchOption.tagsCondition.length) {
          this.contactService.searchOption.next(
            new SearchOption().deserialize(this.searchOption)
          );
        }
        break;
      case 'stage':
        this.searchOption.includeStage = !this.searchOption.includeStage;
        if (this.searchOption.stagesCondition.length) {
          this.contactService.searchOption.next(
            new SearchOption().deserialize(this.searchOption)
          );
        }
        break;
    }
  }

  toggleTeam(team_id: string): void {
    const teamOption = this.teamOptions[team_id];
    if (teamOption) {
      if (teamOption.flag === -1) {
        teamOption.flag = 1;
        teamOption.members = [];
      } else if (teamOption.flag === 0) {
        teamOption.flag = 1;
        teamOption.members = [];
      } else if (teamOption.flag === 1) {
        teamOption.flag = -1;
        teamOption.members = [];
      }
    } else {
      this.teamOptions[team_id] = {
        flag: 1,
        members: []
      };
    }
    this.changeTeamSearch();
  }

  changeTeamMemberOptions(team_id: string, event: User[]): void {
    let teamOption = this.teamOptions[team_id];
    if (teamOption) {
      if (event.length) {
        if (event.length === this.teamMembers[team_id].length) {
          this.teamOptions[team_id].flag = 1;
        } else {
          this.teamOptions[team_id].flag = 0;
        }
      } else {
        this.teamOptions[team_id].flag = -1;
      }
    } else {
      this.teamOptions[team_id] = {
        flag: 0,
        members: []
      };
      this.teamOptions[team_id].members = event;
      if (event.length) {
        if (event.length === this.teamMembers[team_id].length) {
          this.teamOptions[team_id].flag = 1;
        } else {
          this.teamOptions[team_id].flag = 0;
        }
      } else {
        this.teamOptions[team_id].flag = -1;
      }
    }
    teamOption = this.teamOptions[team_id];
    this.changeTeamSearch();
  }

  changeTeamSearch(): void {
    let teamOptions = JSON.parse(JSON.stringify(this.teamOptions));
    for (const key in teamOptions) {
      if (teamOptions[key].flag === -1) {
        delete teamOptions[key];
      } else {
        const members = teamOptions[key].members.map((e) => e._id);
        teamOptions[key].members = members;
      }
    }
    let isShareBy = this.isShareBy;
    let isShareWith = this.isShareWith;
    if (!(this.isShareBy || this.isShareWith)) {
      isShareBy = true;
      isShareWith = true;
    }
    if (Object.keys(teamOptions).length) {
      for (const key in teamOptions) {
        if (isShareBy) {
          if (
            !teamOptions[key].members.length ||
            teamOptions[key].members.length === this.teamMembers[key].length
          ) {
            teamOptions[key]['share_by'] = {
              flag: 1
            };
          } else {
            teamOptions[key]['share_by'] = {
              flag: 0,
              members: teamOptions[key].members
            };
          }
        } else {
          teamOptions[key]['share_by'] = {
            flag: -1,
            members: []
          };
        }
        if (isShareWith) {
          if (
            !teamOptions[key].members.length ||
            teamOptions[key].members.length === this.teamMembers[key].length
          ) {
            teamOptions[key]['share_with'] = {
              flag: 1
            };
          } else {
            teamOptions[key]['share_with'] = {
              flag: -1,
              members: teamOptions[key].members
            };
          }
        } else {
          teamOptions[key]['share_with'] = {
            flag: -1,
            members: []
          };
        }
        if (isShareWith && isShareBy) {
          teamOptions[key].flag = 1;
        } else if (isShareWith || isShareBy) {
          teamOptions[key].flag = 0;
        } else {
          teamOptions[key].flag = -1;
        }
        delete teamOptions[key].members;
      }
    } else {
      isShareBy = this.isShareBy;
      isShareWith = this.isShareWith;
      if (isShareBy || isShareWith) {
        teamOptions = JSON.parse(JSON.stringify(this.teamOptions));
        for (const key in this.teamOptions) {
          if (isShareBy) {
            teamOptions[key]['share_by'] = {
              flag: 1,
              members: []
            };
          } else {
            teamOptions[key]['share_by'] = {
              flag: -1,
              members: []
            };
          }
          if (isShareWith) {
            teamOptions[key]['share_with'] = {
              flag: 1,
              members: []
            };
          } else {
            teamOptions[key]['share_with'] = {
              flag: -1,
              members: []
            };
          }
          if (isShareBy && isShareWith) {
            teamOptions[key]['flag'] = 1;
          } else if (isShareBy || isShareWith) {
            teamOptions[key]['flag'] = 0;
          } else {
            teamOptions[key]['flag'] = -1;
          }
        }
      } else {
        teamOptions = {};
      }
    }
    this.searchOption.teamOptions = teamOptions;
    this.contactService.searchOption.next(
      new SearchOption().deserialize(this.searchOption)
    );
  }

  enableTeamSearchOption(): boolean {
    if (Object.keys(this.searchOption.teamOptions).length) {
      return true;
    } else {
      return false;
    }
  }

  changeShareOption(option: string): void {
    if (option === 'share_with') {
      this.isShareWith = !this.isShareWith;
    } else {
      this.isShareBy = !this.isShareBy;
    }
    this.changeTeamSearch();
  }

  close(): void {
    this.onClose.emit();
  }

  changeCurrentFilter(filter: any): void {
    if (filter && filter._id) {
      this.currentFilterId = filter._id;
      this.contactService.searchOption.next(
        new SearchOption().deserialize(filter.content)
      );
      this.searchOption = new SearchOption().deserialize(filter.content);
    } else {
      this.clearAllFilters();
    }
  }

  updateFilters(): void {
    if (this.currentFilterId) {
      this.dialog.open(FilterAddComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '600px',
        data: {
          searchOption: this.searchOption,
          material: this.selectedMaterial,
          _id: this.currentFilterId
        }
      });
    }
  }

  removeFilters(): void {
    if (this.currentFilterId) {
      this.dialog
        .open(ConfirmComponent, {
          data: {
            title: 'Delete filter',
            message: 'Are you sure to delete the filter?',
            cancelLabel: 'No',
            confirmLabel: 'Delete'
          }
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            this.removing = true;
            this.removeSubscription && this.removeSubscription.unsubscribe();
            this.removeSubscription = this.filterService
              .remove(this.currentFilterId)
              .subscribe((status) => {
                this.removing = false;
                if (status) {
                  this.currentFilterId = '';
                  this.clearAllFilters();
                  // Remove from Service Subject
                  this.filterService.remove$(this.currentFilterId);
                }
              });
          }
        });
    }
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  activityDefine = {
    'Just added': 'contacts',
    'Added note': 'notes',
    'Task added': 'follow_ups',
    // 'Log phone call': 'phone_logs',
    'Opened email': 'email_trackers',
    'Sent video': 'videos',
    'Link clicked': '',
    'Sent PDF': 'pdfs',
    'Watched video': 'video_trackers',
    'Sent image': '',
    'Reviewed PDF': '',
    'Sent email': 'emails',
    'Reviewed image': ''
  };
}
