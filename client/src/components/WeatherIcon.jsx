import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from 'lucide-react';

const ICON_MAP = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Mist: CloudFog,
  Fog: CloudFog,
  Haze: CloudFog,
};

export default function WeatherIcon({ condition = 'Clouds', className = 'h-24 w-24' }) {
  const Icon = ICON_MAP[condition] || Cloud;
  return <Icon className={`${className} text-white drop-shadow-lg`} strokeWidth={1.5} />;
}
