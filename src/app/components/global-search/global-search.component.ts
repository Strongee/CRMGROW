import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { STATUS } from 'src/app/constants/variable.constants';
import { AutomationService } from 'src/app/services/automation.service';
import { ContactService } from 'src/app/services/contact.service';
import { HandlerService } from 'src/app/services/handler.service';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { TeamService } from 'src/app/services/team.service';
import { TemplatesService } from 'src/app/services/templates.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {
  searchSubscription: Subscription;
  automationLoadSubscription: Subscription;
  templateLoadSubscription: Subscription;
  teamLoadSubscription: Subscription;
  materialLoadSubscription: Subscription;
  loadSubscription: Subscription[] = [];

  loading = {
    contacts: false,
    automations: false,
    templates: false,
    teams: false,
    materials: false
  };

  searchedResults = {
    contacts: [],
    automations: [],
    templates: [],
    teams: [],
    videos: [],
    pdfs: [],
    images: []
  };

  selectedMainResult = '';

  constructor(
    public handlerService: HandlerService,
    private storeService: StoreService,
    private contactService: ContactService,
    private materialService: MaterialService,
    private templateService: TemplatesService,
    private automationService: AutomationService,
    private teamService: TeamService
  ) {
    this.handlerService.searchStr$.subscribe((str) => {
      if (str) {
        this.selectedMainResult = '';

        this.loading['contacts'] = true;
        this.searchSubscription && this.searchSubscription.unsubscribe();
        this.searchSubscription = this.contactService
          .easySearch(str)
          .subscribe((contacts) => {
            this.loading['contacts'] = false;
            this.searchedResults['contacts'] = contacts;
          });

        // Load Cold Reload
        this.materialService.loadMaterial(false);
        this.templateService.loadAll(false);
        this.automationService.loadAll(false);
        this.teamService.loadAll(false);

        const reg = new RegExp(str, 'gi');

        this.materialLoadSubscription &&
          this.materialLoadSubscription.unsubscribe();
        this.materialLoadSubscription = this.storeService.materials$.subscribe(
          (materials) => {
            this.searchedResults['videos'] = materials.filter((e) => {
              if (e.material_type === 'video' && reg.test(e.title)) {
                return true;
              }
            });
            this.searchedResults['pdfs'] = materials.filter((e) => {
              if (e.material_type === 'pdf' && reg.test(e.title)) {
                return true;
              }
            });
            this.searchedResults['images'] = materials.filter((e) => {
              if (e.material_type === 'image' && reg.test(e.title)) {
                return true;
              }
            });
          }
        );

        this.templateLoadSubscription &&
          this.templateLoadSubscription.unsubscribe();
        this.templateLoadSubscription = this.templateService.templates$.subscribe(
          (templates) => {
            this.searchedResults['templates'] = templates.filter((e) => {
              return reg.test(e.title);
            });
          }
        );
        this.automationLoadSubscription &&
          this.automationLoadSubscription.unsubscribe();
        this.automationLoadSubscription = this.automationService.automations$.subscribe(
          (automations) => {
            this.searchedResults['automations'] = automations.filter((e) => {
              return reg.test(e.title);
            });
          }
        );
        this.teamLoadSubscription && this.teamLoadSubscription.unsubscribe();
        this.teamLoadSubscription = this.teamService.teams$.subscribe(
          (teams) => {
            this.searchedResults['teams'] = teams.filter((e) => {
              return reg.test(e.name);
            });
          }
        );
      }
    });

    this.loadSubscription[0] = this.materialService.loading$.subscribe(
      (status) => {
        if (status === STATUS.REQUEST || status === STATUS.NONE) {
          this.loading['materials'] = true;
        } else {
          this.loading['materials'] = false;
        }
      }
    );

    this.loadSubscription[1] = this.teamService.loading$.subscribe((status) => {
      if (status === STATUS.REQUEST || status === STATUS.NONE) {
        this.loading['teams'] = true;
      } else {
        this.loading['teams'] = false;
      }
    });

    this.loadSubscription[2] = this.automationService.loading$.subscribe(
      (status) => {
        if (status === STATUS.REQUEST || status === STATUS.NONE) {
          this.loading['automations'] = true;
        } else {
          this.loading['automations'] = false;
        }
      }
    );

    this.loadSubscription[3] = this.templateService.loading$.subscribe(
      (status) => {
        if (status === STATUS.REQUEST || status === STATUS.NONE) {
          this.loading['templates'] = true;
        } else {
          this.loading['templates'] = false;
        }
      }
    );
  }

  isLoading(): boolean {
    return (
      this.loading['contacts'] ||
      this.loading['automations'] ||
      this.loading['templates'] ||
      this.loading['teams'] ||
      this.loading['materials']
    );
  }

  getCount(): number {
    return (
      this.searchedResults['contacts'].length +
      this.searchedResults['automations'].length +
      this.searchedResults['templates'].length +
      this.searchedResults['teams'].length +
      this.searchedResults['videos'].length +
      this.searchedResults['images'].length +
      this.searchedResults['pdfs'].length
    );
  }

  seeAll(tab: string): void {
    this.selectedMainResult = tab;
  }

  ngOnInit(): void {}
}
