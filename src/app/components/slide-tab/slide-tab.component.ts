import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { TabItem } from '../../utils/data.types';
import * as _ from 'lodash';

@Component({
  selector: 'app-slide-tab',
  templateUrl: './slide-tab.component.html',
  styleUrls: ['./slide-tab.component.scss']
})
export class SlideTabComponent implements OnInit, AfterViewInit {
  @Input('tabs') tabs: TabItem[] = [];
  @Input('selected') selected: TabItem;
  @Input('type') type: string = '';
  @Output() onChange = new EventEmitter();
  @ViewChild('container') container: ElementRef;
  @ViewChild('indicator') indicator: ElementRef;
  tabIndicatorPos = { x: 0, width: 0 };

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const tabIndex = _.findIndex(this.tabs, { id: this.selected.id });
    const tabBound = this.container.nativeElement.children[
      tabIndex + 1
    ].getBoundingClientRect();
    const wrapper = this.container.nativeElement.getBoundingClientRect();
    this.indicator.nativeElement.style.left =
      Math.floor(tabBound.x - wrapper.x) + 'px';
    this.indicator.nativeElement.style.width =
      Math.floor(tabBound.width) + 'px';
  }

  changeTab(event: Event, item: TabItem): void {
    const tabBound = (<HTMLElement>event.target)
      .closest('.tab')
      .getBoundingClientRect();
    const wrapper = this.container.nativeElement.getBoundingClientRect();
    this.indicator.nativeElement.style.left =
      Math.floor(tabBound.x - wrapper.x) + 'px';
    this.indicator.nativeElement.style.width =
      Math.floor(tabBound.width) + 'px';
    this.onChange.emit(item);
  }
}
