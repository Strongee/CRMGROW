import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { AutomationCreateComponent } from '../../components/automation-create/automation-create.component';

@Component({
  selector: 'app-automations',
  templateUrl: './automations.component.html',
  styleUrls: ['./automations.component.scss'],
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
export class AutomationsComponent implements OnInit, OnDestroy {
  DISPLAY_COLUMNS = [
    'title',
    'owner',
    'action-count',
    'contacts',
    'created',
    'actions'
  ];
  PAGE_COUNTS = [
    { id: 8, label: '8' },
    { id: 10, label: '10' },
    { id: 25, label: '25' },
    { id: 50, label: '50' }
  ];
  STATUS = STATUS;

  pageSize = this.PAGE_COUNTS[1];

  userId = '';
  page = 1;
  deleting = false;

  selectedAutomation: string = '';

  detailLoading = false;
  detailLoadSubscription: Subscription;
  contacts: Contact[] = [];

  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('detailPanel') detailPanel: AutomationStatusComponent;

  automations: Automation[] = [];
  filteredResult: Automation[] = [];
  searchStr = '';

  profileSubscription: Subscription;
  loadSubscription: Subscription;

  constructor(
    public automationService: AutomationService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((res) => {
      this.userId = res._id;
    });
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.automationService.automations$.subscribe(
      (automations) => {
        this.automations = automations;
        this.filteredResult = automations;
      }
    );
    this.automationService.loadAll(true);
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.loadSubscription && this.loadSubscription.unsubscribe();
  }

  changeSearchStr(): void {
    const reg = new RegExp(this.searchStr, 'gi');
    const filtered = this.automations.filter((item) => {
      return reg.test(item.title);
    });
    this.filteredResult = filtered;
    this.page = 1;
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.changeSearchStr();
  }

  changePageSize(type: any): void {
    this.pageSize = type;
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
   * Open the delete confirm dlg to delete the automation
   * @param event HTML Expansion click event
   * @param automation Automation to delete
   */
  deleteAutomation(event: Event, automation: Automation): void {
    event.stopPropagation();
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Delete Automation',
        message: 'Are you sure you want to delete the automation?',
        confirmLabel: 'Delete'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleting = true;
        this.automationService.delete(automation._id).subscribe((status) => {
          this.deleting = false;
          if (status) {
            this.toastr.success('Automation is deleted successfully.');
            this.automationService.reload();
          }
        });
      }
    });
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
    this.dialog
      .open(AutomationCreateComponent, {
        width: '360px',
        maxWidth: '90vw'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
        }
      });
  }
}
