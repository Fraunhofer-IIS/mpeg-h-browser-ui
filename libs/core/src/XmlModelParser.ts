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

/**
 * functions for parsing XML ASI Scenes
 */

import { Localizable, toBCP47 } from "../lib/LanguageTypes";
import {
  KindsM,
  AudioElementM,
  AudioElementSelectionM,
  AudioElementSelectionsM,
  AudioElementsM,
  AudioSceneM,
  LabelsM,
  PositionInteractivityM,
  PreselectionM,
  ProminenceInteractivityM,
  KindM,
} from "./NGAModels";

export class XmlSceneParser {
  static parseNumericParams(xmlNode: Element) {
    if (xmlNode) {
      const isActionAllowed =
        xmlNode.getAttribute("isActionAllowed") === "true" ||
        !xmlNode.getAttribute("isActionAllowed");
      if (isActionAllowed) {
        return {
          value: Number.parseFloat(xmlNode.getAttribute("val")),
          defaultValue: Number.parseFloat(xmlNode.getAttribute("def")),
          minValue: Number.parseFloat(xmlNode.getAttribute("min")),
          maxValue: Number.parseFloat(xmlNode.getAttribute("max")),
        };
      }
    }
    return null;
  }

  static toSchemeUri(xmlTable: string): string | null {
    if (xmlTable === "ContentKindTable") {
      return "mae_contentKind";
    } else if (xmlTable === "PresetTable") {
      return "mae_groupPreset";
    }
    return null;
  }

  static parseAudioElementMetadata(xmlNode: Element) {
    const id = parseInt(xmlNode.getAttribute("id"), 10);

    const kindNode = xmlNode.querySelector(":scope > kind");
    const kinds = new KindsM([
      new KindM(
        kindNode?.getAttribute("code"),
        this.toSchemeUri(kindNode?.getAttribute("table")),
      ),
    ]);
    const localizables: Localizable[] = [];
    const customKindNode = xmlNode.querySelector(":scope > customKind");

    if (customKindNode == null) {
      // no customKind: no label
      const labels: LabelsM = undefined;
      return { id, labels, kinds };
    }

    // customKind is present: get labels from it
    const audioLanguage = toBCP47(customKindNode.getAttribute("langCode"));
    const descriptionNodes = customKindNode.getElementsByTagName("description");
    for (let i = 0; i < descriptionNodes.length; i++) {
      const value = descriptionNodes.item(i).innerHTML;
      const lang = toBCP47(descriptionNodes[i].getAttribute("langCode"));
      // preferred language: beginning
      if (descriptionNodes[i].getAttribute("isPreferred") === "true") {
        localizables.unshift(new Localizable(value, lang));
      } else {
        localizables.push(new Localizable(value, lang));
      }
    }
    if (descriptionNodes.length == 0) {
      localizables.push(new Localizable("", "en"));
    }
    const labels = new LabelsM(localizables);
    return { id, labels, kinds, audioLanguage };
  }

  static parseAudioProperties(xmlNode: Element) {
    let positionInteractivity, prominenceInteractivity;
    const azimuthOffsetParams = this.parseNumericParams(
      xmlNode.getElementsByTagName("azimuthProp")[0],
    );
    const elevationOffsetParams = this.parseNumericParams(
      xmlNode.getElementsByTagName("elevationProp")[0],
    );

    if (azimuthOffsetParams || elevationOffsetParams) {
      positionInteractivity = new PositionInteractivityM(
        azimuthOffsetParams?.minValue,
        azimuthOffsetParams?.maxValue,
        azimuthOffsetParams?.defaultValue,
        { domainMin: -180, domainMax: 180, step: 1.5, unit: "°" },
        elevationOffsetParams?.minValue,
        elevationOffsetParams?.maxValue,
        elevationOffsetParams?.defaultValue,
        { domainMin: -90, domainMax: 90, step: 3, unit: "°" },
      );
      positionInteractivity.setAzimuth(azimuthOffsetParams?.value);
      positionInteractivity.setElevation(elevationOffsetParams?.value);
    }

    const prominenceParams = this.parseNumericParams(
      xmlNode.getElementsByTagName("prominenceLevelProp")[0],
    );

    if (prominenceParams) {
      prominenceInteractivity = new ProminenceInteractivityM(
        prominenceParams?.minValue,
        prominenceParams?.maxValue,
        prominenceParams?.defaultValue,
        { domainMin: -63, domainMax: 31, step: 1, unit: "dB" },
      );
      prominenceInteractivity.setProminence(prominenceParams?.value);
    }
    return { positionInteractivity, prominenceInteractivity };
  }

  static parseAudioObject(xmlNode: Element) {
    const isActionAllowed =
      xmlNode.getAttribute("isActionAllowed") === "true" ||
      !xmlNode.getAttribute("isActionAllowed");
    const metadata = this.parseAudioElementMetadata(xmlNode);
    const props = this.parseAudioProperties(xmlNode);
    if (!isActionAllowed) {
      props.positionInteractivity = null;
      props.prominenceInteractivity = null;
    }
    return new AudioElementM(
      metadata.kinds,
      metadata.audioLanguage,
      true, // currently toggling is not supported -> always enabled
      false, // currently toggling is not supported -> not toggleable
      props.positionInteractivity,
      props.prominenceInteractivity,
      metadata.id,
      metadata.labels,
    );
  }

  static parseAudioObjectList(xmlNode: Element, parentTag: string = "preset") {
    const audioObjects: AudioElementM[] = [];
    const objectNodes = xmlNode.querySelectorAll(parentTag + " > audioElement");

    for (let i = 0; i < objectNodes.length; ++i) {
      audioObjects.push(this.parseAudioObject(objectNodes.item(i)));
    }
    const nonInteractiveElementNodes = xmlNode.querySelectorAll(
      parentTag + " > nonInteractiveAudioElement",
    );
    for (let i = 0; i < nonInteractiveElementNodes.length; ++i) {
      audioObjects.push(
        this.parseAudioObject(nonInteractiveElementNodes.item(i)),
      );
    }
    return new AudioElementsM(audioObjects);
  }

  static parseAudioSwitchGroup(xmlNode: Element) {
    let activeAudioObject: AudioElementM;
    const audioObjects: AudioElementM[] = [];
    const objectNodes = xmlNode.getElementsByTagName("audioElement");
    const isActionAllowed =
      xmlNode.getAttribute("isActionAllowed") === "true" ||
      !xmlNode.getAttribute("isActionAllowed");

    for (let j = 0; j < objectNodes.length; ++j) {
      const object = this.parseAudioObject(objectNodes.item(j));
      if (objectNodes.item(j).getAttribute("isActive") === "true") {
        activeAudioObject = object;
      }
      if (
        isActionAllowed ||
        objectNodes.item(j).getAttribute("isActive") === "true"
      ) {
        audioObjects.push(object);
      }
    }

    const metadata = this.parseAudioElementMetadata(xmlNode);
    const properties = this.parseAudioProperties(xmlNode);

    if (!isActionAllowed) {
      properties.positionInteractivity = null;
      properties.prominenceInteractivity = null;
    }

    return new AudioElementSelectionM(
      new AudioElementsM(audioObjects),
      activeAudioObject,
      properties?.positionInteractivity,
      properties?.prominenceInteractivity,
      metadata.id,
      metadata.labels,
    );
  }

  static parseAudioSwitchGroupList(xmlNode: HTMLElement) {
    const switchGroups: AudioElementSelectionM[] = [];

    const switchNodes = xmlNode.getElementsByTagName("audioElementSwitch");
    for (let i = 0; i < switchNodes.length; ++i) {
      switchGroups.push(this.parseAudioSwitchGroup(switchNodes.item(i)));
    }
    const nonInteractiveSwitchNodes = xmlNode.getElementsByTagName(
      "nonInteractiveAudioElementSwitch",
    );
    for (let i = 0; i < nonInteractiveSwitchNodes.length; ++i) {
      switchGroups.push(
        this.parseAudioSwitchGroup(nonInteractiveSwitchNodes.item(i)),
      );
    }

    return new AudioElementSelectionsM(switchGroups);
  }

  static parseAudioPresetList_v11(xmlRoot: HTMLElement) {
    const uuid = xmlRoot.getAttribute("uuid");
    const presets: PreselectionM[] = [];
    let activePreset: PreselectionM;

    const presetNodes = xmlRoot.getElementsByTagName("preset");
    for (let i = 0; i < presetNodes.length; ++i) {
      const { id, labels, kinds } = this.parseAudioElementMetadata(
        presetNodes.item(i),
      );

      const audioObjects = this.parseAudioObjectList(
        presetNodes.item(i) as HTMLElement,
        "preset",
      );
      const audioSwitchGroups = this.parseAudioSwitchGroupList(
        presetNodes.item(i) as HTMLElement,
      );

      const preset = new PreselectionM(
        kinds,
        audioObjects,
        audioSwitchGroups,
        undefined,
        undefined,
        undefined,
        undefined,
        id,
        labels,
      );
      if (presetNodes.item(i).getAttribute("isActive") === "true") {
        activePreset = preset;
      }
      presets.push(preset);
    }
    return new AudioSceneM(presets, activePreset, uuid);
  }

  static parseAudioPresetList_v9(xmlRoot: HTMLElement) {
    const uuid = xmlRoot.getAttribute("uuid");
    const presets: PreselectionM[] = [];
    let activePreset: PreselectionM;

    const audioObjects = this.parseAudioObjectList(xmlRoot, "AudioSceneConfig");
    const audioSwitchGroups = this.parseAudioSwitchGroupList(xmlRoot);

    const presetNodes = xmlRoot.getElementsByTagName("preset");
    for (let i = 0; i < presetNodes.length; ++i) {
      const { id, labels, kinds } = this.parseAudioElementMetadata(
        presetNodes.item(i),
      );

      const preset = new PreselectionM(
        kinds,
        audioObjects,
        audioSwitchGroups,
        undefined,
        undefined,
        undefined,
        undefined,
        id,
        labels,
      );
      if (presetNodes.item(i).getAttribute("isActive") === "true") {
        activePreset = preset;
      }
      presets.push(preset);
    }
    return new AudioSceneM(presets, activePreset, uuid);
  }

  /**
   * Parse an audio scene from a XML string.
   * @param audioSceneXmlString the new audio scene in xml format
   * @param currentScene current audio scene. Currently not used, could be used for only partial update.
   * @returns updated or mewly created audio scene
   */
  static parseScene(audioSceneXmlString: string, currentScene?: AudioSceneM) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(audioSceneXmlString, "text/xml");
    const parserError = xmlDoc.querySelector("parsererror div");
    if (parserError) {
      throw new Error(parserError.textContent);
    }
    const xmlRoot = xmlDoc.documentElement;
    const uuid = xmlRoot.getAttribute("uuid");
    const version = xmlRoot.getAttribute("version");

    if (uuid != currentScene?.uuid) {
      currentScene = undefined;
    }

    switch (version) {
      case "11.0":
      case "10.0":
        return {
          uuid,
          version,
          ngaInteractivity: this.parseAudioPresetList_v11(xmlRoot),
        };
      case "9.0":
        return {
          uuid,
          version,
          ngaInteractivity: this.parseAudioPresetList_v9(xmlRoot),
        };
      default:
        throw "Unsupported MPEG-H UI manager XML version";
    }
  }
}
