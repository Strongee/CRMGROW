import { Component, Input, OnInit } from '@angular/core';
import { ActionItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-actions-bar',
  templateUrl: './actions-bar.component.html',
  styleUrls: ['./actions-bar.component.scss']
})
export class ActionsBarComponent implements OnInit {
  @Input('actions') actions: ActionItem[] = [];
  constructor() {}

  ngOnInit(): void {}
}
