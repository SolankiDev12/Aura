import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChatIcon = ({ width = 28, height = 28, fill = '#F3F4F6' }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <Path
        fill={fill}
        d="M12.5 4.438h-.188V3.5A2.815 2.815 0 0 0 9.5.687h-6A2.815 2.815 0 0 0 .687 3.5V11a.563.563 0 0 0 .965.394l1.304-1.332h.732V11A2.815 2.815 0 0 0 6.5 13.813h6.544l1.304 1.33a.562.562 0 0 0 .964-.393v-7.5A2.815 2.815 0 0 0 12.5 4.437Zm-9.78 4.5a.562.562 0 0 0-.402.168l-.506.516V3.5c0-.93.757-1.688 1.688-1.688h6c.93 0 1.688.757 1.688 1.688v3.75A1.69 1.69 0 0 1 9.5 8.938H2.72Zm11.467 4.434-.505-.516a.562.562 0 0 0-.402-.168H6.5A1.69 1.69 0 0 1 4.812 11v-.938H9.5a2.815 2.815 0 0 0 2.813-2.812V5.562h.187c.93 0 1.688.757 1.688 1.688v6.122Z"
      />
    </Svg>
  );
};

export default ChatIcon;
