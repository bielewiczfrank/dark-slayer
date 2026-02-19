import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainMenu from "@/pages/MainMenu";
import CharacterSelect from "@/pages/CharacterSelect";
import LevelSelect from "@/pages/LevelSelect";
import GameScreen from "@/pages/GameScreen";
import Shop from "@/pages/Shop";

function App() {
  return (
    <BrowserRouter>
      <div className="noise-overlay" />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/character-select" element={<CharacterSelect />} />
        <Route path="/level-select/:characterId" element={<LevelSelect />} />
        <Route path="/game/:characterId/:levelId" element={<GameScreen />} />
        <Route path="/shop/:characterId" element={<Shop />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
