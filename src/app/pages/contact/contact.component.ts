import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContactDetail } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  TYPES = [
    {
      id: 'all',
      label: 'All actions'
    },
    {
      id: 'note',
      label: 'Notes'
    },
    {
      id: 'message',
      label: 'Messages'
    },
    {
      id: 'appointment',
      label: 'Appointments'
    },
    {
      id: 'group_call',
      label: 'Group Calls'
    },
    {
      id: 'task',
      label: 'Tasks'
    },
    {
      id: 'deal',
      label: 'Deals'
    }
  ];
  contact: ContactDetail = new ContactDetail();
  _id = '';
  next: string = null;
  prev: string = null;

  mainAction = 'send_message';
  activeHistory = 'all';
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private contactService: ContactService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this._id = this.route.snapshot.params['id'];
    this.loadContact(this._id);

    this.storeService.selectedContact$.subscribe((res) => {
      this.contact = res;
    });
  }

  /**
   * Load Contact Detail information
   * @param _id: Contact id to load
   */
  loadContact(_id: string): void {
    this.contactService.read(_id);
  }

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
