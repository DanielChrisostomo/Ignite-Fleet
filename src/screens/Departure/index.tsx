import React from "react";
import { TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useUser } from "@realm/react";
import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";

import { licensePlateValidate } from "../../utils/licensePlateValidate";

import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";

import { Container, Content } from "./styles";
import { useNavigation } from "@react-navigation/native";

export function Departure() {
  const [ description, setDescription ] = React.useState("")
  const [ licensePlate, setLicensePlate ] = React.useState("")
  const [ isRegistering, setisRegistering ] = React.useState(false)

  const { goBack } = useNavigation()
  const realm = useRealm()
  const user = useUser()

  const licensePlateRef = React.useRef<TextInput>(null);
  const descriptionRef = React.useRef<TextInput>(null);

  function handleDepartureRegister() {
    try {

      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus();
        return Alert.alert("Placa inválida", "A placa é inválida. Por favor, informe a placa correta do veículo.")
      }
  
      if (description.trim().length === 0) {
        descriptionRef.current?.focus();
        return Alert.alert('Finalidade', "Por favor, informe a finalidade da utilização do veículo")
      }

      setisRegistering(true);

      realm.write(() => {
        realm.create("Historic", Historic.generate({
          user_id: user!.id,
          license_plate: licensePlate.toUpperCase(),
          description
        }))
      })

      Alert.alert("Saída", "Saída do veículo registrada com sucesso!")
      goBack()

    } catch (error){
      console.log(error);
      Alert.alert("Erro", "Não foi possível registrar a saída do veículo")
    }
    setisRegistering(false);
  }

  return (
    <Container>
      <Header title="Saída" />

      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView>
          <Content>
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
