import React from "react";
import { TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";

import { licensePlateValidate } from "../../utils/licensePlateValidate";

import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";

import { Container, Content } from "./styles";

const keyboardAvoidingViewBehavior = Platform.OS === "android" ? "position" : "position";

export function Departure() {
  const [ description, setDescription ] = React.useState("")
  const [ licensePlate, setLicensePlate ] = React.useState("")

  const licensePlateRef = React.useRef<TextInput>(null);
  const descriptionRef = React.useRef<TextInput>(null);

  function handleDepartureRegister() {
    if(!licensePlateValidate(licensePlate)) {
      licensePlateRef.current?.focus();
      return Alert.alert("Placa inválida", "A placa é inválida. Por favor, informe a placa correta do veículo.")
    }

    if(description.trim().length === 0) {
      descriptionRef.current?.focus();
      return Alert.alert('Finalidade', "Por favor, informe a finalidade da utilização do veículo")
    }
  }

  return (
    <Container>
      <Header title="Saída" />

      <KeyboardAvoidingView style={{flex: 1}} behavior={keyboardAvoidingViewBehavior}>
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

            <Button title="Registrar saída" onPress={handleDepartureRegister} />
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
