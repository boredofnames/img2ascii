import { createSignal } from "solid-js";
import Options from "../Ascii/Options";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <div id="sidebar" class={styles.Sidebar}>
      <Options />
    </div>
  );
}
