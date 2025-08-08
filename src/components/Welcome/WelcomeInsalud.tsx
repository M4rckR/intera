import Image from "next/image"

export const WelcomeInsalud = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 min-h-screen bg-in-gray-dark">
        <Image className="w-1/3" src="/logos/logo-insalud.png" alt="logo" width={100} height={20} />
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-in-beige"></div>
    </div>
  );
};
