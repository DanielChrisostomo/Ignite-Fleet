import { ThemeProvider } from "styled-components/native"
import { StatusBar } from "react-native";
import { useFonts, Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto";
import { AppProvider, UserProvider } from "@realm/react";

import theme from "./src/theme";

import { REALM_APP_ID } from "@env";

import { SignIn } from './src/screens/SignIn';
import { Home } from "./src/screens/Home";
import { Loading } from "./src/components/Loading";

export default function App() {
  const [ fontsLoaded ] = useFonts({Roboto_400Regular, Roboto_700Bold})

  if(!fontsLoaded) {
    return (
      <Loading />
    )
  }

  return (
    <AppProvider id={REALM_APP_ID}>
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <UserProvider fallback={SignIn}>
        <Home />
      </UserProvider>
    </ThemeProvider>
    </AppProvider>
  );
}


