import { removeGlobalHeaders, setGlobalHeaders } from "@/utils/apiFetch";
import { zendeskAuthenticateWithJwt, zendeskLogout } from "@/utils/zendesk";
import {
  authGetZendeskJwt,
  authRefreshToken,
  authSignIn,
  authSignUp,
  authUpdateDbUser,
} from "@auth/authApi";
import JwtAuthContext, {
  JwtAuthContextType,
} from "@auth/services/jwt/JwtAuthContext";
import {
  FuseAuthProviderComponentProps,
  FuseAuthProviderState,
} from "@fuse/core/FuseAuthProvider/types/FuseAuthTypes";
import useLocalStorage from "@fuse/hooks/useLocalStorage";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { User } from "../../user";
import { isTokenValid } from "./utils/jwtUtils";

interface DecodedToken {
  sub: string;
  role: string;
  name: string;
  email: string;
  companyId: string;
  exp: number;
}

export type JwtSignInPayload = {
  email: string;
  password: string;
};

export type JwtSignUpPayload = {
  displayName: string;
  email: string;
  password: string;
};

function JwtAuthProvider(props: FuseAuthProviderComponentProps) {
  const { ref, children, onAuthStateChanged } = props;

  const {
    value: tokenStorageValue,
    setValue: setTokenStorageValue,
    removeValue: removeTokenStorageValue,
  } = useLocalStorage<string>("jwt_access_token");

  /**
   * Fuse Auth Provider State
   */
  const [authState, setAuthState] = useState<FuseAuthProviderState<User>>({
    authStatus: "configuring",
    isAuthenticated: false,
    user: null,
  });

  /**
   * Watch for changes in the auth state
   * and pass them to the FuseAuthProvider
   */
  useEffect(() => {
    if (onAuthStateChanged) {
      onAuthStateChanged(authState);
    }
  }, [authState, onAuthStateChanged]);

  /**
   * Listen for module status changes from API interceptor
   */
  useEffect(() => {
    const handleModuleDisabled = (event: CustomEvent) => {
      const { module, enabled } = event.detail;
      console.log(`📡 Event received: ${module} = ${enabled}`);

      if (authState.user) {
        const updatedUser = {
          ...authState.user,
          modules: {
            ...authState.user.modules,
            [module]: enabled,
          },
        };

        // Update localStorage
        localStorage.setItem("user_data", JSON.stringify(updatedUser));

        // Update auth state
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));

        console.log(`✅ User modules updated: ${module} = ${enabled}`);
      }
    };

    window.addEventListener(
      "APP_MODULE_STATUS_CHANGED" as any,
      handleModuleDisabled as EventListener,
    );

    return () => {
      window.removeEventListener(
        "APP_MODULE_STATUS_CHANGED" as any,
        handleModuleDisabled as EventListener,
      );
    };
  }, [authState.user]);

  /**
   * Attempt to auto login with the stored token
   */
  useEffect(() => {
    const attemptAutoLogin = async () => {
      const accessToken = tokenStorageValue;

      if (!accessToken) {
        setAuthState({
          authStatus: "unauthenticated",
          isAuthenticated: false,
          user: null,
        });
        return;
      }

      if (isTokenValid(accessToken)) {
        try {
          // Obtener los datos del usuario del localStorage
          const userData = localStorage.getItem("user_data");

          if (userData) {
            const user = JSON.parse(userData);

            // Restaurar los headers de autorización
            setGlobalHeaders({ Authorization: `Bearer ${accessToken}` });

            setAuthState({
              authStatus: "authenticated",
              isAuthenticated: true,
              user,
            });

            return;
          }
        } catch (error) {
          console.error("Auto login error:", error);
        }
      }

      // Si llegamos aquí, algo falló en el proceso de auto-login
      removeTokenStorageValue();
      removeGlobalHeaders(["Authorization"]);
      setAuthState({
        authStatus: "unauthenticated",
        isAuthenticated: false,
        user: null,
      });
    };

    attemptAutoLogin();
  }, [tokenStorageValue]); // Solo dependemos del tokenStorageValue

  /**
   * Sign in
   */
  const signIn: JwtAuthContextType["signIn"] = useCallback(
    async (credentials) => {
      const response = await authSignIn(credentials);
      const responseData = await response.json();
      console.log("signIn responseData:", responseData);

      if (responseData.succeeded) {
        if (responseData.data.user.firstLogin == true) {
          // Guardar el email en localStorage para usarlo en la pantalla de force-reset-password
          localStorage.setItem(
            "force_reset_email",
            responseData.data.user.email,
          );
          window.location.href = "/force-reset-password";
        } else {
          // Extract user info from token
          const token = responseData.data.token;

          // Check if user has required roles
          const userRoles = responseData.data.user.roles || [];
          let selectedRole = null;

          // First check for Sentry_Admin
          if (userRoles.includes("Sentry_Admin")) {
            selectedRole = "Sentry_Admin";
          }
          // Then check for Company_Admin if Sentry_Admin not found
          else if (userRoles.includes("Company_Admin")) {
            selectedRole = "Company_Admin";
          }

          const hasRequiredRole = selectedRole !== null;

          if (!hasRequiredRole) {
            throw new Error("User does not have required roles");
          }

          // Extract modules from response
          const modulesFromAPI = responseData.data.modules || {};
          console.log("Modules from API:", modulesFromAPI);

          // Normalize module keys (fix tTlock -> ttlock)
          const modules: Record<string, boolean> = {};
          for (const [key, value] of Object.entries(modulesFromAPI)) {
            if (key === "tTlock") {
              modules["ttlock"] = value as boolean;
            } else {
              modules[key] = value as boolean;
            }
          }
          console.log("Normalized modules:", modules);
          // Create a user object with required properties
          const user: User = {
            id: "",
            role: selectedRole,
            displayName: responseData.data.user.userName,
            email: responseData.data.user.email,
            companyId: responseData.data.user.companyId,
            photoURL: "",
            shortcuts: [],
            settings: {},
            loginRedirectUrl: "/",
            modules: modules,
          };

          // Guardar los datos del usuario en localStorage
          localStorage.setItem("user_data", JSON.stringify(user));

          setAuthState({
            authStatus: "authenticated",
            isAuthenticated: true,
            user,
          });

          setTokenStorageValue(token);
          setGlobalHeaders({ Authorization: `Bearer ${token}` });

          // Zendesk login with JWT (non-blocking, runs after auth is set)
          try {
            const zendeskJwt = await authGetZendeskJwt({
              externalId: String(responseData.data.user.id ?? ""),
              name: String(responseData.data.user.userName ?? ""),
              email: String(responseData.data.user.email ?? ""),
            });
            if (zendeskJwt) {
              // Add timeout to prevent hanging if Zendesk callback never fires
              await Promise.race([
                zendeskAuthenticateWithJwt(zendeskJwt),
                new Promise((resolve) => setTimeout(resolve, 5000)),
              ]);
            }
          } catch {}
        }
      }

      return response;
    },
    [setTokenStorageValue],
  );

  /**
   * Sign up
   */
  const signUp: JwtAuthContextType["signUp"] = useCallback(
    async (data) => {
      const response = await authSignUp(data);
      const responseData = await response.json();

      if (responseData.succeeded) {
        const token = responseData.data.token;

        // Create a user object with required properties
        const user: User = {
          id: "",
          role: "user",
          displayName: responseData.data.userName,
          email: responseData.data.email,
          photoURL: "",
          shortcuts: [],
          settings: {},
          loginRedirectUrl: "/",
        };

        setAuthState({
          authStatus: "authenticated",
          isAuthenticated: true,
          user,
        });
        setTokenStorageValue(token);
        setGlobalHeaders({ Authorization: `Bearer ${token}` });
      }

      return response;
    },
    [setTokenStorageValue],
  );

  /**
	 * Sign out
	 
		// Clear Redux store
		dispatch(clearUser());
		
		setAuthState({
			authStatus: 'unauthenticated',
		*/
  const signOut: JwtAuthContextType["signOut"] = useCallback(() => {
    console.log("signOut");
    removeTokenStorageValue();
    removeGlobalHeaders(["Authorization"]);
    localStorage.removeItem("user_data");

    setAuthState({
      authStatus: "unauthenticated",
      isAuthenticated: false,
      user: null,
    });

    // Zendesk logout
    zendeskLogout();
  }, [removeTokenStorageValue]);

  /**
   * Update user modules
   * Used to update module access without re-authentication
   */
  const updateUserModules = useCallback(
    (modules: Record<string, boolean>) => {
      if (authState.user) {
        const updatedUser = {
          ...authState.user,
          modules: {
            ...authState.user.modules,
            ...modules,
          },
        };

        // Update localStorage
        localStorage.setItem("user_data", JSON.stringify(updatedUser));

        // Update auth state
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));

        console.log("✅ User modules updated via updateUserModules:", modules);
      }
    },
    [authState.user],
  );

  /**
   * Update user
   */
  const updateUser: JwtAuthContextType["updateUser"] = useCallback(
    async (_user) => {
      try {
        return await authUpdateDbUser(_user);
      } catch (error) {
        console.error("Error updating user:", error);
        return Promise.reject(error);
      }
    },
    [],
  );

  /**
   * Refresh access token
   */
  const refreshToken: JwtAuthContextType["refreshToken"] =
    useCallback(async () => {
      const response = await authRefreshToken();

      if (response.status !== 200) {
        console.error(`Failed to refresh access token: ${response.status}`);
      }

      return response;
    }, []);

  /**
   * Auth Context Value
   */
  const authContextValue = useMemo(
    () =>
      ({
        ...authState,
        signIn,
        signUp,
        signOut,
        updateUser,
        refreshToken,
        updateUserModules,
      }) as JwtAuthContextType & {
        updateUserModules: (modules: Record<string, boolean>) => void;
      },
    [
      authState,
      signIn,
      signUp,
      signOut,
      updateUser,
      refreshToken,
      updateUserModules,
    ],
  );

  /**
   * Expose methods to the FuseAuthProvider
   */
  useImperativeHandle(ref, () => ({
    signOut,
    updateUser,
  }));

  /**
   * Intercept fetch requests to refresh the access token
   */
  const interceptFetch = useCallback(() => {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
      const [resource, config] = args;
      const response = await originalFetch(resource, config);
      const newAccessToken = response.headers.get("New-Access-Token");

      if (newAccessToken) {
        setGlobalHeaders({ Authorization: `Bearer ${newAccessToken}` });
        setTokenStorageValue(newAccessToken);
      }

      if (response.status === 401) {
        signOut();

        console.error("Unauthorized request. User was signed out.");
      }

      return response;
    };
  }, [setTokenStorageValue, signOut]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      interceptFetch();
    }
  }, [authState.isAuthenticated, interceptFetch]);

  return (
    <JwtAuthContext.Provider value={authContextValue}>
      {children}
    </JwtAuthContext.Provider>
  );
}

export default JwtAuthProvider;
