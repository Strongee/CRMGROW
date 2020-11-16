import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  /**
   * Load Contact Detail information
   * @param _id: Contact id to load
   */
  loadContact(_id: string): void {}

  /**
   * Go to Contact List Page
   */
  goToBack(): void {}

  /**
   * Load Previous Contact Detail Information
   */
  prevContact(): void {}

  /**
   * Load Next Contact Detail Information
   */
  nextContact(): void {}

  /**
   * Delete the current contact
   */
  deleteContact(): void {}

  /**
   * Open dialog to merge
   */
  openMergeContactDlg(): void {}

  /**
   * Open the Campagin Dialog to assign the curent contact to the compaign list.
   */
  openCampaignAssignDlg(): void {}

  /**
   * Open the Contact Edit Dialog
   */
  openEditDlg(): void {}

  /**
   * Open dialog to create new group call
   */
  openGroupCallDlg(): void {}

  /**
   * Open Dialog to create new appointment
   */
  openAppointmentDlg(): void {}

  /**
   * Open Dialog to create new task
   */
  openTaskDlg(): void {}

  /**
   * Create Note
   */
  createNote(): void {}

  
}
