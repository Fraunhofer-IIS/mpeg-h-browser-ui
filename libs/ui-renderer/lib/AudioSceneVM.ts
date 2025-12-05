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

import {
  AudioSceneComponentM,
  SceneRepository,
  AudioElementM,
  PositionInteractivityM,
  ProminenceInteractivityM,
  NumericPropertyM,
  AudioElementSelectionM,
  PreselectionM,
  AudioSceneM,
  KindM,
} from "@wmt/mpeg-h-browser-ui-core";
import { Localizable } from "../../core/dist/lib/lib/LanguageTypes";

/**
 * Base class for all ViewModels that have some sort of interactivity and can emit events.
 */
export abstract class InteractiveVM extends EventTarget {
  protected readonly ac = new AbortController();
  constructor(
    readonly model: AudioSceneComponentM,
    protected readonly repository: SceneRepository,
  ) {
    super();
  }
  /**
   * Function to setup change event relay.
   * @param source object emitting the event
   * @param typeOverride override the type in details, or undefined if no type override should happen
   * @param detailOverride Object containing overrides for details.
   */
  protected relayChangeEvents(
    source: EventTarget,
    typeOverride?: string,
    detailOverride?: { [k: string]: unknown },
  ): void {
    if (source == null) return;
    source.addEventListener(
      "change",
      (e: Event) => {
        const detailReceived = (e as CustomEvent).detail ?? {};
        // re-dispatch event but alter detail: override with detailOverride, override type last.
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: {
              ...detailReceived,
              ...detailOverride,
              ...(typeOverride != null ? { type: typeOverride } : {}),
            },
          }),
        );
      },
      { signal: this.ac.signal },
    );
  }

  get labels(): Localizable[] {
    const localizables = [];
    const labels = this.model.labels;
    for (let i = 0; i < labels.length; i++) {
      localizables.push(labels[i].label);
    }
    return localizables;
  }

  getLabelInLang(lang: string): Localizable {
    return this.model.labels.getLabelInLang(lang).label;
  }

  getLabelPreferredInLangs(langs: string[]): Localizable {
    const labels = this.model.labels;
    for (const lang of langs) {
      const inLang = labels.getLabelInLang(lang);
      if (inLang != null) {
        return inLang.label;
      }
    }
    return labels[0]?.label;
  }

  dispose() {
    this.ac.abort();
  }
}

export class PositionInteractivityVM extends InteractiveVM {
  constructor(
    public model: PositionInteractivityM,
    repository: SceneRepository,
  ) {
    super(model, repository);
    this.relayChangeEvents(this.model?.azimuthProp, "azimuthChanged");
    this.relayChangeEvents(this.model?.elevationProp, "elevationChanged");
    this.relayChangeEvents(this.model?.distanceProp, "distanceChanged");
  }

  set azimuth(v: number) {
    this.model.setAzimuth(v);
  }
  get azimuth(): number {
    return this.model.getAzimuth();
  }
  setAzimuth(v: number) {
    this.model.setAzimuth(v);
  }
  set elevation(v: number) {
    this.model.setElevation(v);
  }
  get elevation(): number {
    return this.model.getElevation();
  }
  setElevation(v: number) {
    this.model.setElevation(v);
  }
  setPositionAngular([azim, elev]: [number, number]) {
    this.azimuth = azim;
    this.elevation = elev;
    return this.getPositionAngular();
  }
  getPositionAngular(): [number, number] {
    return [this.azimuth, this.elevation];
  }
  set distance(v: number) {
    this.model.setDistance(v);
  }
  get distance(): number {
    return this.model.getDistance();
  }
  setDistance(v: number) {
    this.model.setDistance(v);
  }
  getDomainInfo(axis: "azimuth" | "elevation" | "distance") {
    return this.model.getDomainInfo(axis);
  }
  getRange(axis: "azimuth" | "elevation" | "distance") {
    return this.model.getRange(axis);
  }
  resetAzimuth(): number {
    return this.model.setAzimuth(this.model.defaultAzimuth);
  }
  resetElevation(): number {
    return this.model.setElevation(this.model.defaultElevation);
  }
  resetDistance(): number {
    return this.model.setDistance(this.model.defaultDistance);
  }
  reset(): void {
    this.resetAzimuth();
    this.resetElevation();
    this.resetDistance();
  }
  hasAzimuthControl(): boolean {
    return !(this.model.azimuthProp == null);
  }
  hasElevationControl(): boolean {
    return !(this.model.elevationProp == null);
  }
  hasDistanceControl(): boolean {
    return !(this.model.distanceProp == null);
  }
  /**
   * Move this audio element in one specific direction by one step.
   * @param dir direction to move
   * @param mode direct: left, right moves azimuth, top, bottom moves elevation
   * @returns true if the position has changed
   */
  moveDirection(dir: "left" | "right" | "up" | "down"): boolean {
    let tomove: NumericPropertyM;
    if (dir == "left" || dir == "right") {
      tomove = this.model.azimuthProp;
    } else if (dir == "up" || dir == "down") {
      tomove = this.model.elevationProp;
    }
    if (!tomove) return false;
    let step = tomove.domainInfo["step"] ?? 1;
    if (dir == "right" || dir == "down") {
      step = -step;
    }
    const oldval = tomove.value;
    tomove.value = oldval + step;
    if (tomove.value !== oldval) return true;
    return false;
  }
}

export class ProminenceInteractivityVM extends InteractiveVM {
  constructor(
    readonly model: ProminenceInteractivityM,
    repository: SceneRepository,
  ) {
    super(model, repository);
    this.relayChangeEvents(this.model?.prominenceProp, "prominenceChanged");
  }

  set prominence(v: number) {
    this.model.setProminence(v);
  }
  get prominence(): number {
    return this.model.getProminence();
  }
  setProminence(v: number) {
    this.model.setProminence(v);
  }
  getDomainInfo() {
    return this.model.getDomainInfo();
  }
  getRange() {
    return this.model.getRange();
  }
}

export class AudioElementVM extends InteractiveVM {
  private readonly _positionInteractivity: PositionInteractivityVM | undefined;
  private readonly _prominenceInteractivity:
    | ProminenceInteractivityVM
    | undefined;
  constructor(
    public readonly model: AudioElementM,
    repository: SceneRepository,
  ) {
    super(model, repository);
    this._positionInteractivity = model.positionInteractivity
      ? new PositionInteractivityVM(model.positionInteractivity, repository)
      : undefined;
    this._prominenceInteractivity = model.prominenceInteractivity
      ? new ProminenceInteractivityVM(model.prominenceInteractivity, repository)
      : undefined;
    // add event listeners, but only to interactivity options that are available
    if (this.hasInteractivity()) {
      this._positionInteractivity?.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === "azimuthChanged")
            this.repository.applyAction({
              type: "setAudioElementAzimuth",
              elementId: this.model.id,
              value: detail.value,
            });
          else if (detail.type === "elevationChanged")
            this.repository.applyAction({
              type: "setAudioElementElevation",
              elementId: this.model.id,
              value: detail.value,
            });
        },
        { signal: this.ac.signal },
      );

      this._prominenceInteractivity?.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === "prominenceChanged")
            this.repository.applyAction({
              type: "setAudioElementProminence",
              elementId: this.model.id,
              value: detail.value,
            });
        },
        { signal: this.ac.signal },
      );

      this.relayChangeEvents(this.model);
      if (this.hasMutingControl()) {
        this.addEventListener(
          "change",
          (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.type === "enabledChanged")
              this.repository.applyAction({
                type: "setAudioElementMute",
                elementId: this.model.id,
                enable: detail.value,
              });
          },
          { signal: this.ac.signal },
        );
      }
    }
  }

  get positionInteractivity(): PositionInteractivityVM | undefined {
    return this._positionInteractivity;
  }
  get prominenceInteractivity(): ProminenceInteractivityVM | undefined {
    return this._prominenceInteractivity;
  }
  get id(): number {
    return this.model?.id;
  }

  /**
   * Calculate whether the Audio Element has any interactivity.
   * @returns true if either muting, prominence, azimuth, elevation or distance interactivity is present.
   */
  hasInteractivity(): boolean {
    return (
      this.hasMutingControl() ||
      this.hasProminenceControl() ||
      this.hasAzimuthControl() ||
      this.hasElevationControl() ||
      this.hasDistanceControl()
    );
  }
  hasMutingControl(): boolean {
    return this.model?.isToggleable;
  }
  hasProminenceControl(): boolean {
    return !(this._prominenceInteractivity == null);
  }
  hasAzimuthControl(): boolean {
    return this._positionInteractivity?.model?.azimuthProp != null;
  }
  hasElevationControl(): boolean {
    return this._positionInteractivity?.model?.elevationProp != null;
  }
  hasDistanceControl(): boolean {
    return this._positionInteractivity?.model?.distanceProp != null;
  }
  enable() {
    this.model?.enable();
  }
  disable() {
    this.model?.disable();
  }
  getKindLabelInLang(lang: string): Localizable | null {
    // returns the label of the first kind instance that has any labels in the queried language
    for (let i = 0; i < this.model.kinds.length; i++) {
      const descriptionLabels = this.model.kinds[i].kindDescription;
      if (descriptionLabels == null || descriptionLabels?.length === 0) {
        continue;
      }
      return descriptionLabels.getLabelInLang(lang).label;
    }
    return null;
  }
  getContentLanguage(): string | null {
    return this.model.language;
  }
  isOfKind(kind: KindM): boolean {
    for (let i = 0; i < this.model.kinds.length; i++) {
      if (
        this.model.kinds[i].schemeUri === kind.schemeUri &&
        this.model.kinds[i].value === kind.value
      )
        return true;
    }
    return false;
  }
  isOfKinds(kinds: KindM[]): boolean {
    for (const kind of kinds) {
      if (this.isOfKind(kind)) {
        return true;
      }
    }
  }
}

export class AudioElementSelectionVM extends InteractiveVM {
  private readonly _positionInteractivity: PositionInteractivityVM | undefined;
  private readonly _prominenceInteractivity:
    | ProminenceInteractivityVM
    | undefined;
  readonly audioElements: AudioElementVM[] = [];
  constructor(
    public readonly model: AudioElementSelectionM,
    repository: SceneRepository,
  ) {
    super(model, repository);
    this._positionInteractivity = model.positionInteractivity
      ? new PositionInteractivityVM(model.positionInteractivity, repository)
      : undefined;
    this._prominenceInteractivity = model.prominenceInteractivity
      ? new ProminenceInteractivityVM(model.prominenceInteractivity, repository)
      : undefined;

    for (let i = 0; i < model.audioElements.length; i++) {
      const audioElement = model.audioElements[i];
      this.audioElements.push(new AudioElementVM(audioElement, repository));
    }

    this.relayChangeEvents(this.model);
    // add event listener for switching
    this.addEventListener("change", (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === "audioElementSelectionChanged")
        this.repository.applyAction({
          type: "selectAudioElementSelection",
          groupId: detail.parentId,
          elementId: detail.id,
        });
    });
    // add further event listeners, but only to interactivity options that are available
    if (this.hasInteractivity()) {
      this._positionInteractivity?.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === "azimuthChanged")
            this.repository.applyAction({
              type: "setAudioElementSelectionAzimuth",
              groupId: this.model.id,
              value: detail.value,
            });
          else if (detail.type === "elevationChanged")
            this.repository.applyAction({
              type: "setAudioElementSelectionElevation",
              groupId: this.model.id,
              value: detail.value,
            });
        },
        { signal: this.ac.signal },
      );

      this._prominenceInteractivity?.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === "prominenceChanged")
            this.repository.applyAction({
              type: "setAudioElementSelectionProminence",
              groupId: this.model.id,
              value: detail.value,
            });
        },
        { signal: this.ac.signal },
      );
    }
  }

  get positionInteractivity(): PositionInteractivityVM | undefined {
    return this._positionInteractivity;
  }
  get prominenceInteractivity(): ProminenceInteractivityVM | undefined {
    return this._prominenceInteractivity;
  }
  get id(): number {
    return this.model?.id;
  }

  /**
   * Calculate whether the Audio Element Selection has any interactivity.
   * @returns true if either muting, prominence, azimuth, elevation or distance interactivity is present.
   */
  hasInteractivity(): boolean {
    return (
      this.hasMutingControl() ||
      this.hasProminenceControl() ||
      this.hasAzimuthControl() ||
      this.hasElevationControl() ||
      this.hasDistanceControl()
    );
  }

  hasMutingControl(): boolean {
    return false;
  }
  hasProminenceControl(): boolean {
    return !(this._prominenceInteractivity == null);
  }
  hasAzimuthControl(): boolean {
    return (
      this._positionInteractivity != null &&
      this._positionInteractivity.model.azimuthProp != null
    );
  }
  hasElevationControl(): boolean {
    return (
      this._positionInteractivity != null &&
      this._positionInteractivity.model.elevationProp != null
    );
  }
  hasDistanceControl(): boolean {
    return (
      this._positionInteractivity != null &&
      this._positionInteractivity.model.distanceProp != null
    );
  }

  selectAudioElement(audioElement: AudioElementVM): void {
    this.model.selectAudioElement(audioElement.model);
  }

  selectAudioElementById(id: number): boolean {
    for (let i = 0; i < this.model.audioElements.length; i++) {
      const checkElem = this.model.audioElements[i];
      if (checkElem.id === id) {
        this.model.selectAudioElement(checkElem);
        return true;
      }
    }
    return false;
  }

  getSelectedAudioElementId(): number | null {
    return this.model.getSelectedAudioElement()?.id;
  }

  getSelectedAudioElement(): AudioElementVM | null {
    const selectedModel = this.model.getSelectedAudioElement();
    for (const ae of this.audioElements) {
      if (ae.model === selectedModel) {
        return ae;
      }
    }
    return null;
  }

  getSelectableAudioElements(): AudioElementVM[] {
    return this.audioElements;
  }

  getSelectedKindLabelInLang(lang: string): Localizable | null {
    // returns the label of the first kind instance that has any labels of the currently selected audio element in the queried language
    let audioObject = this.model.getSelectedAudioElement();
    if (audioObject == null && this.model.audioElements?.length > 0)
      audioObject = this.model.audioElements[0];
    if (audioObject != null) {
      for (let i = 0; i < audioObject.kinds.length; i++) {
        const descriptionLabels = audioObject.kinds[i].kindDescription;
        if (descriptionLabels == null || descriptionLabels?.length === 0) {
          continue;
        }
        return descriptionLabels.getLabelInLang(lang).label;
      }
    }
    return null;
  }
}

export class PreselectionVM extends InteractiveVM {
  audioElements: AudioElementVM[] = [];
  audioElementSelections: AudioElementSelectionVM[] = [];

  constructor(
    readonly model: PreselectionM,
    repository: SceneRepository,
  ) {
    super(model, repository);
    for (let i = 0; i < this.model.audioElements.length; i++) {
      this.audioElements.push(
        new AudioElementVM(this.model.audioElements[i], this.repository),
      );
    }
    for (let i = 0; i < this.model.audioElementSelections.length; i++) {
      this.audioElementSelections.push(
        new AudioElementSelectionVM(
          this.model.audioElementSelections[i],
          this.repository,
        ),
      );
    }
  }

  hasInteractivity(): boolean {
    for (const ae of this.audioElements) {
      if (ae.hasInteractivity()) return true;
    }
    for (const aes of this.audioElementSelections) {
      if (aes.hasInteractivity()) return true;
    }
    return false;
  }

  getContentLanguge(): string | null {
    // return explicit preselection language if available in model
    if (this.model.language != null) {
      return this.model.language;
    }
    // fallback to first found language in audio elements
    for (const ae of this.audioElements) {
      const l = ae.getContentLanguage();
      if (l != null) return l;
    }
    return null;
  }

  getKindLabelInLang(lang: string): Localizable | null {
    // returns the label of the first kind instance that has any labels in the queried language
    for (let i = 0; i < this.model.kinds.length; i++) {
      const descriptionLabels = this.model.kinds[i].kindDescription;
      if (descriptionLabels == null || descriptionLabels?.length === 0) {
        continue;
      }
      return descriptionLabels.getLabelInLang(lang).label;
    }
    return null;
  }

  getSwitchableElementsOfKinds(
    kinds: KindM[],
  ): Map<AudioElementSelectionVM, AudioElementVM[]> {
    const result = new Map<AudioElementSelectionVM, AudioElementVM[]>();
    for (const kind of kinds) {
      // audio element selections
      for (const aes of this.audioElementSelections) {
        const aesSelable = aes.getSelectableAudioElements();
        if (aesSelable.length < 1) continue;
        const matching: AudioElementVM[] = [];
        for (let i = 0; i < aesSelable.length; i++) {
          if (aesSelable[i].isOfKind(kind)) {
            matching.push(aesSelable[i]);
          }
        }
        if (result.has(aes)) {
          result.get(aes)!.push(...matching);
        } else {
          result.set(aes, matching);
        }
      }
    }
    return result;
  }

  getInteractiveAesOfKinds(
    kinds: KindM[] | null,
    filter: "prominence" | "azimuth" | "elevation" | "distance" | null,
  ): (AudioElementVM | AudioElementSelectionVM)[] {
    let filterFunction;
    if (!filter) {
      filterFunction = (a: AudioElementVM | AudioElementSelectionVM) => {
        return a.hasInteractivity();
      };
    } else if (filter == "prominence") {
      filterFunction = (a: AudioElementVM | AudioElementSelectionVM) => {
        return a.hasProminenceControl();
      };
    } else if (filter == "azimuth") {
      filterFunction = (a: AudioElementVM | AudioElementSelectionVM) => {
        return a.hasAzimuthControl();
      };
    } else if (filter == "elevation") {
      filterFunction = (a: AudioElementVM | AudioElementSelectionVM) => {
        return a.hasElevationControl();
      };
    } else if (filter == "distance") {
      filterFunction = (a: AudioElementVM | AudioElementSelectionVM) => {
        return a.hasDistanceControl();
      };
    }

    const rslt: (AudioElementVM | AudioElementSelectionVM)[] = [];
    for (const aes of this.audioElementSelections) {
      if (
        filterFunction(aes) &&
        (kinds == null || aes.getSelectedAudioElement().isOfKinds(kinds))
      ) {
        rslt.push(aes);
      }
    }
    for (const ae of this.audioElements) {
      if (filterFunction(ae) && (kinds == null || ae.isOfKinds(kinds))) {
        rslt.push(ae);
      }
    }
    return rslt;
  }

  reset(globalReset: boolean = false) {
    if (globalReset) {
      this.repository.applyAction({ type: "reset", globalReset: globalReset });
    } else {
      this.repository.applyAction({
        type: "selectPreselection",
        preselectionId: this.model.id,
      });
    }
  }
}

export class AudioSceneVM extends InteractiveVM {
  private _preselections: PreselectionVM[] = [];
  constructor(
    readonly model: AudioSceneM,
    repository: SceneRepository,
  ) {
    super(model, repository);
    this.relayChangeEvents(this.model);
    this.addEventListener(
      "change",
      (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail.type === "preselectionChanged")
          this.repository.applyAction({
            type: "selectPreselection",
            preselectionId: detail.id,
          });
      },
      { signal: this.ac.signal },
    );
    this.updateFromModel();
  }

  updateFromModel() {
    this._preselections = [];
    for (let i = 0; i < this.model.length; i++) {
      this._preselections.push(
        new PreselectionVM(this.model[i], this.repository),
      );
      // updated model: dispatch event for view
      this.dispatchEvent(new CustomEvent("modelUpdated"));
    }
  }

  get preselections() {
    return this._preselections;
  }

  get selectedPreselection() {
    const selected = this.model.getSelectedPreselection();
    for (const p of this._preselections) {
      if (p.model === selected) return p;
    }
  }

  get selectedPreselectionIndex() {
    const selected = this.model.getSelectedPreselection();
    for (let i = 0; i < this._preselections.length; i++) {
      if (this._preselections[i].model === selected) return i;
    }
  }

  selectPreselection(toSelect: PreselectionVM) {
    this.model.selectPreselection(toSelect.model);
  }

  reset() {
    this.repository.applyAction({ type: "reset", globalReset: true });
  }

  hasInteractivity() {
    if (this._preselections?.length > 1) {
      return true;
    }
    if (this.selectedPreselection?.hasInteractivity()) {
      return true;
    }
    return false;
  }
}
