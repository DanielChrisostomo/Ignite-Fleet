import { TouchableOpacity } from "react-native";
import { Power } from "phosphor-react-native"
import { useUser, useApp } from "@realm/react";

import theme from "../../theme";

import { Container, Greeting, Message, Name, Picture } from './styles';

const blurhash = "L17_1hkCW=of00ayjZay~qj[ayjt"
// blurhash Site = https://blurha.sh/

export function HomeHeader() {
  const user = useUser()
  const app = useApp()

  function handleLogOut () {
    app.currentUser?.logOut()
  }

  return (
    <Container>
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