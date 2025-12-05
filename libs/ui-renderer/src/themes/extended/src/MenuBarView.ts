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

import { appendToLocalizables, Localizable } from "@wmt/mpeg-h-browser-ui-core";
import {
  AudioElementSelectionVM,
  AudioElementVM,
  AudioSceneVM,
} from "../../../../lib/AudioSceneVM";
import { UiComponent } from "../lib/UiComponent";
import { UiComponentFocusable } from "../lib/UiComponentFocusable";
import { LabelView } from "../lib/LabelView";
import { ButtonView } from "../lib/ButtonView";
import { ExtendedNavController } from "./ExtendedNavController";

import AdvancedSvg from "../assets/advanced.svg";

export class MenuBarView extends UiComponent {
  viewModel: AudioSceneVM;
  element: HTMLUListElement;
  containers: HTMLLIElement[];
  buttons: ButtonView[];
  labels: LabelView[];
  ac = new AbortController();

  constructor(
    rootElement: HTMLElement,
    params: Map<string, unknown>,
    private readonly selectAction: (b: ButtonView) => UiComponentFocusable,
  ) {
    super(rootElement, params);
    this.element = document.createElement("ul");
    this.element.classList.add("menubar");
    this.init();
  }

  init(): void {
    super.init();
    this.containers = [];
    this.labels = [];
    this.buttons = [];

    for (let i = 0; i < 4; i++) {
      this.containers[i] = document.createElement("li");
    }

    this.labels.push(
      new LabelView(
        this.containers[0],
        this.params,
        "h2",
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "preselection"
        ],
      ),
    );
    this.buttons.push(
      new ButtonView(
        this.containers[0],
        this.params,
        this.selectAction,
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "not available"
        ],
        undefined,
        "dropup",
      ),
    );
    this.buttons[0].setEnabled(false);

    this.labels.push(
      new LabelView(
        this.containers[1],
        this.params,
        "h2",
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "language"
        ],
      ),
    );
    this.buttons.push(
      new ButtonView(
        this.containers[1],
        this.params,
        this.selectAction,
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "not available"
        ],
        undefined,
        "dropup",
      ),
    );
    this.buttons[1].setEnabled(false);

    this.labels.push(
      new LabelView(
        this.containers[2],
        this.params,
        "h2",
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "voice_accessibility"
        ],
      ),
    );
    this.buttons.push(
      new ButtonView(
        this.containers[2],
        this.params,
        this.selectAction,
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "not available"
        ],
        undefined,
        "dropup",
      ),
    );
    this.buttons[2].setEnabled(false);

    this.labels.push(
      new LabelView(
        this.containers[3],
        this.params,
        "h2",
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "advanced"
        ],
      ),
    );
    this.buttons.push(
      new ButtonView(
        this.containers[3],
        this.params,
        this.selectAction,
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "advanced"
        ],
        AdvancedSvg,
        "action",
      ),
    );
    this.buttons[this.buttons.length - 1].element.classList.add("advanced");
    this.buttons[3].setEnabled(false);
    for (const l of this.labels) {
      l.element.classList.add("capitalize");
    }
    for (const c of this.containers) {
      this.element.append(c);
    }

    const navCtrls = this.params.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    for (const exNavCtrlr of navCtrls) {
      if (!(exNavCtrlr instanceof ExtendedNavController)) continue;
      for (let i = 0; i < this.buttons.length; i++) {
        exNavCtrlr.setConnection(this.buttons[i], "select", () =>
          this.selectAction(this.buttons[i]),
        );
        exNavCtrlr.setConnection(this.buttons[i], "right", this.buttons[i + 1]);
        exNavCtrlr.setConnection(this.buttons[i + 1], "left", this.buttons[i]);
      }
    }
  }

  updateMainSelection(
    mode = "language",
    switchableElems = new Map<AudioElementSelectionVM, AudioElementVM[]>(),
  ) {
    this.labels[1].updateContent(
      (this.params.get("customLabels") as Record<string, Localizable[]>)[mode],
    );
    const firstSel: AudioElementSelectionVM = switchableElems
      ?.keys()
      ?.next()?.value;
    const activeEl = firstSel?.getSelectedAudioElement();
    if (switchableElems.size > 0 && activeEl != null) {
      if (mode === "language") {
        this.buttons[1].labelView.element.classList.add("capitalize");
        this.buttons[1].labelView.updateContentFromLangCode(
          activeEl.getContentLanguage(),
        );
      } else {
        this.buttons[1].labelView.element.classList.remove("capitalize");
        this.buttons[1].updateLabel(activeEl.labels);
      }
      this.buttons[1].setEnabled(switchableElems.get(firstSel).length > 1);
    } else {
      // no switchable elems -> is in language mode by default
      this.buttons[1].setEnabled(false);
      const fallbackPreselLanguage =
        this.viewModel.selectedPreselection.getContentLanguge();
      if (fallbackPreselLanguage == null) {
        this.buttons[1].labelView.element.classList.remove("capitalize");
        this.buttons[1].updateLabel(
          (this.params.get("customLabels") as Record<string, Localizable[]>)[
            "not available"
          ],
        );
      } else {
        this.buttons[1].labelView.element.classList.add("capitalize");
        this.buttons[1].labelView.updateContentFromLangCode(
          fallbackPreselLanguage,
        );
      }
    }
  }

  updateMainProminences(
    mode: string = "voice_accessibility",
    prominences: (AudioElementSelectionVM | AudioElementVM)[] = [],
  ) {
    this.labels[2].updateContent(
      (this.params.get("customLabels") as Record<string, Localizable[]>)[mode],
    );
    if (prominences?.length === 1) {
      this.buttons[2].updateLabel(prominences[0].labels);
      this.buttons[2].setEnabled(true);
    } else if (prominences?.length > 1) {
      this.buttons[2].updateLabel(
        appendToLocalizables(prominences[0].labels, ", ..."),
      );
      this.buttons[2].setEnabled(true);
    } else {
      this.buttons[2].updateLabel(
        (this.params.get("customLabels") as Record<string, Localizable[]>)[
          "not available"
        ],
      );
      this.buttons[2].setEnabled(false);
    }
  }

  updateLabels() {
    for (const btn of this.buttons) {
      btn.labelView?.update();
    }
    for (const lbl of this.labels) {
      lbl.update();
    }
    this.buttons[0].updateLabel(this.viewModel.selectedPreselection.labels);
  }

  updateAvailability() {
    const interactive = this.viewModel.selectedPreselection.hasInteractivity();
    this.buttons[0].setEnabled(this.viewModel.preselections?.length > 1);
    this.buttons[2].setEnabled(interactive);
    this.buttons[3].setEnabled(interactive);
  }

  setViewModel(vm: AudioSceneVM) {
    this.ac.abort();
    this.ac = new AbortController();
    if (this.viewModel === vm) return;
    this.viewModel = vm;
    this.updateLabels();
    this.updateAvailability();
    this.viewModel.addEventListener(
      "change",
      (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (
          detail.type === "preselectionChanged" ||
          detail.type === "modelUpdated"
        ) {
          this.updateLabels();
          this.updateAvailability();
        }
      },
      { signal: this.ac.signal },
    );
  }

  show() {
    this.element.classList.add("shown");
    this.element.classList.remove("hidden");
  }

  hide() {
    this.element.classList.add("hidden");
    this.element.classList.remove("shown");
  }

  dispose() {
    this.ac.abort();
  }
}
