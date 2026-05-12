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

import { XmlSceneParser } from "./XmlModelParser";
import { Action, SceneRepository } from "../lib/SceneRepository";
import { AudioSceneM } from "./NGAModels";
import { to639_2B } from "../lib/LanguageTypes";
interface DispatchParams {
  actionType: number;
  paramText?: string;
  paramInt?: number;
  paramFloat?: number;
  paramBool?: boolean;
}

type XmlVersion = "9.0" | "10.0" | "11.0";

export class XmlSceneRepository extends EventTarget implements SceneRepository {
  uuid: string;
  version: XmlVersion;

  throttleDelayMs: number = 333;
  onAction: (
    actionString: string,
  ) => Promise<string | ArrayBuffer | void> | string | ArrayBuffer | void;
  private dispatchQueue: DispatchParams[] = [];
  private lastDispatchedTime: number = 0;
  private isThrottling: boolean = false;
  private currentPromise: Promise<unknown> | null = null;
  private currentResolve: ((value: unknown) => void) | null = null;

  private static readonly systemSettingTypes = [
    0, 10, 11, 12, 20, 21, 31, 70, 71,
  ];

  constructor(
    private getCurrent: () => AudioSceneM,
    private setCurrent: (current: AudioSceneM) => void | null = null,
    public source: string | null = null,
  ) {
    super();
  }

  get supportedActions() {
    return [
      "reset",
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
      "selectPreferredDisplayLanguage",
      "selectPreferredAudioLanguage",
    ];
  }

  private toStringPayload(
    payload: string | ArrayBuffer,
    charset = "utf-8",
  ): string {
    if (typeof payload === "string") {
      return payload;
    }
    return new TextDecoder(charset).decode(new Uint8Array(payload));
  }

  async load(options?: { signal?: AbortSignal }): Promise<AudioSceneM> | null {
    if (this.source == null) {
      return Promise.resolve(this.getCurrent());
    }
    try {
      const response = await fetch(this.source, { signal: options?.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const payload = await response.text();
      return Promise.resolve(this.loadFromPayload(payload));
    } catch (error) {
      console.error("Client error FETCHing current scene: ", error);
      return Promise.resolve(this.getCurrent());
    }
  }

  loadFromPayload(payload: string | ArrayBuffer): Promise<AudioSceneM> {
    const { uuid, version, ngaInteractivity } = XmlSceneParser.parseScene(
      this.toStringPayload(payload),
    );
    this.uuid = uuid;
    this.version = version;
    this.setCurrent(ngaInteractivity);
    return Promise.resolve(ngaInteractivity);
  }

  setOnAction(
    target: (
      actionString: string,
    ) => Promise<string | ArrayBuffer | void> | string | ArrayBuffer | void,
  ) {
    this.onAction = target;
  }

  async applyAction(
    action: Action,
    options?: { signal?: AbortSignal },
  ): Promise<AudioSceneM> | null {
    const returned_data = await this.sendAction(action, this.uuid, options);
    // If we get a response with the newest XML content, load it again directly.
    if (
      returned_data != null &&
      (typeof returned_data === "string" ||
        returned_data instanceof ArrayBuffer)
    ) {
      return Promise.resolve(this.loadFromPayload(returned_data));
    } else {
      return null;
    }
  }

  async sendAction(
    action: Action,
    uuid: string,
    __options?: { signal?: AbortSignal },
  ): Promise<unknown> {
    const dispatchParams = XmlSceneRepository.toDispatchParams(action);

    queueEdit: if (
      dispatchParams.actionType == 0 ||
      dispatchParams.actionType == 30
    ) {
      // reset or preset change: delete all previous enqued actions
      // this also deletes selectPreferredDisplayLanguage and selectPreferredAudioLanguage actions!
      this.dispatchQueue = [dispatchParams];
    } else {
      for (const [index, enquedItem] of this.dispatchQueue.entries()) {
        if (
          enquedItem.actionType == dispatchParams.actionType &&
          enquedItem?.paramInt == dispatchParams?.paramInt
        ) {
          // update enqued action with same type on same element with new values
          if (enquedItem?.paramBool != null) {
            enquedItem.paramBool = dispatchParams?.paramBool;
          }
          if (enquedItem?.paramFloat != null) {
            enquedItem.paramFloat = dispatchParams?.paramFloat;
          }
          if (enquedItem?.paramText != null) {
            enquedItem.paramText = dispatchParams?.paramText;
          }
          // move the updated action to the end of the queue
          this.dispatchQueue.push(this.dispatchQueue.splice(index, 1)[0]);
          break queueEdit;
        }
      }
      // default: append to queue
      this.dispatchQueue.push(dispatchParams);
    }

    // wait for promise if currently throttling
    if (this.isThrottling && this.currentPromise != null) {
      return this.currentPromise;
    }

    this.isThrottling = true;
    this.currentPromise = new Promise((resolve) => {
      this.currentResolve = resolve;
    });
    this.processQueue(uuid);

    return this.currentPromise;
  }

  private async processQueue(uuid: string): Promise<void> {
    while (this.dispatchQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastDispatch = now - this.lastDispatchedTime;

      if (timeSinceLastDispatch >= this.throttleDelayMs) {
        this.lastDispatchedTime = now;
        const uiMessage = XmlSceneRepository.assembleUiEvent(
          uuid,
          this.version,
          this.dispatchQueue.shift(),
        );
        const result = await this.onAction(uiMessage);
        if (this.currentResolve) {
          this.currentResolve(result);
        }
        this.currentPromise = null;
        this.currentResolve = null;
      } else {
        const waitTime = this.throttleDelayMs - timeSinceLastDispatch;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
    this.isThrottling = false;
  }

  private static assembleUiEvent(
    uuid: string,
    version: XmlVersion,
    params: DispatchParams,
  ): string {
    if (params == null) {
      return null;
    }
    if (XmlSceneRepository.systemSettingTypes.includes(params.actionType)) {
      // system settings
      uuid = "00000000-0000-0000-0000-000000000000";
    }
    const paramStrings: string[] = [];
    Object.entries(params).forEach(([param, value]) => {
      paramStrings.push(`${param}="${value}"`);
    });
    const actionString = `<ActionEvent uuid="${uuid}" version="${version}" ${paramStrings.join(" ")} />`;
    return actionString;
  }

  private static toDispatchParams(action: Action): DispatchParams {
    const params: DispatchParams = { actionType: undefined };
    switch (action.type) {
      case "reset":
        params.actionType = 0;
        break;
      case "selectPreselection":
        params.actionType = 30;
        params.paramInt = action.preselectionId;
        break;
      case "setAudioElementMute":
        params.actionType = 40;
        params.paramInt = action.elementId;
        params.paramBool = action.enable;
        break;
      case "setAudioElementProminence":
        params.actionType = 41;
        params.paramInt = action.elementId;
        params.paramFloat = action.value;
        break;
      case "setAudioElementAzimuth":
        params.actionType = 42;
        params.paramInt = action.elementId;
        params.paramFloat = action.value;
        break;
      case "setAudioElementElevation":
        params.actionType = 43;
        params.paramInt = action.elementId;
        params.paramFloat = action.value;
        break;
      case "selectAudioElementSelection":
        params.actionType = 60;
        params.paramInt = action.groupId;
        params.paramFloat = action.elementId;
        break;
      case "setAudioElementSelectionMute":
        params.actionType = 61;
        params.paramInt = action.groupId;
        params.paramBool = action.enable;
        break;
      case "setAudioElementSelectionProminence":
        params.actionType = 62;
        params.paramInt = action.groupId;
        params.paramFloat = action.value;
        break;
      case "setAudioElementSelectionAzimuth":
        params.actionType = 63;
        params.paramInt = action.groupId;
        params.paramFloat = action.value;
        break;
      case "setAudioElementSelectionElevation":
        params.actionType = 64;
        params.paramInt = action.groupId;
        params.paramFloat = action.value;
        break;
      case "selectPreferredDisplayLanguage":
        params.actionType = 71;
        params.paramText = to639_2B(action.languageCode) ?? action.languageCode;
        params.paramInt = action.priority;
        break;
      case "selectPreferredAudioLanguage":
        params.actionType = 70;
        params.paramText = to639_2B(action.languageCode) ?? action.languageCode;
        params.paramInt = action.priority;
        break;
      default:
        break;
    }
    return params;
  }
}
