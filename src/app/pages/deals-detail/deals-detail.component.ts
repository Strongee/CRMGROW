import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from 'src/app/services/store.service';
import { DealsService } from 'src/app/services/deals.service';
import { Deal } from 'src/app/models/deal.model';
import { Contact } from 'src/app/models/contact.model';
import { TabItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-deals-detail',
  templateUrl: './deals-detail.component.html',
  styleUrls: ['./deals-detail.component.scss']
})
export class DealsDetailComponent implements OnInit {
  deal = {
    main: new Deal(),
    activities: [],
    contacts: []
  };
  stages: any[] = [];
  selectedStage = '';
  dealPanel = true;
  contactsPanel = true;
  tabs: TabItem[] = [
    { icon: '', label: 'Activity', id: 'all' },
    { icon: '', label: 'Notes', id: 'notes' },
    { icon: '', label: 'Emails', id: 'emails' },
    { icon: '', label: 'Texts', id: 'texts' },
    { icon: '', label: 'Appointments', id: 'appointments' },
    { icon: '', label: 'Group Calls', id: 'group_calls' },
    { icon: '', label: 'Tasks', id: 'follow_ups' },
    { icon: '', label: 'Deals', id: 'deals' }
  ];
  action: TabItem = this.tabs[0];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dealsService: DealsService,
    private storeService: StoreService
  ) {
    this.dealsService.stages$.subscribe((res) => {
      this.stages = res;
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.dealsService.getDeal(id).subscribe((res) => {
        this.deal = res['data'];
        this.deal.contacts = (res['data']['contacts'] || []).map((e) =>
          new Contact().deserialize(e)
        );
        if (this.stages.length) {
          this.stages.forEach((stage) => {
            if (stage._id == res['data'].main.deal_stage) {
              this.selectedStage = stage.title;
            }
          });
        }
        console.log('###', this.deal);
      });
    }
  }

  backTasks(): void {
    this.router.navigate(['./deals']);
  }

  editDeal(): void {
    this.dealPanel = !this.dealPanel;
  }

  addContact(): void {
    this.contactsPanel = !this.contactsPanel;
  }

  changeTab(tab: TabItem): void {
    this.action = tab;
  }
}
