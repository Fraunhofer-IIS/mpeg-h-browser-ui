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

/**
 * functions for parsing XML ASI Scenes
 */

import { Localizable, toBCP47 } from "../lib/LanguageTypes";
import {
  KindsM,
  KindM,
  AudioElementM,
  AudioElementSelectionM,
  AudioElementSelectionsM,
  AudioElementsM,
  AudioSceneM,
  PreselectionM,
  ProminenceInteractivityM,
  PositionInteractivityM,
  LabelsM,
} from "./NGAModels";
type JsonAzimuth = {
  default?: number;
  offset: number;
  min?: number;
  max?: number;
};
type JsonElevation = JsonAzimuth;

type JsonProminence = {
  default?: number;
  level: number;
  min?: number;
  max?: number;
};
type JsonMuting = { value: boolean; default?: boolean };
type JsonLabel = { value?: string; lang?: string };
type JsonAudioElement = {
  id: number;
  contentKind?: number;
  contentLanguage?: string;
  labels?: JsonLabel[];
  prominence?: JsonProminence;
  azimuth?: JsonAzimuth;
  elevation?: JsonElevation;
  muting?: JsonMuting;
};
type JsonAudioElementSelection = {
  id: number;
  activeObject?: number;
  defaultObject?: number;
  labels?: JsonLabel[];
  muting?: JsonMuting;
  objects?: JsonAudioElement[];
};
type JsonPreselection = {
  id: number;
  active?: boolean;
  default?: boolean;
  contentKinds?: number[];
  contentLanguages?: string[];
  labels?: JsonLabel[];
  objects?: JsonAudioElement[];
  switchGroups?: JsonAudioElementSelection[];
  presetKind?: number;
};

export type JsonAudioScene = {
  uuid: string;
  displayLanguageHint?: string;
  audioPresets?: JsonPreselection[];
};
export class JsonModelParser {
  /**
   * Converts an audio scene to a JSON string.
   * @param model the audio scene to be converted
   * @returns JSON string representation of audio scene
   */
  static modelToOutJson(model: AudioSceneM): JsonAudioScene {
    const presels = [];
    for (let i = 0; i < model.length; i++) {
      presels.push({
        id: model[i].id,
        active: model[i] === model.getSelectedPreselection(),
        objects: this.audioElementsToOutJson(model[i].audioElements),
        switchGroups: this.audioElementSelectionsToOutJson(
          model[i].audioElementSelections,
        ),
      });
    }
    return { uuid: model.uuid, audioPresets: presels };
  }

  static audioElementSelectionsToOutJson(
    selections: AudioElementSelectionsM,
  ): JsonAudioElementSelection[] {
    const jsonSelections = [];
    for (let i = 0; i < selections.length; i++) {
      const jsonSel = {
        id: selections[i].id,
        activeObject: selections[i].getSelectedAudioElement().id,
        objects: this.audioElementsToOutJson(selections[i].audioElements),
      };
      for (const obj of jsonSel.objects) {
        if (selections[i].prominenceInteractivity != null) {
          obj.prominence = JsonModelParser.prominenceToOutJson(
            selections[i].prominenceInteractivity,
          );
        }
        if (
          selections[i].positionInteractivity?.azimuthProp != null ||
          selections[i].positionInteractivity?.elevationProp != null
        ) {
          Object.assign(
            obj,
            this.positionToOutJson(selections[i].positionInteractivity),
          );
        }
      }
      jsonSelections.push(jsonSel);
    }
    return jsonSelections;
  }

  static audioElementsToOutJson(elements: AudioElementsM): JsonAudioElement[] {
    const jsonElements = [];
    for (let i = 0; i < elements.length; i++) {
      const jsonElem: {
        id: number;
        prominence?: { level: number };
        azimuth?: { offset: number };
        elevation?: { offset: number };
      } = {
        id: elements[i].id,
        ...this.positionToOutJson(elements[i].positionInteractivity),
      };
      if (elements[i].prominenceInteractivity != null) {
        jsonElem.prominence = this.prominenceToOutJson(
          elements[i].prominenceInteractivity,
        );
      }
      jsonElements.push(jsonElem);
    }
    return jsonElements;
  }

  static prominenceToOutJson(prom: ProminenceInteractivityM): JsonProminence {
    return { level: prom.getProminence() };
  }
  static positionToOutJson(pos: PositionInteractivityM): {
    azimuth?: JsonAzimuth;
    elevation?: JsonElevation;
  } {
    const json: {
      azimuth?: JsonAzimuth;
      elevation?: JsonElevation;
    } = {};
    if (pos?.azimuthProp != null) {
      json.azimuth = { offset: pos.getAzimuth() };
    }
    if (pos?.elevationProp != null) {
      json.elevation = { offset: pos.getElevation() };
    }
    return json;
  }

  /**
   * Parse an audio scene from a JSON object.
   * @param audioSceneXmlString the new audio scene in JSON format
   * @returns updated or newly created audio scene
   */
  static jsonToModel(json: JsonAudioScene) {
    if (json == null || typeof json !== "object") {
      return undefined;
    }

    // preselections
    let activePreselection, defaultPreselection;
    const preselections: PreselectionM[] = [];
    for (const jsonPresel of json?.audioPresets ?? []) {
      const parsedPresel = this.parseJsonPreselection(jsonPresel);
      if (parsedPresel) {
        preselections.push(parsedPresel);
      }
      if (jsonPresel?.active) {
        activePreselection = parsedPresel;
      }
      if (jsonPresel?.default) {
        defaultPreselection = parsedPresel;
      }
    }
    const scene = new AudioSceneM(
      preselections,
      activePreselection,
      json.uuid,
      defaultPreselection,
    );
    return scene;
  }

  static parseJsonProminence(prom: JsonProminence) {
    if (prom == null) {
      return null;
    }
    const promModel = new ProminenceInteractivityM(
      prom.min,
      prom.max,
      prom.default,
      { domainMin: -63, domainMax: 31, step: 1, unit: "dB" },
      null,
      prom.level,
    );
    return promModel;
  }

  static parseJsonPosition(element: {
    azimuth?: JsonAzimuth;
    elevation?: JsonElevation;
  }) {
    if (element == null) {
      return null;
    }
    const posModel = new PositionInteractivityM(
      // azimuth
      element?.azimuth?.min,
      element?.azimuth?.max,
      element?.azimuth?.default,
      element?.azimuth
        ? { domainMin: -180, domainMax: 180, step: 1.5, unit: "°" }
        : null,
      //elevation
      element?.elevation?.min,
      element?.elevation?.max,
      element?.elevation?.default,
      element?.elevation
        ? { domainMin: -90, domainMax: 90, step: 3, unit: "°" }
        : null,
      // distance
      null,
      null,
      null,
      null,
      // labels
      null,
      // current values
      element?.azimuth?.offset,
      element?.elevation?.offset,
      null,
    );
    return posModel;
  }

  static parseJsonPreselection(preset: JsonPreselection): PreselectionM | null {
    if (!preset) {
      return null;
    }

    // preset language: null if preset has content of more than one language
    const presetLang =
      preset?.contentLanguages?.length > 0 &&
      preset?.contentLanguages?.every(
        (lang: string) => lang === preset?.contentLanguages[0],
      )
        ? toBCP47(preset?.contentLanguages[0])
        : null;

    return new PreselectionM(
      this.parseJsonKinds(preset.presetKind, "mae_groupPreset"),
      this.parseJsonAudioElements(preset.objects),
      this.parseJsonAudioElementSelections(preset.switchGroups),
      presetLang,
      null,
      null,
      null,
      preset.id,
      this.parseJsonLabels(preset.labels),
    );
  }

  static parseJsonAudioElements(audioElements: JsonAudioElement[]) {
    if (!audioElements || !Array.isArray(audioElements)) {
      return new AudioElementsM([]);
    }
    const audioElementsArray = audioElements.map((ae) =>
      this.parseJsonAudioElement(ae),
    );
    return new AudioElementsM(audioElementsArray);
  }

  static parseJsonAudioElement(audioElement: JsonAudioElement): AudioElementM {
    if (audioElement == null) {
      return null;
    }
    return new AudioElementM(
      this.parseJsonKinds(audioElement?.contentKind, "mae_contentKind"),
      audioElement?.contentLanguage,
      !audioElement?.muting?.default,
      audioElement?.muting?.value,
      this.parseJsonPosition(audioElement),
      this.parseJsonProminence(audioElement?.prominence),
      audioElement.id,
      this.parseJsonLabels(audioElement.labels),
    );
  }

  static parseJsonAudioElementSelections(
    audioElementSelections: JsonAudioElementSelection[],
  ): AudioElementSelectionsM {
    if (!audioElementSelections || !Array.isArray(audioElementSelections)) {
      return new AudioElementSelectionsM([]);
    }
    const selectionsArray = audioElementSelections.map((aes) =>
      this.parseJsonAudioElementSelection(aes),
    );
    return new AudioElementSelectionsM(selectionsArray);
  }

  static parseJsonAudioElementSelection(
    audioElementSelection: JsonAudioElementSelection,
  ) {
    const containedElements = this.parseJsonAudioElements(
      audioElementSelection?.objects ?? [],
    );
    let defaultElement, activeElement;
    for (let i = 0; i < containedElements.length; i++) {
      if (audioElementSelection?.activeObject == containedElements[i]?.id) {
        activeElement = containedElements[i];
      }
      if (audioElementSelection?.defaultObject == containedElements[i]?.id) {
        defaultElement = containedElements[i];
      }
    }
    if (activeElement == null) {
      throw new Error(
        `AudioElementSelection parsing Error: activeElement of id ${audioElementSelection?.activeObject} could not be found.`,
      );
    }
    if (defaultElement == null) {
      throw new Error(
        `AudioElementSelection parsing Error: defaultElement of id ${audioElementSelection?.defaultObject} could not be found.`,
      );
    }
    return new AudioElementSelectionM(
      containedElements,
      defaultElement,
      activeElement?.positionInteractivity,
      activeElement?.prominenceInteractivity,
      audioElementSelection?.id,
      this.parseJsonLabels(audioElementSelection?.labels),
      activeElement,
    );
  }

  static parseJsonKinds(
    kindOrKinds: number | number[],
    schemeUri: string,
  ): KindsM {
    if (kindOrKinds == null) {
      return new KindsM([]);
    }
    if (Array.isArray(kindOrKinds)) {
      const kindArray = kindOrKinds.map(
        (k: number) => new KindM(k.toString(), schemeUri),
      );
      return new KindsM(kindArray);
    }
    const singleKind = new KindM(kindOrKinds.toString(), schemeUri);
    return new KindsM([singleKind]);
  }

  static parseJsonLabels(labels: JsonLabel[]): LabelsM | null {
    if (!labels || !Array.isArray(labels)) {
      return null;
    }

    const validLabels = labels.filter(
      (lbl) => lbl.value != null && lbl.lang != null,
    );

    const localizableArray = validLabels.map((lbl) => {
      const bcp = toBCP47(lbl.lang);
      if (bcp == null) {
        throw new Error(
          "Invalid language code: " + lbl.lang + " of label: " + lbl.value,
        );
      }
      return new Localizable(lbl.value, toBCP47(lbl.lang));
    });
    return new LabelsM(localizableArray);
  }
}
