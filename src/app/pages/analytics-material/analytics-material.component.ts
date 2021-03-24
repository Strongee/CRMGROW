import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { Subscription } from 'rxjs';
import { MaterialService } from '../../services/material.service';
import { LabelService } from '../../services/label.service';

@Component({
  selector: 'app-analytics-material',
  templateUrl: './analytics-material.component.html',
  styleUrls: ['./analytics-material.component.scss']
})
export class AnalyticsMaterialComponent implements OnInit {
  isLoading = false;
  loadSubcription: Subscription;
  analytics;
  material;
  topExpanded = true;
  contacts = [];
  labels = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private labelService: LabelService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params.id;
    if (id) {
      this.loadData(id);
      this.getLabels();
    }
  }

  loadData(id): void {
    this.isLoading = true;
    this.loadSubcription && this.loadSubcription.unsubscribe();
    this.loadSubcription = this.materialService
      .getAnalytics(id)
      .subscribe((res) => {
        this.isLoading = false;
        if (res) {
          this.analytics = res;
          for (const activity of this.analytics.watched_activity) {
            if (activity.contact && activity.contact.length) {
              const contact = {
                ...activity.contact[0],
                duration: activity.duration ? activity.duration : 0
              };
              this.contacts.push(contact);
            }
          }
        }
      });
  }

  getMaterialType(): string {
    if (this.analytics.video.type) {
      if (this.analytics.video.type === 'application/pdf') {
        return 'PDF';
      } else if (this.analytics.video.type.includes('image')) {
        return 'Image';
      }
    }
    return 'Video';
  }

  getAvatarName(contact): any {
    if (contact.first_name && contact.last_name) {
      return contact.first_name[0] + contact.last_name[0];
    } else if (contact.first_name && !contact.last_name) {
      return contact.first_name[0];
    } else if (!contact.first_name && contact.last_name) {
      return contact.last_name[0];
    }
    return 'UC';
  }

  getLabels(): any {
    // this.isLoading = true;
    this.labelService.getLabels().subscribe(async (res: any) => {
      this.labels = res.sort((a, b) => {
        return a.priority - b.priority;
      });
    });
  }

  getLabelById(id): any {
    let retVal = { color: 'white', font_color: 'black' };
    let i;
    for (i = 0; i < this.labels.length; i++) {
      if (this.labels[i]._id === id) {
        retVal = this.labels[i];
      }
    }
    return retVal;
  }

  changeExpanded(): void {
    this.topExpanded = !this.topExpanded;
  }

  toContact(id: string): void {
    this.router.navigate(['/contacts/' + id]);
  }
}
