import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { DagreNodesOnlyLayout } from '../../variables/customDagreNodesOnly';
import { stepRound } from '../../variables/customStepCurved';
import { Layout, Edge, Node } from '@swimlane/ngx-graph';
import { ActionDialogComponent } from 'src/app/components/action-dialog/action-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ACTION_CAT } from 'src/app/constants/variable.constants';
import { ActionEditComponent } from 'src/app/components/action-edit/action-edit.component';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { CaseConfirmComponent } from 'src/app/components/case-confirm/case-confirm.component';
import { AutomationService } from 'src/app/services/automation.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { PageCanDeactivate } from 'src/app/variables/abstractors';
import { UserService } from '../../services/user.service';

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

  automation;
  automation_id;
  automation_title;
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

  @ViewChild('wrapper') wrapper: ElementRef;
  wrapperWidth = 0;
  wrapperHeight = 0;
  offsetX = 0;
  offsetY = 0;

  constructor(
    private dialog: MatDialog,
    private automationService: AutomationService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private userService: UserService
  ) {
    super();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.userService.profile$.subscribe((res) => {
        this.user_id = res._id;
        this.loadData(id);
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
      });
      this.editMode = 'edit';
    } else {
      this.auth = 'owner';
      const curDate = new Date();
      this.created_at = curDate.toISOString();
      this.editMode = 'new';
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

  loadData(id): void {
    this.automationService.get(id).subscribe(
      (res) => {
        this.automation = res;
        const mode = this.route.snapshot.params['mode'];
        if (mode === 'edit') {
          this.automation_id = res['_id'];
        }
        this.automation_title = res['title'];
        const actions = res['automations'];
        this.composeGraph(actions);
      },
      (err) => {}
    );
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
    actions.forEach((e) => {
      const idStr = (e.id + '').replace('a_', '');
      const id = parseInt(idStr);
      if (maxId < id) {
        maxId = id;
      }
      currentIds.push(id);
    });
    for (let i = 1; i <= maxId; i++) {
      ids.push(i);
    }
    missedIds = ids.filter(function (n) {
      return currentIds.indexOf(n) === -1;
    });
    actions.forEach((e) => {
      if (e.condition) {
        const node = {
          id: e.id,
          index: this.genIndex(e.id),
          period: e.period
        };
        if (e.action) {
          node['type'] = e.action.type;
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
    console.log('insertAction ===========>', link);
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
        maxWidth: '90vw',
        minHeight: '300px',
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
        maxWidth: '90vw',
        minHeight: '300px',
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
        maxWidth: '90vw',
        minHeight: '300px',
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
          message: 'Are you sure to remove this action?',
          cancelLabel: 'No',
          confirmLabel: 'REMOVE'
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
    if (this.automation_id) {
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
            this.toastr.success('Automation Saved Successfully');
          },
          (err) => {
            this.isSaving = false;
          }
        );
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
              this.toastr.success('Automation Saved Successfully');
              const path = '/autoflow/edit/' + res['_id'];
              this.router.navigate([path]);
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

  ICONS = {
    follow_up: '../../assets/img/automations/follow_up.svg',
    update_follow_up:
      'https://app.crmgrow.com/assets/img/icons/follow-step.png',
    note: '../../assets/img/automations/create_note.svg',
    email: '../../assets/img/automations/send_email.svg',
    send_email_video: '../../assets/img/automations/send_video_email.svg',
    send_text_video: '../../assets/img/automations/send_video_text.svg',
    send_email_pdf: '../../assets/img/automations/send_pdf_email.svg',
    send_text_pdf: '../../assets/img/automations/send_pdf_text.svg',
    send_email_image: '../../assets/img/automations/send_image_email.svg',
    send_text_image: 'https://app.crmgrow.com/assets/img/icons/image_sms.png',
    update_contact:
      'https://app.crmgrow.com/assets/img/icons/update_contact.png'
  };
  ACTIONS = {
    follow_up: 'Follow up',
    update_follow_up: 'Update Follow up',
    note: 'Create Note',
    email: 'Send E-mail',
    send_email_video: 'Send Video E-mail',
    send_text_video: 'Send Video Text',
    send_email_pdf: 'Send PDF E-mail',
    send_text_pdf: 'Send PDF Text',
    send_email_image: 'Send Image E-mail',
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
