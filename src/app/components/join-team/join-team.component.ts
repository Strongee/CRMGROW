import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-join-team',
  templateUrl: './join-team.component.html',
  styleUrls: ['./join-team.component.scss']
})
export class JoinTeamComponent implements OnInit, OnDestroy {
  separatorKeyCodes: number[] = [ENTER, COMMA];

  @Input('placeholder') placeholder = 'Team or user';

  inputControl: FormControl = new FormControl();
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('auto') autoComplete: MatAutocomplete;

  protected _onDestroy = new Subject<void>();
  filteredUsers: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  filteredTeams: ReplaySubject<Team[]> = new ReplaySubject<Team[]>(1);

  selectedTeam: Team = null;
  selectedUser: User[] = [];
  searchedTeams: Team[] = [];
  searching = false;
  teamSearching = false;
  requesting = false;
  addOnBlur = false;
  error$: Subject<boolean> = new Subject<boolean>();
  isToggleTeam = false;
  skip = 0;
  pageCount = 8;
  keyword = '';
  teams = [];
  users = [];
  loadingMore = false;
  apiSubscription: Subscription;

  loadMoreSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<JoinTeamComponent>,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        filter((search) => {
          if (typeof search === 'string') {
            return !!search;
          } else {
            return false;
          }
        }),
        takeUntil(this._onDestroy),
        debounceTime(50),
        distinctUntilChanged(),
        tap(() => {
          this.searching = true;
        }),
        map((search) => {
          this.teams = [];
          this.users = [];
          this.keyword = search;
          this.skip = 0;
          return this.teamService.searchTeamUser(search);
        })
      )
      .subscribe((api) => {
        this.apiSubscription && this.apiSubscription.unsubscribe();
        this.apiSubscription = api.subscribe(
          (res) => {
            this.searching = false;
            res['team_array'] &&
              res['team_array'].forEach((e) => {
                this.teams.push(new Team().deserialize(e));
              });
            res['user_array'] &&
              res['user_array'].forEach((e) => {
                this.users.push(new User().deserialize(e));
              });
            this.filteredTeams.next(this.teams);
            this.filteredUsers.next(this.users);
          },
          () => {
            this.searching = false;
          }
        );
      });
  }
  ngOnDestroy(): void {}

  /**
   * Select Team or Team, Find teams that includes the selected User
   * @param event Mat Autocomplete select event
   */
  onSelectOption(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (value instanceof User) {
      // Search team...
      this.selectedUser = [value];
      this.selectedTeam = null;
      this.teamSearching = true;
      this.error$.next(true);
      this.teamService.searchTeamByUser(value._id).subscribe(
        (res) => {
          this.teamSearching = false;
          this.searchedTeams = res;
        },
        () => {
          this.teamSearching = false;
          this.searchedTeams = [];
        }
      );
    } else {
      // Select Team and User(Owner)
      this.searchedTeams = [value];
      this.selectedTeam = value;
      this.selectedUser = value.owner;
      this.error$.next(false);
    }
  }

  /**
   * select team to request joining
   * @param event: HTML Click event
   * @param team: Team Object
   */
  selectTeam(event: Event, team: Team): void {
    const target = <HTMLElement>event.target;
    if (target.classList.contains('deselect')) {
      return;
    }
    this.selectedTeam = team;
    this.error$.next(false);
  }

  /**
   * deselect the team
   */
  deselectTeam(): void {
    this.selectedTeam = null;
    this.error$.next(true);
  }

  /**
   * Send the request to join the selected team
   */
  requestJoin(): void {
    if (!this.selectedTeam) {
      this.error$.next(true);
      return;
    } else {
      const userIds = [];
      this.selectedUser.forEach((e) => {
        userIds.push(e._id);
      });
      this.requesting = true;
      this.teamService
        .requestJoin({
          team_id: this.selectedTeam._id,
          searchedUser: userIds.length === 1 ? userIds : undefined
        })
        .subscribe(
          () => {
            this.requesting = false;
            this.dialogRef.close();
          },
          () => {
            this.requesting = false;
          }
        );
    }
  }

  toggleTeam(): void {
    this.isToggleTeam = !this.isToggleTeam;
  }

  loadMore(): void {
    if (this.loadingMore) {
      return;
    }

    this.skip += this.pageCount;
    this.loadingMore = true;
    this.loadMoreSubscription && this.loadMoreSubscription.unsubscribe();
    this.loadMoreSubscription = this.teamService
      .searchTeamUser(this.keyword, this.skip)
      .subscribe((res) => {
        if (res) {
          this.loadingMore = false;
          res['team_array'] &&
            res['team_array'].forEach((e) => {
              this.teams.push(new Team().deserialize(e));
            });
          res['user_array'] &&
            res['user_array'].forEach((e) => {
              this.users.push(new User().deserialize(e));
            });
          this.filteredTeams.next(this.teams);
          this.filteredUsers.next(this.users);
        }
      });
  }

  showMore(): boolean {
    if (this.loadingMore) {
      return true;
    }

    if (this.isToggleTeam) {
      if (this.users.length >= this.skip + this.pageCount) {
        return true;
      }
    } else {
      if (this.teams.length >= this.skip + this.pageCount) {
        return true;
      }
    }
    return false;
  }
}
