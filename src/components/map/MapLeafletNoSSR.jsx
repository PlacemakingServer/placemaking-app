// /components/map/MapLeafletNoSSR.tsx

import dynamic from 'next/dynamic';
import React from 'react';

// Faz import dinâmico do seu componente real de mapa
const MapLeafletComponent = dynamic(() => import('@/components/map/MapLeafletComponent'), {
  ssr: false, // Desativa SSR para o Leaflet não quebrar
});

export default function MapLeafletNoSSR(props) {
  return <MapLeafletComponent {...props} />;
}
