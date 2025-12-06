import { use, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { listen } from "@tauri-apps/api/event";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import WebcamComponent from "./pages/WebcamComponent";
import Home from "./pages/Home";
import GetUserMediaCam from "./pages/GetUserMediaCam";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/streamCam" element={<WebcamComponent />} />
        <Route path="/getUserMediaCam" element={<GetUserMediaCam />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
