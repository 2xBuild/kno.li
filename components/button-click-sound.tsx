"use client";

import { useEffect } from "react";
import { playClickSfx, playSwitchSfx } from "@/lib/sfx";

const BUTTON_SOUND_SELECTOR = 'button, [data-slot="button"]';
const BUTTON_SOUND_CONTEXT_SELECTOR = "[data-click-sfx]";
const PORTFOLIO_SCOPE_SELECTOR = '[data-page-sfx-scope="portfolio"]';

function isDisabledTrigger(element: HTMLElement) {
  if (element instanceof HTMLButtonElement) {
    return element.disabled;
  }

  return (
    element.getAttribute("aria-disabled") === "true" ||
    element.hasAttribute("disabled")
  );
}

export function ButtonClickSound() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const trigger = event.target.closest<HTMLElement>(BUTTON_SOUND_SELECTOR);
      if (!trigger) {
        return;
      }

      if (trigger.closest(PORTFOLIO_SCOPE_SELECTOR)) {
        return;
      }

      if (isDisabledTrigger(trigger)) {
        return;
      }

      const soundContext = trigger.closest<HTMLElement>(BUTTON_SOUND_CONTEXT_SELECTOR);
      const sound = soundContext?.dataset.clickSfx;

      if (sound === "off") {
        return;
      }

      if (sound === "switch") {
        playSwitchSfx();
        return;
      }

      playClickSfx();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
