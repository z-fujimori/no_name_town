import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { BitGridFull } from "./components/BitGridFull";
import CameraSample from "./components/CameraSample";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main>
      {/* <BitGridFull /> */}
      <div className="camera">
        <video id="video">Video stream not available.</video>
        <button id="startbutton">Take photo</button>
      </div>
      <canvas id="canvas"> </canvas>
      <div className="output">
        <img id="photo" alt="The screen capture will appear in this box." />
      </div>

      <CameraSample />
    </main>
  );
}

export default App;
