import React, { useState, useEffect } from "react";
import Clock from "./components/Clock";
import "./App.css";
import { useWindowDimensions } from "./hooks/useWindowDimensions";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { hoursFromTimeZone, timePeriodFromHours } from "./datetime";
import { clockColorByPeriod } from "./theme/clockColor";
import { useDateFromTimeZone } from "./hooks/useDateFromTimeZone";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const timeZoneFromQuery = (queryName: string, defaultTimeZone: string) => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  let tz = params.get(queryName) || defaultTimeZone;
  try {
    new Date().toLocaleString("en-US", { timeZone: tz });
  } catch (e) {
    console.log(e);
    tz = defaultTimeZone;
  }
  return tz;
};

const rgbaFromHexWithAlpha = (hex: string, alpha: number) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeZone1, setTimeZone1] = useState<string>();
  const [timeZone2, setTimeZone2] = useState<string>();
  const { width, height } = useWindowDimensions();
  const [size, setSize] = useState(Math.min(width, height));
  useEffect(() => {
    setSize(Math.min(width, height) * 0.5);
  }, [width, height]);
  useEffect(() => {
    setTimeZone1(timeZoneFromQuery("zone1", "America/New_York"));
    setTimeZone2(timeZoneFromQuery("zone2", "Asia/Tokyo"));
    // 数秒後にローディングを解除する
    setTimeout(() => setLoading(false), 1000);
  }, []);
  const date1 = useDateFromTimeZone(timeZone1 ?? "");
  const date2 = useDateFromTimeZone(timeZone2 ?? "");
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const color1 = clockColorByPeriod(
    timePeriodFromHours(date1?.getHours() ?? 0)
  );
  const color2 = clockColorByPeriod(
    timePeriodFromHours(date2?.getHours() ?? 0)
  );
  // color1, color2のalphaを0.5にする
  const rgba1 = rgbaFromHexWithAlpha(color1, 0.5);
  const rgba2 = rgbaFromHexWithAlpha(color2, 0.5);

  const gradientStyle = {
    background: `linear-gradient(to ${
      matches ? "right" : "bottom"
    }, ${rgba1}, ${rgba2})`,
    minHeight: height + 20,
    minWidth: width,
  };
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Box className="app" style={gradientStyle}>
      <Grid container rowSpacing={2}>
        {timeZone1 && (
          <Grid item xs={12} sm={6}>
            <Box className="clock">
              <Clock
                date={date1 ?? new Date()}
                timeZoneName={timeZone1}
                size={size}
              />
            </Box>
          </Grid>
        )}
        {timeZone2 && (
          <Grid item xs={12} sm={6}>
            <Box className="clock">
              <Clock
                date={date2 ?? new Date()}
                timeZoneName={timeZone2}
                size={size}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
