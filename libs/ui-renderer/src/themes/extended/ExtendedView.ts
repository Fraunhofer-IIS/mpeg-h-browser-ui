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

import { KindM, Localizable } from "@wmt/mpeg-h-browser-ui-core";
import { NavigationController, View } from "../../../lib";
import {
  AudioElementSelectionVM,
  AudioElementVM,
  AudioSceneVM,
} from "../../../lib/AudioSceneVM";
import { UiComponentFocusable } from "./lib/UiComponentFocusable";
import { ButtonView } from "./lib/ButtonView";
import { PopupView } from "./src/PopupView";
import { MenuBarView } from "./src/MenuBarView";
import { PreselectionsView } from "./src/PreselectionsView";
import { MainSelectionView } from "./src/MainSelectionView";
import { MainProminencesView } from "./src/MainProminencesView";
import { AdvancedView } from "./src/AdvancedView";
import { customLabels, parseObjToCustomLabels } from "./src/ExtendedLabels";
import { ExtendedNavController } from "./src/ExtendedNavController";

import "./assets/styler.css";

export class ExtendedView implements View {
  params = new Map<string, unknown>();
  menuBar: MenuBarView;
  container: HTMLDivElement;
  subViews: PopupView[];
  viewModel: AudioSceneVM;
  ac = new AbortController();
  ac2 = new AbortController();
  constructor(private rootElement: HTMLElement) {
    // create a new extended navigation controller with id 0
    this.params.set("navigationControllers", [new ExtendedNavController(0)]);

    // preferred label languages, label options
    this.params.set("preferredLabelLanguages", []);
    this.params.set("useLanguageEndonyms", true);
    this.params.set("customLabels", customLabels);

    // filter submenu content by Kind
    // second menu: selectable audio elements
    this.params.set("kindFiltersElementSelections", [
      // structure: name, [search for matches], [append to matches if matches were found]
      // first prio: language (displays languages)
      [
        "language",
        [
          new KindM("2", "mae_contentKind"), // dialogue
          new KindM("7", "mae_contentKind"), // voiceover
          new KindM("8", "mae_contentKind"), // spokensubtitle
          new KindM("9", "mae_contentKind"), // audiodescription/visually impaired
          new KindM("11", "mae_contentKind"), // hearing impaired
        ],
        [new KindM("10", "mae_contentKind")],
      ], // commentary
      // second prio: commentary (displays labels)
      [
        "commentary",
        [
          new KindM("10", "mae_contentKind"), // commentary
        ],
      ],
    ]);
    // third menu: prominence controls
    this.params.set("kindFiltersProminence", [
      // first prio: voice accessibility
      [
        "voice_accessibility",
        [
          new KindM("2", "mae_contentKind"), // dialogue
          new KindM("7", "mae_contentKind"), // voiceover
          new KindM("8", "mae_contentKind"), // spokensubtitle
          new KindM("9", "mae_contentKind"), // audiodescription/visually impaired
          new KindM("10", "mae_contentKind"), // commentary
          new KindM("11", "mae_contentKind"), // hearing impaired
        ],
      ],
      // second prio: music
      [
        "music",
        [
          new KindM("3", "mae_contentKind"), // music
        ],
      ],
    ]);
    this.createSubViews();
    this.updateMaxHeight();
    this.addHeightListeners();
  }

  /**
   * Updates max total height variable based on height of the root element.
   * */
  updateMaxHeight() {
    this.rootElement.style.setProperty(
      "--nga-ui-extended-max-total-height",
      `${this.rootElement.offsetHeight}px`,
    );
  }

  addHeightListeners() {
    window.addEventListener("resize", this.updateMaxHeight.bind(this));
    window.addEventListener("load", this.updateMaxHeight.bind(this));
  }

  /**
   * Set the audio scene view model to be used for UI generation and regenerate the UI
   */
  setAudioScene(audioScene: AudioSceneVM) {
    this.ac.abort();
    this.ac = new AbortController();
    if (this.viewModel === audioScene) {
      return;
    }
    // set new vm
    this.viewModel = audioScene;
    this.menuBar.setViewModel(audioScene);
    this.subViews?.[0].setViewModel(audioScene);
    // update
    this.vmStructureUpdated();
    // listener
    this.viewModel.addEventListener(
      "change",
      (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (
          detail.type === "preselectionChanged" ||
          detail.type === "modelUpdated"
        ) {
          this.vmStructureUpdated();
        }
      },
      { signal: this.ac.signal },
    );
  }

  vmStructureUpdated() {
    // init nav ctrl focus
    for (const navCtrl of this.params.get(
      "navigationControllers",
    ) as NavigationController[]) {
      if (navCtrl instanceof ExtendedNavController) {
        if (this.viewModel.hasInteractivity()) {
          navCtrl.initFocus();
        } else {
          navCtrl.loseFocus();
        }
      }
    }
    this.ac2.abort();
    this.ac2 = new AbortController();
    // update viewmodel (only current preselection)
    this.subViews?.[1].setViewModel(this.viewModel.selectedPreselection);
    this.subViews?.[2].setViewModel(this.viewModel.selectedPreselection);
    this.menuBar.updateMainProminences(
      (this.subViews?.[2] as MainProminencesView)?.mode,
      (this.subViews?.[2] as MainProminencesView)?.viewModel,
    );
    this.subViews?.[3].setViewModel(this.viewModel.selectedPreselection);
    this.updateMainSelection();
    for (const sel of this.viewModel.selectedPreselection
      .audioElementSelections) {
      sel.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === "audioElementSelectionChanged") {
            this.updateMainSelection();
          }
        },
        { signal: this.ac2.signal },
      );
    }
  }

  private updateMainSelection() {
    const selFilter = this.params.get("kindFiltersElementSelections") as [
      string,
      KindM[],
      KindM[]?,
    ][];
    let switchableElems = new Map<AudioElementSelectionVM, AudioElementVM[]>();
    let mode: string;
    for (let i = 0; i < selFilter.length; i++) {
      const tmpSwitchableElems =
        this.viewModel.selectedPreselection.getSwitchableElementsOfKinds(
          selFilter[i][1],
        );
      if (
        i === 0 ||
        [...tmpSwitchableElems.values()].some((arr) => arr.length > 1)
      ) {
        mode = selFilter[i][0];
        additionalChecks: if (
          selFilter[i].length > 2 &&
          [...tmpSwitchableElems.values()].some((arr) => arr.length > 1)
        ) {
          const additionalElems =
            this.viewModel.selectedPreselection.getSwitchableElementsOfKinds(
              selFilter[i][2],
            );
          if (![...additionalElems.values()].some((arr) => arr.length > 1))
            break additionalChecks;
          additionalElems.forEach((elems, selection) => {
            if (tmpSwitchableElems.has(selection)) {
              tmpSwitchableElems.get(selection).push(...elems);
            } else {
              tmpSwitchableElems.set(selection, [...elems]);
            }
          });
        }
        switchableElems = tmpSwitchableElems;
        if ([...tmpSwitchableElems.values()].some((arr) => arr.length > 1))
          break;
      }
    }
    this.menuBar.updateMainSelection(mode, switchableElems);
    if (this.subViews[1] instanceof MainSelectionView)
      (this.subViews[1] as MainSelectionView).updateSelectionButtons(
        mode,
        switchableElems,
      );
  }

  /**
   * create sub Views
   */
  createSubViews(): void {
    this.container = document.createElement("div");
    this.container.classList.add("nga-ui-extended");
    this.subViews = [];
    this.menuBar = new MenuBarView(
      this.container,
      this.params,
      this.menuBarSelect.bind(this),
    );
    this.subViews.push(
      new PreselectionsView(
        this.menuBar.containers[0],
        this.params,
        this.menuBar.buttons[0],
      ),
    );
    this.subViews.push(
      new MainSelectionView(
        this.menuBar.containers[1],
        this.params,
        this.menuBar.buttons[1],
      ),
    );
    this.subViews.push(
      new MainProminencesView(
        this.menuBar.containers[2],
        this.params,
        this.menuBar.buttons[2],
      ),
    );
    this.subViews.push(
      new AdvancedView(
        this.menuBar.containers[3],
        this.params,
        this.menuBar.buttons[3],
      ),
    );
    this.rootElement.append(this.container);
  }

  menuBarSelect(b: ButtonView) {
    if (!b.enabled) return undefined;
    const index = this.menuBar.buttons.indexOf(b);
    let newTarget: UiComponentFocusable = undefined;
    for (let i = 0; i < this.subViews.length; i++) {
      if (index !== i) {
        this.subViews[i]?.hide();
        this.menuBar.buttons[i]?.setActive(false);
        continue;
      }
      if (this.subViews[i]?.shown) {
        this.subViews[i]?.hide();
        newTarget = this.menuBar?.buttons[i];
        b?.setActive(false);
      } else {
        this.subViews[i]?.show();
        newTarget = this.subViews[i]?.getMainFocusTarget();
        b?.setActive(true);
      }
    }
    return newTarget;
  }

  /**
   * Retrieve all navigation controllers active for the view.
   * @returns a list of navigation controllers. If no navigation controller is present, [] is returned.
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
    let currentLabels = this.params.get("customLabels") as Record<
      string,
      Localizable[]
    >;
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
   * Hide the view and content.
   */
  hide() {
    for (let i = 0; i < this.subViews.length; i++) {
      this.subViews[i].hide();
    }
    this.menuBar.hide();
    this.rootElement.innerHTML = "";
  }

  /**
   * Dispose the view and remove all event listeners related to this view.
   */
  dispose() {
    this.hide();
    this.container.remove();
    for (let i = 0; i < this.subViews.length; i++) {
      this.subViews[i].dispose();
    }
    this.menuBar.dispose();
  }
}
