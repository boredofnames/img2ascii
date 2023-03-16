import { createEffect, mergeProps, on, onCleanup } from "solid-js";
import { useAscii } from "../Ascii/context";
import styles from "./StatusBanner.module.css";

export const STATUS_CODES = {
  ERROR: 0,
  SUCCESS: 1,
  MESSAGE: 2,
};

export default function StatusBanner() {
  const [state, { setState }] = useAscii();
  let timeout;

  createEffect(
    on(
      () => state.status,
      (status) => {
        if (!status) return;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setState("status", undefined);
        }, state.status.time || 2500);
      },
      { defer: true }
    )
  );

  onCleanup(() => {
    clearTimeout(timeout);
  });

  return (
    <Show when={state.status}>
      <div
        class={styles.statusBanner}
        style={{
          "background-color":
            state.status.code === STATUS_CODES.ERROR
              ? "red"
              : state.status.code === STATUS_CODES.SUCCESS
              ? "lime"
              : "darkgray",
          color: [STATUS_CODES.ERROR, STATUS_CODES.MESSAGE].includes(
            state.status.code
          )
            ? "white"
            : "black",
        }}
      >
        {state.status.msg}
      </div>
    </Show>
  );
}
