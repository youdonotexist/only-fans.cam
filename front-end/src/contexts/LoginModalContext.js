import React, { createContext, useContext, useState } from 'react';
import LoginModal from '../components/LoginModal';

const LoginModalContext = createContext();

export const useLoginModal = () => useContext(LoginModalContext);

export const LoginModalProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  const openLoginModal = (path = null) => {
    setRedirectPath(path);
    setShowModal(true);
  };

  const closeLoginModal = () => {
    setShowModal(false);
    setRedirectPath(null);
  };

  return (
    <LoginModalContext.Provider value={{ openLoginModal, closeLoginModal }}>
      {children}
      {showModal && <LoginModal onClose={closeLoginModal} redirectPath={redirectPath} />}
    </LoginModalContext.Provider>
  );
};

export default LoginModalContext;