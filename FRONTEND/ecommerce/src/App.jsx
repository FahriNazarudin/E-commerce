import Carousel from "./components/Carousel";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
