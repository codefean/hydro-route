import React from "react";
import "./citation.css";

const Citation = ({ stylePos }) => {
  return (
    <div className="citation-readout" style={stylePos}>
      <div>
        RGI Consortium (2023) — Randolph Glacier Inventory v7.0.{" "}
      </div>
            <div>
        Website Created by Sean Fagan (2025){" "}
      </div>
    </div>
  );
};

export default Citation;
