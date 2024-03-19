import React from "react";
import { View } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { COLORS } from "../Constants";

const CircularProgress = ({
  percentage = 75,
  radius = 14,
  strokeWidth = 4,
  color = COLORS.primary,
  max = 100,
}: any) => {
  const circleRef: any = React.useRef();
  const circumference = 2 * Math.PI * radius;
  const halfCircle = radius + strokeWidth;

  React.useEffect(() => {
    const maxPercentage = (100 * percentage) / max;
    const strokeDashoffset =
      circumference - (circumference * maxPercentage) / 100;
    if (circleRef?.current) {
      circleRef.current.setNativeProps({
        strokeDashoffset,
      });
    }
  }, [percentage, max, circumference, circleRef]);

  return (
    <View style={{ width: radius * 2, height: radius * 2 }}>
      <Svg
        height={radius * 2}
        width={radius * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            ref={circleRef}
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDashoffset={circumference}
            strokeDasharray={circumference}
          />
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeOpacity=".1"
          />
        </G>
      </Svg>
    </View>
  );
};

export default React.memo(CircularProgress);
