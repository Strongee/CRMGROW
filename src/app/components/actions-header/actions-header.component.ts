import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ActionItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-actions-header',
  templateUrl: './actions-header.component.html',
  styleUrls: ['./actions-header.component.scss']
})
export class ActionsHeaderComponent implements OnInit {
  @Input('actions')
  public set actions(_actions: ActionItem[]) {
    if (!this._actions.length) {
      this._actions = _actions;
      this.showActions = _actions.slice(0, 5);
      this.moreActions = _actions.slice(5);
    }
  }
  @Output() doCommand: EventEmitter<any> = new EventEmitter();

  _actions: ActionItem[] = [];
  showActions: ActionItem[] = [];
  moreActions: ActionItem[] = [];

  @ViewChild('moreDrop') moreDrop: NgbDropdown;

  constructor() {}

  ngOnInit(): void {}

  runCommand(command: any, isMore: boolean = false): void {
    if (command.loading) {
      return;
    }
    this.doCommand.emit(command);
    if (isMore) {
      setTimeout(() => {
        this.moreDrop.open();
      }, 50);
    }
  }

  hasProp(action: ActionItem, property: string): boolean {
    return action.hasOwnProperty(property);
  }
}
