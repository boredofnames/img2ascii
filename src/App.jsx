import styles from "./App.module.css";
import { About } from "./jsx/About";
import Ascii from "./jsx/Ascii";
import { AsciiProvider } from "./jsx/Ascii/context";
import Sidebar from "./jsx/sidebar";

function App() {
  return (
    <div class={styles.App}>
      <Sidebar />
      <AsciiProvider>
        <Ascii />
      </AsciiProvider>
      <About />
    </div>
  );
}

export default App;
