import { useCallback, useEffect, useState } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react';

interface WeatherData {
  temperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  advice: string;
  fetchedAt: string;
}

function WeatherConditionIcon({
  code,
  isDay,
}: {
  code: number;
  isDay: boolean;
}) {
  const iconClass = 'w-7 h-7 text-[#FDE68A] shrink-0';
  if (code === 0) {
    return isDay ? (
      <Sun className={iconClass} aria-hidden="true" />
    ) : (
      <Moon className={iconClass} aria-hidden="true" />
    );
  }
  if (code === 1 || code === 2) {
    return <CloudSun className={iconClass} aria-hidden="true" />;
  }
  if (code === 3) {
    return <Cloud className={iconClass} aria-hidden="true" />;
  }
  if (code === 45 || code === 48) {
    return <CloudFog className={iconClass} aria-hidden="true" />;
  }
  if (code >= 51 && code <= 57) {
    return <CloudDrizzle className={iconClass} aria-hidden="true" />;
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={iconClass} aria-hidden="true" />;
  }
  if (code >= 95) {
    return <CloudLightning className={iconClass} aria-hidden="true" />;
  }
  return <CloudSun className={iconClass} aria-hidden="true" />;
}

export function HeroWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    }
    try {
      const res = await fetch('/api/weather');
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as WeatherData;
      if (typeof data.temperatureC === 'number') {
        setWeather(data);
      }
    } catch {
      // Keep hero clean if offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadWeather(false);
  }, [loadWeather]);

  if (loading) {
    return (
      <div
        aria-label="Loading Belagavi weather"
        className="w-full lg:w-80 shrink-0 rounded-[14px] bg-[#0D2118]/65 backdrop-blur-md border border-white/15 p-5 animate-pulse"
      >
        <div className="h-3 w-28 bg-white/20 rounded" />
        <div className="h-9 w-24 bg-white/20 rounded mt-3" />
        <div className="h-3 w-full bg-white/15 rounded mt-4" />
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <aside
      aria-label="Current Belagavi weather"
      className="w-full lg:w-80 shrink-0 rounded-[14px] bg-[#0D2118]/75 backdrop-blur-md border border-white/20 p-5 text-[#FAF9F6] shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#FDE68A]">
          Live in Belagavi
        </p>
        <button
          type="button"
          onClick={() => void loadWeather(true)}
          disabled={refreshing}
          aria-label="Refresh Belagavi weather"
          title="Refresh weather"
          className="p-1 rounded text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WeatherConditionIcon
            code={weather.weatherCode}
            isDay={weather.isDay}
          />
          <div>
            <p className="font-serif text-3xl font-bold text-white leading-none tabular-nums">
              {weather.temperatureC}°C
            </p>
            <p className="text-sm font-medium text-[#E5E7EB] mt-1">
              {weather.condition}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/15 flex items-center gap-2 text-xs text-[#D1D5DB] tabular-nums">
        <span>Humidity {weather.humidity}%</span>
        <span aria-hidden="true">·</span>
        <span>Wind {weather.windSpeedKmh} km/h</span>
      </div>

      <p className="mt-2.5 text-xs text-[#E5E7EB]/90 leading-relaxed">
        {weather.advice}
      </p>
    </aside>
  );
}
