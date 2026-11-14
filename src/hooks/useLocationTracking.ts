import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

const DEFAULT_DISTANCE_INTERVAL = 15;

function getAdaptiveDistanceInterval(speed: number | null): number {
  if (speed === null || !Number.isFinite(speed) || speed < 1.5) {
    return 8;
  }

  if (speed < 6) {
    return 20;
  }

  return 40;
}

export function useLocationTracking() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);
  const [distanceInterval, setDistanceInterval] = useState(
    DEFAULT_DISTANCE_INTERVAL,
  );
  const [error, setError] = useState<string | null>(null);

  const startTracking = useCallback(async () => {
    setError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError(
          "Izin lokasi belum diberikan. Aktifkan izin lokasi untuk menggunakan pelacakan.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);
      setDistanceInterval(
        getAdaptiveDistanceInterval(currentLocation.coords.speed),
      );
      setIsTracking(true);
    } catch (trackingError) {
      const message =
        trackingError instanceof Error
          ? trackingError.message
          : "Lokasi tidak dapat diakses saat ini.";
      setError(`Gagal mendapatkan lokasi: ${message}`);
      setIsTracking(false);
    }
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (!isTracking) {
      return;
    }

    let active = true;
    let subscription: Location.LocationSubscription | undefined;

    const subscribeToLocation = async () => {
      try {
        const nextSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval,
            timeInterval: 3000,
          },
          (nextLocation) => {
            setLocation(nextLocation);

            const nextDistanceInterval = getAdaptiveDistanceInterval(
              nextLocation.coords.speed,
            );
            setDistanceInterval((currentInterval) =>
              currentInterval === nextDistanceInterval
                ? currentInterval
                : nextDistanceInterval,
            );
          },
        );

        if (active) {
          subscription = nextSubscription;
        } else {
          nextSubscription.remove();
        }
      } catch (trackingError) {
        if (!active) {
          return;
        }

        const message =
          trackingError instanceof Error
            ? trackingError.message
            : "Pembaruan lokasi tidak tersedia.";
        setError(`Pelacakan lokasi terhenti: ${message}`);
        setIsTracking(false);
      }
    };

    void subscribeToLocation();

    return () => {
      active = false;
      subscription?.remove();
    };
  }, [distanceInterval, isTracking]);

  return {
    location,
    isTracking,
    distanceInterval,
    error,
    startTracking,
    stopTracking,
  };
}
