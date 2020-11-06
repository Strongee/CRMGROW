import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationService } from 'src/app/services/automation.service';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionName } from '../../constants/variable.constants';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-automations',
  templateUrl: './automations.component.html',
  styleUrls: ['./automations.component.scss']
})
export class AutomationsComponent implements OnInit {
  isLoading = false;
  automations = [];
  loadSubscription: Subscription;
  count = 0;
  page = 1;

  selectedAutomation;
  readSubscription: Subscription;
  automationDetails;
  isReading = false;

  deleting = false;

  contacts = [];
  statusDetails = {};
  assignedContacts = {};

  user_id = '';
  constructor(
    private automationService: AutomationService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService
  ) {

  }

  ngOnInit(): void {
    this.userService.profile$.subscribe((res) => {
      this.user_id = res._id;
      this.loadAll();
    });
  }

  loadAutomations(page): void {
    if (this.page !== page) {
      this.location.replaceState('/automation/' + page);
    }
    this.page = page;
    this.isLoading = true;
    this.automationService.getByPage(page).subscribe(
      (res) => {
        this.isLoading = false;
        if (res['data'] && res['data'].length) {
          this.automations = res['data'];
        }
        this.count = res['total'];
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  loadAll(): void {
    this.isLoading = true;
    this.automationService.loadAll().subscribe(
      (res) => {
        this.isLoading = false;
        const automations = res;
        const automationIds = [];
        automations.forEach((e) => {
          if (automationIds.indexOf(e._id) !== -1) {
            return;
          }
          automationIds.push(e._id);
          this.automations.push(e);
        });
        this.automations.sort((a, b) => {
          if (a.role === 'admin') {
            return -1;
          } else if (a.role === 'team' && a.user !== this.user_id) {
            return 1;
          } else {
            return 0;
          }
        });
        this.count = this.automations.length;
        console.log("automations =========>", automations);
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  showAutomation(): void {
    const automation = this.selectedAutomation;

    this.contacts = automation.contact;
    this.statusDetails = {};
    this.assignedContacts = {};
    this.isReading = true;
    if (!automation.contacts.length) {
      return;
    }

    const contacts = [];
    automation.contacts.forEach((e) => {
      contacts.push(e._id);
    });

    this.readSubscription && this.readSubscription.unsubscribe();
    this.readSubscription = this.automationService
      .getStatus(automation._id, contacts)
      .subscribe(
        (res) => {
          const automationDetails = res['timelines'];
          const assignedContacts = res['contacts'];
          automationDetails.forEach((e) => {
            const key = e['contact'] + '_' + e['ref'];
            this.statusDetails[key] = e['status'];
          });
          assignedContacts.forEach((e) => {
            this.assignedContacts[e._id] = e;
          });
          this.isReading = false;
        },
        (err) => {
          this.isReading = false;
        }
      );
  }

  togglePanel(event, automation): void {
    event.stopPropagation();
    if (
      !this.selectedAutomation ||
      this.selectedAutomation._id !== automation._id
    ) {
      this.selectedAutomation = automation;
      this.showAutomation();
    } else {
      this.selectedAutomation = undefined;
    }
  }

  openAutomation(event, automation): void {
    event.stopPropagation();
    this.router.navigate(['/autoflow/edit/' + automation._id]);
  }

  duplicate(event, automation): void {
    event.stopPropagation();
    this.router.navigate(['/autoflow/new/' + automation._id]);
  }

  assignAutomation(event, automation): void {
    // event.stopPropagation();
    // this.dialog.open(AutomationAssignComponent, {
    //   width: '100vw',
    //   maxWidth: '360px',
    //   data: {
    //     automation,
    //   }
    // }).afterClosed().subscribe(res => {
    //   if(res) {
    //
    //   }
    // })
  }

  deleteAutomation(event, automation): void {
    event.stopPropagation();
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        message: 'Are you sure to remove the automation?',
        cancelLabel: 'No',
        confirmLabel: 'Remove'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleting = true;
        this.automationService.delete(automation._id).subscribe(
          (response) => {
            // this.loadAutomations(this.page);
            this.loadAll();
          },
          (err) => {
            this.deleting = false;
          }
        );
      }
    });
  }
  ActionTypes = ActionName;
}
