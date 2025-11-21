import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

import { useGlacierLayer } from "./glaciers";
import Loc from "./loc";
import Citation from "./citation";
import "./routeMap.css";
import PitchControl from "./PitchControl";
import Hotkey from "./Hotkey";

//cd /Users/seanfagan/Desktop/hydro-route

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwZmVhbiIsImEiOiJjbTNuOGVvN3cxMGxsMmpzNThzc2s3cTJzIn0.1uhX17BCYd65SeQsW1yibA";

const RouteMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const DEFAULT_PITCH = 20;
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [, setLoading] = useState(true);
  const [, setLogMessages] = useState([]);
  const [, setProgress] = useState(0);
  const [cursorInfo, setCursorInfo] = useState({
    lat: null,
    lng: null,
    elevM: null,
  });

  const updateProgress = (msg, step, totalSteps) => {
    console.log(msg);
    setLogMessages((prev) => [...prev, msg]);
    setProgress(Math.round((step / totalSteps) * 100));
  };

  const resetZoom = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [-123.908925, 43.554822],
      zoom: 3.8,
      speed: 2.2,
      pitch: DEFAULT_PITCH,
    });
    setPitch(DEFAULT_PITCH);
  };


  const cinematicFlyRoute = () => {
    const map = mapRef.current;
    if (!map) return;

    const keyPoints = [
      [-123.91, 43.55],
      [-123.82, 43.72],
      [-123.70, 43.95],
      [-123.58, 44.20],
      [-123.45, 44.45],
      [-123.30, 44.70],
      [-123.10, 45.00],
      [-122.90, 45.30],
      [-122.75, 45.55],
      [-122.60, 45.80],
    ];

    let frame = 0;
    const FRAME_TIME = 40; 

    const animate = () => {
      if (frame >= keyPoints.length - 1) return;

      const [lng, lat] = keyPoints[frame];
      const [nextLng, nextLat] = keyPoints[frame + 1];

      const bearing = turf.bearing(
        turf.point([lng, lat]),
        turf.point([nextLng, nextLat])
      );

      map.easeTo({
        center: [lng, lat],
        zoom: 9,
        pitch: 70,
        bearing: bearing,
        duration: FRAME_TIME,
        easing: (n) => n,
        essential: true,
      });

      frame++;
      setTimeout(() => requestAnimationFrame(animate), FRAME_TIME);
    };

    animate();
  };


  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key.toLowerCase() === "r") resetZoom();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);


  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = () => setPitch(map.getPitch());
    map.on("pitch", sync);
    map.on("pitchend", sync);

    return () => {
      map.off("pitch", sync);
      map.off("pitchend", sync);
    };
  }, []);


  useEffect(() => {
    const initMap = async () => {
      if (mapRef.current) return;

      const totalSteps = 6;
      let step = 1;

      updateProgress("Initializing Mapbox map...", step++, totalSteps);

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [-123.908925, 43.554822],
        zoom: 3.8,
        pitch: DEFAULT_PITCH,
      });

      await new Promise((resolve) => mapRef.current.on("load", resolve));
      updateProgress("Mapbox map loaded", step++, totalSteps);


      if (!mapRef.current.getSource("mapbox-dem")) {
        mapRef.current.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.0 });
      }


      mapRef.current.on("mousemove", (e) => {
        const { lng, lat } = e.lngLat;
        const elevation = mapRef.current.queryTerrainElevation(e.lngLat, {
          exaggerated: false,
        });
        setCursorInfo({
          lat,
          lng,
          elevM: elevation !== null ? elevation.toFixed(1) : "N/A",
        });
      });

      mapRef.current.on("mouseleave", () =>
        setCursorInfo({ lat: null, lng: null, elevM: null })
      );


      updateProgress("Loading bike route...", step++, totalSteps);

      try {
        const routeData = await fetch("/route.geojson").then((r) =>
          r.json()
        );

        mapRef.current.addSource("bike-route", {
          type: "geojson",
          data: routeData,
        });

        mapRef.current.addLayer({
          id: "bike-route-line",
          type: "line",
          source: "bike-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#FF6600",
            "line-width": 4,
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        routeData.features.forEach((f) => {
          if (f.geometry.type === "LineString") {
            f.geometry.coordinates.forEach((c) => bounds.extend(c));
          }
        });

        mapRef.current.fitBounds(bounds, {
          padding: 50,
          duration: 1500,
        });

        updateProgress("Route loaded", step++, totalSteps);
      } catch (err) {
        console.error("Error loading route.geojson", err);
        updateProgress("Route load failed", step++, totalSteps);
      }

      setLoading(false);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useGlacierLayer({ mapRef });

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "calc(100vh - 43px)",
          overflow: "hidden",
          zIndex: 1,
        }}
      />

      
    </div>
  );
};

export default RouteMap;
