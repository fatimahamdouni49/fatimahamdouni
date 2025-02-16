import React, { useState, useEffect, createContext } from "react"; 
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import PaginaVoz from "./PaginaVoz";
import Chatbot from "./Chatbox";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Reports from "./Reports";

const UserContext = createContext({ user: null, setUser: () => {} });

interface Cat {
  id: string;
  url: string;
  breeds?: { name: string }[];
}

const genAI = new GoogleGenerativeAI("AIzaSyCZ0zIusZB1ONwevlsUgElhVhVYAuvFZvc");

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [cats, setCats] = useState<Cat[]>([]);
  const [filteredCats, setFilteredCats] = useState<Cat[]>([]);
  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatResponse, setChatResponse] = useState("");

  useEffect(() => {
    fetch("https://api.thecatapi.com/v1/images/search?limit=10&include_breeds=true")
      .then((response) => response.json())
      .then((data: Cat[]) => {
        setCats(data);
        setFilteredCats(data);
      });
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
  };

  const handleChat = async (message: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    setChatResponse(result.text());
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    const filtered = cats.filter((cat) =>
      cat.breeds?.some((breed) => breed.name.toLowerCase().includes(value))
    );
    setFilteredCats(filtered.length > 0 ? filtered : cats);
    setCurrentIndex(0);
  };

  const nextCat = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredCats.length);
  const prevCat = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredCats.length) % filteredCats.length);

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Sueño de los Mil y Un Gatos</h1>
          <h3>by Cat's Ocean</h3>
        </header>

        <nav className="navbar">
          <ul className="navbar-links">
            <li><Link to="/">API</Link></li>
            <li><a onClick={toggleDarkMode} style={{ cursor: "pointer" }}>{darkMode ? "Modo Claro" : "Modo Oscuro"}</a></li>
            <li>
              {isLoggedIn ? (
                <a onClick={() => setIsLoggedIn(false)} style={{ cursor: "pointer" }}>Logout</a>
              ) : (
                <a href="#login" style={{ cursor: "pointer" }}>Login</a>
              )}
            </li>
            {isLoggedIn && <li><a href="#">Perfil</a></li>}
            <li><Link to="/voz">Reconocimiento de Voz</Link></li>
            <li><Link to="/informes">Informes</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={
            !isLoggedIn ? (
              <div id="login" className="login-container">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
                  <input type="text" name="username" placeholder="Nombre de usuario" required className="login-input" />
                  <button type="submit">Entrar</button>
                </form>
              </div>
            ) : (
              <div className="container">
                <h2>Galería de Gatitos</h2>
                <input type="text" placeholder="Buscar por raza..." value={search} onChange={handleSearch} className="search-bar" />
                {filteredCats.length > 0 ? (
                  <div>
                    <img src={filteredCats[currentIndex].url} alt="Gatito" className="cat-img" />
                    {filteredCats[currentIndex].breeds?.[0] && <p>Raza: {filteredCats[currentIndex].breeds[0].name}</p>}
                    <div className="btn-group">
                      <button onClick={prevCat}>Anterior</button>
                      <button onClick={nextCat}>Siguiente</button>
                    </div>
                  </div>
                ) : <p>No se encontraron resultados.</p>}
                <div className="row">
                  <div className="col-sm-4">
                    <img src="./img/gato1.jpg" style={{ width: 200, height: 200 }} alt="Gato 1" />
                  </div>
                  <div className="col-sm-4">
                    <img src="./img/gato2.jpg" style={{ width: 200, height: 200 }} alt="Gato 2" />
                  </div>
                  <div className="col-sm-4">
                    <img src="./img/gato3.jpg" style={{ width: 200, height: 200 }} alt="Gato 3" />
                  </div>
                </div>
              </div>
            )
          } />
          <Route path="/voz" element={<PaginaVoz />} />
          <Route path="/informes" element={<Reports />} />
        </Routes>

        <div className="chatbox-container">
          <Chatbot onMessage={handleChat} response={chatResponse} /> 
        </div> 
      </div>
    </Router>
  );
};

const AppWrapper: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  return <UserContext.Provider value={{ user, setUser }}><App /></UserContext.Provider>;
};

export default AppWrapper;
