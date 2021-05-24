import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { AutomationService } from 'src/app/services/automation.service';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { STATUS } from '../../constants/variable.constants';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { AutomationAssignComponent } from '../../components/automation-assign/automation-assign.component';
import { Automation } from 'src/app/models/automation.model';
import { Contact } from 'src/app/models/contact.model';
import { AutomationStatusComponent } from 'src/app/components/automation-status/automation-status.component';
import { MatDrawer } from '@angular/material/sidenav';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team.model';
import { sortDateArray, sortStringArray } from '../../utils/functions';
import { AutomationBrowserComponent } from '../../components/automation-browser/automation-browser.component';
import * as _ from 'lodash';
import { searchReg } from 'src/app/helper';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-team-share-automation',
  templateUrl: './team-share-automation.component.html',
  styleUrls: ['./team-share-automation.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ])
  ]
})
export class TeamShareAutomationComponent implements OnInit, OnChanges {
  DISPLAY_COLUMNS = [
    'title',
    'owner',
    'action-count',
    'contacts',
    'created',
    'assign-action'
  ];
  STATUS = STATUS;

  userId = '';
  page = 1;
  deleting = false;

  selectedAutomation: string = '';

  detailLoading = false;
  detailLoadSubscription: Subscription;
  contacts: Contact[] = [];

  @Input('team') team: Team;
  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('detailPanel') detailPanel: AutomationStatusComponent;
  @Input('role') role: string;

  automations = [];
  filteredResult: Automation[] = [];
  searchStr = '';

  profileSubscription: Subscription;
  loadSubscription: Subscription;
  loading = false;
  searchCondition = {
    title: false,
    role: false,
    created_at: false
  };

  selectedSort = 'role';

  constructor(
    public automationService: AutomationService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService,
    private toastr: ToastrService,
    private teamService: TeamService,
    public storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((res) => {
      this.userId = res._id;
    });

    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.teamService.loadSharedAutomations(this.team._id);
    this.storeService.sharedAutomations$.subscribe(
      (res) => {
        console.log('###', res);
        this.loading = false;
        this.automations = res;
        this.filteredResult = this.automations;
        this.sort('role', true);
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  ngOnChanges(changes): void {
    if (changes.automations) {
      this.automations = [...changes.automations.currentValue];
      this.changeSearchStr();
    }
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.loadSubscription && this.loadSubscription.unsubscribe();
  }

  changeSearchStr(): void {
    this.filteredResult = this.automations.filter((item) => {
      return searchReg(item.title, this.searchStr);
    });
    this.page = 1;
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.changeSearchStr();
  }
  /**
   * Redirects to the selected Automation
   * @param event HTML Event
   * @param automation Automation to Open
   */
  openAutomation(event: Event, automation: Automation): void {
    event.stopPropagation();
    this.router.navigate(['/autoflow/edit/' + automation._id]);
  }

  /**
   * Redirect to the duplication link of the selected automation
   * @param event HTML Event
   * @param automation Automation to duplicate
   */
  duplicate(event: Event, automation: Automation): void {
    event.stopPropagation();
    this.router.navigate(['/autoflow/new/' + automation._id]);
  }

  /**
   * Open the dialog to assing the automation
   * @param event HTML Expansion click event
   * @param automation Automation to assign
   */
  assignAutomation(event: Event, automation: Automation): void {
    event.stopPropagation();
    this.dialog
      .open(AutomationAssignComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          automation
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.status) {
          this.automationService.reload();
        }
      });
  }

  create(): void {
    this.router.navigate([`/autoflow/new`]);
  }

  isStopSharable(automation): any {
    if (automation.user && automation.user._id === this.userId) {
      return true;
    }
    return false;
    // if (automation.role === 'admin') {
    //   return true;
    // } else {
    //   if (automation.role === 'team' && automation.user === this.userId) {
    //     return true;
    //   }
    // }
    // return false;
  }

  stopShareAutomation(automation): any {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          title: 'Stop Sharing',
          message: 'Are you sure to remove this automation?',
          cancelLabel: 'No',
          confirmLabel: 'Remove'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.teamService.removeAutomation(automation._id).subscribe(
            (res) => {
              const index = this.automations.findIndex(
                (item) => item._id === automation._id
              );
              if (index >= 0) {
                this.automations.splice(index, 1);
              }
              const filterIndex = this.filteredResult.findIndex(
                (item) => item._id === automation._id
              );
              if (filterIndex >= 0) {
                this.filteredResult.splice(filterIndex, 1);
              }
              this.toastr.success('You removed the automation successfully.');
            },
            (err) => {}
          );
        }
      });
  }

  shareAutomation(): void {
    const hideAutomations = [];
    for (const automation of this.automations) {
      hideAutomations.push(automation._id);
    }
    this.dialog
      .open(AutomationBrowserComponent, {
        width: '96vw',
        maxWidth: '940px',
        disableClose: true,
        data: {
          team_id: this.team._id,
          hideAutomations
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.automations) {
            this.automations = [...this.automations, ...res.automations];
            this.changeSearchStr();
          }
        }
      });
  }

  getOwner(automation): any {
    if (automation && automation.user) {
      if (automation.user._id === this.userId) {
        return 'Me';
      } else {
        return automation.user.user_name;
      }
    }
    return '--';
  }

  sort(field: string, keep: boolean = false): void {
    if (this.selectedSort !== field) {
      this.selectedSort = field;
      return;
    } else {
      if (field === 'role') {
        const admins = this.filteredResult.filter(
          (item) => item.role === 'admin'
        );
        const owns = this.filteredResult.filter(
          (item) => item.role === undefined
        );
        const teams = this.filteredResult.filter(
          (item) => item.role === 'team' && item.user === this.userId
        );
        const shared = this.filteredResult.filter(
          (item) => item.role === 'team' && item.user !== this.userId
        );
        let sortedAdmins, sortedOwns, sortedTeams, sortedShared;
        if (keep) {
          sortedAdmins = sortStringArray(admins, 'title', true);
          sortedOwns = sortStringArray(owns, 'title', true);
          sortedTeams = sortStringArray(teams, 'title', true);
          sortedShared = sortStringArray(shared, 'title', true);
        } else {
          sortedAdmins = sortStringArray(
            admins,
            'title',
            this.searchCondition[field]
          );
          sortedOwns = sortStringArray(
            owns,
            'title',
            this.searchCondition[field]
          );
          sortedTeams = sortStringArray(
            teams,
            'title',
            this.searchCondition[field]
          );
          sortedShared = sortStringArray(
            shared,
            'title',
            this.searchCondition[field]
          );
        }
        this.filteredResult = [];
        if (keep) {
          this.filteredResult = [
            ...sortedAdmins,
            ...sortedOwns,
            ...sortedTeams,
            ...sortedShared
          ];
        } else {
          if (this.searchCondition[field]) {
            this.filteredResult = [
              ...sortedAdmins,
              ...sortedOwns,
              ...sortedTeams,
              ...sortedShared
            ];
          } else {
            this.filteredResult = [
              ...sortedOwns,
              ...sortedTeams,
              ...sortedShared,
              ...sortedAdmins
            ];
          }
        }
      } else {
        this.filteredResult = sortStringArray(
          this.filteredResult,
          field,
          this.searchCondition[field]
        );
      }
      this.page = 1;
      if (!keep) {
        this.searchCondition[field] = !this.searchCondition[field];
      }
    }
  }
}
