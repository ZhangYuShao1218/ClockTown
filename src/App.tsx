import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Lobby } from "./components/layout/Lobby";
import { Room } from "./components/game/Room";
import { ScriptTool } from "./components/script-tool/ScriptTool";
import { ReplayViewer } from "./components/replay/ReplayViewer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="/script-tool" element={<ScriptTool />} />
        <Route path="/replay/:id" element={<ReplayViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
