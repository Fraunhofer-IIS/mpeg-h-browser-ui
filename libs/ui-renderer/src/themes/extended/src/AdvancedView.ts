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
  AudioElementSelectionVM,
  AudioElementVM,
  PreselectionVM,
} from "../../../../lib/AudioSceneVM";
import { UiComponentFocusable } from "../lib/UiComponentFocusable";
import { PopupView } from "./PopupView";
import { ButtonView } from "../lib/ButtonView";
import { SliderView } from "./SliderView";
import { AdvancedSelectionView } from "./AdvancedSelectionView";
import { AdvancedNavBarView } from "./AdvancedNavBarView";
import { Localizable } from "@wmt/mpeg-h-browser-ui-core";

export class AdvancedView extends PopupView {
  viewModel: PreselectionVM;
  element: HTMLUListElement;
  ac = new AbortController();
  currentAeOrAes: AudioElementVM | AudioElementSelectionVM;
  interactivityContainer: HTMLDivElement;
  interactivityControls: UiComponentFocusable[] = [];
  navBar: AdvancedNavBarView;
  resetButton: ButtonView;
  advancedSelectionView: AdvancedSelectionView;
  currentIndex = 0;

  constructor(
    rootElement: HTMLElement,
    params: Map<string, unknown>,
    parentFocusElement: UiComponentFocusable,
  ) {
    super(rootElement, params, parentFocusElement);
    this.init();
  }

  init() {
    super.init();

    this.element.classList.add("advanced_menu");
    this.element.classList.add("submenu_l1");
    this.navBar = new AdvancedNavBarView(
      this.element,
      this.params,
      this.switchPage.bind(this),
    );
    this.interactivityContainer = document.createElement("div");
    this.interactivityContainer.classList.add("advanced_interactivity");
    this.element.append(this.interactivityContainer);
    this.resetButton = new ButtonView(
      this.element,
      this.params,
      () => {
        this.viewModel.reset(false);
        return this.parentFocusElement;
      },
      (this.params.get("customLabels") as Record<string, Localizable[]>)[
        "reset"
      ],
      undefined,
      "action",
    );
    this.resetButton.element.classList.add("reset_button");
    this.registerComponentFirstLayer(this.navBar);
    this.registerComponentFirstLayer(this.resetButton);
  }

  setViewModel(vm: PreselectionVM) {
    this.dispose(true);
    this.ac = new AbortController();
    this.init();

    this.viewModel = vm;
    const aes = this.viewModel.getInteractiveAesOfKinds(null, null);
    if (this.currentIndex >= aes.length) {
      this.currentIndex = 0;
    }
    this.currentAeOrAes = aes?.[this.currentIndex];
    if (this.currentAeOrAes == null) {
      this.hide();
    }
    this.navBar.setViewModel(this.currentAeOrAes);
    this.navBar.setEnabled(aes.length > 1);
    this.fillPage();
    this.updateMaxHeight(aes);
  }

  updateMaxHeight(aes: (AudioElementVM | AudioElementSelectionVM)[]) {
    let max_count_buttons_sliders = [0, 0];
    let current;
    for (const ae of aes) {
      if (
        ae instanceof AudioElementSelectionVM &&
        ae.audioElements.length > 0
      ) {
        current = [1, 0];
      } else {
        current = [0, 0];
      }
      if (ae.hasProminenceControl()) {
        current[1] += 1;
      }
      if (ae.hasAzimuthControl()) {
        current[1] += 1;
      }
      if (ae.hasElevationControl()) {
        current[1] += 1;
      }
      if (
        current[1] > max_count_buttons_sliders[1] ||
        (current[1] == max_count_buttons_sliders[1] &&
          current[0] > max_count_buttons_sliders[0])
      ) {
        max_count_buttons_sliders = current;
      }
      this.element.style.setProperty(
        "--nga-ui-extended-advanced-max-btns",
        max_count_buttons_sliders[0].toString(),
      );
      this.element.style.setProperty(
        "--nga-ui-extended-advanced-max-sliders",
        max_count_buttons_sliders[1].toString(),
      );
    }
  }

  emptyPage() {
    for (const i of this.interactivityControls) {
      this.unregisterComponentFirstLayer(i);
      i.element.remove();
    }
    this.interactivityControls = [];
    if (this.advancedSelectionView != null) {
      this.advancedSelectionView.dispose();
    }
  }

  fillPage() {
    if (this.currentAeOrAes == undefined) return;
    this.navBar.setViewModel(this.currentAeOrAes);
    if (
      this.currentAeOrAes instanceof AudioElementSelectionVM &&
      this.currentAeOrAes.audioElements.length > 0
    ) {
      const selectionBtn = new ButtonView(
        this.interactivityContainer,
        this.params,
        this.toggleElementSwitch.bind(this),
        this.currentAeOrAes.getSelectedAudioElement().labels,
        undefined,
        "dropdown",
      );
      selectionBtn.setEnabled(true);
      this.currentAeOrAes.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === "audioElementSelectionChanged") {
            selectionBtn.updateLabel(
              (
                this.currentAeOrAes as AudioElementSelectionVM
              )?.getSelectedAudioElement()?.labels,
            );
          }
        },
        { signal: this.ac.signal },
      );
      if (this.currentAeOrAes.audioElements.length == 1) {
        selectionBtn.setEnabled(false);
      }
      this.interactivityControls.push(selectionBtn);
      this.advancedSelectionView = new AdvancedSelectionView(
        this.interactivityContainer,
        this.params,
        selectionBtn,
      );
      this.advancedSelectionView.setViewModel(this.currentAeOrAes);
    }
    if (this.currentAeOrAes.hasProminenceControl()) {
      const promSlider = new SliderView(
        this.interactivityContainer,
        this.params,
        "prominence",
      );
      promSlider.setViewModel(this.currentAeOrAes);
      this.interactivityControls.push(promSlider);
    }
    if (this.currentAeOrAes.hasAzimuthControl()) {
      const azimSlider = new SliderView(
        this.interactivityContainer,
        this.params,
        "azimuth",
      );
      azimSlider.setViewModel(this.currentAeOrAes);
      this.interactivityControls.push(azimSlider);
    }
    if (this.currentAeOrAes.hasElevationControl()) {
      const elevSlider = new SliderView(
        this.interactivityContainer,
        this.params,
        "elevation",
      );
      elevSlider.setViewModel(this.currentAeOrAes);
      this.interactivityControls.push(elevSlider);
    }
    this.unregisterComponentFirstLayer(this.resetButton);
    let firstRegistered = false;
    for (let i = 0; i < this.interactivityControls.length; i++) {
      if (this.interactivityControls[i].enabled && !firstRegistered) {
        this.registerComponentFirstLayer(this.interactivityControls[i], true);
        firstRegistered = true;
      } else {
        this.registerComponentFirstLayer(this.interactivityControls[i], false);
      }
    }
    this.registerComponentFirstLayer(this.resetButton);
    this.resetButton.labelView.update();
  }

  toggleElementSwitch(btn: ButtonView | null = null): UiComponentFocusable {
    if (this.advancedSelectionView.shown) {
      this.advancedSelectionView.hide();
      btn?.setActive(false);
      return btn;
    } else {
      this.advancedSelectionView.show();
      btn?.setActive(true);
      return this.advancedSelectionView.getMainFocusTarget();
    }
  }

  switchPage(direction: "left" | "right") {
    const allInteractive = this.viewModel.getInteractiveAesOfKinds(null, null);
    if (direction === "left") {
      this.currentIndex -= 1;
      if (this.currentIndex < 0) {
        this.currentIndex = allInteractive.length - 1;
      }
    } else if (direction === "right") {
      this.currentIndex += 1;
      if (this.currentIndex >= allInteractive.length) {
        this.currentIndex = 0;
      }
    }
    if (this.advancedSelectionView?.shown) {
      this.toggleElementSwitch();
    }
    this.currentAeOrAes = allInteractive?.[this.currentIndex];
    this.emptyPage();
    this.fillPage();
  }

  getMainFocusTarget(): UiComponentFocusable {
    for (const focusableElement of this.interactivityControls) {
      if (focusableElement.focusable) {
        return focusableElement;
      }
    }
    return null;
  }

  dispose(full: boolean = false) {
    this.emptyPage();
    super.dispose();
    if (full) {
      this.navBar.dispose();
      this.element.remove();
    }
    // clear navigation graph
    for (const i of this.interactivityControls) {
      this.unregisterComponentFirstLayer(i);
    }
    if (full) {
      this.unregisterComponentFirstLayer(this.navBar);
      this.unregisterComponentFirstLayer(this.resetButton);
    }
  }

  hide() {
    this.advancedSelectionView?.hide();
    super.hide();
  }
}
