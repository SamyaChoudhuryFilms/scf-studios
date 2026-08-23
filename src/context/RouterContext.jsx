import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext();

export const useRouter = () => useContext(RouterContext);

export const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Helper to parse dynamic routes
  // e.g. /movie/m-1 matches /movie/:id
  const matchRoute = (pattern) => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);

    if (pathParts.length !== patternParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, matchRoute }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Link = ({ to, children, className, ...props }) => {
  const { navigate } = useRouter();
  
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
