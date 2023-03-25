import { Show } from "solid-js";
import Icon from "@/jsx/Common/Icon";
import styles from "./Options.module.css";

export default function Section(props) {
  return (
    <section class={styles.Section}>
      <h3>
        <Show when={props.icon}>
          <Icon name={props.icon} size={24} />
        </Show>
        {props.title} {props.option && props.option}
      </h3>
      {props.children}
    </section>
  );
}
