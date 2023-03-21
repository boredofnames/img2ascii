import { mergeProps, splitProps } from "solid-js";

export default function Icon(props) {
  const merged = mergeProps({ name: "help", size: 48 }, props);
  const [local, rest] = splitProps(merged, ["name", "size"]);

  return (
    <span
      class={`material-symbols-outlined size-${local.size} pointer`}
      {...rest}
    >
      {local.name}
    </span>
  );
}
