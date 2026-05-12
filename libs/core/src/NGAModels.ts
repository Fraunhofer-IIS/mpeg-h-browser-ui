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

import {
  NGAPositionInteractivityPolar,
  NGAProminenceInteractivity,
  NGAAudioElement,
  NGAChannelLayout,
  NGAKinds,
  NGALabels,
  NGAAudioElementSelection,
  NGAAudioElementSelections,
  NGAPreselection,
  NGAPreselections,
  NGALabel,
  NGAGroups,
  NGAAudioElements,
  NGAKind,
} from "../lib/NGATypes";

import { clamp, quantize } from "./MathUtils";
import { Localizable, toBCP47 } from "../lib/LanguageTypes";
import { toLocalizables } from "./NGAKindSchemes";

export class KindM implements NGAKind {
  constructor(
    readonly value: string,
    readonly schemeUri = "",
  ) {}
  get kindDescription(): LabelsM | null {
    if (this.schemeUri === "" || this.schemeUri == null) {
      return null;
    } else {
      return new LabelsM(toLocalizables(this.schemeUri, this.value));
    }
  }
  equals(other: KindM) {
    return this.schemeUri === other.schemeUri && this.value === other.value;
  }
}

export class KindsM implements NGAKinds {
  readonly length: number;
  [index: number]: KindM;

  constructor(kinds: KindM[]) {
    if (kinds == null) {
      this.length = 0;
    } else {
      this.length = kinds.length;
      for (let i = 0; i < kinds.length; i++) {
        this[i] = kinds[i];
      }
    }
  }

  equals(other: KindsM) {
    if (other.length !== this.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!other[i].equals(this[i])) {
        return false;
      }
    }
    return true;
  }
}

export class LabelM implements NGALabel {
  readonly label: Localizable;
  // group is currently ignored
  readonly group: NGAGroups;

  constructor(label: string, lang: string) {
    const local = new Localizable(label, lang);
    this.label = local;
  }

  /**
   * Check whether this label is in a specific language.
   * @param lang Language code, supports 2 letter codes, 3 letter codes or BCP47 tags.
   * @returns true if the languages match.
   */
  isInLang(lang: string): boolean | undefined {
    // cannot interpret lang keys that are less than 2 letters
    if (this.label?.lang == null) {
      return undefined;
    }
    // convert to BCP47 codes and compare
    const query = toBCP47(lang);
    const current = toBCP47(this.label.lang);
    if (query == undefined || current == undefined) {
      return undefined;
    }
    if (query === current) {
      return true;
    }
    return false;
  }

  equals(other: LabelM): boolean {
    if (this.group?.length !== other.group?.length) {
      return false;
    }
    for (let i = 0; i < this.group?.length; i++) {
      if (!this.group[i].label.equals(other.group[i].label)) {
        return false;
      }
    }
    return this.label.equals(other.label);
  }
}

export class LabelsM implements NGALabels {
  readonly length: number;
  [index: number]: LabelM;

  constructor(labels: Localizable[]) {
    this.length = labels.length;
    for (let i = 0; i < this.length; i++) {
      const lang = labels[i].lang;
      const value = labels[i].value;
      const label = new LabelM(value, lang);
      this[i] = label;
    }
  }

  /**
   * Get the Label in a specific language
   * @param lang Language code (2 letters) to search
   * @returns Label in requested language, if found; else null
   */
  getLabelInLang(lang: string): LabelM | null {
    for (let i = 0; i < this.length; i++) {
      if (this[i].isInLang(lang)) {
        return this[i];
      }
    }
    return null;
  }

  equals(other: LabelsM): boolean {
    if (this.length !== other.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!this[i].equals(other[i])) {
        return false;
      }
    }
    return true;
  }
}
export abstract class AudioSceneComponentM extends EventTarget {
  readonly labels: LabelsM;
  constructor(labels?: LabelsM) {
    super();
    this.labels = labels;
  }
  isEquivalentStructure(other: AudioSceneComponentM) {
    return (
      (this.labels == null && other.labels == null) ||
      (this.labels != null &&
        other.labels != null &&
        this.labels?.equals(other.labels))
    );
  }
}

export type DomainInfo = {
  step?: number;
  unit?: string;
  domainMin?: number;
  domainMax?: number;
};

export class NumericPropertyM extends AudioSceneComponentM {
  private _value: number;
  constructor(
    private readonly minValue: number,
    private readonly maxValue: number,
    public readonly defaultValue: number,
    public readonly domainInfo?: DomainInfo,
    labels?: LabelsM,
    currentValue = defaultValue,
  ) {
    if (minValue > maxValue) {
      throw new RangeError("minValue must not be greater than maxValue");
    }
    if (!(minValue <= defaultValue && defaultValue <= maxValue)) {
      throw new RangeError(
        "defaultValue must be in range [minValue, maxValue]",
      );
    }
    if (!(minValue <= currentValue && currentValue <= maxValue)) {
      throw new RangeError(
        "currentValue must be in range [minValue, maxValue]",
      );
    }
    if (domainInfo?.domainMin && minValue < domainInfo.domainMin) {
      throw new RangeError("minValue must not be less than domainMin");
    }
    if (domainInfo?.domainMax && maxValue > domainInfo.domainMax) {
      throw new RangeError("maxValue must not be greater than domainMax");
    }
    if (domainInfo?.step && domainInfo.step < 0) {
      throw new RangeError("step must not be negative");
    }
    super(labels);
    this._value = currentValue;
  }

  set value(value: number) {
    // clamp to [min,max]
    let x = clamp(value, this.minValue, this.maxValue);
    // quantize to step
    if (this.domainInfo?.step != null) {
      x = quantize(x, this.domainInfo.step);
    }
    // update if changed
    if (x !== this._value) {
      this._value = x;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            type: "valueChanged",
            value: this._value,
            source: "local",
          },
        }),
      );
    }
  }
  get value(): number {
    return this._value;
  }

  getRange(): [number, number] {
    return [this.minValue, this.maxValue];
  }

  isEquivalentStructure(other: NumericPropertyM): boolean {
    if (
      other.getRange()[0] !== this.getRange()[0] ||
      other.getRange()[1] !== this.getRange()[1] ||
      other?.domainInfo?.domainMin !== this?.domainInfo?.domainMin ||
      other?.domainInfo?.domainMax !== this?.domainInfo?.domainMax ||
      other?.domainInfo?.step !== this?.domainInfo?.step ||
      other?.domainInfo?.unit !== this?.domainInfo?.unit ||
      other.defaultValue !== this.defaultValue
    ) {
      return false;
    }
    return true;
  }

  updateStateFromModel(updated: NumericPropertyM, source = "remote"): boolean {
    // clamp to [min,max]
    let x = clamp(updated.value, this.minValue, this.maxValue);
    // quantize to step
    if (this.domainInfo?.step != null) {
      x = quantize(x, this.domainInfo.step);
    }
    // update if changed
    if (x !== this._value) {
      this._value = x;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            type: "valueChanged",
            value: this._value,
            source: source,
          },
        }),
      );
    }
    return true;
  }
}

export class PositionInteractivityM
  extends AudioSceneComponentM
  implements NGAPositionInteractivityPolar
{
  readonly azimuthProp?: NumericPropertyM;
  readonly elevationProp?: NumericPropertyM;
  readonly distanceProp?: NumericPropertyM;

  constructor(
    minAzimuth?: number,
    maxAzimuth?: number,
    defaultAzimuth?: number,
    domainAzimuth?: DomainInfo,
    minElevation?: number,
    maxElevation?: number,
    defaultElevation?: number,
    domainElevation?: DomainInfo,
    minDistance?: number,
    maxDistance?: number,
    defaultDistance?: number,
    domainDistance?: DomainInfo,
    labels?: LabelsM,
    currentAzimuth: number = defaultAzimuth,
    currentElevation: number = defaultElevation,
    currentDistance: number = defaultDistance,
  ) {
    super(labels);

    // setup NumericProperties. Ranges & quantizations from supplied domains
    if (minAzimuth != null && maxAzimuth != null && defaultAzimuth != null) {
      this.azimuthProp = new NumericPropertyM(
        minAzimuth,
        maxAzimuth,
        defaultAzimuth,
        domainAzimuth,
        null,
        currentAzimuth,
      );
    }
    if (
      minElevation != null &&
      maxElevation != null &&
      defaultElevation != null
    ) {
      this.elevationProp = new NumericPropertyM(
        minElevation,
        maxElevation,
        defaultElevation,
        domainElevation,
        null,
        currentElevation,
      );
    }
    if (minDistance != null && maxDistance != null && defaultDistance != null) {
      this.distanceProp = new NumericPropertyM(
        minDistance,
        maxDistance,
        defaultDistance,
        domainDistance,
        null,
        currentDistance,
      );
    }
  }

  get minAzimuth(): number {
    return this.azimuthProp?.getRange()[0];
  }
  get maxAzimuth(): number {
    return this.azimuthProp?.getRange()[1];
  }
  get defaultAzimuth(): number {
    return this.azimuthProp?.defaultValue;
  }
  get minElevation(): number {
    return this.elevationProp?.getRange()[0];
  }
  get maxElevation(): number {
    return this.elevationProp?.getRange()[1];
  }
  get defaultElevation(): number {
    return this.elevationProp?.defaultValue;
  }
  get minDistance(): number {
    return this.distanceProp?.getRange()[0];
  }
  get maxDistance(): number {
    return this.distanceProp?.getRange()[1];
  }
  get defaultDistance(): number {
    return this.distanceProp?.defaultValue;
  }

  setAzimuth(azimuthValue: number): number {
    if (this.azimuthProp == undefined) {
      return undefined;
    }
    this.azimuthProp.value = azimuthValue;
    return this.azimuthProp.value;
  }
  getAzimuth(): number {
    return this.azimuthProp?.value;
  }
  setElevation(elevationValue: number): number {
    if (this.elevationProp == undefined) {
      return undefined;
    }
    this.elevationProp.value = elevationValue;
    return this.elevationProp.value;
  }
  getElevation(): number {
    return this.elevationProp?.value;
  }
  setDistance(distanceValue: number): number {
    if (this.distanceProp == undefined) {
      return undefined;
    }
    this.distanceProp.value = distanceValue;
    return this.distanceProp.value;
  }
  getDistance(): number {
    return this.distanceProp?.value;
  }
  getDomainInfo(axis: "azimuth" | "elevation" | "distance"): DomainInfo {
    if (axis === "azimuth") {
      return this.azimuthProp?.domainInfo;
    }
    if (axis === "elevation") {
      return this.elevationProp?.domainInfo;
    }
    if (axis === "distance") {
      return this.distanceProp?.domainInfo;
    }
  }
  getRange(axis: "azimuth" | "elevation" | "distance"): [number, number] {
    if (axis === "azimuth") {
      return this.azimuthProp?.getRange();
    }
    if (axis === "elevation") {
      return this.elevationProp?.getRange();
    }
    if (axis === "distance") {
      return this.distanceProp?.getRange();
    }
  }
  isEquivalentStructure(other: PositionInteractivityM): boolean {
    return (
      super.isEquivalentStructure(other) &&
      ((this.azimuthProp == null && other.azimuthProp == null) ||
        (this.azimuthProp != null &&
          other.azimuthProp != null &&
          this.azimuthProp.isEquivalentStructure(other.azimuthProp))) &&
      ((this.elevationProp == null && other.elevationProp == null) ||
        (this.elevationProp != null &&
          other.elevationProp != null &&
          this.elevationProp.isEquivalentStructure(other.elevationProp))) &&
      ((this.distanceProp == null && other.distanceProp == null) ||
        (this.distanceProp != null &&
          other.distanceProp != null &&
          this.distanceProp.isEquivalentStructure(other.distanceProp)))
    );
  }
}

export class ProminenceInteractivityM
  extends AudioSceneComponentM
  implements NGAProminenceInteractivity
{
  readonly prominenceProp: NumericPropertyM;

  constructor(
    minProminence: number,
    maxProminence: number,
    defaultProminence: number,
    domainProminence: DomainInfo,
    labels?: LabelsM,
    currentProminence = defaultProminence,
  ) {
    super(labels);
    // range & quantization according to ISO/IEC 23008-3:2022
    this.prominenceProp = new NumericPropertyM(
      minProminence,
      maxProminence,
      defaultProminence,
      domainProminence,
      null,
      currentProminence,
    );
  }

  setProminence(prominenceValue: number): number {
    this.prominenceProp.value = prominenceValue;
    return this.prominenceProp.value;
  }
  getProminence(): number {
    return this.prominenceProp.value;
  }
  getDomainInfo(): DomainInfo {
    return this.prominenceProp.domainInfo;
  }
  getRange(): [number, number] {
    return this.prominenceProp.getRange();
  }
  get minProminence(): number {
    return this.prominenceProp.getRange()[0];
  }
  get maxProminence(): number {
    return this.prominenceProp.getRange()[1];
  }
  get defaultProminence(): number {
    return this.prominenceProp.defaultValue;
  }
}

abstract class AudioSceneNodeM extends AudioSceneComponentM {
  constructor(
    public readonly id?: number,
    labels?: LabelsM,
  ) {
    super(labels);
  }
  isEquivalentStructure(other: AudioSceneNodeM): boolean {
    return super.isEquivalentStructure(other) && this.id === other.id;
  }
}

export class AudioElementM extends AudioSceneNodeM implements NGAAudioElement {
  private enabled: boolean = true;

  /**
   * Construct a new AudioElementM
   * @param kinds
   * @param language audio language
   * @param isToggleable
   * @param isDefaultEnabled
   * @param positionInteractivity
   * @param prominenceInteractivity
   * @param id
   * @param labels
   */
  constructor(
    public readonly kinds: KindsM,
    public readonly language?: string,
    public readonly isDefaultEnabled?: boolean,
    public readonly isToggleable?: boolean,
    public readonly positionInteractivity?: PositionInteractivityM,
    public readonly prominenceInteractivity?: ProminenceInteractivityM,
    id?: number,
    labels?: LabelsM,
    isEnabled = isDefaultEnabled,
  ) {
    super(id, labels);
    if (isDefaultEnabled != null) {
      this.enabled = isEnabled;
    }
  }

  /**
   * @returns Returns the rendering state of the audio element. True means that the audio element is currently selected for rendering.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable the audio element
   * (only possible if isToggleable is set to true).
   */
  enable(): void {
    if (this.isToggleable && this.enabled !== true) {
      this.enabled = true;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            type: "enabledChanged",
            id: this.id,
            enabled: true,
            source: "local",
          },
        }),
      );
    }
  }

  /**
   * Disable the audio element
   * (only possible if isToggleable is set to true).
   */
  disable(): void {
    if (this.isToggleable && this.enabled !== false) {
      this.enabled = false;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            type: "enabledChanged",
            id: this.id,
            enabled: false,
            source: "local",
          },
        }),
      );
    }
  }

  isEquivalentStructure(other: AudioElementM): boolean {
    return (
      super.isEquivalentStructure(other) &&
      this.kinds.equals(other.kinds) &&
      this?.language === other?.language &&
      this?.isDefaultEnabled === other?.isDefaultEnabled &&
      this?.isToggleable === other?.isToggleable &&
      ((this.prominenceInteractivity == null &&
        other.prominenceInteractivity == null) ||
        (this.prominenceInteractivity != null &&
          other.prominenceInteractivity != null &&
          this.prominenceInteractivity.isEquivalentStructure(
            other.prominenceInteractivity,
          ))) &&
      ((this.positionInteractivity == null &&
        other.positionInteractivity == null) ||
        (this.positionInteractivity != null &&
          other.positionInteractivity != null &&
          this.positionInteractivity.isEquivalentStructure(
            other.positionInteractivity,
          )))
    );
  }

  updateStateFromModel(updated: AudioElementM, source = "remote"): void {
    const prevEnabled = this.enabled;
    this.enabled = updated.enabled;
    if (prevEnabled !== this.enabled) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            type: "enabledChanged",
            id: this.id,
            enabled: this.enabled,
            source: source,
          },
        }),
      );
    }
    this?.positionInteractivity?.azimuthProp?.updateStateFromModel(
      updated?.positionInteractivity?.azimuthProp,
      source,
    );
    this?.positionInteractivity?.elevationProp?.updateStateFromModel(
      updated?.positionInteractivity?.elevationProp,
      source,
    );
    this?.positionInteractivity?.distanceProp?.updateStateFromModel(
      updated?.positionInteractivity?.distanceProp,
      source,
    );
    this?.prominenceInteractivity?.prominenceProp?.updateStateFromModel(
      updated?.prominenceInteractivity?.prominenceProp,
      source,
    );
  }
}

export class AudioElementsM implements NGAAudioElements {
  [index: number]: AudioElementM;
  readonly length: number;

  constructor(objects: AudioElementM[]) {
    this.length = objects.length;
    for (let i = 0; i < this.length; i++) {
      this[i] = objects[i];
    }
  }

  isEquivalentStructure(other: AudioElementsM) {
    if (this.length !== other.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!this[i].isEquivalentStructure(other[i])) {
        return false;
      }
    }
    return true;
  }

  updateStateFromModel(updated: AudioElementsM, source = "remote"): void {
    for (let i = 0; i < this.length; i++) {
      this[i].updateStateFromModel(updated[i], source);
    }
  }
}

export class AudioElementSelectionM
  extends AudioSceneNodeM
  implements NGAAudioElementSelection
{
  private active: AudioElementM | null = null;

  constructor(
    readonly audioElements: AudioElementsM,
    readonly defaultElement?: AudioElementM,
    readonly positionInteractivity?: PositionInteractivityM,
    readonly prominenceInteractivity?: ProminenceInteractivityM,
    id?: number,
    labels?: LabelsM,
    activeElement = defaultElement,
  ) {
    super(id, labels);
    this.audioElements = audioElements;
    if (activeElement != null) {
      this.active = activeElement;
    } else if (audioElements.length > 0) {
      this.active = audioElements[0];
    }
  }

  selectAudioElement(audioElement: AudioElementM): void {
    const x = this.indexOf(audioElement);
    if (x === -1) {
      return; // preselection unknown
    }
    if (this.active === audioElement) {
      return; // do not re-select currently active preselection
    }
    this.active = audioElement;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          type: "audioElementSelectionChanged",
          id: audioElement.id,
          parentId: this.id,
          source: "local",
        },
      }),
    );
  }
  getSelectedAudioElement(): AudioElementM | null {
    return this.active;
  }

  private indexOf(p: AudioElementM): number {
    for (let i = 0; i < this.audioElements.length; i++) {
      if (this.audioElements[i] === p) {
        return i;
      }
    }
    return -1;
  }

  isEquivalentStructure(other: AudioElementSelectionM): boolean {
    return (
      super.isEquivalentStructure(other) &&
      this.audioElements.isEquivalentStructure(other.audioElements) &&
      ((this.defaultElement == null && other.defaultElement == null) ||
        (this.defaultElement != null &&
          other.defaultElement != null &&
          this.defaultElement.isEquivalentStructure(other.defaultElement))) &&
      ((this.prominenceInteractivity == null &&
        other.prominenceInteractivity == null) ||
        (this.prominenceInteractivity != null &&
          other.prominenceInteractivity != null &&
          this.prominenceInteractivity.isEquivalentStructure(
            other.prominenceInteractivity,
          ))) &&
      ((this.positionInteractivity == null &&
        other.positionInteractivity == null) ||
        (this.positionInteractivity != null &&
          other.positionInteractivity != null &&
          this.positionInteractivity.isEquivalentStructure(
            other.positionInteractivity,
          )))
    );
  }

  updateStateFromModel(
    updated: AudioElementSelectionM,
    source = "remote",
  ): void {
    const prevActive = this.active;
    this.audioElements.updateStateFromModel(updated.audioElements, source);
    this.defaultElement?.updateStateFromModel(updated.defaultElement, source);
    this.active =
      this.audioElements[updated.indexOf(updated.getSelectedAudioElement())];
    if (this.active.id !== prevActive.id) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            type: "audioElementSelectionChanged",
            id: this.active.id,
            parentId: this.id,
            source: source,
          },
        }),
      );
    }

    this?.positionInteractivity?.azimuthProp?.updateStateFromModel(
      updated?.positionInteractivity?.azimuthProp,
      source,
    );
    this?.positionInteractivity?.elevationProp?.updateStateFromModel(
      updated?.positionInteractivity?.elevationProp,
      source,
    );
    this?.positionInteractivity?.distanceProp?.updateStateFromModel(
      updated?.positionInteractivity?.distanceProp,
      source,
    );
    this?.prominenceInteractivity?.prominenceProp?.updateStateFromModel(
      updated?.prominenceInteractivity?.prominenceProp,
      source,
    );
  }
}

export class AudioElementSelectionsM implements NGAAudioElementSelections {
  [index: number]: AudioElementSelectionM;
  readonly length: number;
  constructor(objects: AudioElementSelectionM[]) {
    this.length = objects.length;
    for (let i = 0; i < this.length; i++) {
      this[i] = objects[i];
    }
  }

  isEquivalentStructure(other: AudioElementSelectionsM) {
    if (this.length !== other.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!this[i].isEquivalentStructure(other[i])) {
        return false;
      }
    }
    return true;
  }

  updateStateFromModel(
    updated: AudioElementSelectionsM,
    source = "remote",
  ): void {
    for (let i = 0; i < this.length; i++) {
      this[i].updateStateFromModel(updated[i], source);
    }
  }
}

export class PreselectionM extends AudioSceneNodeM implements NGAPreselection {
  constructor(
    public readonly kinds: KindsM,
    public readonly audioElements: AudioElementsM,
    public readonly audioElementSelections: AudioElementSelectionsM,
    public readonly language?: string,
    public readonly selectionPriority?: number,
    public readonly channelLayout?: NGAChannelLayout,
    public readonly audioRenderingIndication?: number,
    id?: number,
    labels?: LabelsM,
  ) {
    super(id, labels);
  }
  isEquivalentStructure(other: PreselectionM): boolean {
    return (
      super.isEquivalentStructure(other) &&
      this.kinds.equals(other.kinds) &&
      this.language === other.language &&
      this.selectionPriority === other.selectionPriority &&
      this.channelLayout?.numObjects === other.channelLayout?.numObjects &&
      this.audioRenderingIndication === other.audioRenderingIndication &&
      ((this.audioElements == null && other.audioElements == null) ||
        (this.audioElements != null &&
          other.audioElements != null &&
          this.audioElements.isEquivalentStructure(other.audioElements))) &&
      ((this.audioElementSelections == null &&
        other.audioElementSelections == null) ||
        (this.audioElementSelections != null &&
          other.audioElementSelections != null &&
          this.audioElementSelections.isEquivalentStructure(
            other.audioElementSelections,
          )))
    );
  }

  updateStateFromModel(updated: PreselectionM, source = "remote"): void {
    this.audioElements.updateStateFromModel(updated.audioElements, source);
    this.audioElementSelections.updateStateFromModel(
      updated.audioElementSelections,
      source,
    );
  }
}

export class AudioSceneM
  extends AudioSceneComponentM
  implements NGAPreselections
{
  [index: number]: PreselectionM;
  readonly length: number;
  private active: PreselectionM | null = null;

  constructor(
    preselections: PreselectionM[],
    activePreselection?: PreselectionM,
    public readonly uuid?: string,
    public readonly defaultPreselection: PreselectionM | null = activePreselection,
  ) {
    super();
    this.length = preselections.length;
    for (let i = 0; i < this.length; i++) {
      // fill internal array
      this[i] = preselections[i];
    }
    if (
      activePreselection != null &&
      preselections.includes(activePreselection)
    ) {
      this.active = activePreselection;
    } else if (this.length > 0) {
      this.active = this[0];
    }
  }

  /**
   * Select a preselection as active preselection.
   * @param preselection PreselectionM that should be selected.
   */
  selectPreselection(preselection: PreselectionM): void {
    const x = this.indexOf(preselection);
    if (x === -1) {
      return; // preselection unknown
    }
    if (this.active === preselection) {
      // do not re-select active preselection
      return;
    }
    this.active = preselection;
    // dispatch change event
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          type: "preselectionChanged",
          id: preselection.id,
          source: "local",
        },
      }),
    );
  }

  /**
   * @returns currently selected preselection
   */
  getSelectedPreselection(): PreselectionM | null {
    return this.active;
  }

  /**
   * Find a preselection in the internal array and return its index.
   * @param preselection to be searched for
   * @returns if found: index of the preselection. If not found: -1
   */
  private indexOf(preselection: PreselectionM): number {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === preselection) {
        return i;
      }
    }
    return -1;
  }

  isEquivalentStructure(other: AudioSceneM): boolean {
    if (this.uuid != null && other.uuid != null && this.uuid !== other.uuid) {
      return false;
    }
    if (!super.isEquivalentStructure(other)) {
      return false;
    }
    if (this.length !== other.length) {
      return false;
    }
    if (!this.isDefaultPreselectionEquivalentStructure(other)) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!this[i].isEquivalentStructure(other[i])) {
        return false;
      }
    }
    return true;
  }

  private isDefaultPreselectionEquivalentStructure(other: AudioSceneM) {
    return (
      (this.defaultPreselection == null && other.defaultPreselection == null) ||
      (this.defaultPreselection != null &&
        other.defaultPreselection != null &&
        this.defaultPreselection.isEquivalentStructure(
          other.defaultPreselection,
        ))
    );
  }

  updateStateFromModel(updated: AudioSceneM, source = "remote"): void {
    const prevActivePreselection = this.active;
    const newActivePreselection =
      this[updated.indexOf(updated.getSelectedPreselection())];
    const hasChanged = !prevActivePreselection.isEquivalentStructure(
      newActivePreselection,
    );
    // emit event only if the preselection changed
    if (hasChanged) {
      this.active = newActivePreselection;
      // dispatch change event
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            type: "preselectionChanged",
            id: this.active.id,
            source: source,
          },
        }),
      );
    }
    this.defaultPreselection?.updateStateFromModel(
      updated.defaultPreselection,
      source,
    );
    this.active.updateStateFromModel(newActivePreselection);
    for (let i = 0; i < this.length; i++) {
      this[i].updateStateFromModel(updated[i], source);
    }
  }
}
