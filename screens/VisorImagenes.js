// VisorImagenes.js
import React from 'react';
import ImageViewing from 'react-native-image-viewing';

const VisorImagenes = ({ visible, imagenes, indexInicial, onClose }) => {
  const data = imagenes.map(img => ({ uri: img.uri }));

  return (
    <ImageViewing
      images={data}
      imageIndex={indexInicial}
      visible={visible}
      onRequestClose={onClose}
      swipeToCloseEnabled={true}
      doubleTapToZoomEnabled={true}
    />
  );
};

export default VisorImagenes;
