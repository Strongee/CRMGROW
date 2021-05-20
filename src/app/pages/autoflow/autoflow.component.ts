import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewContainerRef
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DagreNodesOnlyLayout } from '../../variables/customDagreNodesOnly';
import { stepRound } from '../../variables/customStepCurved';
import { Layout, Edge, Node } from '@swimlane/ngx-graph';
import { ActionDialogComponent } from 'src/app/components/action-dialog/action-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  ACTION_CAT,
  AUTOMATION_ICONS,
  BulkActions,
  DialogSettings,
  ROUTE_PAGE
} from 'src/app/constants/variable.constants';
import { ActionEditComponent } from 'src/app/components/action-edit/action-edit.component';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { CaseConfirmComponent } from 'src/app/components/case-confirm/case-confirm.component';
import { AutomationService } from 'src/app/services/automation.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { PageCanDeactivate } from 'src/app/variables/abstractors';
import { UserService } from '../../services/user.service';
import { TabItem } from '../../utils/data.types';
import { SelectionModel } from '@angular/cdk/collections';
import { AutomationAssignComponent } from '../../components/automation-assign/automation-assign.component';
import { Contact, ContactActivity } from 'src/app/models/contact.model';
import { ContactService } from 'src/app/services/contact.service';
import { HandlerService } from 'src/app/services/handler.service';
import { saveAs } from 'file-saver';
import { SendEmailComponent } from 'src/app/components/send-email/send-email.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { ContactAssignAutomationComponent } from 'src/app/components/contact-assign-automation/contact-assign-automation.component';
import { NotifyComponent } from 'src/app/components/notify/notify.component';
import { MatDrawer } from '@angular/material/sidenav';
import { ContactBulkComponent } from 'src/app/components/contact-bulk/contact-bulk.component';
import { Automation } from '../../models/automation.model';
import { OverlayService } from 'src/app/services/overlay.service';
import { TeamMaterialShareComponent } from '../../components/team-material-share/team-material-share.component';

@Component({
  selector: 'app-autoflow',
  templateUrl: './autoflow.component.html',
  styleUrls: ['./autoflow.component.scss']
})
export class AutoflowComponent
  extends PageCanDeactivate
  implements OnInit, OnDestroy, AfterViewInit {
  layoutSettings = {
    orientation: 'TB'
  };
  center$: Subject<boolean> = new Subject();
  curve = stepRound;
  public layout: Layout = new DagreNodesOnlyLayout();

  initEdges = [];
  initNodes = [{ id: 'start', label: '' }];
  edges = [];
  nodes = [];

  _id;
  automation;
  automation_id;
  automation_title = '';
  isSaving = false;
  user_id;
  auth;
  created_at;
  identity = 1;
  submitted = false;
  saved = true;
  autoZoom = false;
  zoomLevel = 1;

  editMode = 'new';
  contacts = 0;
  selectedContacts = new SelectionModel<any>(true, []);
  labels = [];
  assignedContactLoading = false;
  deleting = false;
  loadSubscription: Subscription;

  tabs: TabItem[] = [
    { icon: '', label: 'Activity', id: 'activity' },
    { icon: '', label: 'Assigned contacts', id: 'contacts' }
  ];

  selectedTab: TabItem = this.tabs[0];

  CONTACT_ACTIONS = BulkActions.Contacts;
  DISPLAY_COLUMNS = [
    'select',
    'contact_name',
    'contact_label',
    'contact_tags',
    'contact_email',
    'contact_phone',
    'contact_address'
  ];
  PAGE_COUNTS = [
    { id: 8, label: '8' },
    { id: 10, label: '10' },
    { id: 25, label: '25' },
    { id: 50, label: '50' }
  ];
  pageSize = this.PAGE_COUNTS[0];
  page = 1;
  searchStr = '';
  selecting = false;
  selectSubscription: Subscription;
  selectSource = '';
  selection: Contact[] = [];
  pageSelection: Contact[] = [];
  pageContacts: ContactActivity[] = [];

  // Variables for Label Update
  isUpdating = false;
  updateSubscription: Subscription;
  searchSubscription: Subscription;

  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('editPanel') editPanel: ContactBulkComponent;
  panelType = '';
  @ViewChild('wrapper') wrapper: ElementRef;
  wrapperWidth = 0;
  wrapperHeight = 0;
  offsetX = 0;
  offsetY = 0;
  profileSubscription: Subscription;
  disableActions = [];
  isPackageGroupEmail = true;
  isPackageAutomation = true;

  constructor(
    private dialog: MatDialog,
    private automationService: AutomationService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private userService: UserService,
    public contactService: ContactService,
    private overlayService: OverlayService,
    private handlerService: HandlerService,
    private viewContainerRef: ViewContainerRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((res) => {
      this.user_id = res._id;
      this.isPackageGroupEmail = res.email_info?.mass_enable;
      this.isPackageAutomation = res.automation_info?.is_enabled;
      this.disableActions = [];
      if (!this.isPackageGroupEmail) {
        this.disableActions.push({
          label: 'Send email',
          type: 'button',
          icon: 'i-message',
          command: 'message',
          loading: false
        });
      }
      if (!this.isPackageAutomation) {
        this.disableActions.push({
          label: 'Add automation',
          type: 'button',
          icon: 'i-automation',
          command: 'automation',
          loading: false
        });
      }
      this.arrangeAutomationData();
    });

    this.automation_id = this.route.snapshot.params['id'];
    const title = this.route.snapshot.params['title'];
    const mode = this.route.snapshot.params['mode'];
    this.editMode = mode;
    let page = '';

    if (this.editMode !== 'new') {
      page = localStorage.getItem('automation');
    }

    if (page === 'contacts') {
      this.selectedTab = this.tabs[1];
    }
    if (title) {
      this.automation_title = title;
    }
    if (this.automation_id) {
      if (page !== 'contacts') {
        this.loadAutomation(this.automation_id, this.pageSize.id, 0);
      } else {
        if (this.editMode !== 'new') {
          this.loadContacts(this.automation_id, this.pageSize.id, 0);
        }
      }
    } else {
      this.auth = 'owner';
      const curDate = new Date();
      this.created_at = curDate.toISOString();
    }

    window['confirmReload'] = true;
  }

  ngOnDestroy(): void {
    // this.storeData();
    window['confirmReload'] = false;
  }

  ngAfterViewInit(): void {
    this.onResize(null);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.wrapperWidth = this.wrapper.nativeElement.offsetWidth;
  }

  loadAutomation(id: string, count: number, page: number): void {
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.automationService
      .get(id, count, page)
      .subscribe(
        (res) => {
          this.automation = res;
          this.contacts = this.automation.contacts.count;
          const mode = this.editMode;
          this.arrangeAutomationData();
          if (this.automation.contacts.contacts.length) {
            this.assignedContactLoading = true;
            this.automationService
              .getStatus(this.automation._id, this.automation.contacts.contacts)
              .subscribe((contacts) => {
                this.assignedContactLoading = false;
                this.pageContacts = [];
                if (this.editMode !== 'new') {
                  for (let i = 0; i < contacts.length; i++) {
                    const newContact = new ContactActivity().deserialize(
                      contacts[i]
                    );
                    this.pageContacts.push(newContact);
                  }
                }
              });
          }

          if (mode === 'edit') {
            this.automation_id = res['_id'];
            this.automation_title = res['title'];
          }

          const actions = res['automations'];
          this.composeGraph(actions);
        },
        (err) => {}
      );
  }

  loadContacts(id: string, count: number, page: number): void {
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.automationService
      .get(id, count, page)
      .subscribe(
        (res) => {
          this.automation = res;
          this.contacts = this.automation.contacts.count;
          const mode = this.route.snapshot.params['mode'];
          if (this.automation.contacts.contacts.length) {
            this.assignedContactLoading = true;
            this.automationService
              .getStatus(this.automation._id, this.automation.contacts.contacts)
              .subscribe((contacts) => {
                this.assignedContactLoading = false;
                this.pageContacts = [];
                for (let i = 0; i < contacts.length; i++) {
                  const newContact = new ContactActivity().deserialize(
                    contacts[i]
                  );
                  this.pageContacts.push(newContact);
                }
              });
          }

          if (mode === 'edit') {
            this.automation_id = res['_id'];
          }
          this.automation_title = res['title'];
        },
        (err) => {}
      );
  }

  arrangeAutomationData(): void {
    if (this.automation) {
      if (this.automation.role === 'admin') {
        this.auth = 'admin';
      } else if (this.automation.role === 'team') {
        if (this.automation.user === this.user_id) {
          this.auth = 'team';
        } else {
          this.auth = 'shared';
        }
      }
      this.created_at = this.automation.created_at;
    } else {
      this.auth = 'owner';
      const curDate = new Date();
      this.created_at = curDate.toISOString();
    }
  }

  composeGraph(actions): void {
    let maxId = 0;
    const ids = [];
    let missedIds = [];
    const currentIds = [];
    const nodes = [];
    const edges = [];
    const caseNodes = {}; // Case nodes pair : Parent -> Sub case actions
    const edgesBranches = []; // Edge Branches
    if (actions) {
      actions.forEach((e) => {
        const idStr = (e.id + '').replace('a_', '');
        const id = parseInt(idStr);
        if (maxId < id) {
          maxId = id;
        }
        currentIds.push(id);
      });
    }
    for (let i = 1; i <= maxId; i++) {
      ids.push(i);
    }
    missedIds = ids.filter(function (n) {
      return currentIds.indexOf(n) === -1;
    });

    if (actions) {
      actions.forEach((e) => {
        if (e.condition) {
          const node = {
            id: e.id,
            index: this.genIndex(e.id),
            period: e.period
          };
          if (e.action) {
            node['type'] = e.action.type;
            node['task_type'] = e.action.task_type;
            node['content'] = e.action.content;
            node['subject'] = e.action.subject;
            node['due_date'] = e.action.due_date;
            node['due_duration'] = e.action.due_duration;
            node['video'] = e.action.video;
            node['pdf'] = e.action.pdf;
            node['image'] = e.action.image;
            node['label'] = this.ACTIONS[e.action.type];
            node['category'] = ACTION_CAT.NORMAL;
            node['command'] = e.action.command;
            node['ref_id'] = e.action.ref_id;
          }
          nodes.push(node);
          let conditionType;
          if (e.watched_video) {
            conditionType = 'watched_video';
          } else if (e.watched_pdf) {
            conditionType = 'watched_pdf';
          } else if (e.watched_image) {
            conditionType = 'watched_image';
          } else {
            conditionType = 'opened_email';
          }
          if (e.condition.answer) {
            const yesNodeIndex = missedIds.splice(-1)[0];
            const yesNodeId = 'a_' + yesNodeIndex;
            const yesNode = {
              id: yesNodeId,
              index: yesNodeIndex,
              label: 'YES',
              leaf: false,
              category: ACTION_CAT.CONDITION,
              condition: { case: conditionType, answer: true }
            };
            nodes.push(yesNode);
            const bSource = e.parent;
            const bTarget = yesNodeId;
            const target = e.id;
            edges.push({
              id: bSource + '_' + bTarget,
              source: bSource,
              target: bTarget,
              category: 'case',
              answer: 'yes'
            });
            edges.push({
              id: bTarget + '_' + target,
              source: bTarget,
              target: target
            });
            edgesBranches.push(bSource);
            edgesBranches.push(bTarget);
            if (caseNodes[bSource]) {
              caseNodes[bSource].push(yesNode);
            } else {
              caseNodes[bSource] = [yesNode];
            }
          }
          if (!e.condition.answer) {
            const noNodeIndex = missedIds.splice(-1)[0];
            const noNodeId = 'a_' + noNodeIndex;
            const noNode = {
              id: noNodeId,
              index: noNodeIndex,
              label: 'NO',
              leaf: false,
              category: ACTION_CAT.CONDITION,
              condition: { case: conditionType, answer: false }
            };
            nodes.push(noNode);
            const bSource = e.parent;
            const bTarget = noNodeId;
            const target = e.id;
            edges.push({
              id: bSource + '_' + bTarget,
              source: bSource,
              target: bTarget,
              category: 'case',
              answer: 'no',
              hasLabel: true,
              type: conditionType
            });
            edges.push({
              id: bTarget + '_' + target,
              source: bTarget,
              target: target
            });
            edgesBranches.push(bSource);
            edgesBranches.push(bTarget);
            if (caseNodes[bSource]) {
              caseNodes[bSource].push(noNode);
            } else {
              caseNodes[bSource] = [noNode];
            }
          }
        } else {
          const node = {
            id: e.id,
            index: this.genIndex(e.id),
            period: e.period
          };
          if (e.action) {
            node['type'] = e.action.type;
            node['task_type'] = e.action.task_type;
            node['content'] = e.action.content;
            node['subject'] = e.action.subject;
            node['due_date'] = e.action.due_date;
            node['due_duration'] = e.action.due_duration;
            node['video'] = e.action.video;
            node['pdf'] = e.action.pdf;
            node['image'] = e.action.image;
            node['label'] = this.ACTIONS[e.action.type];
            node['category'] = ACTION_CAT.NORMAL;
            node['command'] = e.action.command;
            node['ref_id'] = e.action.ref_id;
          }
          nodes.push(node);
          if (e.parent !== '0') {
            const source = e.parent;
            const target = e.id;
            edges.push({ id: source + '_' + target, source, target });
            edgesBranches.push(source);
          }
        }
      });
    }

    // Uncompleted Case Branch Make
    for (const branch in caseNodes) {
      if (caseNodes[branch].length === 1) {
        let newNodeIndex = missedIds.splice(-1)[0];
        if (!newNodeIndex) {
          newNodeIndex = maxId;
          maxId++;
        }
        const newNodeId = 'a_' + newNodeIndex;
        const conditionType = caseNodes[branch][0].condition.case;
        if (caseNodes[branch][0].condition.answer) {
          // Insert False case
          const noNode = {
            id: newNodeId,
            index: newNodeIndex,
            label: 'NO',
            leaf: true,
            condition: { case: conditionType, answer: false },
            category: ACTION_CAT.CONDITION
          };
          nodes.push(noNode);
          const bSource = branch;
          const bTarget = newNodeId;
          edges.push({
            id: bSource + '_' + bTarget,
            source: bSource,
            target: bTarget,
            category: 'case',
            answer: 'no',
            hasLabel: true,
            type: conditionType
          });
        } else {
          // Insert true case
          const yesNode = {
            id: newNodeId,
            index: newNodeIndex,
            label: 'YES',
            leaf: false,
            condition: { case: conditionType, answer: true },
            category: ACTION_CAT.CONDITION
          };
          nodes.push(yesNode);
          const bSource = branch;
          const bTarget = newNodeId;
          edges.push({
            id: bSource + '_' + bTarget,
            source: bSource,
            target: bTarget,
            category: 'case',
            answer: 'yes'
          });
        }
      }
    }
    // Leaf Setting
    nodes.forEach((e) => {
      if (edgesBranches.indexOf(e.id) !== -1) {
        e.leaf = false;
      } else {
        e.leaf = true;
      }
    });
    this.identity = maxId;
    this.nodes = [...nodes];
    this.edges = [...edges];
  }
  genIndex(id): any {
    const idStr = (id + '').replace('a_', '');
    return parseInt(idStr);
  }

  insertAction(link = null): void {
    if (link) {
      const source = link.source;
      const target = link.target;
      const lastIndex = this.identity;
      const newId = 'a_' + (lastIndex + 1);

      const parents = this.getParents(source);
      const prevFollowUps = [];
      this.nodes.forEach((e) => {
        if (e.type === 'follow_up' && parents.indexOf(e.id) !== -1) {
          prevFollowUps.push(e);
        }
      });

      const actionDlg = this.dialog.open(ActionDialogComponent, {
        ...DialogSettings.AUTOMATION_ACTION,
        data: {
          follows: prevFollowUps
        }
      });
      actionDlg.afterClosed().subscribe((res) => {
        if (res) {
          const nodes = this.nodes;
          nodes.push({
            ...res,
            id: newId,
            index: lastIndex + 1,
            label: this.ACTIONS[res.type]
          });
          const edges = this.edges;
          edges.some((e, index) => {
            if (e.id === link.id) {
              edges.splice(index, 1);
              return true;
            }
          });
          edges.push({ id: source + '_' + newId, source, target: newId });
          edges.push({ id: newId + '_' + target, source: newId, target });
          this.identity++;
          this.nodes = [...nodes];
          this.edges = [...edges];
          this.saved = false;
        }
      });
    }
  }
  addAction(node = null): void {
    if (node) {
      const parents = this.getParents(node.id);
      const prevFollowUps = [];
      this.nodes.forEach((e) => {
        if (e.type === 'follow_up' && parents.indexOf(e.id) !== -1) {
          prevFollowUps.push(e);
        }
      });
      const currentId = node.id;
      const lastIndex = this.identity;
      let newId = 'a_' + (lastIndex + 1);
      // CONDITION ACTION HANDLER
      let conditionHandler = '';
      if (node.condition) {
        if (node.condition.answer) {
          conditionHandler = 'trueCase';
        } else {
          conditionHandler = 'falseCase';
        }
      }
      const actionDlg = this.dialog.open(ActionDialogComponent, {
        ...DialogSettings.AUTOMATION_ACTION,
        data: {
          currentAction: node.type,
          conditionHandler,
          follows: prevFollowUps
        }
      });
      actionDlg.afterClosed().subscribe((res) => {
        if (res) {
          if (res.category === ACTION_CAT.NORMAL) {
            node.leaf = false;
            const nodes = this.nodes;
            nodes.push({
              ...res,
              id: newId,
              index: lastIndex + 1,
              label: this.ACTIONS[res.type],
              leaf: true
            });
            const edges = this.edges;
            edges.push({
              id: currentId + '_' + newId,
              source: currentId,
              target: newId
            });
            this.identity += 1;
            this.nodes = [...nodes];
            this.edges = [...edges];
          } else {
            node.leaf = false;
            const nodes = this.nodes;
            nodes.push({
              ...res,
              id: newId,
              index: lastIndex + 1,
              label: 'YES',
              leaf: true,
              condition: { case: res.type, answer: true }
            });
            const edges = this.edges;
            edges.push({
              id: currentId + '_' + newId,
              source: currentId,
              target: newId,
              category: 'case',
              answer: 'yes'
            });
            newId = 'a_' + (lastIndex + 2);
            nodes.push({
              ...res,
              id: newId,
              index: lastIndex + 2,
              label: 'NO',
              leaf: true,
              condition: { case: res.type, answer: false }
            });
            edges.push({
              id: currentId + '_' + newId,
              source: currentId,
              target: newId,
              category: 'case',
              type: res.type,
              hasLabel: true,
              answer: 'no'
            });
            this.identity += 2;
            this.nodes = [...nodes];
            this.edges = [...edges];
          }
          this.saved = false;
        }
      });
    } else {
      const actionDlg = this.dialog.open(ActionDialogComponent, {
        ...DialogSettings.AUTOMATION_ACTION,
        data: {}
      });
      actionDlg.afterClosed().subscribe((res) => {
        if (res) {
          this.nodes.push({
            ...res,
            id: 'a_' + this.identity,
            index: this.identity,
            label: this.ACTIONS[res.type],
            leaf: true
          });
          this.saved = false;
        }
      });
    }
  }
  editAction(event, node): void {
    if (
      event.target.classList.contains('v-leaf') ||
      event.target.classList.contains('remove-action')
    ) {
      return;
    }
    const edge = _.find(this.edges, { target: node.id });
    let conditionHandler = '';
    if (edge) {
      const parentNode = _.find(this.nodes, { id: edge.source });
      if (parentNode && parentNode.condition) {
        if (parentNode.condition.answer) {
          conditionHandler = 'trueCase';
        } else {
          conditionHandler = 'falseCase';
        }
      }
    }

    const parents = this.getParents(node.id);
    const prevFollowUps = [];
    this.nodes.forEach((e) => {
      if (e.type === 'follow_up' && parents.indexOf(e.id) !== -1) {
        prevFollowUps.push(e);
      }
    });
    this.dialog
      .open(ActionEditComponent, {
        ...DialogSettings.AUTOMATION_ACTION,
        data: {
          action: node,
          conditionHandler,
          follows: prevFollowUps
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          for (const key in res) {
            node[key] = res[key];
          }
          this.saved = false;
        }
      });
  }
  removeAction(node): void {
    // Decide the node type => root | leaf | middle | middle with case | case
    if (node.leaf) {
      this.removeLeaf(node);
    } else {
      let newSource;
      let newTarget;
      let newTargetNode;
      const edges = this.edges;
      for (let i = edges.length - 1; i >= 0; i--) {
        const e = edges[i];
        if (e.target === node.id) {
          newSource = e.source;
        }
        if (e.source === node.id) {
          newTarget = e.target;
        }
        if (newSource && newTarget) {
          break;
        }
      }
      this.nodes.some((e) => {
        if (e.id === newTarget) {
          newTargetNode = e;
          return true;
        }
      });
      if (newTargetNode.condition) {
        this.removeWithCaseNode(node, newSource);
      } else {
        if (newSource && newTarget) {
          this.removeMiddleNode(node, newSource, newTarget);
        } else {
          this.removeRoot(node);
        }
      }
    }
  }
  removeLeaf(node): void {
    this.dialog
      .open(ConfirmComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          title: 'Delete action',
          message: 'Are you sure to delete this action?',
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const nodes = this.nodes;
          nodes.some((e, index) => {
            if (e.id === node.id) {
              nodes.splice(index, 1);
              return true;
            }
          });
          const edges = this.edges;
          let newLeafId;
          edges.some((e, index) => {
            if (e.target === node.id) {
              newLeafId = e.source;
              edges.splice(index, 1);
              return true;
            }
          });
          nodes.some((e) => {
            if (e.id === newLeafId) {
              e.leaf = true;
              return true;
            }
          });
          this.nodes = [...nodes];
          this.edges = [...edges];
          this.saved = false;
        }
      });
  }
  removeRoot(node): void {
    const options = [
      {
        title: 'Remove only node',
        description: 'This option removes only current node.',
        id: 'only'
      },
      {
        title: 'Remove all nodes',
        description: 'This option removes all nodes.',
        id: 'child'
      }
    ];
    this.dialog
      .open(CaseConfirmComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          message:
            'Are you sure to remove this item? If yes, please select the remove method.',
          cancelLabel: 'No',
          confirmLabel: 'Remove',
          cases: options
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.id === 'only') {
            const nodes = this.nodes;
            nodes.some((e, index) => {
              if (e.id === node.id) {
                nodes.splice(index, 1);
                return true;
              }
            });
            const edges = this.edges;
            edges.some((e, index) => {
              if (e.source === node.id) {
                edges.splice(index, 1);
                return true;
              }
            });
            this.nodes = [...nodes];
            this.edges = [...edges];
          } else {
            this.nodes = [];
            this.edges = [];
          }
          this.saved = false;
        }
      });
  }
  removeMiddleNode(node, nSource, nTarget): void {
    const options = [
      {
        title: 'Remove only node',
        description: 'This option removes only current node.',
        id: 'only'
      },
      {
        title: 'Remove child nodes',
        description: 'This option removes related child nodes as well.',
        id: 'child'
      }
    ];
    this.dialog
      .open(CaseConfirmComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          message:
            'Are you sure to remove this item? If yes, please select the remove method.',
          cancelLabel: 'No',
          confirmLabel: 'Remove',
          cases: options
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.id === 'only') {
            const nodes = this.nodes;
            nodes.some((e, index) => {
              if (e.id === node.id) {
                nodes.splice(index, 1);
                return true;
              }
            });
            const edges = this.edges;
            let newSource;
            let newTarget;
            for (let i = edges.length - 1; i >= 0; i--) {
              const e = edges[i];
              if (e.target === node.id) {
                newSource = e.source;
                edges.splice(i, 1);
              }
              if (e.source === node.id) {
                newTarget = e.target;
                edges.splice(i, 1);
              }
              if (newSource && newTarget) {
                break;
              }
            }
            edges.push({
              id: nSource + '_' + nTarget,
              source: nSource,
              target: nTarget
            });
            this.nodes = [...nodes];
            this.edges = [...edges];
            this.saved = false;
          } else {
            this.removeChildNodes(node, nSource);
          }
        }
      });
  }
  removeWithCaseNode(node, nSource): void {
    const options = [
      {
        title: 'Remove Yes case nodes',
        description:
          'This option removes Yes case nodes and connect parent node with No case nodes.',
        id: 'falseNodes'
      },
      {
        title: 'Remove No case nodes',
        description:
          'This option removes No case nodes and connect parent node with Yes case nodes.',
        id: 'trueNodes'
      },
      {
        title: 'Remove all child nodes',
        description: 'This option removes all related child nodes.',
        id: 'child'
      }
    ];
    this.dialog
      .open(CaseConfirmComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          message:
            'Are you sure to remove this item? If yes, please select the remove method.',
          cancelLabel: 'No',
          confirmLabel: 'Remove',
          cases: options
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.id === 'child') {
            this.removeChildNodes(node, nSource);
          } else {
            let yesCase; // "Yes" node id
            let noCase; // "No" node id
            let yesNextNode; // Node behind "Yes"
            let noNextNode; // Node behind "No"
            const edges = this.edges;
            const nodes = this.nodes;
            for (let i = edges.length - 1; i >= 0; i--) {
              const e = edges[i];
              if (e.source === node.id && e.answer === 'yes') {
                yesCase = e.target;
              }
              if (e.source === node.id && e.answer === 'no') {
                noCase = e.target;
              }
              if (yesCase && noCase) {
                break;
              }
            }
            for (let i = edges.length - 1; i >= 0; i--) {
              const e = edges[i];
              if (e.source === yesCase) {
                yesNextNode = e.target;
              }
              if (e.source === noCase) {
                noNextNode = e.target;
              }
              if (yesNextNode && noNextNode) {
                break;
              }
            }

            if (res.id === 'trueNodes') {
              const deleteNodes = [noCase];
              edges.forEach((e) => {
                if (deleteNodes.indexOf(e.source) !== -1) {
                  deleteNodes.push(e.target);
                }
              });
              deleteNodes.push(node.id);
              deleteNodes.push(yesCase);
              for (let i = edges.length - 1; i >= 0; i--) {
                const e = edges[i];
                if (deleteNodes.indexOf(e.source) !== -1) {
                  edges.splice(i, 1);
                }
                if (e.target === node.id) {
                  edges.splice(i, 1);
                }
              }

              for (let i = nodes.length - 1; i >= 0; i--) {
                const e = nodes[i];
                if (deleteNodes.indexOf(e.id) !== -1) {
                  nodes.splice(i, 1);
                }
              }
              if (yesNextNode) {
                edges.push({
                  id: nSource + '_' + yesNextNode,
                  source: nSource,
                  target: yesNextNode
                });
              } else {
                nodes.some((e) => {
                  if (e.id === nSource) {
                    e.leaf = true;
                    return true;
                  }
                });
              }
              this.nodes = [...nodes];
              this.edges = [...edges];
              this.saved = false;
            } else if (res.id === 'falseNodes') {
              const deleteNodes = [yesCase];
              edges.forEach((e) => {
                if (deleteNodes.indexOf(e.source) !== -1) {
                  deleteNodes.push(e.target);
                }
              });
              deleteNodes.push(node.id);
              deleteNodes.push(noCase);
              for (let i = edges.length - 1; i >= 0; i--) {
                const e = edges[i];
                if (deleteNodes.indexOf(e.source) !== -1) {
                  edges.splice(i, 1);
                }
                if (e.target === node.id) {
                  edges.splice(i, 1);
                }
              }

              for (let i = nodes.length - 1; i >= 0; i--) {
                const e = nodes[i];
                if (deleteNodes.indexOf(e.id) !== -1) {
                  nodes.splice(i, 1);
                }
              }
              if (noNextNode) {
                edges.push({
                  id: nSource + '_' + noNextNode,
                  source: nSource,
                  target: noNextNode
                });
              } else {
                nodes.some((e) => {
                  if (e.id === nSource) {
                    e.leaf = true;
                    return true;
                  }
                });
              }
              this.nodes = [...nodes];
              this.edges = [...edges];
              this.saved = false;
            }
          }
        }
      });
  }
  removeCase(link): void {
    const options = [
      {
        title: 'Remove Yes case nodes',
        description:
          'This option removes Yes case nodes and connect parent node with No case nodes.',
        id: 'falseNodes'
      },
      {
        title: 'Remove No case nodes',
        description:
          'This option removes No case nodes and connect parent node with Yes case nodes.',
        id: 'trueNodes'
      },
      {
        title: 'Remove all child nodes',
        description: 'This option removes all related child nodes.',
        id: 'child'
      }
    ];
    this.dialog
      .open(CaseConfirmComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          message:
            'Are you sure to remove this case? If yes, please select the remove method.',
          cancelLabel: 'No',
          confirmLabel: 'Remove',
          cases: options
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const newSource = link.source;
          let yesCase; // "Yes" node id
          let noCase; // "No" node id
          let yesNextNode; // Node behind "Yes"
          let noNextNode; // Node behind "No"
          const edges = this.edges;
          const nodes = this.nodes;
          for (let i = edges.length - 1; i >= 0; i--) {
            const e = edges[i];
            if (e.source === newSource && e.answer === 'yes') {
              yesCase = e.target;
            }
            if (e.source === newSource && e.answer === 'no') {
              noCase = e.target;
            }
            if (yesCase && noCase) {
              break;
            }
          }
          if (res.id === 'child') {
            const deleteNodes = [yesCase, noCase];
            edges.forEach((e) => {
              if (deleteNodes.indexOf(e.source) !== -1) {
                deleteNodes.push(e.target);
              }
            });
            for (let i = edges.length - 1; i >= 0; i--) {
              const e = edges[i];
              if (deleteNodes.indexOf(e.source) !== -1) {
                edges.splice(i, 1);
              }
              if (e.source === newSource) {
                edges.splice(i, 1);
              }
            }
            for (let i = nodes.length - 1; i >= 0; i--) {
              const e = nodes[i];
              if (deleteNodes.indexOf(e.id) !== -1) {
                nodes.splice(i, 1);
              }
            }
            nodes.some((e) => {
              if (e.id === newSource) {
                e.leaf = true;
                return true;
              }
            });
            this.nodes = [...nodes];
            this.edges = [...edges];
            this.saved = false;
          } else {
            for (let i = edges.length - 1; i >= 0; i--) {
              const e = edges[i];
              if (e.source === yesCase) {
                yesNextNode = e.target;
              }
              if (e.source === noCase) {
                noNextNode = e.target;
              }
              if (yesNextNode && noNextNode) {
                break;
              }
            }

            if (res.id === 'trueNodes') {
              const deleteNodes = [noCase];
              edges.forEach((e) => {
                if (deleteNodes.indexOf(e.source) !== -1) {
                  deleteNodes.push(e.target);
                }
              });
              deleteNodes.push(yesCase);
              for (let i = edges.length - 1; i >= 0; i--) {
                const e = edges[i];
                if (deleteNodes.indexOf(e.source) !== -1) {
                  edges.splice(i, 1);
                }
                if (e.source === newSource) {
                  edges.splice(i, 1);
                }
              }

              for (let i = nodes.length - 1; i >= 0; i--) {
                const e = nodes[i];
                if (deleteNodes.indexOf(e.id) !== -1) {
                  nodes.splice(i, 1);
                }
              }
              if (yesNextNode) {
                edges.push({
                  id: newSource + '_' + yesNextNode,
                  source: newSource,
                  target: yesNextNode
                });
              } else {
                nodes.some((e) => {
                  if (e.id === newSource) {
                    e.leaf = true;
                    return true;
                  }
                });
              }
              this.nodes = [...nodes];
              this.edges = [...edges];
              this.saved = false;
            } else if (res.id === 'falseNodes') {
              const deleteNodes = [yesCase];
              edges.forEach((e) => {
                if (deleteNodes.indexOf(e.source) !== -1) {
                  deleteNodes.push(e.target);
                }
              });
              deleteNodes.push(noCase);
              for (let i = edges.length - 1; i >= 0; i--) {
                const e = edges[i];
                if (deleteNodes.indexOf(e.source) !== -1) {
                  edges.splice(i, 1);
                }
                if (e.source === newSource) {
                  edges.splice(i, 1);
                }
              }

              for (let i = nodes.length - 1; i >= 0; i--) {
                const e = nodes[i];
                if (deleteNodes.indexOf(e.id) !== -1) {
                  nodes.splice(i, 1);
                }
              }
              if (noNextNode) {
                edges.push({
                  id: newSource + '_' + noNextNode,
                  source: newSource,
                  target: noNextNode
                });
              } else {
                nodes.some((e) => {
                  if (e.id === newSource) {
                    e.leaf = true;
                    return true;
                  }
                });
              }
              this.nodes = [...nodes];
              this.edges = [...edges];
              this.saved = false;
            }
          }
        }
      });
  }
  removeChildNodes(node, nSource): void {
    const deleteNodes = [node.id];
    const nodes = this.nodes;
    const edges = this.edges;
    edges.forEach((e) => {
      if (deleteNodes.indexOf(e.source) !== -1) {
        deleteNodes.push(e.target);
      }
    });
    for (let i = nodes.length - 1; i >= 0; i--) {
      const e = nodes[i];
      if (deleteNodes.indexOf(e.id) !== -1) {
        nodes.splice(i, 1);
      }
      if (nSource === e.id) {
        e.leaf = true;
      }
    }
    for (let i = edges.length - 1; i >= 0; i--) {
      const e = edges[i];
      if (deleteNodes.indexOf(e.source) !== -1) {
        edges.splice(i, 1);
      }
      if (e.target === node.id) {
        edges.splice(i, 1);
      }
    }
    this.nodes = [...nodes];
    this.edges = [...edges];
    this.saved = false;
  }

  getParents(id): any {
    const edgesObj = {};
    this.edges.forEach((e) => {
      edgesObj[e.target] = e.source;
    });
    let target = id;
    const parents = [target];
    while (edgesObj[target]) {
      parents.push(edgesObj[target]);
      target = edgesObj[target];
    }
    return parents;
  }

  startDrop(event): void {
    console.log('START DROP', event);
  }
  allowStartDrop(event, node): void {
    event.preventDefault();
  }
  enableStartArea(event, node): void {
    if (event.dataTransfer && event.dataTransfer.type) {
      node.droppable = true;
    }
  }
  disableStartArea(event, node): any {
    if (
      event.target.closest('.drop-target') &&
      !event.target.classList.contains('drop-target')
    ) {
      return;
    }
    node.droppable = false;
  }
  dragAction(event, type): void {
    event.dataTransfer.setData('action', type);
  }

  storeData(): void {
    if (this.automation_title === '') {
      this.toastr.error(
        `You've made edits to an automation provided to you, please add a title for this new automation`
      );
      return;
    }
    const parentsObj = {}; // Parent Ids of each node
    const caseActions = {}; // Case actions Object
    const nodesObj = {};
    const actions = [];
    this.edges.forEach((e) => {
      parentsObj[e.target] = e.source;
    });
    this.nodes.forEach((e) => {
      if (e.category === ACTION_CAT.CONDITION) {
        caseActions[e.id] = e;
      }
      nodesObj[e.id] = e;
    });

    this.nodes.forEach((e) => {
      if (e.category !== ACTION_CAT.CONDITION) {
        const parentId = parentsObj[e.id] || '0';
        // Check if the parent action is case action
        if (caseActions[parentId]) {
          const caseAction = caseActions[parentId];
          const caseParentActionId = parentsObj[caseAction.id];
          const caseParentAction = nodesObj[caseParentActionId];
          if (caseParentAction) {
            const action = {
              parent: caseParentActionId,
              id: e.id,
              period: e.period,
              condition: caseAction.condition,
              status: 'pending',
              action: {
                type: e.type,
                task_type: e.task_type,
                content: e.content,
                subject: e.subject,
                due_date: e.due_date,
                due_duration: e.due_duration,
                video: e.video,
                pdf: e.pdf,
                image: e.image,
                command: e.command,
                ref_id: e.ref_id
              }
            };
            if (action.condition['case'] === 'watched_video') {
              if (caseParentAction['video']) {
                const watched_video = caseParentAction['video']['_id'];
                action['watched_video'] = watched_video;
              }
            }
            if (action.condition['case'] === 'watched_pdf') {
              if (caseParentAction['pdf']) {
                const watched_pdf = caseParentAction['pdf']['_id'];
                action['watched_pdf'] = watched_pdf;
              }
            }
            if (action.condition['case'] === 'watched_image') {
              if (caseParentAction['image']) {
                const watched_image = caseParentAction['image']['_id'];
                action['watched_image'] = watched_image;
              }
            }
            actions.push(action);
          }
        } else {
          const action = {
            parent: parentId,
            id: e.id,
            period: e.period,
            status: 'pending'
          };
          if (parentId === '0') {
            action['status'] = 'active';
          }
          action['action'] = {
            type: e.type,
            task_type: e.task_type,
            content: e.content,
            subject: e.subject,
            due_date: e.due_date,
            due_duration: e.due_duration,
            video: e.video,
            pdf: e.pdf,
            image: e.image,
            command: e.command,
            ref_id: e.ref_id
          };
          actions.push(action);
        }
      }
    });

    if (this.editMode === 'edit') {
      if (this.auth === 'admin' || this.auth === 'shared') {
        if (this.automation.title === this.automation_title) {
          this.toastr.error(
            `Please input another title and save it as new automation`
          );
          return;
        } else {
          this.isSaving = true;
          this.automationService
            .create({
              title: this.automation_title,
              automations: actions
            })
            .subscribe(
              (res) => {
                if (res) {
                  this.isSaving = false;
                  this.saved = true;
                  this.toastr.success('Automation created successfully');
                  const path = '/autoflow/edit/' + res['_id'];
                  this.router.navigate([path]);
                  this.editMode = 'edit';
                  this.auth = 'owner';
                  this.automation = res;
                  this.automation_id = res['_id'];
                  this.pageContacts = [];
                }
              },
              (err) => {
                this.isSaving = false;
              }
            );
        }
      } else {
        this.isSaving = true;
        this.automationService
          .update(this.automation_id, {
            title: this.automation_title,
            automations: actions
          })
          .subscribe(
            (res) => {
              this.isSaving = false;
              this.saved = true;
              this.toastr.success('Automation saved successfully');
              this.dialog
                .open(ConfirmComponent, {
                  data: {
                    title: 'Apply Changes',
                    message:
                      'Are you sure to apply changes to assigned contacts?',
                    cancelLabel: 'No',
                    confirmLabel: 'Apply'
                  }
                })
                .afterClosed()
                .subscribe((result) => {});
            },
            (err) => {
              this.isSaving = false;
            }
          );
      }
    } else {
      this.isSaving = true;
      this.automationService
        .create({
          title: this.automation_title,
          automations: actions
        })
        .subscribe(
          (res) => {
            if (res) {
              this.isSaving = false;
              this.saved = true;
              this.toastr.success('Automation created successfully');
              const path = '/autoflow/edit/' + res['_id'];
              this.router.navigate([path]);
              this.editMode = 'edit';
              this.auth = 'owner';
              this.automation = res;
              this.automation_id = res['_id'];
              this.pageContacts = [];
            }
          },
          (err) => {
            this.isSaving = false;
          }
        );
    }
  }

  setLayout(): void {
    setTimeout(() => {
      const rect = document.querySelector('.nodes').getClientRects()[0];
      const graphWidth = rect.width;
      this.offsetX = (this.wrapperWidth - graphWidth) / 2;
    }, 100);
  }

  clearAllNodes(): void {
    this.nodes = [];
    this.edges = [];
    this.identity = 1;
  }

  zoomIn(): void {
    if (this.zoomLevel < 3) {
      this.autoZoom = false;
      this.zoomLevel++;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0) {
      this.zoomLevel--;
      if (this.zoomLevel === 0) {
        this.autoZoom = true;
      }
    }
  }

  easyView(event: any, node: any, origin: any, content: any): void {
    this.overlayService
      .open(origin, content, this.viewContainerRef, 'automation', {
        data: node
      })
      .subscribe((res) => {
        if (res === 'edit') {
          this.editAction(event, node);
        } else if (res === 'remove') {
          this.removeAction(node);
        }
      });
  }

  goToBack(): void {
    if (
      this.handlerService.previousUrl &&
      this.handlerService.previousUrl.includes('/autoflow')
    ) {
      this.router.navigate(['/automations']);
    } else {
      this.handlerService.goBack('/automations');
    }
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
    if (this.selectedTab !== this.tabs[1] && this.nodes.length < 1) {
      this.loadAutomation(this.automation_id, this.pageSize.id, 0);
    }
    localStorage.setItem('automation', tab.id);
  }

  assignContacts(): void {
    this.dialog
      .open(AutomationAssignComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          automation: this.automation
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.data && res.data.length) {
          // this.contacts = [...this.contacts, ...res.data];
          this.loadAutomation(this.automation_id, this.pageSize.id, 0);
        }
      });
  }

  delete(): void {
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Delete Automation',
        message: 'Are you sure to delete the automation?',
        confirmLabel: 'Delete'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleting = true;
        this.automationService.delete(this.automation_id).subscribe(
          (response) => {
            this.deleting = false;
            this.goToBack();
            this.automationService.reload();
          },
          (err) => {
            this.deleting = false;
          }
        );
      }
    });
  }

  unassign(contact): void {}

  /**
   * Toggle All Elements in Page
   */
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection = _.differenceBy(
        this.selection,
        this.pageSelection,
        '_id'
      );
      this.pageSelection = [];
      return;
    }
    this.pageContacts.forEach((e) => {
      if (!this.isSelected(e)) {
        this.pageSelection.push(e.mainInfo);
        this.selection.push(e.mainInfo);
      }
    });
  }
  /**
   * Toggle Element
   * @param contact : Contact
   */
  toggle(contact: ContactActivity): void {
    const selectedContact = contact.mainInfo;
    const toggledSelection = _.xorBy(
      this.pageSelection,
      [selectedContact],
      '_id'
    );
    this.pageSelection = toggledSelection;

    const toggledAllSelection = _.xorBy(
      this.selection,
      [selectedContact],
      '_id'
    );
    this.selection = toggledAllSelection;
  }
  /**
   * Check contact is selected.
   * @param contact : ContactActivity
   */
  isSelected(contact: ContactActivity): boolean {
    return _.findIndex(this.pageSelection, contact.mainInfo, '_id') !== -1;
  }
  /**
   * Check all contacts in page are selected.
   */
  isAllSelected(): boolean {
    return this.pageSelection.length === this.pageContacts.length;
  }

  /**
   * Load the page contacts
   * @param page : Page Number to load
   */
  changePage(page: number): void {
    this.page = page;
    // Normal Load by Page
    let skip = (page - 1) * this.pageSize.id;
    skip = skip < 0 ? 0 : skip;
    if (this.searchStr === '') {
      this.loadAutomation(this.automation_id, this.pageSize.id, skip);
    }
  }
  /**
   * Change the Page Size
   * @param type : Page size information element ({id: size of page, label: label to show UI})
   */
  changePageSize(type: any): void {
    const currentSize = this.pageSize.id;
    this.pageSize = type;
    // Check with the Prev Page Size
    if (currentSize < this.pageSize.id) {
      // If page size get bigger
      const loaded = this.page * currentSize;
      let newPage = Math.floor(loaded / this.pageSize.id);
      newPage = newPage > 0 ? newPage : 1;
      this.changePage(newPage);
    } else {
      // if page size get smaller: TODO -> Set Selection and Page contacts
      const skipped = (this.page - 1) * currentSize;
      const newPage = Math.floor(skipped / this.pageSize.id) + 1;
      this.changePage(newPage);
    }
  }

  changeSearchStr(): void {
    this.searchSubscription && this.searchSubscription.unsubscribe();
    this.searchSubscription = this.automationService
      .searchContact(this.automation._id, this.searchStr)
      .subscribe((res) => {
        if (res) {
          this.pageContacts = [];
          for (let i = 0; i < res.length; i++) {
            const newContact = new ContactActivity().deserialize(res[i]);
            this.pageContacts.push(newContact);
          }
          this.contacts = this.pageContacts.length;
        }
      });
    this.page = 1;
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.changePage(1);
  }

  openContact(contact: ContactActivity): void {
    this.router.navigate([`contacts/${contact._id}`]);
  }

  /**
   * Update the Label of the current contact or selected contacts.
   * @param label : Label to update
   * @param _id : id of contact to update
   */
  updateLabel(label: string, _id: string): void {
    const newLabel = label ? label : null;
    let ids = [];
    this.selection.forEach((e) => {
      ids.push(e._id);
    });
    if (ids.indexOf(_id) === -1) {
      ids = [_id];
    }
    this.isUpdating = true;
    this.contactService
      .bulkUpdate(ids, { label: newLabel }, {})
      .subscribe((status) => {
        this.isUpdating = false;
        if (status) {
          this.handlerService.bulkContactUpdate$(ids, { label: newLabel }, {});
        }
      });
  }

  /**
   * Select All Contacts
   */
  selectAll(source = false): void {
    if (source) {
      this.updateActionsStatus('select', true);
      this.selectSource = 'header';
    } else {
      this.selectSource = 'page';
    }
    this.selecting = true;
    this.selectSubscription && this.selectSubscription.unsubscribe();
    this.selectSubscription = this.contactService
      .selectAll()
      .subscribe((contacts) => {
        this.selecting = false;
        this.selection = _.unionBy(this.selection, contacts, '_id');
        this.pageSelection = _.intersectionBy(
          this.selection,
          this.pageContacts,
          '_id'
        );
        this.updateActionsStatus('select', false);
      });
  }

  /**
   * Update the Command Status
   * @param command :Command String
   * @param loading :Whether current action is running
   */
  updateActionsStatus(command: string, loading: boolean): void {
    this.CONTACT_ACTIONS.some((e) => {
      if (e.command === command) {
        e.loading = loading;
        return true;
      }
    });
  }

  duplicate(event: Event, automation: Automation): void {
    event.stopPropagation();
    this.router.navigate(['/automations']);
    const _SELF = this;
    setTimeout(function () {
      _SELF.router.navigate(['/autoflow/new/' + automation._id]);
    }, 30);
  }

  shareAutomation($event, automation): void {
    this.dialog
      .open(TeamMaterialShareComponent, {
        width: '98vw',
        maxWidth: '450px',
        data: {
          automation,
          type: 'automation'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.status) {
          // this.automationService.reload();
        }
      });
  }

  deselectAll(): void {
    this.pageSelection = [];
    this.selection = [];
  }

  /**
   * Delete Selected Contacts
   */
  deleteConfirm(): void {
    this.dialog
      .open(ConfirmComponent, {
        ...DialogSettings.CONFIRM,
        data: {
          title: 'Delete contacts',
          message: 'Are you sure to delete contacts?',
          confirmLabel: 'Delete'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.delete();
          this.handlerService.reload$();
        }
      });
  }

  /**
   * Bulk Edit Open
   */
  bulkEdit(): void {
    this.panelType = 'editor';
    this.drawer.open();
  }

  /**
   * Download CSV
   */
  downloadCSV(): void {
    const ids = [];
    this.selection.forEach((e) => {
      ids.push(e._id);
    });
    this.updateActionsStatus('download', true);
    this.contactService.downloadCSV(ids).subscribe((data) => {
      const contacts = [];
      data.forEach((e) => {
        const contact = {
          first_name: e.contact.first_name,
          last_name: e.contact.last_name,
          email: e.contact.email,
          phone: e.contact.phone,
          source: e.contact.source,
          brokerage: e.contact.brokerage,
          city: e.contact.city,
          state: e.contact.state,
          zip: e.contact.zip,
          address: e.contact.address
        };
        const notes = [];
        if (e.note && e.note.length) {
          e.note.forEach((note) => {
            notes.push(note.content);
          });
        }
        let label = '';
        if (e.contact.label) {
          label = e.contact.label.name || '';
        }
        contact['note'] = notes.join('     ');
        contact['tags'] = e.contact.tags.join(', ');
        contact['label'] = label;
        contacts.push(contact);
      });
      if (contacts.length) {
        const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
        const header = Object.keys(contacts[0]);
        const csv = contacts.map((row) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(',')
        );
        csv.unshift(header.join(','));
        const csvArray = csv.join('\r\n');

        const blob = new Blob([csvArray], { type: 'text/csv' });
        saveAs(blob, 'myFile.csv');
      }
      this.updateActionsStatus('download', false);
    });
  }

  openMessageDlg(): void {
    this.dialog.open(SendEmailComponent, {
      position: {
        bottom: '0px',
        right: '0px'
      },
      width: '100vw',
      panelClass: 'send-email',
      backdropClass: 'cdk-send-email',
      disableClose: false,
      data: {
        contacts: this.selection
      }
    });
  }

  openNoteDlg(): void {
    this.dialog.open(NoteCreateComponent, {
      ...DialogSettings.NOTE,
      data: {
        contacts: this.selection
      }
    });
  }

  openTaskDlg(): void {
    this.dialog.open(NoteCreateComponent, {
      ...DialogSettings.TASK,
      data: {
        contacts: this.selection
      }
    });
  }

  openAutomationDlg(): void {
    if (this.selection.length <= 10) {
      this.dialog.open(ContactAssignAutomationComponent, {
        ...DialogSettings.AUTOMATION,
        data: {
          contacts: this.selection
        }
      });
    } else {
      this.dialog.open(NotifyComponent, {
        width: '98vw',
        maxWidth: '390px',
        data: {
          title: 'Add Automation',
          message: 'You can assign to at most 10 contacts.'
        }
      });
    }
  }

  doAction(event: any): void {
    switch (event.command) {
      case 'deselect':
        this.deselectAll();
        break;
      case 'select':
        this.selectAll(true);
        break;
      case 'delete':
        this.deleteConfirm();
        break;
      case 'edit':
        this.bulkEdit();
        break;
      case 'download':
        this.downloadCSV();
        break;
      case 'message':
        this.openMessageDlg();
        break;
      case 'add_note':
        this.openNoteDlg();
        break;
      case 'add_task':
        this.openTaskDlg();
        break;
      case 'automation':
        this.openAutomationDlg();
        break;
    }
  }

  /**
   * Handler when page number get out of the bound after remove contacts.
   * @param $event : Page Number
   */
  pageChanged($event: number): void {
    this.changePage($event);
  }

  /**
   * Panel Open and Close event
   * @param $event Panel Open Status
   */
  setPanelType($event: boolean): void {
    if (!$event) {
      this.panelType = '';
    } else {
      this.editPanel.clearForm();
    }
  }

  getPrevPage(): string {
    if (!this.handlerService.previousUrl) {
      return 'to Automations';
    }
    for (const route in ROUTE_PAGE) {
      if (this.handlerService.previousUrl.includes(route)) {
        return 'to ' + ROUTE_PAGE[route];
      }
    }
    return '';
  }

  ICONS = {
    follow_up: AUTOMATION_ICONS.FOLLOWUP,
    update_follow_up: AUTOMATION_ICONS.UPDATE_FOLLOWUP,
    note: AUTOMATION_ICONS.CREATE_NOTE,
    email: AUTOMATION_ICONS.SEND_EMAIL,
    send_email_video: AUTOMATION_ICONS.SEND_VIDEO_EMAIL,
    send_text_video: AUTOMATION_ICONS.SEND_VIDEO_TEXT,
    send_email_pdf: AUTOMATION_ICONS.SEND_PDF_EMAIL,
    send_text_pdf: AUTOMATION_ICONS.SEND_PDF_TEXT,
    send_email_image: AUTOMATION_ICONS.SEND_IMAGE_EMAIL,
    send_text_image: AUTOMATION_ICONS.SEND_IMAGE_TEXT,
    update_contact: AUTOMATION_ICONS.UPDATE_CONTACT
  };
  ACTIONS = {
    follow_up: 'Task',
    update_follow_up: 'Update Task',
    note: 'Create Note',
    email: 'Send Email',
    send_email_video: 'Send Video Email',
    send_text_video: 'Send Video Text',
    send_email_pdf: 'Send PDF Email',
    send_text_pdf: 'Send PDF Text',
    send_email_image: 'Send Image Email',
    send_text_image: 'Send Image Text',
    update_contact: 'Update Contact'
  };
  CASE_ACTIONS = {
    watched_video: 'Watched Video?',
    watched_pdf: 'Reviewed PDF?',
    watched_image: 'Reviewed Image?',
    opened_email: 'Opened Email?'
  };
  NEED_CASE_ACTIONS: [
    'email',
    'send_email_video',
    'send_text_video',
    'send_email_pdf',
    'send_text_pdf',
    'send_email_image',
    'send_text_image'
  ];
}
