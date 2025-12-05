/*-----------------------------------------------------------------------------
Software License for The Fraunhofer FDK MPEG-H Software

Copyright (c) 2025 - 2025 Fraunhofer-Gesellschaft zur Förderung der angewandten
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
import {
  Action,
  SceneRepository,
  SceneConnector,
  ActionConnector,
} from "../lib/SceneRepository";
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

export class XmlSceneConnector implements SceneConnector {
  constructor(private xmlPayload?: string | ArrayBuffer) {}
  // get current scene.

  fetchScene(
    __uuid: string,
    __options?: { signal?: AbortSignal },
  ): Promise<string | ArrayBuffer> {
    // UUID is ignored, as XML always contains only one (the current) audio scene. Directly return it.
    return Promise.resolve(this.xmlPayload);
  }

  // manually update the scene.
  updateScene(xmlPayload: string | ArrayBuffer) {
    this.xmlPayload = xmlPayload;
  }
}
export class XmlActionConnector implements ActionConnector {
  onAction: (actionString: string) => Promise<unknown> | void;
  constructor(private version: XmlVersion = "9.0") {}
  private assembleUiEvent(
    uuid: string,
    version: XmlVersion,
    params: DispatchParams,
  ): string {
    if (params == null) {
      return null;
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
    if (action.type == "reset") {
      if (!action.globalReset) {
        return null;
      }
      params.actionType = 0;
    } else if (action.type == "selectPreselection") {
      params.actionType = 30;
      params.paramInt = action.preselectionId;
    } else if (action.type == "setAudioElementMute") {
      params.actionType = 40;
      params.paramInt = action.elementId;
      params.paramBool = action.enable;
    } else if (action.type == "setAudioElementProminence") {
      params.actionType = 41;
      params.paramInt = action.elementId;
      params.paramFloat = action.value;
    } else if (action.type == "setAudioElementAzimuth") {
      params.actionType = 42;
      params.paramInt = action.elementId;
      params.paramFloat = action.value;
    } else if (action.type == "setAudioElementElevation") {
      params.actionType = 43;
      params.paramInt = action.elementId;
      params.paramFloat = action.value;
    } else if (action.type == "selectAudioElementSelection") {
      params.actionType = 60;
      params.paramInt = action.groupId;
      params.paramFloat = action.elementId;
    } else if (action.type == "setAudioElementSelectionMute") {
      params.actionType = 61;
      params.paramInt = action.groupId;
      params.paramBool = action.enable;
    } else if (action.type == "setAudioElementSelectionProminence") {
      params.actionType = 62;
      params.paramInt = action.groupId;
      params.paramFloat = action.value;
    } else if (action.type == "setAudioElementSelectionAzimuth") {
      params.actionType = 63;
      params.paramInt = action.groupId;
      params.paramFloat = action.value;
    } else if (action.type == "setAudioElementSelectionElevation") {
      params.actionType = 64;
      params.paramInt = action.groupId;
      params.paramFloat = action.value;
    } else if (action.type == "selectPreferredDisplayLanguage") {
      params.actionType = 71;
      params.paramText = to639_2B(action.languageCode);
    } else if (action.type == "selectPreferredAudioLanguage") {
      params.actionType = 70;
      params.paramText = to639_2B(action.languageCode);
    }
    return params;
  }
  setVersion(version: XmlVersion) {
    this.version = version;
  }

  async sendAction(
    action: Action,
    uuid: string,
    __options?: { signal?: AbortSignal },
  ): Promise<unknown> {
    const uiMessage = this.assembleUiEvent(
      uuid,
      this.version,
      XmlActionConnector.toDispatchParams(action),
    );
    return await this.onAction(uiMessage);
  }
}

export class XmlSceneRepository extends EventTarget implements SceneRepository {
  uuid: string;
  version: XmlVersion;
  constructor(
    private sceneConnector: XmlSceneConnector | null,
    private actionConnector: XmlActionConnector | null,
  ) {
    super();
  }

  private toStringPayload(
    payload: string | ArrayBuffer,
    charset = "utf-8",
  ): string {
    if (typeof payload === "string") return payload;
    return new TextDecoder(charset).decode(new Uint8Array(payload));
  }

  async load(
    uuid: string,
    current?: AudioSceneM,
    options?: { signal?: AbortSignal },
  ): Promise<AudioSceneM> | null {
    if (this.sceneConnector == null) return null;
    const payload = await this.sceneConnector.fetchScene(uuid, options);
    return Promise.resolve(this.loadFromPayload(payload, current));
  }

  loadFromPayload(
    payload: string | ArrayBuffer,
    current?: AudioSceneM,
  ): AudioSceneM {
    const { uuid, version, ngaInteractivity } = XmlSceneParser.parseScene(
      this.toStringPayload(payload),
      current,
    );
    this.uuid = uuid;
    this.version = version;
    this.actionConnector?.setVersion(version);
    return ngaInteractivity;
  }

  setOnAction(target: (actionString: string) => void | Promise<unknown>) {
    if (this.actionConnector == null) {
      this.actionConnector = new XmlActionConnector(this.version);
    }
    this.actionConnector.onAction = target;
  }

  applyAction(
    action: Action,
    current?: AudioSceneM,
    options?: { signal?: AbortSignal },
  ): Promise<AudioSceneM> | null {
    if (this.actionConnector == null) {
      this.actionConnector = new XmlActionConnector(this.version);
    }
    const returned_data = this.actionConnector.sendAction(
      action,
      this.uuid,
      options,
    );
    // If we get a response with the newest XML content, load it again directly. Otherwise, try to load via the scene Connector.
    if (
      returned_data != null &&
      (typeof returned_data === "string" ||
        returned_data instanceof ArrayBuffer)
    ) {
      return Promise.resolve(this.loadFromPayload(returned_data, current));
    } else {
      return this.load(this.uuid, current);
    }
  }
}
