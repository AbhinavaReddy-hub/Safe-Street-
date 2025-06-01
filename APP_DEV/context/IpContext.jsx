import { useEffect, useState,useContext,createContext } from 'react';

export const IpContext = createContext();
export const IpProvider  = ({ children }) => {
    const [ip, setIp] = useState(null);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('http://192.168.43.97:3000/ip');  
        const data = await response.json();
        setIp(data.ip);
      } catch (error) {
        console.error('Failed to fetch backend IP:', error);
      }
    };

    fetchIp();
  }, []);
return <IpContext.Provider value={{ ip }}>{children}</IpContext.Provider>;
};
export const useIp = () => useContext(IpContext);
