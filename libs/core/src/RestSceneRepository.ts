/*-----------------------------------------------------------------------------
Software License for The Fraunhofer FDK MPEG-H Software

Copyright (c) 2025 - 2026 Fraunhofer-Gesellschaft zur Förderung der angewandten
Forschung e.V. and Contributors
All rights reserved.

1. INTRODUCTION

The "Fraunhofer FDK MPEG-H Software" is software that implements the ISO/MPEG
MPEG-H 3D Audio standard for digital audio or related system features. Patent
licenses for necessary patent claims for the Fraunhofer FDK MPEG-H Software
(including those of Fraunhofer), for the use in commercial products and
services, may be obtained from the respective patent owners individually and/or
from Via LA (www.via-la.com).

Fraunhofer supports the development of MPEG-H products and services by offering
additional software, documentation, and technical advice. In addition, it
operates the MPEG-H Trademark Program to ease interoperability testing of end-
products. Please visit www.mpegh.com for more information.

2. COPYRIGHT LICENSE

Redistribution and use in source and binary forms, with or without modification,
are permitted without payment of copyright license fees provided that you
satisfy the following conditions:

* You must retain the complete text of this software license in redistributions
of the Fraunhofer FDK MPEG-H Software or your modifications thereto in source
code form.

* You must retain the complete text of this software license in the
documentation and/or other materials provided with redistributions of
the Fraunhofer FDK MPEG-H Software or your modifications thereto in binary form.
You must make available free of charge copies of the complete source code of
the Fraunhofer FDK MPEG-H Software and your modifications thereto to recipients
of copies in binary form.

* The name of Fraunhofer may not be used to endorse or promote products derived
from the Fraunhofer FDK MPEG-H Software without prior written permission.

* You may not charge copyright license fees for anyone to use, copy or
distribute the Fraunhofer FDK MPEG-H Software or your modifications thereto.

* Your modified versions of the Fraunhofer FDK MPEG-H Software must carry
prominent notices stating that you changed the software and the date of any
change. For modified versions of the Fraunhofer FDK MPEG-H Software, the term
"Fraunhofer FDK MPEG-H Software" must be replaced by the term "Third-Party
Modified Version of the Fraunhofer FDK MPEG-H Software".

3. No PATENT LICENSE

NO EXPRESS OR IMPLIED LICENSES TO ANY PATENT CLAIMS, including without
limitation the patents of Fraunhofer, ARE GRANTED BY THIS SOFTWARE LICENSE.
Fraunhofer provides no warranty of patent non-infringement with respect to this
software. You may use this Fraunhofer FDK MPEG-H Software or modifications
thereto only for purposes that are authorized by appropriate patent licenses.

4. DISCLAIMER

This Fraunhofer FDK MPEG-H Software is provided by Fraunhofer on behalf of the
copyright holders and contributors "AS IS" and WITHOUT ANY EXPRESS OR IMPLIED
WARRANTIES, including but not limited to the implied warranties of
merchantability and fitness for a particular purpose. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE for any direct, indirect,
incidental, special, exemplary, or consequential damages, including but not
limited to procurement of substitute goods or services; loss of use, data, or
profits, or business interruption, however caused and on any theory of
liability, whether in contract, strict liability, or tort (including
negligence), arising in any way out of the use of this software, even if
advised of the possibility of such damage.

5. CONTACT INFORMATION

Fraunhofer Institute for Integrated Circuits IIS
Attention: Division Audio and Media Technologies - MPEG-H FDK
Am Wolfsmantel 33
91058 Erlangen, Germany
www.iis.fraunhofer.de/amm
amm-info@iis.fraunhofer.de
-----------------------------------------------------------------------------*/

import { JsonAudioScene, JsonModelParser } from "./JsonModelParser";
import { Action, SceneRepository } from "../lib/SceneRepository";
import { AudioSceneM } from "./NGAModels";

export class RestSceneRepository
  extends EventTarget
  implements SceneRepository
{
  throttleDelayMs: number = 250;
  periodicLoadDelayMs: number = 500;
  remoteApplyDelayMs: number = 500;
  maxSceneAgeMs: number = 5000;
  private isRemoteUpdated: boolean = true;
  private lastDispatchedTime: number = 0;
  private syncAc = new AbortController();
  private queuedTimeoutId: number | null = null;
  private remoteApplyTimeoutId: number | null = null;
  private lastLoadTime: number = 0;
  private latestPayload: { ngaInteractivity: JsonAudioScene };

  constructor(
    private url: string | null = null,
    private getCurrent: () => AudioSceneM,
    private setCurrent: (current: AudioSceneM) => void,
  ) {
    super();
    this.load({ signal: this.syncAc.signal });
    this.startPeriodicLoad({ signal: this.syncAc.signal });
  }

  get supportedActions() {
    return [
      "selectPreselection",
      "setAudioElementMute",
      "setAudioElementProminence",
      "setAudioElementAzimuth",
      "setAudioElementElevation",
      "selectAudioElementSelection",
      "setAudioElementSelectionMute",
      "setAudioElementSelectionProminence",
      "setAudioElementSelectionAzimuth",
      "setAudioElementSelectionElevation",
    ];
  }

  startPeriodicLoad(options?: { signal?: AbortSignal }): void {
    if (!this.url) {
      return;
    }
    const interval = setInterval(async () => {
      try {
        if (
          this.isRemoteUpdated ||
          Date.now() - this.lastLoadTime >= this.maxSceneAgeMs
        ) {
          await this.load(options);
        }
      } catch (error) {
        console.error("Error fetching audio scene:", error);
      }
    }, this.periodicLoadDelayMs);

    options?.signal?.addEventListener("abort", () => clearInterval(interval));
  }

  async load(options?: { signal?: AbortSignal }): Promise<AudioSceneM> {
    try {
      await this.fetchLatest(options);
      return this.loadFromPayload(this.latestPayload?.ngaInteractivity);
    } catch (error) {
      console.error("Client error GETting current scene: ", error);
      return Promise.resolve(this.getCurrent());
    }
  }

  async fetchLatest(options?: { signal?: AbortSignal }) {
    const response = await fetch(this.url, { signal: options?.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    this.lastLoadTime = Date.now();
    const payload = await response.json();
    if (
      payload == null ||
      typeof payload !== "object" ||
      typeof payload.ngaInteractivity !== "object"
    ) {
      throw new Error(`Invalid JSON response`);
    }
    this.latestPayload = payload;
  }

  loadFromPayload(payload: JsonAudioScene): Promise<AudioSceneM> {
    const current = this.getCurrent();
    const updated = JsonModelParser.jsonToModel(payload);
    if (
      current instanceof AudioSceneM &&
      current.isEquivalentStructure(updated)
    ) {
      current.updateStateFromModel(updated);
    } else {
      this.setCurrent(updated);
    }
    return Promise.resolve(this.getCurrent());
  }

  async applyAction(
    action: Action,
    options?: { signal?: AbortSignal },
  ): Promise<AudioSceneM> {
    if (
      action.type == "selectPreferredAudioLanguage" ||
      action.type == "selectPreferredDisplayLanguage"
    ) {
      return Promise.resolve(this.getCurrent());
    }
    this.isRemoteUpdated = false;

    // if there is a queued send: discard it
    if (this.queuedTimeoutId != null) {
      clearTimeout(this.queuedTimeoutId);
      this.queuedTimeoutId = null;
    }

    // queue the latest send
    this.queuedTimeoutId = window.setTimeout(
      async () => {
        await this.send(
          JsonModelParser.modelToOutJson(this.getCurrent()),
          options,
        ).finally(() => {
          this.queuedTimeoutId = null;
        });
      },
      Math.max(
        0,
        this.throttleDelayMs - (Date.now() - this.lastDispatchedTime),
      ),
    );

    return Promise.resolve(this.getCurrent());
  }

  async send(toSend: JsonAudioScene, options?: { signal?: AbortSignal }) {
    try {
      // before sending: fetch & check whether the scene changed
      const current = this.getCurrent();
      await this.fetchLatest(options);
      const updated = JsonModelParser.jsonToModel(
        this.latestPayload?.ngaInteractivity,
      );
      if (
        !(current instanceof AudioSceneM) ||
        !current.isEquivalentStructure(updated)
      ) {
        // if the scene changed: reapply the scene and do not send out local (old) changes
        if (this.remoteApplyTimeoutId != null) {
          clearTimeout(this.remoteApplyTimeoutId);
          this.remoteApplyTimeoutId = null;
        }
        this.isRemoteUpdated = true;
        this.loadFromPayload(this.latestPayload?.ngaInteractivity);
        return;
      }
    } catch (error) {
      console.error(
        "Client error GETting current scene for comparison: ",
        error,
      );
      return;
    }
    try {
      this.lastDispatchedTime = Date.now();
      if (!this.latestPayload) {
        this.latestPayload = { ngaInteractivity: toSend };
      } else {
        this.latestPayload.ngaInteractivity = toSend;
      }
      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(this.latestPayload),
        signal: options?.signal,
      });
      if (res.ok) {
        if (this.remoteApplyTimeoutId != null) {
          clearTimeout(this.remoteApplyTimeoutId);
          this.remoteApplyTimeoutId = null;
        }
        this.remoteApplyTimeoutId = window.setTimeout(() => {
          if (this.queuedTimeoutId == null) {
            this.isRemoteUpdated = true;
          }
        }, this.remoteApplyDelayMs);
        return;
      } else {
        console.error(
          "Server error POSTing current scene: ",
          res.status,
          ": ",
          res.statusText,
        );
        return;
      }
    } catch (error) {
      console.error("Client error POSTing current scene: ", error);
      this.isRemoteUpdated = false;
      return;
    }
  }
}
