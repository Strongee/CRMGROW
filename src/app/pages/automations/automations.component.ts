import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationService } from 'src/app/services/automation.service';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { STATUS } from '../../constants/variable.constants';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AutomationAssignComponent } from '../../components/automation-assign/automation-assign.component';
import { Automation } from 'src/app/models/automation.model';

@Component({
  selector: 'app-automations',
  templateUrl: './automations.component.html',
  styleUrls: ['./automations.component.scss']
})
export class AutomationsComponent implements OnInit {
  STATUS = STATUS;

  userId = '';
  page = 1;
  deleting = false;

  constructor(
    public automationService: AutomationService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.profile$.subscribe((res) => {
      this.userId = res._id;
    });
    this.automationService.loadAll(true);
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
        message: 'Are you sure to delete the automation?',
        confirmLabel: 'Delete'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleting = true;
        this.automationService.delete(automation._id).subscribe(
          (response) => {
            this.deleting = false;
          },
          (err) => {
            this.deleting = false;
          }
        );
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
        if (res) {
        }
      });
  }
}
