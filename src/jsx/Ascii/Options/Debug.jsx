import { useAscii } from "../context";

export default function Debug() {
  const [state] = useAscii();
  return (
    <Show when={state.debug}>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </Show>
  );
}
