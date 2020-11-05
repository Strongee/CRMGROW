import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deals-detail',
  templateUrl: './deals-detail.component.html',
  styleUrls: ['./deals-detail.component.scss']
})
export class DealsDetailComponent implements OnInit {
  stages = [
    'New lead - Working',
    '50% Commited',
    'Opportunity Fully Presented',
    'ICA Completed',
    'Join Company'
  ];
  constructor(private router: Router) {}

  ngOnInit(): void {}

  backTasks(): void {
    this.router.navigate(['./deals']);
  }
}
