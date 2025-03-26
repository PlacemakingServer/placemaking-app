import { createContext, useContext, useState } from "react";
import Message from "@/components/ui/Message";


const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("info");
  const [show, setShow] = useState(false);

  const showMessage = (msg, type = "info", duration = 3000) => {
    setMessage(msg);
    setVariant(type);
    setShow(true);

    setTimeout(() => {
      setShow(false);
    }, duration);
  };

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      <Message message={message} variant={variant} show={show} />
    </MessageContext.Provider>
  );
}

export function useMessage() {
  return useContext(MessageContext);
}

