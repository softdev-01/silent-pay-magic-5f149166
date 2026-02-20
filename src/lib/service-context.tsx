import { createContext, useContext, useState, ReactNode } from "react";
import { Service } from "./types";
import { mockServices } from "./mock-data";

interface ServiceContextType {
  services: Service[];
  addService: (service: Service) => void;
}

const ServiceContext = createContext<ServiceContextType>({
  services: [],
  addService: () => {},
});

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(mockServices);

  const addService = (service: Service) => {
    setServices((prev) => [service, ...prev]);
  };

  return (
    <ServiceContext.Provider value={{ services, addService }}>
      {children}
    </ServiceContext.Provider>
  );
}

export const useServices = () => useContext(ServiceContext);
