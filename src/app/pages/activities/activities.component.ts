import { Component, OnInit } from '@angular/core';
import { ActivityService } from 'src/app/services/activity.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  DISPLAY_COLUMNS = [
    'contact_name',
    'contact_label',
    'activity',
    'contact_email',
    'contact_phone'
  ];
  ACTIVITY_ICONS = {
    videos: 'i-video',
    pdfs: 'i-pdf',
    emails: 'i-message'
  };
  constructor(
    public storeService: StoreService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.activityService.load(1);
  }
}
