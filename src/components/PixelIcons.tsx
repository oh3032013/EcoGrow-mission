import type { ItemId, TimePhase, WeatherType } from '../game/types';

export function ItemIcon({ id, className = 'w-6 h-6' }: { id: ItemId; className?: string }) {
  switch (id) {
    case 'hoe':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="16" width="4" height="4" fill="#6b4528" />
          <rect x="7" y="13" width="4" height="4" fill="#8c5a35" />
          <rect x="10" y="10" width="4" height="4" fill="#8c5a35" />
          <rect x="13" y="7" width="4" height="4" fill="#8c5a35" />
          <rect x="13" y="4" width="7" height="3" fill="#aeb6bf" />
          <rect x="17" y="7" width="3" height="4" fill="#8a929a" />
        </svg>
      );
    case 'watering_can':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="8" y="9" width="10" height="10" fill="#4f8fba" />
          <rect x="9" y="10" width="8" height="3" fill="#77b5de" />
          <rect x="10" y="5" width="6" height="4" fill="#3a6d91" />
          <rect x="4" y="11" width="4" height="3" fill="#4f8fba" />
          <rect x="3" y="9" width="2" height="4" fill="#77b5de" />
          <rect x="18" y="11" width="3" height="6" fill="#3a6d91" />
        </svg>
      );
    case 'axe':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="5" y="16" width="4" height="4" fill="#6b4528" />
          <rect x="8" y="13" width="4" height="4" fill="#8c5a35" />
          <rect x="11" y="10" width="4" height="4" fill="#8c5a35" />
          <rect x="13" y="4" width="6" height="7" fill="#9ca4ad" />
          <rect x="17" y="5" width="3" height="6" fill="#dce3eb" />
        </svg>
      );
    case 'wheat_seed':
    case 'carrot_seed':
    case 'tomato_seed':
    case 'strawberry_seed':
    case 'pumpkin_seed': {
      const accent =
        id === 'wheat_seed'
          ? '#e6b84c'
          : id === 'carrot_seed'
          ? '#e8782b'
          : id === 'tomato_seed'
          ? '#d93829'
          : id === 'strawberry_seed'
          ? '#e03e52'
          : '#de6f1f';
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="6" y="6" width="12" height="14" rx="1" fill="#d9be8c" stroke="#6b4528" strokeWidth="2" />
          <rect x="8" y="4" width="8" height="3" fill="#b89863" />
          <rect x="9" y="10" width="6" height="6" fill={accent} />
          <rect x="10" y="9" width="4" height="2" fill="#4e963e" />
        </svg>
      );
    }
    case 'wheat':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="11" y="11" width="2" height="9" fill="#c99a32" />
          <rect x="9" y="5" width="6" height="7" fill="#e6b84c" />
          <rect x="10" y="4" width="4" height="4" fill="#f7de8a" />
        </svg>
      );
    case 'carrot':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="9" y="4" width="6" height="5" fill="#5fa845" />
          <rect x="9" y="9" width="6" height="7" fill="#e8782b" />
          <rect x="10" y="16" width="4" height="4" fill="#d4621a" />
        </svg>
      );
    case 'tomato':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="10" y="5" width="4" height="3" fill="#4e913d" />
          <rect x="6" y="8" width="12" height="10" rx="2" fill="#d93829" />
          <rect x="8" y="10" width="3" height="3" fill="#f27d72" />
        </svg>
      );
    case 'strawberry':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="9" y="5" width="6" height="3" fill="#4e913d" />
          <rect x="7" y="8" width="10" height="8" fill="#e03e52" />
          <rect x="9" y="16" width="6" height="3" fill="#c72c3f" />
          <rect x="9" y="10" width="2" height="2" fill="#fff5d6" />
          <rect x="13" y="12" width="2" height="2" fill="#fff5d6" />
        </svg>
      );
    case 'pumpkin':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="11" y="4" width="2" height="4" fill="#477d34" />
          <rect x="5" y="8" width="14" height="11" rx="2" fill="#de6f1f" />
          <rect x="9" y="9" width="6" height="9" fill="#f7a541" />
        </svg>
      );
    case 'fence':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="5" y="5" width="4" height="15" fill="#8c5a33" />
          <rect x="15" y="5" width="4" height="15" fill="#8c5a33" />
          <rect x="3" y="9" width="18" height="3" fill="#6b4426" />
          <rect x="3" y="14" width="18" height="3" fill="#6b4426" />
        </svg>
      );
    case 'scarecrow':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="11" y="9" width="2" height="12" fill="#6b4528" />
          <rect x="5" y="11" width="14" height="2" fill="#6b4528" />
          <rect x="8" y="10" width="8" height="7" fill="#4c6e91" />
          <rect x="9" y="5" width="6" height="5" fill="#e0b879" />
          <rect x="7" y="4" width="10" height="2" fill="#c9933b" />
        </svg>
      );
    case 'lantern':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="7" y="18" width="10" height="3" fill="#6e757a" />
          <rect x="10" y="13" width="4" height="5" fill="#6e757a" />
          <rect x="8" y="8" width="8" height="5" fill="#ffe073" />
          <rect x="6" y="5" width="12" height="3" fill="#8f969c" />
        </svg>
      );
    case 'flowerbed':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="11" width="16" height="9" fill="#734b2e" />
          <rect x="6" y="9" width="12" height="4" fill="#4e963e" />
          <rect x="7" y="7" width="3" height="3" fill="#e86884" />
          <rect x="11" y="8" width="3" height="3" fill="#f5d259" />
          <rect x="15" y="7" width="3" height="3" fill="#78b8eb" />
        </svg>
      );
    case 'stone_path':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="5" width="7" height="6" fill="#9ea6ad" />
          <rect x="13" y="5" width="7" height="6" fill="#889096" />
          <rect x="4" y="13" width="8" height="6" fill="#889096" />
          <rect x="14" y="13" width="6" height="6" fill="#9ea6ad" />
        </svg>
      );
    case 'wood':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="9" width="16" height="6" fill="#7d4e2d" />
          <rect x="5" y="10" width="12" height="3" fill="#9e663d" />
          <rect x="17" y="10" width="3" height="4" fill="#d9b07e" />
        </svg>
      );
    case 'stone':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="5" y="10" width="14" height="9" fill="#7c8288" />
          <rect x="7" y="7" width="9" height="6" fill="#a0a8b0" />
          <rect x="8" y="8" width="4" height="3" fill="#c5ccd4" />
        </svg>
      );
    case 'sprinkler':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="7" y="14" width="10" height="6" fill="#5e6870" />
          <rect x="10" y="9" width="4" height="6" fill="#8895a1" />
          <rect x="5" y="7" width="14" height="3" fill="#2b5a8a" />
          <rect x="6" y="7" width="12" height="2" fill="#4aa3e8" />
          <rect x="4" y="10" width="2" height="2" fill="#99e1ff" />
          <rect x="18" y="10" width="2" height="2" fill="#99e1ff" />
        </svg>
      );
    case 'sensor':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="10" y="11" width="4" height="10" fill="#6b4528" />
          <rect x="7" y="7" width="10" height="7" fill="#3a4c59" />
          <rect x="9" y="9" width="6" height="3" fill="#3be083" />
          <rect x="11" y="3" width="2" height="4" fill="#98a8b5" />
          <rect x="10" y="2" width="4" height="2" fill="#54f29c" />
        </svg>
      );
    case 'compost':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="4" y="9" width="16" height="11" fill="#6b4528" />
          <rect x="6" y="11" width="12" height="3" fill="#402818" />
          <rect x="6" y="8" width="12" height="3" fill="#4f9c3e" />
          <rect x="10" y="5" width="4" height="3" fill="#77c756" />
          <rect x="4" y="15" width="16" height="2" fill="#8c5a35" />
        </svg>
      );
    case 'egg':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="8" y="6" width="8" height="12" rx="3" fill="#faf0dc" stroke="#c9b086" strokeWidth="1.5" />
          <rect x="9" y="8" width="3" height="4" fill="#ffffff" />
        </svg>
      );
  }
}

export function WeatherIcon({ weather, className = 'w-5 h-5' }: { weather: WeatherType; className?: string }) {
  if (weather === 'Clear') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="5" fill="#f7c844" />
        <rect x="11" y="2" width="2" height="3" fill="#f7c844" />
        <rect x="11" y="19" width="2" height="3" fill="#f7c844" />
        <rect x="2" y="11" width="3" height="2" fill="#f7c844" />
        <rect x="19" y="11" width="3" height="2" fill="#f7c844" />
      </svg>
    );
  }
  if (weather === 'Drought') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="12" cy="10" r="5" fill="#eb6c34" />
        <rect x="4" y="18" width="16" height="2" fill="#f2a649" />
        <rect x="6" y="21" width="12" height="2" fill="#eb6c34" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="5" y="6" width="14" height="7" rx="3" fill="#8da4bd" />
      <rect x="8" y="4" width="8" height="4" rx="2" fill="#b3c6db" />
      <rect x="7" y="15" width="2" height="5" fill="#63b3ed" />
      <rect x="12" y="16" width="2" height="5" fill="#63b3ed" />
      <rect x="16" y="14" width="2" height="5" fill="#63b3ed" />
    </svg>
  );
}

export function TimeIcon({ phase, className = 'w-4 h-4' }: { phase: TimePhase; className?: string }) {
  if (phase === 'Day') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="6" fill="#ffd859" />
      </svg>
    );
  }
  if (phase === 'Sunset') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M5 16h14v2H5z" fill="#e87a46" />
        <path d="M7 16a5 5 0 0 1 10 0z" fill="#f5a142" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M14 4a7 7 0 1 0 6 10 6 6 0 0 1-6-10z" fill="#b7ccff" />
    </svg>
  );
}

export function HeartIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 20s-7-4.5-8.5-9.2C2.3 7.1 5 4 8.3 4c1.7 0 3.1.9 3.7 2.2C12.6 4.9 14 4 15.7 4 19 4 21.7 7.1 20.5 10.8 19 15.5 12 20 12 20z" fill="#e04848" stroke="#451212" strokeWidth="1.5" />
    </svg>
  );
}

export function BoltIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M13 2L5 14h6l-1 8 9-12h-6l0-8z" fill="#f2c038" stroke="#4f3808" strokeWidth="1.5" />
    </svg>
  );
}

export function CoinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="#f2c038" stroke="#6b4a0c" strokeWidth="2" />
      <rect x="11" y="7" width="2" height="10" fill="#fff0a6" />
    </svg>
  );
}

export function ChickenIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="7" y="10" width="10" height="8" fill="#f7f1e1" />
      <rect x="13" y="6" width="5" height="6" fill="#f7f1e1" />
      <rect x="14" y="4" width="3" height="2" fill="#d93829" />
      <rect x="18" y="8" width="2" height="2" fill="#f2a634" />
      <rect x="15" y="7" width="2" height="2" fill="#26180f" />
      <rect x="9" y="18" width="2" height="3" fill="#e8942e" />
      <rect x="13" y="18" width="2" height="3" fill="#e8942e" />
    </svg>
  );
}
