import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-files',
  templateUrl: './message-files.component.html',
  styleUrls: ['./message-files.component.scss']
})
export class MessageFilesComponent implements OnInit {
  @Input('info')
  public set info(info) {
    if (info && info.timeInfo) {
      this.timeline = info.timeInfo || [];
    }
    if (info && info.materials) {
      info.materials.forEach((e) => {
        this.materials[e._id] = e;
      });
    }
    if (info && info.trackers) {
      this.trackers = info.trackers;

      for (const material in this.trackers) {
        this.trackers[material].sort((a, b) =>
          new Date(a.updated_at) < new Date(b.updated_at) ? 1 : -1
        );
      }
    }
  }
  materials = {};
  timeline = [];
  trackers = {};

  constructor() {}

  ngOnInit(): void {}
}
