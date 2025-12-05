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

import { DomainInfo, Localizable } from "@wmt/mpeg-h-browser-ui-core";
import {
  AudioElementSelectionVM,
  AudioElementVM,
} from "../../../../lib/AudioSceneVM";
import { UiComponentFocusable } from "../lib/UiComponentFocusable";
import { ButtonView } from "../lib/ButtonView";
import { LabelView } from "../lib/LabelView";
import { ExtendedNavController } from "./ExtendedNavController";

import AzimLeft from "../assets/azimuth_left.svg";
import AzimRight from "../assets/azimuth_right.svg";
import ElevDown from "../assets/arrow_down.svg";
import ElevUp from "../assets/arrow_up.svg";
import PromDecr from "../assets/minus.svg";
import PromIncr from "../assets/plus.svg";

type SliderType = "azimuth" | "elevation" | "prominence";

const imageSources: Record<SliderType, [string, string]> = {
  azimuth: [AzimLeft, AzimRight],
  elevation: [ElevDown, ElevUp],
  prominence: [PromDecr, PromIncr],
};

export class SliderView extends UiComponentFocusable {
  element: HTMLDivElement;
  sliderContainer: HTMLDivElement;
  labelView: LabelView;
  increaseBtn: ButtonView;
  decreaseBtn: ButtonView;
  sliderElement: HTMLInputElement;
  viewModel: AudioElementSelectionVM | AudioElementVM;
  private _type: SliderType;

  protected ac = new AbortController();

  constructor(
    rootElement: HTMLElement,
    params: Map<string, unknown>,
    type: SliderType,
  ) {
    super(rootElement, params);
    this.type = type;
    this.init();
  }

  init() {
    this.element = document.createElement("div");
    this.element.classList.add("slider_and_label_container");
    this.sliderContainer = document.createElement("div");
    this.sliderContainer.classList.add("slidercontainer");
    this.labelView = new LabelView(
      this.element,
      this.params,
      "p",
      (this.params.get("customLabels") as Record<string, Localizable[]>)[
        this.type
      ],
    );
    this.decreaseBtn = new ButtonView(
      this.sliderContainer,
      this.params,
      this.decrease.bind(this),
      (this.params.get("customLabels") as Record<string, Localizable[]>)[
        "decrease"
      ],
      imageSources[this.type][0],
      "action",
    );
    this.decreaseBtn.element.classList.add("sliderbutton");
    this.sliderElement = document.createElement("input");
    this.sliderElement.type = "range";
    this.sliderElement.tabIndex = -1;
    this.sliderContainer.append(this.sliderElement);
    this.increaseBtn = new ButtonView(
      this.sliderContainer,
      this.params,
      this.increase.bind(this),
      (this.params.get("customLabels") as Record<string, Localizable[]>)[
        "increase"
      ],
      imageSources[this.type][1],
      "action",
    );
    this.increaseBtn.element.classList.add("sliderbutton");
    this.element.append(this.sliderContainer);
    super.init();
  }

  setViewModel(
    vm: AudioElementSelectionVM | AudioElementVM,
    useAeLabel: boolean = false,
  ): boolean {
    if (this.viewModel === vm) {
      // no change
      return false;
    }
    this.dispose();
    this.ac = new AbortController();
    this.init();

    this.registerSliderControls();
    if (
      !(vm instanceof AudioElementSelectionVM || vm instanceof AudioElementVM)
    ) {
      // viewModel not properly set
      return false;
    }

    this.viewModel = vm;

    // event listener slider -> view model
    let setter: (v: number) => void = () => {};
    if (this._type === "azimuth") {
      setter = (v) => {
        this.viewModel.positionInteractivity.setAzimuth(-1 * v);
      };
    } else if (this._type === "elevation") {
      setter = (v) => {
        this.viewModel.positionInteractivity.setElevation(v);
      };
    } else if (this._type === "prominence") {
      setter = (v) => {
        this.viewModel.prominenceInteractivity.setProminence(v);
      };
    }
    this.sliderElement.addEventListener(
      "input",
      () => {
        setter(this.sliderElement.valueAsNumber);
      },
      { signal: this.ac.signal },
    );
    if (useAeLabel) {
      this.labelView.updateContent(vm.labels);
    }
    let range: [number, number];
    let domainInfo: DomainInfo;

    // setup + event listeners view model -> slider
    if (this.type == "prominence") {
      range = vm.prominenceInteractivity.getRange();
      domainInfo = vm.prominenceInteractivity.getDomainInfo();
      this.sliderElement.min = range[0] + "";
      this.sliderElement.max = range[1] + "";
      this.sliderElement.step = domainInfo.step + "";
      this.sliderElement.valueAsNumber =
        this.viewModel.prominenceInteractivity.prominence;
      this.viewModel.prominenceInteractivity.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === "prominenceChanged") {
            this.sliderElement.valueAsNumber = detail.value;
          }
        },
        { signal: this.ac.signal },
      );
    }
    if (["azimuth", "elevation", "distance"].includes(this.type)) {
      range = vm.positionInteractivity.getRange(
        this.type as "azimuth" | "elevation" | "distance",
      );
      domainInfo = vm.positionInteractivity.getDomainInfo(
        this.type as "azimuth" | "elevation" | "distance",
      );
      this.sliderElement.min = range[0] + "";
      this.sliderElement.max = range[1] + "";
      this.sliderElement.step = domainInfo.step + "";
      this.sliderElement.valueAsNumber =
        this.type == "azimuth"
          ? this.viewModel.positionInteractivity["azimuth"] * -1
          : this.viewModel.positionInteractivity[
              this.type as "elevation" | "distance"
            ];
      this.viewModel.positionInteractivity.addEventListener(
        "change",
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === this.type + "Changed") {
            this.sliderElement.valueAsNumber =
              this.type == "azimuth" ? detail.value * -1 : detail.value;
          }
        },
        { signal: this.ac.signal },
      );
    }
  }

  set type(type: SliderType) {
    if (type === this._type) return;

    this._type = type;
  }
  get type() {
    return this._type;
  }

  decrease(__b: ButtonView | undefined = undefined) {
    this.sliderElement.stepDown();
    this.sliderElement.dispatchEvent(new Event("input"));
    return this;
  }

  increase(__b: ButtonView | undefined = undefined) {
    this.sliderElement.stepUp();
    this.sliderElement.dispatchEvent(new Event("input"));
    return this;
  }

  registerSliderControls() {
    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    if (exnavs != null && exnavs.length != null) {
      for (const exnav of exnavs) {
        if (!exnav.setConnection) continue;
        exnav.setConnection(this, "left", this.decrease.bind(this), true);
        exnav.setConnection(this, "right", this.increase.bind(this), true);
      }
    }
  }

  dispose() {
    // clear vm listeners
    this.ac.abort();
    // remove rc connections
    const exnavs = this.params?.get(
      "navigationControllers",
    ) as ExtendedNavController[];
    if (exnavs != null && exnavs.length != null) {
      for (const exnav of exnavs) {
        if (!exnav.setConnection) continue;
        exnav.setConnection(this, "left", undefined, true);
        exnav.setConnection(this, "right", undefined, true);
      }
    }
    this.element.remove();
  }
}
