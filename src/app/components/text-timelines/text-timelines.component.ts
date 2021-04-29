import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DetailActivity } from 'src/app/models/activityDetail.model';

@Component({
  selector: 'app-text-timelines',
  templateUrl: './text-timelines.component.html',
  styleUrls: ['./text-timelines.component.scss']
})
export class TextTimelinesComponent implements OnInit {
  @Input('text') text: any = {};
  @Input('timelines')
  public set timelines(val: DetailActivity[]) {
    this._timelines = val;
    this._timelines.sort((a, b) =>
      a.type === 'texts' ? 1 : a.created_at > b.created_at ? -1 : 1
    );
    if (this._timelines && this._timelines.length) {
      this.main = this._timelines[0];
    }
    this.basic = this._timelines.filter((e) => e.type === 'texts')[0];
    if (this.basic.videos instanceof Array) {
      this._includedMaterials = [...this.basic.videos];
    }
    if (this.basic.pdfs instanceof Array) {
      this._includedMaterials = [
        ...this._includedMaterials,
        ...this.basic.pdfs
      ];
    }
    if (this.basic.images instanceof Array) {
      this._includedMaterials = [
        ...this._includedMaterials,
        ...this.basic.images
      ];
    }
    this._firstM = this._includedMaterials[0];
  }
  @Input('expanded') expanded: boolean = false;
  @Input('materials')
  public set materials(val) {
    this._materials = val;
  }
  @Output() onExpand = new EventEmitter();
  @Output() onCollapse = new EventEmitter();
  user_id: string = '';
  main: DetailActivity;
  basic: DetailActivity;
  _timelines: DetailActivity[] = [];
  _materials = {};
  _includedMaterials = [];
  _firstM: string;
  more = false;

  constructor() {}

  ngOnInit(): void {}

  expand(): void {
    this.onExpand.emit();
  }
  collapse(): void {
    this.more = false;
    this.onCollapse.emit();
  }
}
