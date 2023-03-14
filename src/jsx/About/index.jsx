import { createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import styles from "./About.module.css";

function AboutButton(props) {
  return (
    <span class={styles.AboutButton} onClick={props.toggleAbout}>
      ❔
    </span>
  );
}

export function About(props) {
  const [showAbout, setShowAbout] = createSignal(false);
  function toggleAbout() {
    setShowAbout(!showAbout());
  }
  return (
    <Portal mount={document.querySelector("body")}>
      <AboutButton toggleAbout={toggleAbout} />
      <Show when={showAbout()}>
        <div class={styles.About}>
          <span class={styles.close} onClick={toggleAbout}>
            ●
          </span>
          <div class={styles.content}>
            img2ascii by Anthony Kolak
            <a
              href="https://github.com/boredofnames/img2ascii"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source Code
            </a>
            <a
              href="https://www.paypal.com/paypalme/4z3r0d3v"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate
            </a>
          </div>
        </div>
      </Show>
    </Portal>
  );
}
