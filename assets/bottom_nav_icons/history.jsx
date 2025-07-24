import * as React from "react"
import Svg, { Path } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m26.483 13.417-2.332 2.333-2.334-2.333m2.619 1.75c.042-.383.064-.773.064-1.167 0-5.799-4.701-10.5-10.5-10.5S3.5 8.201 3.5 14 8.201 24.5 14 24.5a10.48 10.48 0 0 0 8.167-3.9M14 8.167V14l3.5 2.333"
    />
  </Svg>
)
export default SvgComponent
