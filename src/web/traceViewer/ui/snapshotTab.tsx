/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ActionEntry } from '../../../server/trace/viewer/traceModel';
import { Size } from '../geometry';
import './snapshotTab.css';
import * as React from 'react';
import { useMeasure } from './helpers';
import type { Point } from '../../../common/types';

export const SnapshotTab: React.FunctionComponent<{
  actionEntry: ActionEntry | undefined,
  snapshotSize: Size,
}> = ({ actionEntry, snapshotSize }) => {
  const [measure, ref] = useMeasure<HTMLDivElement>();
  const [snapshotIndex, setSnapshotIndex] = React.useState(0);

  const snapshots = actionEntry ? (actionEntry.snapshots || []) : [];

  const iframeRef = React.createRef<HTMLIFrameElement>();
  React.useEffect(() => {
    if (!iframeRef.current)
      return;
    let snapshotUri = undefined;
    let point: Point | undefined = undefined;
    if (actionEntry) {
      const snapshot = snapshots[snapshotIndex];
      if (snapshot && snapshot.snapshotName) {
        snapshotUri = `${actionEntry.metadata.pageId}?name=${snapshot.snapshotName}`;
        if (snapshot.snapshotName.includes('action'))
          point = actionEntry.metadata.point;
      }
    }
    const snapshotUrl = snapshotUri ? `${window.location.origin}/snapshot/${snapshotUri}` : 'data:text/html,<body style="background: #ddd"></body>';
    try {
      (iframeRef.current.contentWindow as any).showSnapshot(snapshotUrl, { point });
    } catch (e) {
    }
  }, [actionEntry, snapshotIndex]);

  const scale = Math.min(measure.width / snapshotSize.width, measure.height / snapshotSize.height);
  const scaledSize = {
    width: snapshotSize.width * scale,
    height: snapshotSize.height * scale,
  };
  return <div
    className='snapshot-tab'
    tabIndex={0}
    onKeyDown={event => {
      if (event.key === 'ArrowDown')
        setSnapshotIndex(Math.min(snapshotIndex + 1, snapshots.length - 1));
      if (event.key === 'ArrowUp')
        setSnapshotIndex(Math.max(snapshotIndex - 1, 0));
    }}
  ><div className='snapshot-controls'>
      {snapshots.map((snapshot, index) => {
        return <div
          key={snapshot.title}
          className={'snapshot-toggle' + (snapshotIndex === index ? ' toggled' : '')}
          onClick={() => setSnapshotIndex(index)}>
          {snapshot.title}
        </div>
      })
    }</div>
    <div ref={ref} className='snapshot-wrapper'>
      <div className='snapshot-container' style={{
        width: snapshotSize.width + 'px',
        height: snapshotSize.height + 'px',
        transform: `translate(${-snapshotSize.width * (1 - scale) / 2 + (measure.width - scaledSize.width) / 2}px, ${-snapshotSize.height * (1 - scale) / 2  + (measure.height - scaledSize.height) / 2}px) scale(${scale})`,
      }}>
        <iframe ref={iframeRef} id='snapshot' name='snapshot' src='/snapshot/'></iframe>
      </div>
    </div>
  </div>;
};
