import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssistantCreateComponent } from 'src/app/components/assistant-create/assistant-create.component';
import { AssistantPasswordComponent } from 'src/app/components/assistant-password/assistant-password.component';
import { AssistantRemoveComponent } from 'src/app/components/assistant-remove/assistant-remove.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { Guest } from 'src/app/models/guest.model';
import { GuestService } from 'src/app/services/guest.service';

@Component({
  selector: 'app-assistant',
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss']
})
export class AssistantComponent implements OnInit {
  guests: Guest[] = [];
  loading = false;
  toggling = false;
  constructor(private guestService: GuestService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadGuests();
  }

  /**
   * Load Guests
   */
  loadGuests(): void {
    this.loading = true;
    this.guestService.loadGuests().subscribe(
      (guests) => {
        this.loading = false;
        this.guests = guests;
      },
      () => {
        this.loading = false;
      }
    );
  }

  /**
   * Open Create Dialog
   */
  openCreateDialog(): void {
    this.dialog
      .open(AssistantCreateComponent, {
        ...DialogSettings.ASSISTANT
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.guests.push(res);
        }
      });
  }

  /**
   * Open delete Dialog & clean list after success
   */
  openDeleteDialog(): void {
    this.dialog
      .open(AssistantRemoveComponent, {
        ...DialogSettings.CONFIRM,
        data: this.guests[0]
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.guests = [];
        }
      });
  }

  /**
   * Open password edit dialog
   */
  openPasswordEditDialog(): void {
    this.dialog.open(AssistantPasswordComponent, {
      ...DialogSettings.ASSISTANT,
      data: this.guests[0]
    });
  }

  /**
   *
   */
  toggleAssistant(): void {
    const status = this.guests[0].disabled;
    this.guests[0].disabled = !status;
    this.toggling = true;
    this.guestService.update(this.guests[0]._id, this.guests[0]).subscribe(
      () => {
        this.toggling = false;
      },
      () => {
        this.toggling = false;
        this.guests[0].disabled = status;
      }
    );
  }
}
