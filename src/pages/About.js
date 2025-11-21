import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About</h1>
      <div className="about-content">
        <p>
          <strong>Title</strong> The research objective is...
        </p>

      </div>


      {/* Citations Section */}
      <div className="about-citations">
        <h2>Citations</h2>
        <div>
          Andreassen LM, Nagy T, Kjøllmoen B, Leigh JR (2022) — An inventory of
          Norway’s glaciers and ice-marginal lakes from 2018–19 Sentinel-2 data.
          <i> Journal of Glaciology</i>, 68(272), 1085–1106.
          doi:10.1017/jog.2022.20
        </div>
        <div>
          RGI Consortium (2023) — Randolph Glacier Inventory (RGI) – A dataset of
          global glacier outlines, version 7.0. <i>Technical Report</i>.{" "}
          <a
            href="https://www.glims.org/RGI/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.glims.org/RGI/
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
