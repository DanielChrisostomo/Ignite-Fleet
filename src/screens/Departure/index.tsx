import React from "react";
import { TextInput, ScrollView, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import { CarSimple } from "phosphor-react-native";
import {
  useForegroundPermissions,
  requestBackgroundPermissionsAsync,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
  LocationObjectCoords,
} from "expo-location";

import { useUser } from "@realm/react";
import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";

import { licensePlateValidate } from "../../utils/licensePlateValidate";
import { getAddressLocation } from "../../utils/getAddressLocation";
import { openSettings } from "../../utils/openSettings";
import { startLocationTask } from '../../tasks/backgroundLocationTask';

import { Loading } from "../../components/Loading";
import { LocationInfo } from "../../components/LocationInfo";
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { Map } from "../../components/Map";

import { Container, Content, Message, MessageContent } from "./styles";

export function Departure() {
  const [description, setDescription] = React.useState("");
  const [licensePlate, setLicensePlate] = React.useState("");
  const [isRegistering, setIsResgistering] = React.useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(true);
  const [currentAddress, setCurrentAddress] = React.useState<string | null>(
    null
  );
  const [currentCoords, setCurrentCoords] =
    React.useState<LocationObjectCoords | null>(null);

  const [locationForegroundPermission, requestLocationForegroundPermission] =
    useForegroundPermissions();

  const { goBack } = useNavigation();
  const realm = useRealm();
  const user = useUser();

  const licensePlateRef = React.useRef<TextInput>(null);
  const descriptionRef = React.useRef<TextInput>(null);

  async function handleDepartureRegister() {
    try {
      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus();
        return Alert.alert(
          "Placa inválida",
          "A placa é inválida. Por favor, informe a placa correta do veículo."
        );
      }

      if (description.trim().length === 0) {
        descriptionRef.current?.focus();
        return Alert.alert(
          "Finalidade",
          "Por favor, informe a finalidade da utilização do veículo"
        );
      }

      if(!currentCoords?.latitude && !currentCoords?.longitude) {
        return Alert.alert('Localização', 'Não foi possível obter a localização atual. Tente novamente.')
      }

      setIsResgistering(true);

      const backgroundPermissions = await requestBackgroundPermissionsAsync()

      if(!backgroundPermissions.granted) {
        setIsResgistering(false)
        return Alert.alert(
          'Localização', 
          'É necessário permitir que o App tenha acesso localização em segundo plano. Acesse as configurações do dispositivo e habilite "Permitir o tempo todo."',
          [{ text: 'Abrir configurações', onPress: openSettings }]
        )
      }

      await startLocationTask();

      realm.write(() => {
        realm.create(
          "Historic",
          Historic.generate({
            user_id: user!.id,
            license_plate: licensePlate.toUpperCase(),
            description,
            coords:[{
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude,
              timestamp: new Date().getTime()
            }]
          })
        );
      });

      Alert.alert("Saída", "Saída do veículo registrada com sucesso!");
      goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível registrar a saída do veículo");
    }
    setIsResgistering(false);
  }

  React.useEffect(() => {
    requestLocationForegroundPermission();
  }, []);

  React.useEffect(() => {
    if (!locationForegroundPermission?.granted) {
      return;
    }

    let subscription: LocationSubscription;

    watchPositionAsync(
      {
        accuracy: LocationAccuracy.High,
        timeInterval: 1000,
      },
      (location) => {
        setCurrentCoords(location.coords);
        getAddressLocation(location.coords)
          .then((address) => {
            if (address) {
              setCurrentAddress(address);
            }
          })
          .finally(() => setIsLoadingLocation(false));
      }
    ).then((response) => (subscription = response));

    return () => {
      if (subscription) subscription.remove();
    };
  }, [locationForegroundPermission?.granted]);

  if (!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title="Saída" />
        <MessageContent>
          <Message>
            Você precisa permitir que o aplicativo tenha acesso a 
            localização para acessar essa funcionalidade. Por favor, acesse as
            configurações do seu dispositivo para conceder a permissão ao aplicativo.
          </Message>

          <Button title='Abrir configurações' onPress={openSettings} />
        </MessageContent>
      </Container>
    );
  }

  if (isLoadingLocation) {
    return <Loading />;
  }

  return (
    <Container>
      <Header title="Saída" />

      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView>
          {currentCoords && (
            <Map
              coordinates={[currentCoords]}
            />
          )}

          <Content>
            {currentAddress && (
              <LocationInfo
                icon={CarSimple}
                label="Localização atual"
                description={currentAddress}
              />
            )}
            <LicensePlateInput
              ref={licensePlateRef}
              label="Placa do veículo"
              placeholder="BRA1234"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType="next"
              onChangeText={(text) => setLicensePlate(text)}
            />

            <TextAreaInput
              ref={descriptionRef}
              label="Finalidade"
              placeholder="Vou utilizar o veículo para..."
              onSubmitEditing={handleDepartureRegister}
              returnKeyType="send"
              blurOnSubmit
              onChangeText={setDescription}
            />

            <Button
              title="Registrar saída"
              onPress={handleDepartureRegister}
              isLoading={isRegistering}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Container>
  );
}
