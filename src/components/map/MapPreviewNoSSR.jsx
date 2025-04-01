
import dynamic from "next/dynamic";

const MapPreview = dynamic(() => import("./MapPreview"), {
  ssr: false,
});

export default MapPreview;
