import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  Output,
  EventEmitter,
  AfterViewInit,
  TemplateRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, ReplaySubject } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import {
  filter,
  tap,
  takeUntil,
  debounceTime,
  map,
  distinctUntilChanged
} from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-select-leader',
  templateUrl: './select-leader.component.html',
  styleUrls: ['./select-leader.component.scss']
})
export class SelectLeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input('resultItem') resultItemTemplate: TemplateRef<HTMLElement>;
  @Input('placeholder') placeholder = 'Search Team Leader';
  @Input('formPlaceholder') formPlaceholder = 'Search Team Leader';
  @Input('leader') leader = null;
  @Output() onSelect = new EventEmitter();

  formControl: FormControl = new FormControl();
  inputControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('selector') selector: MatSelect;

  protected _onDestroy = new Subject<void>();
  searching = false;
  filteredResults: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  teamLeaders: User[] = [];

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadLeaders();
    this.inputControl.valueChanges
      .pipe(
        takeUntil(this._onDestroy),
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        map((search) =>
          search
            ? this.teamLeaders.filter((e) => {
                if (JSON.stringify(e).indexOf(search) !== -1) {
                  return true;
                }
              })
            : this.teamLeaders
        )
      )
      .subscribe(
        (filtered) => {
          this.searching = false;
          this.filteredResults.next(filtered);
        },
        () => {
          this.searching = false;
        }
      );
    this.formControl.valueChanges.subscribe((val) => {
      this.onSelect.emit(val);
    });
  }

  ngAfterViewInit(): void {
    this.selector._positions = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
      }
    ];
  }

  ngOnDestroy(): void {}

  /**
   * This function loads the leaders(owners and editors) of teams that he owns or is included.
   */
  loadLeaders(): void {
    this.searching = true;
    this.teamService.loadLeaders().subscribe((data) => {
      this.searching = false;
      this.teamLeaders = data;
      this.filteredResults.next(this.teamLeaders);
    });
  }
}
