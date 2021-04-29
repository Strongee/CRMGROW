import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-play-timelines',
  templateUrl: './play-timelines.component.html',
  styleUrls: ['./play-timelines.component.scss']
})
export class PlayTimelinesComponent implements OnInit, AfterViewInit {
  @Input('data') data: any = {};
  @Input('duration') duration: number = 0;
  gaps: any[] = [];
  @ViewChild('canvas') canvas: ElementRef;
  completion = 0;
  start = 0;
  end = 0;
  constructor() {}

  ngOnInit(): void {
    const duration = Math.ceil(this.duration / 1000);
    const watched = Math.ceil(this.data.duration / 1000);
    this.completion = parseFloat(((watched / duration) * 100).toFixed(2));
    if (watched / duration > 0.98) {
      this.gaps = [[0, duration]];
      this.start = 0;
      this.end = duration;
      return;
    }

    let start = 0;
    let end = 0;
    if (this.data.start || this.data.end) {
      start = Math.floor(this.data.start);
      end = Math.ceil(this.data.end);
    } else {
      end = Math.ceil(this.data.material_last);
      start = end - watched;
    }
    this.start = start;
    this.end = end;

    if (this.data.gaps && this.data.gaps.length) {
      this.gaps = this.data.gaps;
    } else {
      if (this.data.start || this.data.end) {
        if (start > end) {
          this.gaps = [
            [0, end],
            [this.data.start, duration]
          ];
        } else {
          this.gaps = [[start, end]];
        }
      } else if (this.data.material_last) {
        if (start < 0) {
          this.gaps = [
            [0, end],
            [duration - start, duration]
          ];
        } else {
          this.gaps = [[start, end]];
        }
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.canvas) {
      const duration = Math.ceil(this.duration / 1000);
      const canvas = <HTMLCanvasElement>this.canvas.nativeElement;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0000FF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      this.gaps.forEach((e) => {
        if (e.length == 2) {
          const start = Math.floor((e[0] / duration) * 300);
          const end = Math.floor((e[1] / duration) * 300);
          ctx.moveTo(start, 2);
          ctx.lineTo(end, 2);
        }
      });
      ctx.stroke();
    }
  }
}
