'use client'
// import { DashNumbers } from "@/components/DashNumbers";
import { LeadsList } from "@/components/LeadsList";
import { Navbar } from "@/components/Navbar";
import { SocialMenu } from "@/components/SocialMenu";
import { WelcomeInsalud } from "@/components/Welcome/WelcomeInsalud";
import { useStatusStore } from "@/store/status";
import { useEffect } from "react";

export default function Home() {
  const isLoading = useStatusStore(state => state.isLoading);
  const timeoutReached = useStatusStore(state => state.timeoutReached);
  const connectSocket = useStatusStore(state => state.connectSocket);
  const disconnectSocket = useStatusStore(state => state.disconnectSocket);
  const lastUpdate = useStatusStore(state => state.lastUpdate);

  useEffect(() => {
    connectSocket();
    
    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  if (isLoading) return <WelcomeInsalud />;
  if (timeoutReached) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
        <h1 className="text-2xl font-semibold text-white">Lo sentimos</h1>
        <p className="text-white">La conexión está tardando más de lo esperado. Por favor, intenta ingresar más tarde.</p>
        {lastUpdate && (
          <p className="text-sm text-gray-400">
            Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <SocialMenu />
      {/* <DashNumbers /> */}
      <LeadsList />
      {lastUpdate && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-400">
          Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </>
  );
}
