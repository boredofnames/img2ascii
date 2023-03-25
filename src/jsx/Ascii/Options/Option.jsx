import styles from "./Options.module.css";

export default function Option(props) {
  return (
    <div class={styles.Option}>
      {props.title && props.title + ": "}
      {props.children}
    </div>
  );
}
