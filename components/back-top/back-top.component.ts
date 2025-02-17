/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { fadeMotion } from 'ng-zorro-antd/core/animation';
import { NzConfigService, WithConfig } from 'ng-zorro-antd/core/config';
import { NzScrollService } from 'ng-zorro-antd/core/services';
import { NumberInput, NzSafeAny } from 'ng-zorro-antd/core/types';
import { InputNumber } from 'ng-zorro-antd/core/util';

import { fromEvent, Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

const NZ_CONFIG_COMPONENT_NAME = 'backTop';

@Component({
  selector: 'nz-back-top',
  exportAs: 'nzBackTop',
  animations: [fadeMotion],
  template: `
    <div class="ant-back-top" (click)="clickBackTop()" @fadeMotion *ngIf="visible">
      <ng-template #defaultContent>
        <div class="ant-back-top-content">
          <div class="ant-back-top-icon"></div>
        </div>
      </ng-template>
      <ng-template [ngTemplateOutlet]="nzTemplate || defaultContent"></ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false
})
export class NzBackTopComponent implements OnInit, OnDestroy, OnChanges {
  static ngAcceptInputType_nzVisibilityHeight: NumberInput;

  private scrollListenerDestroy$ = new Subject();
  private target: HTMLElement | null = null;

  visible: boolean = false;

  @Input() nzTemplate?: TemplateRef<void>;
  @Input() @WithConfig(NZ_CONFIG_COMPONENT_NAME) @InputNumber() nzVisibilityHeight: number = 400;
  @Input() nzTarget?: string | HTMLElement;
  @Output() readonly nzClick: EventEmitter<boolean> = new EventEmitter();

  constructor(
    @Inject(DOCUMENT) private doc: NzSafeAny,
    public nzConfigService: NzConfigService,
    private scrollSrv: NzScrollService,
    private platform: Platform,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.registerScrollEvent();
  }

  clickBackTop(): void {
    this.scrollSrv.scrollTo(this.getTarget(), 0);
    this.nzClick.emit(true);
  }

  private getTarget(): HTMLElement | Window {
    return this.target || window;
  }

  private handleScroll(): void {
    if (this.visible === this.scrollSrv.getScroll(this.getTarget()) > this.nzVisibilityHeight) {
      return;
    }
    this.visible = !this.visible;
    this.cd.detectChanges();
  }

  private registerScrollEvent(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    this.scrollListenerDestroy$.next();
    this.handleScroll();
    this.zone.runOutsideAngular(() => {
      fromEvent(this.getTarget(), 'scroll')
        .pipe(throttleTime(50), takeUntil(this.scrollListenerDestroy$))
        .subscribe(() => this.handleScroll());
    });
  }

  ngOnDestroy(): void {
    this.scrollListenerDestroy$.next();
    this.scrollListenerDestroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzTarget } = changes;
    if (nzTarget) {
      this.target = typeof this.nzTarget === 'string' ? this.doc.querySelector(this.nzTarget) : this.nzTarget;
      this.registerScrollEvent();
    }
  }
}
