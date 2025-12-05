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

import { NavigationController } from "../../../../lib";
import { UiComponentFocusable } from "../lib/UiComponentFocusable";

type NavigationTarget =
  | UiComponentFocusable
  | (() => UiComponentFocusable)
  | undefined;

export class ExtendedNavController implements NavigationController {
  // keep track of a graph with references to the elements
  // call focus and unfocus on the elements
  readonly supportedActions = ["left", "right", "up", "down", "select", "back"];
  private _navConnections: Map<
    UiComponentFocusable,
    Record<string, NavigationTarget>
  > = new Map();
  private _currentFocus: UiComponentFocusable;

  /**
   *
   * @param id ID for navigation. multiple navigation controllers are possible (e.g. one for keyboard, one for remote control actions)
   */
  constructor(readonly id: number) {}

  /**
   * Retrieve the target of a connection, without actually going there.
   * @param from
   * @param action
   * @returns
   */
  getConnection(from: UiComponentFocusable, action: string): NavigationTarget {
    if (
      !this.supportedActions.includes(action) ||
      !this._navConnections.has(from)
    ) {
      return undefined;
    }
    return this._navConnections.get(from)[action];
  }

  /**
   * Removes a source and all outgoing connections completely from the navigation graph.
   * @param source to be removed
   * @returns true if the source was removed
   */
  removeSource(source: UiComponentFocusable): boolean {
    return this._navConnections?.delete(source);
  }

  /**
   * Set a connection ("edge") in the navigation graph.
   * @param from Ui component from where a connection should be set.
   * @param action on action, perform function to or go to to
   * @param to NavigationTarget to be executed or focus moved to.
   * @returns true if the "edge" was added to the navigation graph.
   */
  setConnection(
    from: UiComponentFocusable,
    action: string,
    to: NavigationTarget | undefined,
    override: boolean = false,
  ): boolean {
    if (!this.supportedActions.includes(action)) {
      return false;
    }
    if (!this._navConnections.has(from)) {
      const initSet: Record<string, NavigationTarget> = {};
      for (const ac of this.supportedActions) {
        initSet[ac] = undefined;
      }
      this._navConnections.set(from, initSet);
    }
    const outgoing = this._navConnections.get(from);
    if (outgoing[action] != null && !override) {
      return false;
    }
    outgoing[action] = to;
    // cleanup graph
    if (Object.values(outgoing).every((value) => value == null)) {
      this._navConnections.delete(from);
    }
    return true;
  }

  /**
   * Perform an action. If the new target is not enabled, the same action will be called on it again
   * @param action action to be performed
   * @param maxDepth maximum depth for iterative search of the graph (as disabled nodes are skipped).
   * @returns true if an action (move focus or function call) was performed.
   */
  performAction(action: string, maxDepth: number = 10): boolean {
    // pre-checks
    if (!this.supportedActions.includes(action)) return false;
    if (
      this._currentFocus == null ||
      !this._navConnections?.has(this._currentFocus)
    ) {
      this._currentFocus = null;
      // default focus to first enabled element in the graph
      for (let i = 0; i < 4; i++) {
        const entry = this._navConnections?.entries().next();
        if (entry.value?.[0]?.focusable) {
          this._currentFocus = entry.value?.[0];
          entry.value?.[0]?.focus(0);
        }
      }
    }
    if (this._currentFocus == null) {
      return false;
    }

    // search for new target
    let target: UiComponentFocusable | (() => UiComponentFocusable) =
      this._currentFocus;
    for (let i = 0; i < maxDepth; i++) {
      target = this._navConnections.get(target)?.[action];
      // no target found -> return false
      if (target == null) return false;

      if (typeof target === "function") {
        // execute function and set return as new query
        target = target();
        if (!this._navConnections.has(target)) {
          // new target not in graph -> return false (otherwise navigation would be stuck forever there!)
          return false;
        }
      }

      // end search if we found enabled query
      if (target instanceof UiComponentFocusable && target.enabled) break;
      if (i === maxDepth - 1) {
        return false;
      }
    }

    // move focus to new target
    this._currentFocus.blur(0);
    target.focus(0);
    this._currentFocus = target;
    return true;
  }

  initFocus() {
    if (
      this._currentFocus == null ||
      !this._navConnections?.has(this._currentFocus)
    ) {
      // default focus to first element in the graph which is not disabled

      this._currentFocus?.blur(0);
      for (const key of this._navConnections?.keys() || []) {
        if (key?.focusable === true) {
          this._currentFocus = key;
          this._currentFocus?.focus(0);
          break;
        }
      }
    }
  }

  loseFocus() {
    this._currentFocus?.blur(0);
    this._currentFocus = null;
  }

  get currentFocus() {
    return this._currentFocus;
  }

  set currentFocus(newFocus: UiComponentFocusable) {
    if (this._navConnections.has(newFocus)) {
      this._currentFocus.blur(0);
      newFocus.focus(0);
      this._currentFocus = newFocus;
    }
  }
}
