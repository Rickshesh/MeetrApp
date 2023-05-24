import React, { useState, useEffect } from "react";
import { View, Image, Text } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";

const VideoThumbnail = ({ videoUri, customStyle }) => {
  const [thumbnailUri, setThumbnailUri] = useState(null);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: 1000,
        });
        console.log(uri);
        setThumbnailUri(uri);
      } catch (e) {
        console.warn(e);
      }
    };

    generateThumbnail();
  }, [videoUri]);

  if (!thumbnailUri) {
    return (
      <View>
        <Text>Loading thumbnail...</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: thumbnailUri }}
      resizeMode="contain"
      style={customStyle}
    />
  );
};

export default VideoThumbnail;
