/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { ReplaySubject } from 'rxjs';

export class TimelineService {
  check$ = new ReplaySubject(1);
  markForCheck(): void {
    this.check$.next();
  }
}
