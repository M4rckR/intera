'use client'
import { DashNumbers } from "@/components/DashNumbers";
import { Navbar } from "@/components/Navbar";
import { SocialMenu } from "@/components/SocialMenu";
import { useStatusStore } from "@/store/status";
import { useEffect } from "react";
import { WelcomeInsalud } from "@/components/Welcome/WelcomeInsalud";
export default function Home() {
  const isLoading = useStatusStore(state => state.isLoading);
  const connectSocket = useStatusStore(state => state.connectSocket);

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  return (
    <>
      {isLoading ? (
        <WelcomeInsalud />  
      ) : (
        <>
          <Navbar />
          <SocialMenu />
          <DashNumbers />
        </>
      )}
    </>
  );
} 
