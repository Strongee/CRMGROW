import { Component, OnInit } from '@angular/core';
import { DIAL_LEVEL } from 'src/app/constants/variable.constants';

@Component({
  selector: 'app-dial-plan',
  templateUrl: './dial-plan.component.html',
  styleUrls: ['./dial-plan.component.scss']
})
export class DialPlanComponent implements OnInit {
  currentPackage = DIAL_LEVEL.pro;
  selectedPackage = DIAL_LEVEL.pro;
  litePackage = DIAL_LEVEL.lite;
  proPackage = DIAL_LEVEL.pro;
  elitePackage = DIAL_LEVEL.elite;
  constructor() {}

  ngOnInit(): void {}

  clickPackage(level): void {
    this.selectedPackage = level;
  }

  planButtonLabel(level): string {
    if (level === this.currentPackage.package) {
      return 'Your Plan';
    } else {
      if (level === DIAL_LEVEL.lite.package) {
        return 'Downgrade';
      } else if (level === DIAL_LEVEL.pro.package) {
        if (this.currentPackage.package === DIAL_LEVEL.lite.package) {
          return 'Get Pro';
        } else {
          return 'Downgrade';
        }
      } else if (level === DIAL_LEVEL.elite.package) {
        return 'Get Elite';
      }
    }
  }

  selectPlan(level): void {
    for (const item in DIAL_LEVEL) {
      if (DIAL_LEVEL[item].package === level) {
        this.currentPackage = DIAL_LEVEL[item];
      }
    }
  }
}
