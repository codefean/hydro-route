// src/App.js
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import RouteMap from "./pages/routeMap";
import About from "./pages/About";
import Header from "./components/Header";
import Footer from "./components/Footer";

import "./App.css";

// Custom hook for setting the document title
const useDocumentTitle = (title) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
};

// Page wrappers to handle title updates
const RouteMapPage = () => {
  useDocumentTitle("Route Map");
  return <RouteMap />;
};

const AboutPage = () => {
  useDocumentTitle("About");
  return <About />;
};

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Default home route */}
            <Route path="/" element={<RouteMapPage />} />
            <Route path="/route-map" element={<RouteMapPage />} />
            <Route path="/routeMap" element={<RouteMapPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<RouteMapPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
