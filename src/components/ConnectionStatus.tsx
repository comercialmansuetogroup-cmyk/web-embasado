import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <div className="relative">
            <Wifi className="w-5 h-5 text-green-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-medium text-green-600">Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-600">Desconectado</span>
        </>
      )}
    </div>
  );
}
