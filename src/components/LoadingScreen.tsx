import moonkyLogo from "@/assets/moonky-logo.png";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-50">
            <img 
              src={moonkyLogo} 
              alt="Moonky" 
              className="h-20 w-auto"
            />
          </div>
          <div className="relative">
            <img 
              src={moonkyLogo} 
              alt="Moonky" 
              className="h-20 w-auto"
            />
          </div>
        </div>
        <div className="text-white text-center space-y-2">
          <p className="text-sm opacity-90">Carregando...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
