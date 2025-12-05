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

import "./assets/styler.css";

import { NavigationController, View } from "../../../lib";
import {
  AudioElementSelectionVM,
  AudioElementVM,
  AudioSceneVM,
  PreselectionVM,
} from "../../../lib/AudioSceneVM";
import {
  customLabels,
  getPreferredLocalizable,
  capitalizeFirstLetter,
} from "./BasicHelpers";
import { Localizable } from "@wmt/mpeg-h-browser-ui-core";
import { BasicNavController } from "./BasicNavController";
import { parseObjToCustomLabels } from "./BasicHelpers";

export class BasicView implements View {
  params = new Map<string, unknown>();
  basicViewElement: HTMLDivElement;
  presetsDiv: HTMLDivElement;
  objectsDiv: HTMLDivElement;
  selectionsDiv: HTMLDivElement;

  constructor(private rootElement: HTMLElement) {
    this.basicViewElement = document.createElement("div");
    this.basicViewElement.id = "nga-ui-basic";
    this.rootElement.append(this.basicViewElement);
    this.params.set("preferredLabelLanguages", []);
    this.params.set("navigationControllers", [new BasicNavController()]);
    this.params.set("customLabels", customLabels);
    this.basicViewElement.scrollTop = 0;
  }

  /**
   * Set the audio scene view model to be used for UI generation and generate the UI.
   */
  setAudioScene(audioScene: AudioSceneVM): void {
    this.basicViewElement.textContent = "";

    this.generateUIPreselectionList(audioScene);
    this.basicViewElement.appendChild(this.presetsDiv);

    this.generateUIObjectList(audioScene.selectedPreselection.audioElements);
    this.basicViewElement.appendChild(this.objectsDiv);

    this.generateUISelectionsList(
      audioScene.selectedPreselection.audioElementSelections,
    );
    this.basicViewElement.appendChild(this.selectionsDiv);

    this.basicViewElement.scrollTop = 0;
  }

  /**
   * Update the UI if another preselection is selected.
   * @param preselection new selected preselection
   */
  updateUIPreselectionChanged(preselection: PreselectionVM): void {
    this.basicViewElement.removeChild(this.objectsDiv);
    this.generateUIObjectList(preselection.audioElements);
    this.basicViewElement.appendChild(this.objectsDiv);

    this.basicViewElement.removeChild(this.selectionsDiv);
    this.generateUISelectionsList(preselection.audioElementSelections);
    this.basicViewElement.appendChild(this.selectionsDiv);
  }

  /**
   * Generate the preselections section of the UI.
   * @param audioScene current audio scene
   */
  generateUIPreselectionList(audioScene: AudioSceneVM): void {
    this.presetsDiv = document.createElement("div");
    this.presetsDiv.className = "presets";
    const presetsLabel = document.createElement("div");
    presetsLabel.className = "headerlabel";
    const preselectionLocalizable = getPreferredLocalizable(
      (this.params.get("customLabels") as Record<string, Localizable[]>)[
        "preselection"
      ],
      this.params.get("preferredLabelLanguages") as string[],
    );
    presetsLabel.textContent = capitalizeFirstLetter(
      preselectionLocalizable.value,
    );
    presetsLabel.lang = preselectionLocalizable.lang;
    this.presetsDiv.appendChild(presetsLabel);
    const presetsInteractivityDiv = document.createElement("div");
    presetsInteractivityDiv.classList.add("interactivityitem");
    this.presetsDiv.appendChild(presetsInteractivityDiv);
    for (const presel of audioScene.preselections) {
      presetsInteractivityDiv.appendChild(
        this.generateUIPreselectionButton(audioScene, presel),
      );
    }
  }

  /**
   * Generate one preselection radio button.
   * @param scene current audio scene
   * @param preselection current preselection
   * @returns <span> containing the button
   */
  generateUIPreselectionButton(
    scene: AudioSceneVM,
    preselection: PreselectionVM,
  ): HTMLSpanElement {
    const container = document.createElement("span");
    const label = document.createElement("label");
    label.className = "presetlabel";
    container.appendChild(label);
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "preset";
    radio.className = "preset";
    if (scene.selectedPreselection === preselection) {
      // add initial focus to selected preselection
      radio.classList.add("basic-focused");
    }
    radio.checked = scene.selectedPreselection === preselection;
    const localizable = preselection.getLabelPreferredInLangs(
      this.params.get("preferredLabelLanguages") as string[],
    );
    label.appendChild(radio);
    const textNode = document.createTextNode(localizable?.value || "");
    label.appendChild(textNode);
    label.lang = localizable?.lang;
    radio.addEventListener("input", () => {
      scene.selectPreselection(preselection);
      this.updateUIPreselectionChanged(preselection);
    });
    return container;
  }

  /**
   * Generate the objects section of the UI.
   * @param objects all audio elements of this preselection
   */
  generateUIObjectList(objects: AudioElementVM[]): void {
    this.objectsDiv = document.createElement("div");
    this.objectsDiv.className = "audioobjects";
    for (const object of objects) {
      if (object.hasInteractivity()) {
        this.objectsDiv.appendChild(
          this.generateUIAudioObjectOrSelection(object),
        );
      }
    }
  }

  /**
   * Generate sliders (interavtivity controls) for an audio element or an element selection.
   * @param object the audio element or selection.
   * @param inSelection whether it is a selection or not.
   * @returns sliders in a <div> element.
   */
  generateUIAudioObjectOrSelection(
    object: AudioElementVM | AudioElementSelectionVM,
    inSelection: boolean = false,
  ): HTMLDivElement {
    const container = document.createElement("div");
    if (!inSelection) {
      container.className = "object";
      const objectLabel = document.createElement("div");
      objectLabel.className = "headerlabel";
      const localizable = object.getLabelPreferredInLangs(
        this.params.get("preferredLabelLanguages") as string[],
      );
      objectLabel.textContent = localizable.value;
      objectLabel.lang = localizable.lang;
      container.appendChild(objectLabel);
    }
    if (object.hasProminenceControl()) {
      container.appendChild(
        this.generateUINumericProperty(
          (this.params.get("customLabels") as Record<string, Localizable[]>)[
            "prominence"
          ],
          object.prominenceInteractivity.getRange(),
          object.prominenceInteractivity.getDomainInfo().step,
          object.prominenceInteractivity.prominence,
          object.prominenceInteractivity.setProminence.bind(
            object.prominenceInteractivity,
          ),
        ),
      );
    }
    if (object.hasAzimuthControl()) {
      container.appendChild(
        this.generateUINumericProperty(
          (this.params.get("customLabels") as Record<string, Localizable[]>)[
            "azimuth"
          ],
          object.positionInteractivity.getRange("azimuth"),
          object.positionInteractivity.getDomainInfo("azimuth").step,
          object.positionInteractivity.azimuth,
          object.positionInteractivity.setAzimuth.bind(
            object.positionInteractivity,
          ),
          true,
        ),
      );
    }
    if (object.hasElevationControl()) {
      container.appendChild(
        this.generateUINumericProperty(
          (this.params.get("customLabels") as Record<string, Localizable[]>)[
            "elevation"
          ],
          object.positionInteractivity.getRange("elevation"),
          object.positionInteractivity.getDomainInfo("elevation").step,
          object.positionInteractivity.elevation,
          object.positionInteractivity.setElevation.bind(
            object.positionInteractivity,
          ),
        ),
      );
    }
    return container;
  }

  /**
   * Generate the UI for a list of audio element selections.
   * @param selections the list of selections that the UI should be generated for
   */
  generateUISelectionsList(selections: AudioElementSelectionVM[]): void {
    this.selectionsDiv = document.createElement("div");
    this.selectionsDiv.className = "audioswitches";
    for (const selection of selections) {
      const selDiv = this.generateUISelection(selection);
      if (selDiv != null) {
        this.selectionsDiv.appendChild(this.generateUISelection(selection));
      }
    }
  }

  /**
   * Generate the UI for one audio element selection.
   * @param selection the selection that the UI should be generated for
   * @returns <div> containing selection buttons and numeric interactivity sliders
   */
  generateUISelection(selection: AudioElementSelectionVM): HTMLDivElement {
    if (!selection.hasInteractivity() && selection.audioElements?.length < 2) {
      return null;
    }
    const container = document.createElement("div");
    container.className = "object";
    const objectLabel = document.createElement("div");
    objectLabel.className = "headerlabel";
    const localizable = selection.getLabelPreferredInLangs(
      this.params.get("preferredLabelLanguages") as string[],
    );
    objectLabel.textContent = localizable.value;
    objectLabel.lang = localizable.lang;
    container.appendChild(objectLabel);

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "interactivityitem";
    container.appendChild(optionsDiv);

    for (const obj of selection.audioElements) {
      const optionDiv = this.generateUIObjectSelectionButton(selection, obj);
      optionsDiv.appendChild(optionDiv);
    }

    container.appendChild(
      this.generateUIAudioObjectOrSelection(selection, true),
    );
    return container;
  }

  /**
   * Generate one button representing an audio element in a audio element selection.
   * @param selection "parent" selection of the audio element
   * @param object audio element that this button represents
   * @returns <span> containing a radio button
   */
  generateUIObjectSelectionButton(
    selection: AudioElementSelectionVM,
    object: AudioElementVM,
  ): HTMLSpanElement {
    const container = document.createElement("span");
    const label = document.createElement("label");
    label.className = "optionlabel";
    container.appendChild(label);
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name =
      "selection_" +
      selection.id +
      "_" +
      selection.getLabelPreferredInLangs(["en"]);
    radio.className = "option";
    radio.checked = selection.getSelectedAudioElementId() === object.model.id;
    const localizable = object.getLabelPreferredInLangs(
      this.params.get("preferredLabelLanguages") as string[],
    );
    label.appendChild(radio);
    const textNode = document.createTextNode(localizable?.value || "");
    label.appendChild(textNode);
    label.lang = localizable?.lang;
    radio.addEventListener("input", () => {
      selection.selectAudioElement(object);
    });
    return container;
  }

  /**
   * Generate one numeric slider.
   * @param localizables localized labels for the slider.
   * @param range value range to be used for the slider
   * @param step value step that the value will be quantized to
   * @param currentValue current value which will be the initial value
   * @param setter setter method to update the value in the model
   * @param inverted whether the slider should invert its range
   * @returns slider in a <div> element
   */
  generateUINumericProperty(
    localizables: Localizable[],
    range: [number, number],
    step: number,
    currentValue: number,
    setter: (v: number) => unknown,
    inverted = false,
  ): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "interactivityitem";
    const label = document.createElement("span");
    label.className = "interactivitylabel";
    const localizable = getPreferredLocalizable(
      localizables,
      this.params.get("preferredLabelLanguages") as string[],
    );
    label.textContent = capitalizeFirstLetter(localizable.value);
    label.lang = localizable.lang;
    container.appendChild(label);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.className = "slider";
    // assign min, max, step & value
    slider.min = inverted ? `${-1 * range[1]}` : `${range[0]}`;
    slider.max = inverted ? `${-1 * range[0]}` : `${range[1]}`;
    slider.step = `${step}`;
    slider.valueAsNumber = inverted ? -1 * currentValue : currentValue;
    slider.addEventListener("change", () => {
      const value = inverted ? -1 * slider.valueAsNumber : slider.valueAsNumber;
      setter(value);
    });
    container.appendChild(slider);
    return container;
  }

  /**
   * Retrieve all navigation controllers active for the view.
   * @returns a list containing one navigation controller. If no navigation controller is present, [] is returned.
   */
  getNavigationControllers(): NavigationController[] {
    return (
      (this.params?.get("navigationControllers") as NavigationController[]) ??
      []
    );
  }

  /**
   * Update a view parameter.
   * @param param the parameter option (key) to be updated
   * @param value the to be set value
   * @returns if the option exists and the value was set: true, else false
   */
  updateViewParam(param: string, value: unknown) {
    if (param == "updateCustomLabels" && value instanceof Object) {
      this.setCustomLabels(value, false);
    }
    if (param == "overrideCustomLabels" && value instanceof Object) {
      this.setCustomLabels(value, true);
    }
    if (this.params.has(param)) {
      this.params.set(param, value);
      return true;
    }
    return false;
  }

  setCustomLabels(customLbls: object, override: boolean = false): void {
    const customLabelsParsed = parseObjToCustomLabels(customLbls);
    if (override === true) {
      this.params.set("customLabels", customLabelsParsed);
      return;
    }
    let currentLabels: Record<string, Localizable[]> = this.params.get(
      "customLabels",
    ) as Record<string, Localizable[]>;
    if (currentLabels == null) currentLabels = {};
    for (const key of Object.keys(customLabelsParsed)) {
      // add new entries
      if (currentLabels[key] == null) {
        currentLabels[key] = customLabelsParsed[key];
        continue;
      }
      // update existing entry
      for (const l of customLabelsParsed[key]) {
        // look for localizable in lang in entry and update
        let updated = false;
        for (let i = 0; i < currentLabels[key].length; i++) {
          if (currentLabels[key][i].lang === l.lang) {
            currentLabels[key][i] = l;
            updated = true;
          }
        }
        // add localizable if language was previously unknown
        if (!updated) {
          currentLabels[key].push(l);
        }
      }
    }
    this.params.set("customLabels", currentLabels);
  }

  /**
   * Dispose the view and clear content.
   */
  dispose() {
    this.rootElement.innerHTML = "";
    return;
  }
}
