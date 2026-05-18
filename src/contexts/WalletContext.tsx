import { createContext, useContext, ReactNode } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useModal } from "connectkit";
import { shortenAddress } from "@/lib/wallet";

interface WalletContextValue {
  address: string | null;
  shortAddress: string;
  balance: string;
  isConnecting: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  shortAddress: "",
  balance: "0",
  isConnecting: false,
  isAuthenticated: false,
  userId: null,
  connect: () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { setOpen } = useModal();

  const balanceStr = balanceData
    ? parseFloat(balanceData.formatted).toFixed(4)
    : "0";

  const addr = address?.toLowerCase() ?? null;

  return (
    <WalletContext.Provider
      value={{
        address: addr,
        shortAddress: addr ? shortenAddress(addr) : "",
        balance: balanceStr,
        isConnecting,
        isAuthenticated: isConnected,
        userId: addr,
        connect: () => setOpen(true),
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
