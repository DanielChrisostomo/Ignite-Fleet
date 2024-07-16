import { TouchableOpacity } from "react-native";
import { Power } from "phosphor-react-native"
import { useUser, useApp } from "@realm/react";

import { useTheme } from 'styled-components/native';

import { Container, Greeting, Message, Name, Picture } from './styles';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const blurhash = "L17_1hkCW=of00ayjZay~qj[ayjt"
// blurhash Site = https://blurha.sh/

export function HomeHeader() {

  const theme = useTheme()
  const user = useUser()
  const app = useApp()
  const insets = useSafeAreaInsets()

  const paddingTop = insets.top + 32

  function handleLogOut () {
    app.currentUser?.logOut()
  }

  return (
    <Container style={{paddingTop}}>
      <Picture source={{uri: user?.profile.pictureUrl }} placeholder={{blurhash}} />
      <Greeting>
        <Message>
          Olá
        </Message>

        <Name>
          {user?.profile.name}
        </Name>
      </Greeting>

      <TouchableOpacity activeOpacity={0.7} onPress={handleLogOut}>
        <Power size={32} color={theme.COLORS.GRAY_400}/>
      </TouchableOpacity>
    </Container>
  );
}