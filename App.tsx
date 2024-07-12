import { ThemeProvider } from "styled-components/native"
import { useFonts, Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto";

import { SignIn } from './src/screens/SignIn';
import theme from "./src/theme";
import { LoadIndicator } from "./src/components/Loading/styles";

export default function App() {
  const [ fontsLoaded ] = useFonts({Roboto_400Regular, Roboto_700Bold})

  if(!fontsLoaded) {
    return (
      <LoadIndicator />
    )
  }

  return (
    <ThemeProvider theme={theme}>
    <SignIn />
    </ThemeProvider>
  );
}


