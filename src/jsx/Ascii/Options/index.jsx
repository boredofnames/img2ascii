import BgColor from "./BgColor";
import CharSet from "./CharSet";
import ChromaKey from "./ChromaKey";
import Colors from "./Colors";
import CustomPalette from "./CustomPalette";
import Debug from "./Debug";
import styles from "./Options.module.css";
import Quantization from "./Quantization";
import Save from "./Save";
import Scale from "./Scale";
import Upload from "./Upload";

export default function Options() {
  return (
    <div class={styles.Options}>
      <h2>Options</h2>
      <Upload />
      <Scale />
      <CharSet />
      <Colors />
      <BgColor />
      <Quantization />
      <CustomPalette />
      <ChromaKey />
      <Save />
      <Debug />
    </div>
  );
}
