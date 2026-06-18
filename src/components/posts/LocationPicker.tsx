import { Button } from '@components/ui/Button';
import type { PostLocation } from '@/types';

/** Props for the browser geolocation picker. */
export interface LocationPickerProps {
  readonly value: PostLocation | null;
  readonly onChange: (location: PostLocation | null) => void;
}

/** Uses the free browser Geolocation API to attach an approximate post location. */
export const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const pickLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      onChange({ lat: position.coords.latitude, lng: position.coords.longitude, name: 'Current location' });
    });
  };

  return (
    <div className="location-picker">
      <Button type="button" variant="secondary" onClick={pickLocation}>Use current location</Button>
      {value ? <p className="form-helper">Location attached: {value.name}</p> : null}
      {value ? <Button type="button" variant="ghost" onClick={() => onChange(null)}>Remove location</Button> : null}
    </div>
  );
};
