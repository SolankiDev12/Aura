import * as React from "react"
import Svg, { Circle, Mask, Path, G } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <Circle cx={20} cy={20} r={20} fill="#fff" />
    <Mask
      id="a"
      width={40}
      height={40}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <Path
        fill="#FF3B3B"
        d="M40 20c0 11.046-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0s20 8.954 20 20Z"
      />
    </Mask>
    <G mask="url(#a)">
      <Path
        fill="#2354E9"
        d="M20 25.833c4.144 0 7.5-3.356 7.5-7.5 0-4.143-3.356-7.5-7.5-7.5a7.498 7.498 0 0 0-7.5 7.5c0 4.144 3.356 7.5 7.5 7.5Zm0 3.75c-5.006 0-15 2.513-15 7.5v1.875a1.88 1.88 0 0 0 1.875 1.875h26.25A1.88 1.88 0 0 0 35 38.958v-1.875c0-4.987-9.994-7.5-15-7.5Z"
      />
    </G>
  </Svg>
)
export default SvgComponent
